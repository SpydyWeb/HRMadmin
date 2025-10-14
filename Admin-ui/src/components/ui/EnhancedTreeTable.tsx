// components/EnhancedTreeTable.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import Button  from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  FiAlertCircle,
  FiChevronRight,
  FiChevronDown,
  FiUser,
  FiSearch,
  FiX,
  FiLoader,
} from 'react-icons/fi';

interface TreeViewItem {
  id: string;
  name: string;
  type: string;
  agentCode: string;
  agentName: string;
  region: string;
  children?: TreeViewItem[];
}

interface ApiResponse {
  data: TreeViewItem[];
  total: number;
  page: number;
  pageSize: number;
}

interface TreeTableProps {
  data: TreeViewItem[];
  onSearch?: (query: string, page: number, pageSize: number) => Promise<ApiResponse>;
  isLoading?: boolean;
  totalCount?: number;
}

const MAX_RECOMMENDED_LEVEL = 4;
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const EnhancedTreeTable: React.FC<TreeTableProps> = ({
  data: initialData,
  onSearch,
  isLoading = false,
  totalCount = 0,
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [maxDepthReached, setMaxDepthReached] = useState(0);
  
  // Search and pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [apiData, setApiData] = useState<TreeViewItem[]>(initialData);
  const [apiTotalCount, setApiTotalCount] = useState(totalCount);
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page on new search
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch data when search query, page, or page size changes
  useEffect(() => {
    const fetchData = async () => {
      if (!onSearch) {
        // If no API search provided, use initial data
        setApiData(initialData);
        setApiTotalCount(initialData.length);
        return;
      }

      setApiLoading(true);
      setError(null);

      try {
        const response = await onSearch(debouncedSearchQuery, currentPage, pageSize);
        setApiData(response.data);
        setApiTotalCount(response.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setApiData([]);
        setApiTotalCount(0);
      } finally {
        setApiLoading(false);
      }
    };

    fetchData();
  }, [debouncedSearchQuery, currentPage, pageSize, onSearch]);

  // Toggle expand/collapse
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

  // Calculate max depth
  const calculateMaxDepth = (items: TreeViewItem[], level: number = 0): number => {
    let maxDepth = level;
    items.forEach((item) => {
      if (item.children && item.children.length > 0) {
        const childDepth = calculateMaxDepth(item.children, level + 1);
        maxDepth = Math.max(maxDepth, childDepth);
      }
    });
    return maxDepth;
  };

  useEffect(() => {
    setMaxDepthReached(calculateMaxDepth(apiData));
  }, [apiData]);

  // Get type badge color
  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'region':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'store':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'department':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Render tree rows recursively
  const renderRows = (
    items: TreeViewItem[],
    level: number = 0
  ): React.ReactNode => {
    return items.map((item) => {
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = expandedIds.has(item.id);
      const exceedsRecommended = level >= MAX_RECOMMENDED_LEVEL;

      return (
        <React.Fragment key={item.id}>
          <TableRow
            className={cn(
              'hover:bg-muted/50 transition-colors',
              exceedsRecommended && 'bg-amber-50/50 dark:bg-amber-950/20'
            )}
          >
            <TableCell className="font-medium">
              <div
                className="flex items-center gap-2"
                style={{ paddingLeft: `${Math.min(level * 24, 200)}px` }}
              >
                {hasChildren ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-muted"
                    onClick={() => toggleExpand(item.id)}
                  >
                    {isExpanded ? (
                      <FiChevronDown className="h-4 w-4" />
                    ) : (
                      <FiChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                ) : (
                  <span className="w-6" />
                )}
                <FiUser className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{item.name}</span>
                {exceedsRecommended && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-amber-100 border-amber-300 ml-auto"
                  >
                    L{level}
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge
                variant="secondary"
                className={cn('text-xs font-semibold', getTypeBadgeClass(item.type))}
              >
                {item.type}
              </Badge>
            </TableCell>
            <TableCell className="truncate">{item.agentCode}</TableCell>
            <TableCell className="truncate">{item.agentName}</TableCell>
            <TableCell className="truncate">{item.region}</TableCell>
          </TableRow>

          {hasChildren && isExpanded && renderRows(item.children!, level + 1)}
        </React.Fragment>
      );
    });
  };

  // Loading skeleton
  const renderSkeleton = () => {
    return Array.from({ length: pageSize }).map((_, index) => (
      <TableRow key={index}>
        <TableCell>
          <Skeleton className="h-4 w-full" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-20" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-24" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-32" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-24" />
        </TableCell>
      </TableRow>
    ));
  };

  const totalPages = Math.ceil(apiTotalCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, apiTotalCount);

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, code, agent, region..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
            disabled={apiLoading}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setSearchQuery('')}
            >
              <FiX className="h-4 w-4" />
            </Button>
          )}
          {apiLoading && searchQuery && (
            <FiLoader className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Rows per page:
          </span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setCurrentPage(1);
            }}
            disabled={apiLoading}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Alert for deep nesting */}
      {maxDepthReached >= MAX_RECOMMENDED_LEVEL && !apiLoading && (
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <FiAlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            Deep nesting detected ({maxDepthReached} levels). Consider using a
            split-view layout for better usability.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <FiAlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          {apiLoading ? (
            <Skeleton className="h-4 w-32" />
          ) : apiTotalCount > 0 ? (
            <>
              Showing{' '}
              <strong className="text-foreground">
                {startIndex}-{endIndex}
              </strong>{' '}
              of <strong className="text-foreground">{apiTotalCount}</strong>{' '}
              {searchQuery ? 'result' : 'item'}
              {apiTotalCount !== 1 ? 's' : ''}
            </>
          ) : (
            'No results found'
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Name</TableHead>
              <TableHead className="w-[120px]">Type</TableHead>
              <TableHead className="w-[150px]">Agent Code</TableHead>
              <TableHead className="w-[200px]">Agent Name</TableHead>
              <TableHead className="w-[150px]">Region</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiLoading || isLoading ? (
              renderSkeleton()
            ) : apiData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <FiSearch className="h-12 w-12 opacity-20" />
                    <div>
                      <p className="font-medium">No results found</p>
                      {searchQuery && (
                        <p className="text-sm mt-1">
                          Try adjusting your search terms
                        </p>
                      )}
                    </div>
                    {searchQuery && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchQuery('')}
                        className="mt-2"
                      >
                        Clear search
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              renderRows(apiData)
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && !apiLoading && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-sm text-muted-foreground">
            Page <strong className="text-foreground">{currentPage}</strong> of{' '}
            <strong className="text-foreground">{totalPages}</strong>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1 || apiLoading}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || apiLoading}
            >
              Previous
            </Button>

            {/* Page numbers */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    disabled={apiLoading}
                    className="w-9"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages || apiLoading}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || apiLoading}
            >
              Last
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedTreeTable;