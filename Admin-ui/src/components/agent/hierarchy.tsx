// Hierarchy.tsx
import { useQuery } from '@tanstack/react-query'
import SplitTreeTable from '../ui/SplitTreeView'
import type { TreeViewItem } from '../ui/tree-view'
import type { IAgentSearchByCodeRequest, IPeopleHierarchy } from '@/models/agent'
import { agentService } from '@/services/agentService'
import Loader from '../Loader'

interface HierarchyProps {
  Agent: { agentId: number }
  highlightAgentCode?: string
}

const buildUniqueSupervisorTree = (hierarchies: Array<IPeopleHierarchy>): Array<TreeViewItem> => {
  const nodeMap = new Map<number, TreeViewItem>()
  const childSet = new Set<number>()

  const flatten = (node: IPeopleHierarchy | null) => {
    if (!node) return

    if (!nodeMap.has(node.agentId)) {
      nodeMap.set(node.agentId, {
        id: node.agentId.toString(),
        name: node.firstName + ' - ' + node.agentCode,
        type: 'agent',
        agentCode: node.agentCode || '',
        agentName: [node.firstName, node.middleName, node.lastName].filter(Boolean).join(' '),
        children: [],
      })
    }

    if (node.supervisors) {
      childSet.add(node.supervisors.agentId)
      flatten(node.supervisors)

      const parentNode = nodeMap.get(node.agentId)!
      const childNode = nodeMap.get(node.supervisors.agentId)!
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

export const Hierarchy = ({ Agent, highlightAgentCode }: HierarchyProps) => {
  const requestData: IAgentSearchByCodeRequest = {
    agentId: Agent.agentId,
    FetchHierarchy: true,
  }

  const { data: agent, isLoading, isError } = useQuery({
    queryKey: ['agentHierarchy', requestData], // object form
    queryFn: () => agentService.fetchAgentHierarchy(requestData), // object form
    staleTime: 5 * 60 * 1000, // optional: cache for 5 minutes
  })

  if (isLoading) return <Loader />
  if (isError) return <div className="text-center p-4 text-red-500">Failed to load hierarchy.</div>

  const treeData = agent?.peopleHeirarchy
    ? buildUniqueSupervisorTree(agent.peopleHeirarchy)
    : []

  return <SplitTreeTable treeData={treeData} highlightAgentCode={highlightAgentCode} />
}
