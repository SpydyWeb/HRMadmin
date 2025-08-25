import { FaPlus } from "react-icons/fa6";
import { LuSquareUserRound } from "react-icons/lu";
import {RxDownload, RxUpload  } from "react-icons/rx";
import { Box, Button, Card } from "@mui/material";
import { ActionItem } from "@/utils/models";


const actions: Array<ActionItem> = [
  {
    icon: FaPlus,
    title: "Bulk Create Entity",
    subtitle: "Create multiple entities at once",
    onClick: () => alert("Bulk Create Entity clicked"),
  },
  {
    icon: LuSquareUserRound,
    title: "Create Individually",
    subtitle: "Create a new entity",
    onClick: () => alert("Create Individually clicked"),
  },
  {
    icon: RxUpload,
    title: "Export Hierarchy",
    subtitle: "Export current hierarchy data",
    onClick: () => alert("Export Hierarchy clicked"),
  },
  {
    icon: RxDownload,
    title: "Import Hierarchy",
    subtitle: "Import hierarchy from file",
    onClick: () => alert("Import Hierarchy clicked"),
  },
];

const QuickActions = () => {
  return (
    <Card className="w-80 px-4 py-9 shadow-md !rounded-xl">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Quick Actions</h2>
      <div className="flex flex-col gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Box    
              key={index}
              variant="outlined"
              className="flex items-center justify-start gap-3 rounded-xl border border-gray-200 bg-gray-200 hover:bg-white text-left p-3  shadow-sm transition cursor-pointer"
            >
              <div className="flex items-center justify-center h-8 w-8 rounded-lg border border-gray-900 hover:border-blue-700 ">
                <Icon className="h-5 w-5 text-gray-700 hover:text-blue-700" />
              </div>
              <div>
                <div className="text-sm text-gray-800 font-bold">{action.title}</div>
                <div className="text-xs text-gray-500">{action.subtitle}</div>
              </div>
            </Box>
          );
        })}
      </div>
    </Card>
  );
};

export default QuickActions;
