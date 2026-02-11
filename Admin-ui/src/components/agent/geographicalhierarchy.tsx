// Hierarchy.tsx
import { useQuery } from '@tanstack/react-query'
import type { TreeViewItem } from '../ui/tree-view'
import type { IGeoHierarchy } from '@/models/agent'
import { agentService } from '@/services/agentService'
import Loader from '../Loader'
import SplitTreeTableGeo from '../ui/SplitTreeViewGeo'

interface GeoHierarchyProps {
  Agent: { agentId: number }
  channelCode?: string | null
  getOptions: (key: string) => any[]
}

const buildGeoHierarchyTree = (hierarchies: Array<IGeoHierarchy>): Array<TreeViewItem> => {
  const nodeMap = new Map<number, TreeViewItem>()
  let rootNode: TreeViewItem | null = null

  // Process each hierarchy path
  hierarchies.forEach(item => {
    const processPath = (node: IGeoHierarchy, parent: TreeViewItem | null = null) => {
      let currentNode = nodeMap.get(node.branchMasterId)
      
      if (!currentNode) {
        currentNode = {
          id: node.branchMasterId.toString(),
          name: node.branchName + ' - ' + node.branchCode,
          type: 'location',
          agentCode: '',
          agentName: '',
          branchCode: node.branchCode || '',
          branchName: node.branchName || '',
          parentBranchId: node.branchMasterId,
          children: [],
        } as unknown as TreeViewItem & { branchCode: string; branchName: string; parentBranchId: number }
        nodeMap.set(node.branchMasterId, currentNode)
      }

      if (parent) {
        // Check if this child is already added to the parent
        if (!parent.children?.find(c => c.id === currentNode!.id)) {
          parent.children?.push(currentNode!)
        }
      } else {
        // This is the root node
        rootNode = currentNode || null
      }

      if (node.parentLocation) {
        processPath(node.parentLocation, currentNode)
      }
    }

    processPath(item)
  })

  return rootNode ? [rootNode] : []
}





export const GeographicalHierarchy = ({ channelCode,getOptions }: GeoHierarchyProps) => {
  const { data: geoHierarchy, isLoading, isError } = useQuery({
    queryKey: ['geoHierarchy', channelCode],
    queryFn: () => agentService.fetchGeoHierarchy(channelCode || ''),
    enabled: !!channelCode, 
    staleTime: 5 * 60 * 1000, 
  })

  if (!channelCode) {
    return <div className="text-center p-4 text-gray-500">Channel category is required to load geographical hierarchy.</div>
  }

  if (isLoading) return <Loader />
  if (isError) return <div className="text-center p-4 text-red-500">Failed to load geographical hierarchy.</div>

  // console.log("see what get",geoHierarchy?.geoHierarchy) //in each object we have branchCode take that and pass to split

  const treeData = geoHierarchy?.geoHierarchy
    ? buildGeoHierarchyTree(geoHierarchy.geoHierarchy)
    : []

  // Extract root branchMasterId (the one without parentLocation) to use as parentBranchId
  const rootBranch = geoHierarchy?.geoHierarchy?.find((item: IGeoHierarchy) => !item.parentLocation)
  const parentBranchId = rootBranch?.branchMasterId || 0
    
  return <SplitTreeTableGeo getOptions={getOptions} treeData={treeData} channelCode={channelCode} parentBranchId={parentBranchId} />
}
