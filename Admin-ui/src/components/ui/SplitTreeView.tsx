import React, { useState, useEffect } from 'react';
import {
  FiAlertCircle,
  FiChevronRight,
  FiChevronDown,
  FiUser,
  FiSearch,
  FiX,
  FiLoader,
  FiFolder,
  FiUsers,
} from 'react-icons/fi';
import { BiFolderOpen } from 'react-icons/bi';
import { Badge } from '@/components/ui/badge';
import  Button  from '@/components/ui/button';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { agentService } from '@/services/agentService';

interface SplitTreeTableProps {
  treeData: Array<any>;
  onSearch?: (
    query: string,
    page: number,
    pageSize: number,
    selectedNodeId?: string
  ) => Promise<any>;
  isLoading?: boolean;
  channelCode?: string | null;
  highlightAgentCode?: string;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const SplitTreeTable: React.FC<SplitTreeTableProps> = ({
  treeData,
  onSearch,
  isLoading = false,
  channelCode,
  highlightAgentCode,
}) => {
  // Tree view states
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(['1', '2'])
  );
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  // Table states
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [tableData, setTableData] = useState<Array<any>>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch table data when search, pagination, or selected node changes
  useEffect(() => {
    const fetchTableData = async () => {
      if (!onSearch) {
        // If no API provided, try to fetch from GeoHierarchyByChannelDesignation API
        if (selectedNode && channelCode && selectedNode.agentCode) {
          setApiLoading(true);
          setError(null);
          
          try {
            const geoAgentHierarchy = await agentService.fetchGeoHierarchyTable(
              channelCode,
              selectedNode.agentCode
            );
            
            if (geoAgentHierarchy && Array.isArray(geoAgentHierarchy)) {
              // Map the API response to table data format
              const mappedData = geoAgentHierarchy.map((item: {
                agentId: number;
                agentName: string;
                agentDesignation: string;
                agentCode: string;
                location: string;
              }) => ({
                id: item.agentId.toString(),
                name: item.agentName,
                type: 'agent',
                agentCode: item.agentCode,
                agentName: item.agentName,
                region: item.location,
                agentDesignation: item.agentDesignation,
              }));
              setTableData(mappedData);
              setTotalCount(mappedData.length);
            } else {
              setTableData([]);
              setTotalCount(0);
            }
          } catch (err) {
            console.error('Error fetching geo hierarchy table:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
            setTableData([]);
            setTotalCount(0);
          } finally {
            setApiLoading(false);
          }
        } else if (selectedNode?.children) {
          // If no API call needed, show selected node's children
          setTableData(selectedNode.children);
          setTotalCount(selectedNode.children.length);
        } else {
          setTableData([]);
          setTotalCount(0);
        }
        return;
      }

      setApiLoading(true);
      setError(null);

      try {
        const response = await onSearch(
          debouncedSearchQuery,
          currentPage,
          pageSize,
          selectedNode?.id
        );
        setTableData(response.data);
        setTotalCount(response.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setTableData([]);
        setTotalCount(0);
      } finally {
        setApiLoading(false);
      }
    };

    fetchTableData();
  }, [debouncedSearchQuery, currentPage, pageSize, selectedNode, onSearch, channelCode]);

  // Toggle tree node expansion
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

  // Get breadcrumb path for selected node
  const getBreadcrumb = (item: any | null): string[] => {
    if (!item) return [];

    const findPath = (
      items: any[],
      targetId: string,
      path: string[] = []
    ): string[] | null => {
      for (const currentItem of items) {
        const newPath = [...path, currentItem.name];
        if (currentItem.id === targetId) {
          return newPath;
        }
        if (currentItem.children) {
          const result = findPath(currentItem.children, targetId, newPath);
          if (result) return result;
        }
      }
      return null;
    };

    return findPath(treeData, item.id) || [];
  };

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

  // Render tree node recursively
  const renderTreeNode = (
    item: any,
    level: number = 0
  ): React.ReactNode => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedIds.has(item.id);
    const isSelected = selectedNode?.id === item.id;
    const isHighlighted = highlightAgentCode && item.agentCode?.toLowerCase() === highlightAgentCode?.toLowerCase();

    return (
      <div key={item.id}>
        <div
          className={cn(
            'flex items-center gap-2 py-2 px-3 rounded-md cursor-pointer hover:bg-muted/50 transition-colors group',
            isSelected && 'bg-primary/10 border-l-2 border-primary',
            isHighlighted && !isSelected && 'bg-orange-100 border-l-2 border-orange-500 dark:bg-orange-900/30 dark:border-orange-600'
          )}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
          onClick={() => setSelectedNode(item)}
        >
          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 hover:bg-muted"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(item.id);
              }}
            >
              {isExpanded ? (
                <FiChevronDown className="h-3 w-3" />
              ) : (
                <FiChevronRight className="h-3 w-3" />
              )}
            </Button>
          ) : (
            <span className="w-5" />
          )}
          
          {hasChildren ? (
            isExpanded ? (
              <BiFolderOpen className="h-4 w-4 text-blue-500 flex-shrink-0" />
            ) : (
              <FiFolder className="h-4 w-4 text-blue-500 flex-shrink-0" />
            )
          ) : (
            <FiUser className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          )}
          
          <span className="text-sm truncate flex-1">{item.name}</span>
          
          <Badge
            variant="secondary"
            className={cn(
              'text-xs px-1.5 py-0 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity',
              isSelected && 'opacity-100',
              getTypeBadgeClass(item.type)
            )}
          >
            {item.type}
          </Badge>
          
          {hasChildren && (
            <Badge
              variant="outline"
              className="text-xs px-1.5 py-0 flex-shrink-0"
            >
              {item.children!.length}
            </Badge>
          )}
        </div>

        {hasChildren &&
          isExpanded &&
          item.children!.map((child: any) => renderTreeNode(child, level + 1))}
      </div>
    );
  };

  // Render table skeleton
  const renderSkeleton = () => {
    return Array.from({ length: pageSize }).map((_, index) => (
      <TableRow key={index}>
        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      </TableRow>
    ));
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endIndex = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-200px)]">
      {/* LEFT PANEL - Tree View */}
      <Card className="col-span-12 lg:col-span-4 xl:col-span-3 overflow-hidden flex flex-col">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FiUsers className="h-5 w-5" />
            Hierarchy Navigator
          </CardTitle>
        </CardHeader>
        <ScrollArea className="flex-1">
          <CardContent className="pt-4 pb-2">
            {treeData?.map((item) => renderTreeNode(item))}
          </CardContent>
        </ScrollArea>
      </Card>

      {/* RIGHT PANEL - Table with Search & Pagination */}
      <Card className="col-span-12 lg:col-span-8 xl:col-span-9 overflow-hidden flex flex-col">
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {selectedNode ? 'Details & Children' : 'All Employees'}
              </CardTitle>
              {selectedNode && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedNode(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <FiX className="h-4 w-4 mr-1" />
                  Clear selection
                </Button>
              )}
            </div>

            {/* Breadcrumb */}
            {selectedNode && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                {getBreadcrumb(selectedNode).map((crumb, index, arr) => (
                  <React.Fragment key={index}>
                    <span className={index === arr.length - 1 ? 'text-foreground font-medium' : ''}>
                      {crumb}
                    </span>
                    {index < arr.length - 1 && (
                      <FiChevronRight className="h-3 w-3" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* Search and Page Size Controls */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-md w-full">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-9"
                  disabled={apiLoading}
                  variant="outlined"
                  label=""
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
                  Rows:
                </span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => {
                    setPageSize(Number(value));
                    setCurrentPage(1);
                  }}
                  disabled={apiLoading}
                >
                  <SelectTrigger className="w-[90px]">
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

            {/* Results Info */}
            <div className="text-sm text-muted-foreground">
              {apiLoading ? (
                <Skeleton className="h-4 w-40" />
              ) : totalCount > 0 ? (
                <>
                  Showing{' '}
                  <strong className="text-foreground">
                    {startIndex}-{endIndex}
                  </strong>{' '}
                  of <strong className="text-foreground">{totalCount}</strong>{' '}
                  {searchQuery ? 'result' : 'item'}
                  {totalCount !== 1 ? 's' : ''}
                </>
              ) : (
                'No results'
              )}
            </div>
          </div>
        </CardHeader>

        {/* Error Alert */}
        {error && (
          <div className="px-6 pt-4">
            <Alert variant="destructive">
              <FiAlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Table */}
        <ScrollArea className="flex-1">
          <CardContent className="pt-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Name</TableHead>
                    <TableHead className="w-[100px]">Type</TableHead>
                    <TableHead className="w-[140px]">Agent Code</TableHead>
                    <TableHead className="w-[180px]">Agent Name</TableHead>
                    <TableHead className="w-[130px]">Region</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiLoading || isLoading ? (
                    renderSkeleton()
                  ) : tableData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                          <FiSearch className="h-12 w-12 opacity-20" />
                          <div>
                            <p className="font-medium">No data available</p>
                            {searchQuery && (
                              <p className="text-sm mt-1">
                                Try adjusting your search
                              </p>
                            )}
                            {!selectedNode && !searchQuery && (
                              <p className="text-sm mt-1">
                                Select a node from the tree to view details
                              </p>
                            )}
                          </div>
                          {searchQuery && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSearchQuery('')}
                            >
                              Clear search
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    tableData.map((item) => (
                      <TableRow
                        key={item.id}
                        className="hover:bg-muted/50 cursor-pointer"
                        onClick={() => setSelectedNode(item)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FiUser className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">{item.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={cn(
                              'text-xs font-semibold',
                              getTypeBadgeClass(item.type)
                            )}
                          >
                            {item.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="truncate">
                          {item.agentCode}
                        </TableCell>
                        <TableCell className="truncate">
                          {item.agentName}
                        </TableCell>
                        <TableCell className="truncate">{item.region}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </ScrollArea>

        {/* Pagination */}
        {totalPages > 1 && !apiLoading && (
          <div className="border-t px-6 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Page <strong className="text-foreground">{currentPage}</strong>{' '}
                of <strong className="text-foreground">{totalPages}</strong>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
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
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Last
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SplitTreeTable;