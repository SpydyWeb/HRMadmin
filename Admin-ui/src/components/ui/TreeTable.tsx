
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import  Button  from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BiChevronDown, BiChevronRight, BiUser } from 'react-icons/bi';

interface TreeViewItem {
  id: string;
  name: string;
  type: string;
  agentCode: string;
  agentName: string;
  region: string;
  children?: TreeViewItem[];
}

interface TreeTableProps {
  data: TreeViewItem[];
}

const TreeTable: React.FC<TreeTableProps> = ({ data }) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const renderRows = (
    items: TreeViewItem[],
    level: number = 0
  ): React.ReactNode => {
    return items.map((item) => {
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = expandedIds.has(item.id);

      return (
        <React.Fragment key={item.id}>
          <TableRow className="hover:bg-muted/50">
            <TableCell className="font-medium">
              <div
                className="flex items-center gap-2"
                style={{ paddingLeft: `${level * 24}px` }}
              >
                {hasChildren ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => toggleExpand(item.id)}
                  >
                    {isExpanded ? (
                      <BiChevronDown className="h-4 w-4" />
                    ) : (
                      <BiChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                ) : (
                  <span className="w-6" />
                )}
                <BiUser className="h-4 w-4 text-muted-foreground" />
                <span>{item.name}</span>
              </div>
            </TableCell>
            <TableCell>
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                  item.type === 'region' &&
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                  item.type === 'store' &&
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                  item.type === 'department' &&
                    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                )}
              >
                {item.type}
              </span>
            </TableCell>
            <TableCell>{item.agentCode}</TableCell>
            <TableCell>{item.agentName}</TableCell>
            <TableCell>{item.region}</TableCell>
          </TableRow>

          {hasChildren && isExpanded && renderRows(item.children!, level + 1)}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Agent Code</TableHead>
            <TableHead>Agent Name</TableHead>
            <TableHead>Region</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{renderRows(data)}</TableBody>
      </Table>
    </div>
  );
};

export default TreeTable;