import { ImArrowDown2, ImArrowUp2 } from "react-icons/im";
import { alpha, useTheme } from "@mui/material";
import { MiniChart } from "./MiniChart";
import { Card, CardFooter } from "./ui/card";

export const MetricsCard = () => {
  const theme = useTheme();

  // Centralized data for reusability
  const metrics = [
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const isPositive = metric.changeType === "positive";
        const isNegative = metric.changeType === "negative";

        return (
          <Card key={index} className="rounded-md p-3 flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-gray-500 text-sm font-medium mb-2">
                  {metric.title}
                </h3>
                <div className="text-3xl font-bold text-gray-900 mb-3">
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
                <div
                  className="flex items-center font-bold"
                  style={{ color: theme.palette.success.main }}
                >
                  <ImArrowUp2
                    className="w-4 h-4 rounded-full mr-1 p-1"
                    style={{
                      backgroundColor: alpha(theme.palette.success.main, 0.3),
                    }}
                  />
                  <span className="text-sm">{metric.change}</span>
                </div>
              )}

              {isNegative && (
                <div
                  className="flex items-center font-bold text-red-500"
                >
                  <ImArrowDown2
                    className="w-4 h-4 rounded-full mr-1 p-1"
                    style={{
                      backgroundColor: alpha(theme.palette.error.dark, 0.3),
                    }}
                  />
                  <span className="text-sm">{metric.change}</span>
                </div>
              )}

              <span className="text-gray-500 text-sm ml-1">
                Entities this month
              </span>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};
