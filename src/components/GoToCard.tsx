import { FiExternalLink } from "react-icons/fi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface GoToItem {
  title: string;
  link: string;
}

interface GoToCardProps {
  resources: GoToItem[];
}
 const resources = [
    { title: "CMS", link: "/tips" },
    { title: "ICMS", link: "/manual" },
    { title: "Queries", link: "/review-masters" },
  ];

export default function GoToCard() {

  return (
    <Card className="w-full max-w-sm rounded-md  bg-white gap-1">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Go To</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
       
        {/* Resource List */}
        <div className="space-y-2">
          {resources.map((item, index) => (
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
