// Hierarchy.tsx
import { useQuery } from '@tanstack/react-query'
import SplitTreeTable from '../ui/SplitTreeView'
import type { TreeViewItem } from '../ui/tree-view'
import type { IGeoHierarchy } from '@/models/agent'
import { agentService } from '@/services/agentService'
import Loader from '../Loader'

interface GeoHierarchyProps {
  Agent: { agentId: number }
  channelCode?: string | null
}

const buildGeoHierarchyTree = (hierarchies: Array<IGeoHierarchy>): Array<TreeViewItem> => {
  const nodeMap = new Map<number, TreeViewItem>()
  const childSet = new Set<number>()

  const flatten = (node: IGeoHierarchy | null) => {
    if (!node) return

    if (!nodeMap.has(node.designationId)) {
      nodeMap.set(node.designationId, {
        id: node.designationId.toString(),
        name: `${node.designationName} - ${node.designationCode}`,
        type: 'designation',
        agentCode: node.designationCode || '',
        agentName: node.designationName || '',
        children: [],
      })
    }

    if (node.parentLocation) {
      // Mark current node as a child (it has a parent)
      childSet.add(node.designationId)
      // Recursively process the parent
      flatten(node.parentLocation)

      // Add current node as a child of its parent
      const parentNode = nodeMap.get(node.parentLocation.designationId)!
      const childNode = nodeMap.get(node.designationId)!
      if (!parentNode.children?.some((c) => c.id === childNode.id)) {
        parentNode.children?.push(childNode)
      }
    }
  }

  hierarchies.forEach(flatten)

  const roots: Array<TreeViewItem> = []
  nodeMap.forEach((node, id) => {
    if (!childSet.has(Number(id))) roots.push(node)
  })

  return roots
}

export const GeographicalHierarchy = ({ channelCode }: GeoHierarchyProps) => {
  const { data: geoHierarchy, isLoading, isError } = useQuery({
    queryKey: ['geoHierarchy', channelCode],
    queryFn: () => agentService.fetchGeoHierarchy(channelCode || ''),
    enabled: !!channelCode, // Only fetch if channelCategory is available
    staleTime: 5 * 60 * 1000, // optional: cache for 5 minutes
  })

  if (!channelCode) {
    return <div className="text-center p-4 text-gray-500">Channel category is required to load geographical hierarchy.</div>
  }

  // if (isLoading) return <div className="text-center p-4">Loading geographical hierarchy...</div>
  if (isLoading) return <Loader />
  if (isError) return <div className="text-center p-4 text-red-500">Failed to load geographical hierarchy.</div>

  console.log("whatis the geo hierarchy", geoHierarchy)
  const treeData = geoHierarchy?.geoHierarchy
    ? buildGeoHierarchyTree(geoHierarchy.geoHierarchy)
    : []

  return <SplitTreeTable treeData={treeData} />
}
