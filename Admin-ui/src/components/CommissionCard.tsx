import { ImArrowDown2, ImArrowUp2 } from "react-icons/im";
import { MiniChart } from "./MiniChart";
import { Card, CardFooter } from "./ui/card";

export const CommissionMetricsCard = () => {
  
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
  <div className="flex gap-6">
      <div className="w-full space-y-3">
        contenct 
      </div>

      <div className="max-w-[18rem] w-full space-y-3">

      </div>

    </div>
  );
};
