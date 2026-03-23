import React, { useMemo, useState, useEffect } from 'react';
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
import { MASTER_DATA_KEYS } from '@/utils/constant';

type BranchOption = { branchId: number; name: string; code: string };

function parseRegulatorBranchCatalog(raw: unknown): BranchOption[] {
  if (raw == null) return [];

  // Unwrap: full envelope, nested responseBody, or service return value
  let data: any = raw;
  const branchListKey = (d: any): any[] | null => {
    if (!d || typeof d !== 'object') return null;
    if (Array.isArray(d.branchList)) return d.branchList;
    if (Array.isArray(d.BranchList)) return d.BranchList;
    return null;
  };

  for (let depth = 0; depth < 4 && data && typeof data === 'object'; depth++) {
    if (Array.isArray(data)) break;
    if (branchListKey(data)) break;
    if (data.responseBody != null && typeof data.responseBody === 'object') {
      data = data.responseBody;
      continue;
    }
    break;
  }

  if (!data) return [];

  let arr: any[] = [];
  if (Array.isArray(data)) arr = data;
  else {
    const bl = branchListKey(data);
    if (bl) arr = bl;
    else if (Array.isArray(data.regulatorBranches)) arr = data.regulatorBranches;
    else if (Array.isArray(data.branches)) arr = data.branches;
    else if (Array.isArray(data.data)) arr = data.data;
    else if (Array.isArray(data.items)) arr = data.items;
  }

  const out: BranchOption[] = [];
  const seen = new Set<number>();
  for (const item of arr) {
    const idRaw = item?.branchId ?? item?.branchMasterId ?? item?.id;
    const id =
      typeof idRaw === 'string' ? parseInt(idRaw, 10) : Number(idRaw);
    if (!Number.isFinite(id) || seen.has(id)) continue;
    seen.add(id);
    out.push({
      branchId: id,
      name: String(item?.branchName ?? item?.name ?? `Branch ${id}`),
      code: String(item?.branchCode ?? item?.code ?? ''),
    });
  }
  return out;
}

function normalizeLinkedBranchIds(raw: unknown): number[] {
  const body = (raw as any)?.responseBody ?? raw;
  if (!body) return [];

  const toNumber = (v: any): number | null => {
    const n = typeof v === 'string' ? parseInt(v, 10) : Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const extractId = (item: any): number | null => {
    const idRaw =
      item?.branchId ??
      item?.BranchId ??
      item?.branchMasterId ??
      item?.BranchMasterId ??
      item?.branchID ??
      item?.BranchID ??
      item?.id ??
      item?.ID;
    return toNumber(idRaw);
  };

  // Common shapes:
  // 1) { branchIds: [25,85] }
  if (Array.isArray((body as any).branchIds)) {
    return (body as any).branchIds.map(toNumber).filter((n: any) => n !== null);
  }
  if (Array.isArray((body as any).BranchIds)) {
    return (body as any).BranchIds.map(toNumber).filter((n: any) => n !== null);
  }

  // 2) { branchList: [ { branchId: 25, ...}, ... ] }
  if (Array.isArray((body as any).branchList)) {
    return (body as any).branchList.map(extractId).filter((n: any) => n !== null);
  }
  if (Array.isArray((body as any).BranchList)) {
    return (body as any).BranchList.map(extractId).filter((n: any) => n !== null);
  }

  // 3) Direct array of objects or ids
  if (Array.isArray(body)) {
    return body.map((x: any) => (typeof x === 'number' || typeof x === 'string' ? toNumber(x) : extractId(x))).filter((n: any) => n !== null);
  }

  // 4) { branches: [...] }
  if (Array.isArray((body as any).branches)) {
    return (body as any).branches.map(extractId).filter((n: any) => n !== null);
  }

  return [];
}

interface SplitTreeTableGeoProps {
  treeData: Array<any>;
  onSearch?: (
    query: string,
    page: number,
    pageSize: number,
    selectedNodeId?: string
  ) => Promise<any>;
  isLoading?: boolean;
  channelCode?: string | null;
  locationCode?: string | null;
  highlightBranch?: number | null;
  officeType?: string | null;
  getOptions: (key: string) => any[];
  parentBranchId: number;
  agentId?: number | null;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const SplitTreeTableGeo: React.FC<SplitTreeTableGeoProps> = ({
  treeData,
  onSearch,
  isLoading = false,
  channelCode,
  locationCode,
  highlightBranch,
  getOptions,
  officeType,
  parentBranchId,
  agentId,
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

  // Regulator branches — Gmail-style tags (like RolesManagement add user)
  const [branchCatalog, setBranchCatalog] = useState<BranchOption[]>([]);
  const [branchCatalogLoading, setBranchCatalogLoading] = useState(false);
  const [branchTagSearchText, setBranchTagSearchText] = useState('');
  const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([]);
  const [showBranchSuggestions, setShowBranchSuggestions] = useState(false);
  const [branchSaveLoading, setBranchSaveLoading] = useState(false);
  const [branchTagError, setBranchTagError] = useState<string | null>(null);
  const [linkedBranchesLoading, setLinkedBranchesLoading] = useState(false);
  const [isLinkingBranches, setIsLinkingBranches] = useState(true);
  const [editStartBranchIds, setEditStartBranchIds] = useState<number[]>([]);

  const selectedBranchSet = useMemo(
    () => new Set(selectedBranchIds),
    [selectedBranchIds],
  );

  const selectedBranchesForTags = useMemo(() => {
    return selectedBranchIds.map((id) => {
      const b = branchCatalog.find((x) => x.branchId === id);
      return b ?? { branchId: id, name: `Branch ${id}`, code: '' };
    });
  }, [branchCatalog, selectedBranchIds]);

  const branchSuggestions = useMemo(() => {
    const q = branchTagSearchText.trim().toLowerCase();
    return branchCatalog
      .filter((b) => !selectedBranchSet.has(b.branchId))
      .filter((b) => {
        if (!q) return true;
        return `${b.name} ${b.code}`.toLowerCase().includes(q);
      })
      .slice(0, 20);
  }, [branchCatalog, branchTagSearchText, selectedBranchSet]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setBranchCatalogLoading(true);
      setBranchTagError(null);
      try {
        const res = await agentService.fetchRegulatorBranches({ isActive: true });
        if (!cancelled) setBranchCatalog(parseRegulatorBranchCatalog(res));
      } catch (e) {
        if (!cancelled) {
          setBranchTagError(
            e instanceof Error ? e.message : 'Failed to load branches',
          );
          setBranchCatalog([]);
        }
      } finally {
        if (!cancelled) setBranchCatalogLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  //  Load already mapped branches for the agent (FetchByAgent/{agentId})
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!agentId) {
        setSelectedBranchIds([]);
        setIsLinkingBranches(true);
        setShowBranchSuggestions(false);
        return;
      }

      setLinkedBranchesLoading(true);
      setBranchTagError(null);
      setShowBranchSuggestions(false);

      try {
        const res = await agentService.fetchRegulatorBranchesByAgent({
          agentId,
        });
        const ids = normalizeLinkedBranchIds(res);
        if (cancelled) return;

        setSelectedBranchIds(ids);
        setEditStartBranchIds(ids);
        // Hide the picker if something is already mapped.
        setIsLinkingBranches(ids.length === 0);
      } catch (e) {
        if (cancelled) return;
        setBranchTagError(e instanceof Error ? e.message : 'Failed to fetch mapped branches');
        setSelectedBranchIds([]);
        setIsLinkingBranches(true);
      } finally {
        if (!cancelled) setLinkedBranchesLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [agentId]);

  const addBranchTag = (id: number) => {
    setSelectedBranchIds((prev) =>
      prev.includes(id) ? prev : [...prev, id],
    );
    setBranchTagSearchText('');
    setShowBranchSuggestions(false);
  };

  const removeBranchTag = (id: number) => {
    setSelectedBranchIds((prev) => prev.filter((x) => x !== id));
  };

  const commitBranchInput = () => {
    const q = branchTagSearchText.trim().toLowerCase();
    if (!q) return;
    const exact = branchSuggestions.find(
      (b) =>
        b.name.toLowerCase() === q ||
        (b.code && b.code.toLowerCase() === q),
    );
    if (exact && !selectedBranchSet.has(exact.branchId)) {
      addBranchTag(exact.branchId);
      return;
    }
    if (branchSuggestions.length === 1 && !selectedBranchSet.has(branchSuggestions[0].branchId)) {
      addBranchTag(branchSuggestions[0].branchId);
    }
  };

  const handleSaveRegulatorBranches = async () => {
    if (!agentId || selectedBranchIds.length === 0) return;
    setBranchSaveLoading(true);
    setBranchTagError(null);
    try {
      await agentService.saveRegulatorBranchesForAgent({
        agentId,
        branchIds: selectedBranchIds,
      });
      const res = await agentService.fetchRegulatorBranchesByAgent({
        agentId,
      });
      const ids = normalizeLinkedBranchIds(res);
      setSelectedBranchIds(ids);
      setEditStartBranchIds(ids);
      setIsLinkingBranches(false);
      setShowBranchSuggestions(false);
    } catch (e) {
      setBranchTagError(
        e instanceof Error ? e.message : 'Failed to save branches',
      );
      setIsLinkingBranches(true);
    } finally {
      setBranchSaveLoading(false);
    }
  };

  const handleStartEditRegulatorBranches = () => {
    setEditStartBranchIds(selectedBranchIds);
    setIsLinkingBranches(true);
  };

  const handleCancelRegulatorBranchEdit = () => {
    setSelectedBranchIds(editStartBranchIds);
    setBranchTagSearchText('');
    setShowBranchSuggestions(false);
    setBranchTagError(null);
    setIsLinkingBranches(editStartBranchIds.length === 0);
  };

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
        // If no API provided, try to fetch from GeoChildren API
        if (selectedNode && selectedNode.parentBranchId) {
          setApiLoading(true);
          setError(null);
          
          try {
            const geoAgentHierarchy = await agentService.fetchGeoHierarchyTable(
              selectedNode.parentBranchId
            );
            // console.log("see what geoAgentHierarchy",geoAgentHierarchy)
            
            if (geoAgentHierarchy && Array.isArray(geoAgentHierarchy)) {
              // Map the API response to table data format
              const mappedData = geoAgentHierarchy.map((item: any) => ({
                id: item.branchMasterId?.toString() || '',
                // type: item.agentId ? 'agent' : 'location',
                branchCode: item.branchCode || '',
                branchName: item.branchName || '',
              }));
              // console.log("see what mappedData",mappedData)
              setTableData(mappedData);
              setTotalCount(mappedData.length);
            } else {
              setTableData([]);
              setTotalCount(0);
            }
          } catch (err) {
            console.error('Error fetching geo children:', err);
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
  }, [debouncedSearchQuery, currentPage, pageSize, selectedNode, onSearch, parentBranchId]);

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
    const isHighlighted = highlightBranch && item.parentBranchId === highlightBranch;

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
      <Card className="col-span-12 lg:col-span-4 xl:col-span-4 overflow-hidden flex flex-col h-full">
        <CardHeader className="pb-3 border-b flex-shrink-0">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FiUsers className="h-5 w-5" />
            Hierarchy Navigator
          </CardTitle>
        </CardHeader>
        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full">
            <CardContent className="pt-4 pb-2">
              {treeData?.map((item) => renderTreeNode(item))}
            </CardContent>
          </ScrollArea>
        </div>
      </Card>

      {/* RIGHT PANEL - Table with Search & Pagination */}
      <Card className="col-span-12 lg:col-span-8 xl:col-span-8 overflow-hidden flex flex-col">
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col gap-3">
            {/* Regulator branches — search & tag (same pattern as RolesManagement → Add User) */}
            <div className="border-b pb-3 dark:border-neutral-800 dark:bg-neutral-950/30">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <p className="text-lg font-medium text-foreground">
                    Update Regulator Branches
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Search (e.g. Head Office), pick from list or press Enter.
                    Update assigns branches to this agent.
                  </p>
                </div>
                {isLinkingBranches ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      disabled={branchSaveLoading || linkedBranchesLoading}
                      onClick={handleCancelRegulatorBranchEdit}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="blue"
                      size="sm"
                      type="button"
                      disabled={
                        branchSaveLoading ||
                        linkedBranchesLoading ||
                        !agentId ||
                        selectedBranchIds.length === 0 ||
                        branchCatalogLoading
                      }
                      onClick={handleSaveRegulatorBranches}
                    >
                      {branchSaveLoading ? 'Saving…' : 'Save'}
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="blue"
                    size="sm"
                    type="button"
                    disabled={!agentId || linkedBranchesLoading}
                    onClick={handleStartEditRegulatorBranches}
                  >
                    {linkedBranchesLoading ? 'Loading…' : 'Edit'}
                  </Button>
                )}
              </div>

              {branchTagError && (
                <Alert variant="destructive" className="mt-2 py-2">
                  <FiAlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {branchTagError}
                  </AlertDescription>
                </Alert>
              )}

              <div
                className={cn(
                  'mt-2 w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-sm',
                  'focus-within:outline-none focus-within:ring-2 focus-within:ring-[var(--brand-blue)]',
                )}
                onClick={() => isLinkingBranches && setShowBranchSuggestions(true)}
              >
                <div className="flex flex-wrap items-center gap-2">
                  {branchCatalogLoading && (
                    <FiLoader className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
                  )}
                  {selectedBranchesForTags.map((b) => (
                    <span
                      key={b.branchId}
                      className="inline-flex max-w-full items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200"
                      title={b.code ? `${b.name} (${b.code})` : b.name}
                    >
                      <span className="max-w-[200px] truncate">{b.name}</span>
                      {isLinkingBranches && (
                        <button
                          type="button"
                          className="shrink-0 text-blue-700/80 hover:text-blue-900 dark:text-blue-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeBranchTag(b.branchId);
                          }}
                          aria-label={`Remove ${b.name}`}
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                  {isLinkingBranches && (
                    <input
                      type="text"
                      value={branchTagSearchText}
                      disabled={branchCatalogLoading}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBranchTagSearchText(val);
                        setShowBranchSuggestions(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          commitBranchInput();
                        }
                        if (
                          e.key === 'Backspace' &&
                          branchTagSearchText.length === 0 &&
                          selectedBranchIds.length > 0
                        ) {
                          removeBranchTag(
                            selectedBranchIds[selectedBranchIds.length - 1],
                          );
                        }
                      }}
                      onBlur={() => {
                        window.setTimeout(
                          () => setShowBranchSuggestions(false),
                          150,
                        );
                      }}
                      onFocus={() => setShowBranchSuggestions(true)}
                      placeholder={
                        branchCatalog.length === 0 && !branchCatalogLoading
                          ? 'No branches loaded — check API / network'
                          : !agentId
                            ? 'Search branches (open an agent to save)'
                            : selectedBranchIds.length
                              ? 'Type to search more branches…'
                              : 'Search branches (e.g. Head Office)…'
                      }
                      className="min-w-[160px] flex-1 border-0 bg-transparent px-1 py-1 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  )}
                </div>
              </div>

              {isLinkingBranches &&
                showBranchSuggestions &&
                !branchCatalogLoading && (
                <div className="z-30 mt-1 max-h-56 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-950">
                  {branchCatalog.length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground">
                      No branches loaded — check API / network
                    </div>
                  ) : branchSuggestions.length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground">
                      {branchTagSearchText.trim()
                        ? 'No matching branches'
                        : 'Showing all branches — type to filter'}
                    </div>
                  ) : (
                    branchSuggestions.map((b) => (
                      <button
                        key={b.branchId}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => addBranchTag(b.branchId)}
                        className="w-full px-3 py-2 text-left text-sm transition hover:bg-muted"
                      >
                        <div className="font-medium text-foreground">
                          {b.name}
                        </div>
                        {b.code ? (
                          <div className="truncate text-xs text-muted-foreground">
                            {b.code}
                          </div>
                        ) : null}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          

          <div className="flex  gap-2">
            <p>Select Office Type</p>
              <Select value={officeType || ''} disabled>
                <SelectTrigger>
                  <SelectValue placeholder="Select Office Type" />
                </SelectTrigger>
                <SelectContent>
                  {getOptions(MASTER_DATA_KEYS.Office_Type).map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p>Select Location</p>
              <Select value={locationCode || ''} disabled>
                <SelectTrigger>
                  <SelectValue placeholder="Select Location" />
                </SelectTrigger>
                <SelectContent>
                  {getOptions(MASTER_DATA_KEYS.Office_Type).map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
     
          
            <div className="flex  items-center justify-between">
             
             
              <CardTitle className="text-lg mb-2">
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
                    <TableHead className="w-[200px]">Branch Name</TableHead>
                    {/* <TableHead className="w-[100px]">Type</TableHead> */}
                    <TableHead className="w-[140px]">Brach Code</TableHead>
                    {/* <TableHead className="w-[180px]">Agent Name</TableHead>
                    <TableHead className="w-[130px]">Region</TableHead> */}
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
                            <span className="truncate">{item.branchName}</span>
                          </div>
                        </TableCell>
                        {/* <TableCell>
                          <Badge
                            variant="secondary"
                            className={cn(
                              'text-xs font-semibold',
                              getTypeBadgeClass(item.type)
                            )}
                          >
                            {item.type}
                          </Badge>
                        </TableCell> */}
                        <TableCell className="truncate">
                          {item.branchCode}
                        </TableCell>
                        {/* <TableCell className="truncate">
                          {item.agentName}
                        </TableCell>
                        <TableCell className="truncate">{item.region}</TableCell> */}
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

export default SplitTreeTableGeo;