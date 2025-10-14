import { useCallback, useMemo, useState } from 'react'
import { BiDownload, BiFolder, BiFolderOpen, BiGlobe } from 'react-icons/bi'
import { FaFile } from 'react-icons/fa6'
import TreeView from '../ui/tree-view'
import DataTable from '../table/DataTable'
import type { TreeViewItem } from '../ui/tree-view'

const columns = [
  { header: 'Agent Code', accessor: 'agentCode' },
  { header: 'Employee Name', accessor: 'name' },
  { header: 'Region', accessor: 'region' },
  { header: 'Agent Name', accessor: 'agentName' },
]

export const Hierarchy = () => {
  const [selectedItems, setSelectedItems] = useState<Array<TreeViewItem>>([])
  const [tableData, settableData] = useState<Array<TreeViewItem>>([])

  // Memoize data to keep prop identity stable
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

  const customIconMap = {
    region: <BiGlobe className="h-4 w-4 text-purple-500" />,
    store: <BiFolder className="h-4 w-4 text-blue-500" />,
    department: <BiFolderOpen className="h-4 w-4 text-green-500" />,
    item: <FaFile className="h-4 w-4 text-orange-500" />,
  }

  const menuItems = [
    {
      id: 'download',
      label: 'Download',
      icon: <BiDownload className="h-4 w-4" />,
      action: (items: TreeViewItem[]) => console.log('Downloading:', items),
    },
  ]

  // Memoize the selection handler
const handleSelectionChange = useCallback((items: Array<TreeViewItem>) => {
  console.log('Selected items:', items);
  
  setSelectedItems(items)
  if (items[0]?.children?.length > 0) {
    settableData(items[0].children)
  } else {
    settableData([])
  }
}, [])

  return (
    <div className="bg-white flex">
      <div className="w-1/3">
        <TreeView
          data={data}
          title="Tree View Demo"
          showCheckboxes={false}
          iconMap={customIconMap}
          menuItems={menuItems}
          onSelectionChange={handleSelectionChange}
          // Keep onAction for logs only; do NOT call onSelectionChange here
          onAction={(action, items) => {
            if (action === 'item-clicked') {
              console.log('Item clicked:', items[0])
            }
            if (action === 'select-parent') {
              console.log('Parent (or self if root):', items[0])
            }
          }}
          showExpandAll={false}
          showSeach={false}
        />
      </div>
      <div className="w-2/3 p-4">
        {tableData.length > 0 && (
          <DataTable columns={columns} data={tableData} />
        )}
      </div>
    </div>
  )
}