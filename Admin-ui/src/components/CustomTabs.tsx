import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TabItem {
  value: string;
  label: string;
  icon?: React.ReactNode; // For react-icons
}

interface CustomTabsProps {
  tabs: Array<TabItem>;
  defaultValue: string;
  onValueChange?: (value: string) => void;
}

export default function CustomTabs({
  tabs,
  defaultValue,
  onValueChange,
}: CustomTabsProps) {
  return (
    <Tabs defaultValue={defaultValue} onValueChange={onValueChange} className="contents">
      <TabsList className="rounded-none py-6 bg-transparent shadow-none px-0">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className=" px-8 py-6 rounded-none text-gray-600 data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:text-black transition-all"
          >
            {tab.icon && <span className="text-lg">{tab.icon}</span>}
            <span>{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
