import { MetricsCard } from '@/components/MetricsCard'
import { BsWindowDock } from 'react-icons/bs'
import { TbCertificate } from 'react-icons/tb'
import { LuSquareUserRound } from 'react-icons/lu'
import { AlertCard } from '@/components/AlertCard'
import { useTheme } from '@mui/material'
import QuickAction from '@/components/QuickAction'
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
  const theme=useTheme()
  const alerts = [
  {
    icon: TbCertificate,
    iconBgColor: theme.palette.primary.main,
    iconColor: 'white',
    count: '52',
    countColor: theme.palette.primary.main,
    title: 'Licenses Expiring Soon',
    subtitle: 'Expiring in 30 days',
    },
  {
    icon: BsWindowDock,
    iconBgColor: theme.palette.secondary.main,
    iconColor: 'text-green-600',
    count: '23',
    countColor: theme.palette.secondary.main,
    title: 'Certifications Expiring',
    subtitle: 'Expiring in 30 days',
 },
  {
    icon: LuSquareUserRound,
    iconBgColor: theme.palette.success.main,
    iconColor: 'text-blue-600',
    count: '13',
    countColor: theme.palette.success.main,
    title: 'MBG Criteria Not Met',
    subtitle: 'Entities not meeting MBG criteria',
    },
]
  return (
    <div className='flex  gap-6 mr-8'>
    <div>
      <div className="flex flex-col lg:flex-row gap-6">
        {metrics.map((metric, index) => (
          <MetricsCard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            changeType={metric.changeType}
            chartColor={metric.chartColor}
            chartData={metric.chartData}
          />
        ))}
      </div>

      <div className="px-6 py-3 bg-gray-50 mt-5 rounded-lg">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-lg font-bold text-gray-900">Urgent Alerts</h1>
          </div>

          {/* Alert Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alerts.map((alert, index) => (
              <AlertCard
                key={index}
                icon={alert.icon}
                iconBgColor={alert.iconBgColor}
                iconColor={alert.iconColor}
                count={alert.count}
                countColor={alert.countColor}
                title={alert.title}
                subtitle={alert.subtitle}
                notifyBtnColor={alert.notifyBtnColor}
                notifyBtnTextColor={alert.notifyBtnTextColor}
                viewBtnColor={alert.viewBtnColor}
                viewBtnTextColor={alert.viewBtnTextColor}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
    <div>
      <QuickAction/>
    </div>
    </div>
  )
}

export default Dashboard
