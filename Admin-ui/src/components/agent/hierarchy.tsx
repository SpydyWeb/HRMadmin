// Hierarchy.tsx
import { useMemo } from 'react'
import SplitTreeTable from '../ui/SplitTreeView'
import type { TreeViewItem } from '../ui/tree-view'

export const Hierarchy = () => {
  const data = useMemo<TreeViewItem[]>(
    () => [
      {
        id: '1',
        name: 'Employee 100',
        type: 'region',
        agentCode: 'AGT-R100',
        agentName: 'John Carter',
        region: 'North Zone',
        children: [
          {
            id: '1.1',
            name: 'Employee 101',
            type: 'store',
            agentCode: 'AGT-S101',
            agentName: 'Sarah Thomas',
            region: 'North Zone',
            children: [
              {
                id: '1.1.1',
                name: 'Employee 111',
                type: 'department',
                agentCode: 'AGT-D111',
                agentName: 'Michael Smith',
                region: 'North Zone',
              },
              {
                id: '1.1.2',
                name: 'Employee 112',
                type: 'department',
                agentCode: 'AGT-D112',
                agentName: 'Emily Davis',
                region: 'North Zone',
              },
              {
                id: '1.1.3',
                name: 'Employee 113',
                type: 'department',
                agentCode: 'AGT-D113',
                agentName: 'Robert Johnson',
                region: 'North Zone',
              },
            ],
          },
          {
            id: '1.2',
            name: 'Employee 115',
            type: 'store',
            agentCode: 'AGT-S115',
            agentName: 'David Brown',
            region: 'North Zone',
          },
          {
            id: '1.3',
            name: 'Employee 116',
            type: 'store',
            agentCode: 'AGT-S116',
            agentName: 'Sophia Lee',
            region: 'North Zone',
          },
        ],
      },
      {
        id: '2',
        name: 'Employee 102',
        type: 'region',
        agentCode: 'AGT-R102',
        agentName: 'Olivia Green',
        region: 'South Zone',
        children: [
          {
            id: '2.1',
            name: 'Employee 114',
            type: 'store',
            agentCode: 'AGT-S114',
            agentName: 'William Johnson',
            region: 'South Zone',
            children: [
              {
                id: '2.1.1',
                name: 'Employee 211',
                type: 'department',
                agentCode: 'AGT-D211',
                agentName: 'Ava Taylor',
                region: 'South Zone',
              },
              {
                id: '2.1.2',
                name: 'Employee 212',
                type: 'department',
                agentCode: 'AGT-D212',
                agentName: 'Noah Martinez',
                region: 'South Zone',
              },
            ],
          },
          {
            id: '2.2',
            name: 'Employee 112',
            type: 'store',
            agentCode: 'AGT-S112',
            agentName: 'Charlotte Scott',
            region: 'South Zone',
          },
          {
            id: '2.3',
            name: 'Employee 113',
            type: 'store',
            agentCode: 'AGT-S113',
            agentName: 'Liam Walker',
            region: 'South Zone',
          },
        ],
      },
      {
        id: '3',
        name: 'Employee 103',
        type: 'region',
        agentCode: 'AGT-R103',
        agentName: 'Ethan Hall',
        region: 'East Zone',
      },
      {
        id: '4',
        name: 'Employee 104',
        type: 'region',
        agentCode: 'AGT-R104',
        agentName: 'Mia Allen',
        region: 'West Zone',
      },
    ],
    [],
  )

  return (
    <>
      {/* Fixed: Changed 'data' to 'treeData' */}
      <SplitTreeTable treeData={data} />
    </>
  )
}