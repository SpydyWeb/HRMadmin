
import { AlertCardProps } from "@/utils/models";


export const AlertCard = ({ 
  icon: Icon, 
  iconBgColor, 
  iconColor, 
  count, 
  countColor, 
  title, 
  subtitle, 
  notifyBtnColor, 
  notifyBtnTextColor,
  viewBtnColor,
  viewBtnTextColor 
}: AlertCardProps) => {
  return (
    <div className="bg-gray-200 rounded-sm p-6 shadow-sm flex-1 min-w-0">
      {/* Icon and Count */}
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white`} style={{backgroundColor: iconBgColor}}>
          <Icon className={`w-5 h-5`} />
        </div>
        <div className={`text-4xl font-bold`} style={{color: countColor}}>
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
        <button  style={{borderColor: iconBgColor,color:iconBgColor}}
          className={`px-4 py-2 rounded-sm border-2 font-medium text-sm transition-colors hover:opacity-80`}
        >
          Notify
        </button>
        <button  style={{backgroundColor: iconBgColor}}
          className={`px-4 py-2 rounded-sm font-medium text-sm text-white transition-colors hover:opacity-90 `}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

