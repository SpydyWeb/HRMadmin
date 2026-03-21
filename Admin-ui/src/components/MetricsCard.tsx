import { ImArrowDown2, ImArrowUp2 } from "react-icons/im";
import { MiniChart } from "./MiniChart";
import { Card, CardFooter } from "./ui/card";

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
};

export const MetricsCard = ({ metrics: propsMetrics }: MetricsCardProps) => {
  const metrics = propsMetrics || [];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {metrics.map((metric, index) => {
          const isPositive = metric.changeType === "positive";
          const isNegative = metric.changeType === "negative";

          return (
            <Card key={index} className="rounded-md p-2 flex-1 min-w-0 p-2">
              <div className="flex items-start justify-between">
                <div className="flex-1 p-2">
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
  );
};
