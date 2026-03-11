import { ImArrowDown2, ImArrowUp2 } from "react-icons/im";
import { MiniChart } from "./MiniChart";
import { Card, CardFooter } from "./ui/card";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";

type Metric = {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative";
  chartColor: string;
  chartData: number[];
};

type MetricsCardProps = {
  metrics?: Metric[];
  graphData?: any;
  graphLoading?: boolean;
};

export const MetricsCard = ({
  metrics: propsMetrics,
  graphData,
  graphLoading,
}: MetricsCardProps) => {
  
  // Default metrics if not provided
  const defaultMetrics: Metric[] = [
    {
      title: "Total Entities",
      value: "1250",
      change: "+120",
      changeType: "positive",
      chartColor: "#10b981",
      chartData: [15, 18, 16, 22, 25, 28, 32, 35, 40],
    },
    {
      title: "Created This Month",
      value: "152",
      change: "-10",
      changeType: "negative",
      chartColor: "#ef4444",
      chartData: [35, 38, 42, 40, 38, 35, 32, 28, 25],
    },
    {
      title: "Terminated This Month",
      value: "250",
      change: "+5",
      changeType: "positive",
      chartColor: "#10b981",
      chartData: [20, 18, 19, 21, 20, 22, 23, 24, 25],
    },
    {
      title: "Net Entity This Month",
      value: "48",
      change: "+5",
      changeType: "positive",
      chartColor: "#10b981",
      chartData: [20, 18, 19, 21, 20, 22, 23, 24, 25],
    },
  ];

  console.log("Received propsMetrics:", propsMetrics);
  const metrics = propsMetrics || [];

  const findFirstArray = (obj: any): any[] | null => {
    if (!obj) return null;
    if (Array.isArray(obj)) return obj;
    if (typeof obj !== "object") return null;

    // common wrappers
    const candidates = [
      obj.responseBody,
      obj.responseBody?.graphData,
      obj.graphData,
      obj.data,
      obj.result,
    ];
    for (const c of candidates) {
      if (Array.isArray(c)) return c;
    }

    for (const key of Object.keys(obj)) {
      const val = (obj as any)[key];
      if (Array.isArray(val)) return val;
      if (val && typeof val === "object") {
        const nested = findFirstArray(val);
        if (nested) return nested;
      }
    }
    return null;
  };

  const normalizeNumber = (v: any) => {
    if (typeof v === "number") return v;
    if (typeof v === "string") {
      const n = Number(v.replace(/,/g, ""));
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  };

  const normalizeDateLabel = (v: any) => {
    if (!v) return "";
    if (typeof v === "string") {
      try {
        // handles ISO strings
        const d = parseISO(v);
        if (!isNaN(d.getTime())) return format(d, "dd MMM");
      } catch {
        // ignore
      }
      return v;
    }
    if (v instanceof Date) return format(v, "dd MMM");
    return String(v);
  };

  const toChartPoints = (raw: any) => {
    const arr = findFirstArray(raw) || [];
    return arr
      .map((row: any) => {
        const dateRaw =
          row?.date ?? row?.Date ?? row?.day ?? row?.Day ?? row?.label ?? row?.Label ?? row?.xAxis ?? row?.X;
        const revenueRaw =
          row?.revenue ?? row?.Revenue ?? row?.revune ?? row?.Revune ?? row?.totalRevenue ?? row?.TotalRevenue;
        const commissionRaw =
          row?.commission ?? row?.Commission ?? row?.commision ?? row?.Commision ?? row?.totalCommission ?? row?.TotalCommission;

        return {
          date: normalizeDateLabel(dateRaw),
          revenue: normalizeNumber(revenueRaw),
          commission: normalizeNumber(commissionRaw),
        };
      })
      .filter((p: any) => p.date);
  };

  const chartPoints = toChartPoints(graphData);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {metrics.map((metric, index) => {
          const isPositive = metric.changeType === "positive";
          const isNegative = metric.changeType === "negative";

          return (
            <Card key={index} className="rounded-md p-2 flex-1 min-w-0 p-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-gray-500 text-xs font-medium mb-1">
                    {metric.title}
                  </h3>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {metric.value}
                  </div>
                </div>

                <MiniChart
                  data={metric.chartData}
                  color={metric.chartColor}
                  type={metric.title.replace(/\s+/g, "-").toLowerCase()}
                />
              </div>

              <CardFooter className="flex items-center gap-1 p-0">
                {isPositive && (
                  <div className="flex items-center font-bold text-[--brand-orange] bg-[--brand-orange]">
                    <ImArrowUp2 className="w-4 h-4 rounded-full mr-1 p-1" />
                    <span className="text-xs">{metric.change}</span>
                  </div>
                )}

                {isNegative && (
                  <div className="flex items-center font-bold text-red-500">
                    <ImArrowDown2 className="w-4 h-4 rounded-full mr-1 p-1" />
                    <span className="text-xs">{metric.change}</span>
                  </div>
                )}

                <span className="text-gray-500 text-xs ml-1">
                  Entities this month
                </span>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Card className="rounded-md p-3 min-h-[220px] lg:col-span-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-md font-medium text-gray-700">
            Revenue vs Commission
          </div>
        </div>
        <div className="h-[200px] w-full">
          {graphLoading ? (
            <div className="h-full w-full flex items-center justify-center text-sm text-gray-500">
              Loading graph...
            </div>
          ) : chartPoints.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-sm text-gray-500">
              No graph data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartPoints}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  name="Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="commission"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  name="Commission"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  );
};
