import { IoIosArrowRoundDown, IoIosArrowRoundUp } from "react-icons/io";
import { ImArrowDown2 ,ImArrowUp2} from "react-icons/im";
import { alpha, useTheme } from "@mui/material";
import { MiniChart } from "./MiniChart";
import { MetricsCardProps } from "@/utils/models";


export const MetricsCard = ({
  title,
  value,
  change,
  changeType,
  chartData,
  chartColor
}: MetricsCardProps) => {
    const theme = useTheme()
  const isPositive = changeType === 'positive';
  const isNegative = changeType === 'negative';
  return (
    <div className="bg-white rounded-lg p-3 shadow border border-gray-100 flex-1 ">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-gray-500 text-sm font-medium mb-2">{title}</h3>
          <div className="text-3xl font-bold text-gray-900 mb-3">{value}</div>
          
          <div className="flex items-center gap-1">
            {isPositive && (
              <div className={`flex items-center font-bold`} style={{ color: theme.palette.success.main }}>
                <ImArrowUp2 className="w-4 h-4 rounded-full mr-1 p-1" style={{backgroundColor:alpha(theme.palette.success.main, 0.3)}} />
                <span className="text-sm ">{change}</span>
              </div>
            )}
            {isNegative && (
              <div className="flex items-center font-bold text-red-500" >
                <ImArrowDown2 className="w-4 h-4 rounded-full  mr-1 p-1" style={{backgroundColor:alpha(theme.palette.error.dark, 0.3)}} />
                <span className="text-sm ">{change}</span>
              </div>
            )}
            <span className="text-gray-500 text-sm ml-1">Entities this month</span>
          </div>
        </div>
        
        <MiniChart 
          data={chartData} 
          color={chartColor} 
          type={title.replace(/\s+/g, '-').toLowerCase()}
        />
      </div>
    </div>
  );
};
