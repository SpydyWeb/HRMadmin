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
  designationCode?: string | null
  getOptions: (key: string) => any[]
}

// const buildGeoHierarchyTree = (hierarchies: Array<IGeoHierarchy>): Array<TreeViewItem> => {
//   const nodeMap = new Map<number, TreeViewItem>()
//   const childSet = new Set<number>()

//   const flatten = (node: IGeoHierarchy | null) => {
//     if (!node) return

//     if (!nodeMap.has(node.designationId)) {
//       nodeMap.set(node.designationId, {
//         id: node.designationId.toString(),
//         name: `${node.designationName} - ${node.designationCode}`,
//         type: 'designation',
//         agentCode: node.designationCode || '',
//         agentName: node.designationName || '',
//         children: [],
//       })
//     }

//     if (node.parentLocation) {
//       // Mark current node as a child (it has a parent)
//       childSet.add(node.designationId)
//       // Recursively process the parent
//       flatten(node.parentLocation)

//       // Add current node as a child of its parent
//       const parentNode = nodeMap.get(node.parentLocation.designationId)!
//       const childNode = nodeMap.get(node.designationId)!
//       if (!parentNode.children?.some((c) => c.id === childNode.id)) {
//         parentNode.children?.push(childNode)
//       }
//     }
//   }

//   hierarchies.forEach(flatten)

//   const roots: Array<TreeViewItem> = []
//   nodeMap.forEach((node, id) => {
//     if (!childSet.has(Number(id))) roots.push(node)
//   })

//   return roots
// }

const buildGeoHierarchyTree = (hierarchies: Array<IGeoHierarchy>): Array<TreeViewItem> => {
  const nodeMap = new Map<number, TreeViewItem>()

  // Process all nodes and establish parent-child relationships
  hierarchies.forEach(hierarchy => {
    const processNode = (node: IGeoHierarchy) => {
      // Create the node if it doesn't exist
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

      // If this node has a "parentLocation" (which is actually its child in the hierarchy)
      if (node.parentLocation) {
        // Process the child node
        processNode(node.parentLocation)
        
        // Add the child to this node's children
        const parentNode = nodeMap.get(node.designationId)!
        const childNode = nodeMap.get(node.parentLocation.designationId)!
        
        if (!parentNode.children?.some((c) => c.id === childNode.id)) {
          parentNode.children?.push(childNode)
        }
      }
    }

    processNode(hierarchy)
  })

  // The roots are the top-level nodes in the hierarchies array
  return hierarchies.map(h => nodeMap.get(h.designationId)!).filter(Boolean)
}





export const GeographicalHierarchy = ({ channelCode,designationCode,getOptions }: GeoHierarchyProps) => {
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


  const treeData = geoHierarchy?.geoHierarchy
    ? buildGeoHierarchyTree(geoHierarchy.geoHierarchy)
    : []
    
  return <SplitTreeTableGeo getOptions={getOptions} treeData={treeData} channelCode={channelCode} designationCode={designationCode} highlightDesignationCode={designationCode} />
}
