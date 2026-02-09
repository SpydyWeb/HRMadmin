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
  locationCode?: string | null
  getOptions: (key: string) => any[]
}


// const buildGeoHierarchyTree = (hierarchies: Array<IGeoHierarchy>): Array<TreeViewItem> => {
//   const nodeMap = new Map<number, TreeViewItem>()

//   // Process all nodes and establish parent-child relationships
//   hierarchies.forEach(hierarchy => {
//     const processNode = (node: IGeoHierarchy) => {
//       // Create the node if it doesn't exist
//       if (!nodeMap.has(node.designationId)) {
//         nodeMap.set(node.designationId, {
//           id: node.designationId,
//           name: `${node.designationName} - ${node.designationCode}`,
//           type: 'designation',
//           agentCode: node.designationCode || '',
//           agentName: node.designationName || '',
//           children: [],
//         })
//       }

//       // If this node has a "parentLocation" (which is actually its child in the hierarchy)
//       if (node.parentLocation) {
//         // Process the child node
//         processNode(node.parentLocation)
        
//         // Add the child to this node's children
//         const parentNode = nodeMap.get(node.designationId)!
//         const childNode = nodeMap.get(node.parentLocation.designationId)!
        
//         if (!parentNode.children?.some((c) => c.id === childNode.id)) {
//           parentNode.children?.push(childNode)
//         }
//       }
//     }

//     processNode(hierarchy)
//   })

//   // The roots are the top-level nodes in the hierarchies array
//   return hierarchies.map(h => nodeMap.get(h.designationId)!).filter(Boolean)
// }

const buildGeoHierarchyTree = (hierarchies: Array<IGeoHierarchy>): Array<TreeViewItem> => {
  const nodeMap = new Map<number, TreeViewItem>()
  const rootNodes: TreeViewItem[] = []

  // The items in the initial `hierarchies` array are the roots of the trees.
  hierarchies.forEach(rootHierarchy => {
    // Recursive function to traverse the chain of children.
    const processNode = (node: IGeoHierarchy): TreeViewItem => {
      // 1. Create the TreeViewItem for the current node if it doesn't exist.
      if (!nodeMap.has(node.locationMasterId)) {
        nodeMap.set(node.locationMasterId, {
          id: node.locationMasterId,
          name: `${node.locationName} - ${node.locationCode}`,
          type: 'location',
          agentCode: node.locationCode || '',
          agentName: node.locationName || '',
          children: [],
        })
      }
      const currentNode = nodeMap.get(node.locationMasterId)!;

      // 2. If the node has a "child" (misnamed as parentLocation), process it.
      if (node.parentLocation) {
        const childNode = processNode(node.parentLocation); // Recursively process the child
        
        // Add the child to the current node's children array if it's not already there.
        if (!currentNode.children?.some((c) => c.id === childNode.id)) {
          currentNode.children?.push(childNode);
        }
      }
      
      // 3. Return the current node.
      return currentNode;
    };

    // Start processing from the root of this chain and add it to the list of roots.
    const rootNode = processNode(rootHierarchy);
    rootNodes.push(rootNode);
  });

  return rootNodes;
}





export const GeographicalHierarchy = ({ channelCode,locationCode,getOptions }: GeoHierarchyProps) => {
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
    
  return <SplitTreeTableGeo getOptions={getOptions} treeData={treeData} channelCode={channelCode} locationCode={locationCode} highlightLocationCode={locationCode} />
}
