import { useState } from "react";
import { FiExternalLink,FiSearch } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ResourceItem {
  title: string;
  link: string;
}

interface ResourcesCardProps {
  resources: ResourceItem[];
}
 const resources = [
    { title: "Tips", link: "/tips" },
    { title: "User Manual", link: "/manual" },
    { title: "Review Masters", link: "/review-masters" },
    { title: "Review Structure", link: "/review-structure" },
  ];

export default function ResourcesCard() {
  const [search, setSearch] = useState("");

  const filteredResources = resources.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="w-full max-w-sm rounded-md  bg-white gap-1">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Resources</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Resource List */}
        <div className="space-y-2">
          {filteredResources.map((item, index) => (
            <a
              key={index}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg bg-gray-100 hover:bg-gray-100 p-3 transition"
            >
              <span className="text-sm font-medium text-gray-700">
                {item.title}
              </span>
              <FiExternalLink className="text-gray-500" />
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
