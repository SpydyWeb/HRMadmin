import { BiDownload, BiFolder, BiFolderOpen, BiGlobe } from "react-icons/bi";
import { FaFile } from "react-icons/fa6";
import TreeView, { TreeViewItem } from "../ui/tree-view";

export const Hierarchy = () => {
 const handleCheckChange = (item: TreeViewItem, checked: boolean) => {
    console.log(`Item ${item.name} checked:`, checked);
  };
const data =[
  {
    id: "1",
    name: "Employee 100",
    type: "region",
    children: [
      {
        id: "1.1",
        name: "Employee 101",
        type: "store",
        children: [
          { id: "1.1.1", name: "Employee 111", type: "department" },
          { id: "1.1.2", name: "Employee 112", type: "department" },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Employee 102",
    type: "region",
    children: [
      { id: "2.1", name: "Employee 114", type: "store" },
      { id: "2.2", name: "Employee 112", type: "store" },
    ],
  },
];


const customIconMap = {
  region: <BiGlobe className="h-4 w-4 text-purple-500" />,
  store: <BiFolder className="h-4 w-4 text-blue-500" />,
  department: <BiFolderOpen className="h-4 w-4 text-green-500" />,
  item: <FaFile className="h-4 w-4 text-orange-500" />,
};

const menuItems = [
  {
    id: "download",
    label: "Download",
    icon: <BiDownload className="h-4 w-4" />,
    action: (items) => console.log("Downloading:", items),
  },
];

  return (
   <TreeView data={data}
      title="Tree View Demo"
      showCheckboxes={true}
      iconMap={customIconMap}
      menuItems={menuItems}
      onCheckChange={handleCheckChange} />
  )
}
