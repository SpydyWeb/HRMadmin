
import { AlertCardProps } from "@/utils/models";
import { Button } from "./ui/button";


export const AlertCard = ({ 
  icon: Icon, 
  iconBgColor, 
  count, 
  btnColor, 
  title, 
  subtitle, 

}: AlertCardProps) => {
  return (
    <div className="bg-gray-200 rounded-sm p-6 shadow-sm flex-1 min-w-0">
      {/* Icon and Count */}
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white`} style={{backgroundColor: iconBgColor}}>
          <Icon className={`w-5 h-5`} />
        </div>
        <div className={`text-4xl font-bold`} style={{color: iconBgColor}}>
          {count}
        </div>
      </div>

      {/* Title and Subtitle */}
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between ">
        <Button  style={{borderColor: btnColor,color:btnColor}}
          className={` rounded-sm border-2 bg-transparent font-medium text-sm transition-colors hover:bg-transparent `}
        >
          Notify
        </Button>
        <Button  style={{backgroundColor: btnColor}}
          className={` rounded-sm font-medium text-sm text-white transition-colors hover:opacity-90 `}
        >
          View Details
        </Button>
      </div>
    </div>
  );
};

