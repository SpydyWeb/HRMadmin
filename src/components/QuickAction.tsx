import { FaPlus } from 'react-icons/fa6'
import { LuSquareUserRound } from 'react-icons/lu'
import { RxDownload, RxUpload } from 'react-icons/rx'
import { ActionItem } from '@/utils/models'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

const actions: Array<ActionItem> = [
  {
    icon: FaPlus,
    title: 'Bulk Create Entity',
    subtitle: 'Create multiple entities at once',
    onClick: () => alert('Bulk Create Entity clicked'),
  },
  {
    icon: LuSquareUserRound,
    title: 'Create Individually',
    subtitle: 'Create a new entity',
    onClick: () => alert('Create Individually clicked'),
  },
  {
    icon: RxUpload,
    title: 'Export Hierarchy',
    subtitle: 'Export current hierarchy data',
    onClick: () => alert('Export Hierarchy clicked'),
  },
  {
    icon: RxDownload,
    title: 'Import Hierarchy',
    subtitle: 'Import hierarchy from file',
    onClick: () => alert('Import Hierarchy clicked'),
  },
]

const QuickActions = () => {
  return (
    <Card className="px-2 gap-0 rounded-md">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-2">
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <div
              key={index}
              className="flex items-center justify-start gap-3 rounded-md border border-gray-100 bg-gray-100 hover:bg-white hover:shadow-lg text-left p-3  shadow-sm transition cursor-pointer"
            >
              <div className="flex items-center justify-center h-8 w-8 rounded-lg border border-gray-900 hover:border-blue-700 ">
                <Icon className="h-5 w-5 text-gray-700 hover:text-blue-700" />
              </div>
              <div>
                <div className="text-sm text-gray-800 font-bold">
                  {action.title}
                </div>
                <div className="text-xs text-gray-500">{action.subtitle}</div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

export default QuickActions
