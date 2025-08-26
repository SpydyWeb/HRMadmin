import { MetricsCard } from '@/components/MetricsCard'
import { AlertCard } from '@/components/AlertCard'
import QuickAction from '@/components/QuickAction'
import PendingActionsTable from '@/components/PendingActionsTable'
import CompanyOverview from '@/components/CompanyOverview'
import ResourcesCard from '@/components/ResourcesCard'
import GoToCard from '@/components/GoToCard'
const metrics = [
  {
    title: 'Total Entities',
    value: '1250',
    change: '+120',
    changeType: 'positive',
    chartColor: '#10b981',
    chartData: [15, 18, 16, 22, 25, 28, 32, 35, 40], // Clear upward trend for +120
  },
  {
    title: 'Created This Month',
    value: '152',
    change: '-10',
    changeType: 'negative',
    chartColor: '#ef4444',
    chartData: [35, 38, 42, 40, 38, 35, 32, 28, 25], // Downward trend for -10
  },
  {
    title: 'Terminated This Month',
    value: '250',
    change: '+5',
    changeType: 'positive',
    chartColor: '#10b981',
    chartData: [20, 18, 19, 21, 20, 22, 23, 24, 25], // Slight upward trend for +5
  },
  {
    title: 'Net Entity This Month',
    value: '48',
    change: '+5',
    changeType: 'positive',
    chartColor: '#10b981',
    chartData: [20, 18, 19, 21, 20, 22, 23, 24, 25], // Slight upward trend for +5
  },
]

const Dashboard = () => {
  return (
    <div className="flex  gap-6">
      <div className="w-full space-y-3">
          <MetricsCard />
          <AlertCard />
          <PendingActionsTable />
          <CompanyOverview />
      </div>
      <div className="max-w-[18rem] w-full space-y-3">
        <QuickAction />
        <ResourcesCard />
        <GoToCard />
      </div>
    </div>
  )
}

export default Dashboard
