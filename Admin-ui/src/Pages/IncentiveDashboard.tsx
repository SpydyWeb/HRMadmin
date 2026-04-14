import { useMemo, useState } from 'react'
import {
  FiBarChart2,
  FiDownload,
  FiExternalLink,
  FiList,
  FiSearch,
  FiUpload,
  FiUserPlus,
} from 'react-icons/fi'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
} from 'recharts'

type PeriodMode = 'monthly' | 'quarterly'
type MonthlyAchievementRow = { month: string; budget: number; revenue: number; payout: number }
type PeriodAchievementRow = { period: string; budget: number; revenue: number; payout: number }

const statCards = [
  { title: 'Variable Budget', value: '12', delta: '+3 this month' },
  { title: 'Actual Expenses', value: '248', delta: '+18 this month' },
  { title: 'Variance Against Budget', value: '₹4.2L', delta: '-2 this month' },
  { title: 'Provision but yet to pay', value: '78%', delta: '+5% this month' },
]

// Placeholder series until APIs are wired. Structure matches requested metrics.
const monthlyAchievementData: MonthlyAchievementRow[] = [
  { month: 'Jan', budget: 600000, revenue: 520000, payout: 310000 },
  { month: 'Feb', budget: 650000, revenue: 610000, payout: 360000 },
  { month: 'Mar', budget: 700000, revenue: 640000, payout: 390000 },
  { month: 'Apr', budget: 720000, revenue: 690000, payout: 420000 },
  { month: 'May', budget: 750000, revenue: 710000, payout: 440000 },
  { month: 'Jun', budget: 800000, revenue: 760000, payout: 480000 },
]

const CHANNEL_COLORS: Record<string, string> = {
  Agency: '#14b8a6',
  Bancassurance: '#7c3aed',
  Direct: '#f59e0b',
  Broker: '#ef4444',
}

const channelRevenueShare = [
  { name: 'Agency', value: 44, color: CHANNEL_COLORS.Agency },
  { name: 'Bancassurance', value: 26, color: CHANNEL_COLORS.Bancassurance },
  { name: 'Direct', value: 18, color: CHANNEL_COLORS.Direct },
  { name: 'Broker', value: 12, color: CHANNEL_COLORS.Broker },
]

const channelIncentiveShare = [
  { name: 'Agency', value: 38, color: CHANNEL_COLORS.Agency },
  { name: 'Bancassurance', value: 24, color: CHANNEL_COLORS.Bancassurance },
  { name: 'Direct', value: 22, color: CHANNEL_COLORS.Direct },
  { name: 'Broker', value: 16, color: CHANNEL_COLORS.Broker },
]

const topSchemePerformance = [
  { schemeName: 'Summer Fresher Program 2024', channel: 'Agency', budget: 500000, revenue: 430000, payout: 260000 },
  { schemeName: 'Q2 Growth Booster', channel: 'Bancassurance', budget: 450000, revenue: 410000, payout: 240000 },
  { schemeName: 'Motor Push', channel: 'Direct', budget: 380000, revenue: 360000, payout: 210000 },
  { schemeName: 'Health Accelerator', channel: 'Broker', budget: 300000, revenue: 290000, payout: 175000 },
]

const toCurrency = (n: number) => `₹${Math.round(n).toLocaleString()}`

const quarterOf = (monthShort: string) => {
  const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(monthShort)
  if (m < 0) return 'Q?'
  return `Q${Math.floor(m / 3) + 1}`
}

const aggregateToQuarterly = (rows: MonthlyAchievementRow[]): PeriodAchievementRow[] => {
  const map = new Map<string, PeriodAchievementRow>()
  for (const r of rows) {
    const q = quarterOf(r.month)
    const existing = map.get(q) ?? { period: q, budget: 0, revenue: 0, payout: 0 }
    existing.budget += r.budget
    existing.revenue += r.revenue
    existing.payout += r.payout
    map.set(q, existing)
  }
  return Array.from(map.values())
}

const quickActions = [
  {
    title: 'Programs',
    subtitle: 'View, edit, or create incentive programs',
    icon: FiList,
  },
  {
    title: 'KPI',
    subtitle: 'Browse KPIs or create a new one',
    icon: FiBarChart2,
  },
  {
    title: 'Add Agent Target',
    subtitle: 'Assign agent-wise goals',
    icon: FiUserPlus,
  },
  {
    title: 'Export Incentive Data',
    subtitle: 'Download monthly payout report',
    icon: FiDownload,
  },
  {
    title: 'Import Payout File',
    subtitle: 'Upload processed payout file',
    icon: FiUpload,
  },
]

const resourceItems = [
  { title: 'Incentive Policy', link: '#' },
  { title: 'Payout Rulebook', link: '#' },
  { title: 'Approval Workflow', link: '#' },
  { title: 'Incentive Master Setup', link: '#' },
  { title: 'Exception Handling Guide', link: '#' },
]

const goToItems = [
  { title: 'Programs', to: '/search/incentive/programs' },
  { title: 'Program Config', to: '/search/incentive/program-config' },
  { title: 'Product Weightage', to: '/search/incentive/product-weightage' },
  // { title: 'KPI', to: '/search/incentive/kpis' },
  { title: 'Payout Config', to: '#' },
  { title: 'Incentive Cycles', to: '#' },
  { title: 'Approval Queue', to: '#' },
]

const IncentiveDashboard = () => {
  const [resourceSearch, setResourceSearch] = useState('')
  const [periodMode, setPeriodMode] = useState<PeriodMode>('monthly')
  const navigate = useNavigate()

  const filteredResources = useMemo(
    () =>
      resourceItems.filter((item) =>
        item.title.toLowerCase().includes(resourceSearch.toLowerCase()),
      ),
    [resourceSearch],
  )

  const achievementChartData: PeriodAchievementRow[] = useMemo(() => {
    return periodMode === 'monthly'
      ? monthlyAchievementData.map((r) => ({
          period: r.month,
          budget: r.budget,
          revenue: r.revenue,
          payout: r.payout,
        }))
      : aggregateToQuarterly(monthlyAchievementData)
  }, [periodMode])

  return (
    <div className="min-h-screen py-2">
      <div className="max-w-full p-2">
        <div className="flex flex-col gap-4 xl:flex-row">
          <div className="min-w-0 flex-1 space-y-4">
            {/* <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1> */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {statCards.map((card) => (
                <Card key={card.title} className="gap-2 rounded-lg border border-neutral-200 py-4 shadow-sm">
                  <CardContent className="px-4">
                    <p className="text-sm text-neutral-500">{card.title}</p>
                    <p className="mt-1 text-3xl font-bold text-neutral-900">{card.value}</p>
                    <p className="mt-1 text-xs text-emerald-600">{card.delta}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card className="rounded-lg border border-neutral-200 py-4">
                <CardHeader className="px-4 pb-2">
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-base">Monthly / Quarterly Achievements</CardTitle>
                    <div className="flex items-center rounded-md border border-neutral-200 bg-white p-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setPeriodMode('monthly')}
                        className={`rounded px-2 py-1 font-medium ${periodMode === 'monthly' ? 'bg-teal-600 text-white' : 'text-neutral-700 hover:bg-neutral-50'}`}
                      >
                        Monthly
                      </button>
                      <button
                        type="button"
                        onClick={() => setPeriodMode('quarterly')}
                        className={`rounded px-2 py-1 font-medium ${periodMode === 'quarterly' ? 'bg-teal-600 text-white' : 'text-neutral-700 hover:bg-neutral-50'}`}
                      >
                        Quarterly
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="h-[280px] px-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={achievementChartData}>
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip formatter={(value) => toCurrency(Number(value ?? 0))} />
                      <Legend />
                      <Bar dataKey="budget" name="Budget" radius={[6, 6, 0, 0]} fill="#0ea5e9" />
                      <Bar dataKey="revenue" name="Revenue" radius={[6, 6, 0, 0]} fill="#14b8a6" />
                      <Bar dataKey="payout" name="Payout" radius={[6, 6, 0, 0]} fill="#7c3aed" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="rounded-lg border border-neutral-200 py-4">
                <CardHeader className="px-4 pb-2">
                  <CardTitle className="text-base">Channel-wise Share</CardTitle>
                </CardHeader>
                <CardContent className="px-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-md border border-neutral-200 bg-white p-2">
                      <p className="px-2 pt-2 text-xs font-semibold text-neutral-700">Revenue</p>
                      <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={channelRevenueShare}
                              dataKey="value"
                              nameKey="name"
                              innerRadius={50}
                              outerRadius={82}
                              paddingAngle={2}
                              label={({ name, value }) => `${name} ${value}%`}
                            >
                              {channelRevenueShare.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${Number(value ?? 0)}%`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="rounded-md border border-neutral-200 bg-white p-2">
                      <p className="px-2 pt-2 text-xs font-semibold text-neutral-700">Incentive</p>
                      <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={channelIncentiveShare}
                              dataKey="value"
                              nameKey="name"
                              innerRadius={50}
                              outerRadius={82}
                              paddingAngle={2}
                              label={({ name, value }) => `${name} ${value}%`}
                            >
                              {channelIncentiveShare.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${Number(value ?? 0)}%`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card className="rounded-lg border border-neutral-200 py-4">
                <CardHeader className="px-4 pb-2">
                  <CardTitle className="text-base">Budget vs Payout / Revenue</CardTitle>
                </CardHeader>
                <CardContent className="h-[260px] px-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={achievementChartData}>
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip formatter={(value) => toCurrency(Number(value ?? 0))} />
                      <Legend />
                      <Bar dataKey="budget" name="Budget" radius={[6, 6, 0, 0]} fill="#0ea5e9" />
                      <Bar dataKey="revenue" name="Revenue" radius={[6, 6, 0, 0]} fill="#14b8a6" />
                      <Bar dataKey="payout" name="Payout" radius={[6, 6, 0, 0]} fill="#7c3aed" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="rounded-lg border border-neutral-200 py-4">
                <CardHeader className="px-4 pb-2">
                  <CardTitle className="text-base">Title here</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 px-4">
                  {topSchemePerformance.map((row) => (
                    <div
                      key={`${row.schemeName}-${row.channel}`}
                      className="rounded-md border border-neutral-200 bg-neutral-100 p-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-neutral-900">{row.schemeName}</p>
                          <p className="text-xs text-neutral-500">Channel: {row.channel}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-neutral-500">Budget: {toCurrency(row.budget)}</p>
                          <p className="text-xs text-neutral-500">Revenue: {toCurrency(row.revenue)}</p>
                          <p className="text-sm font-semibold text-emerald-600">Payout: {toCurrency(row.payout)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="w-full xl:max-w-[22rem] space-y-3">
            <Card className="rounded-md gap-0 py-3">
              <CardHeader className="px-4">
                <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-4">
                {quickActions.map((item) => {
                  const Icon = item.icon

                  const handleClick = () => {
                    if (item.title === 'Programs') {
                      navigate({ to: '/search/incentive/programs' })
                    }
                    if (item.title === 'KPI') {
                      navigate({ to: '/search/incentive/kpis' })
                    }
                  }
                  return (
                    <button
                      key={item.title}
                      onClick={handleClick}
                      type="button"
                      className="flex w-full items-center gap-3 rounded-md border border-gray-100 bg-gray-100 p-3 text-left transition hover:bg-white hover:shadow-sm"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-700 text-gray-700">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.subtitle}</p>
                      </div>
                    </button>
                  )
                })}
              </CardContent>
            </Card>

            <Card className="rounded-md gap-0 py-3">
              <CardHeader className="px-4">
                <CardTitle className="text-xl font-semibold">Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-4">
                <div className="relative">
                  <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    label=""
                    variant="searchVariant"
                    className="pl-10"
                    placeholder="Search"
                    value={resourceSearch}
                    onChange={(e) => setResourceSearch(e.target.value)}
                  />
                </div>
                <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                  {filteredResources.map((item) => (
                    <button
                      key={item.title}
                      type="button"
                      className="flex w-full items-center justify-between rounded-lg bg-gray-100 p-3 text-left transition hover:bg-gray-200"
                    >
                      <span className="text-sm font-medium text-gray-700">{item.title}</span>
                      <FiExternalLink className="text-gray-500" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-md gap-0 py-3">
              <CardHeader className="px-4">
                <CardTitle className="text-xl font-semibold">Go To</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 px-4">
                {goToItems.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg bg-gray-100 p-3 text-left transition hover:bg-gray-200"
                    onClick={() => {
                      if (item.to && item.to !== '#') {
                        console.log('Navigating to:', item.to);
                        navigate({ to: item.to as any })
                      }
                    }}
                  >
                    <span className="text-sm font-medium text-gray-700">{item.title}</span>
                    <FiExternalLink className="text-gray-500" />
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IncentiveDashboard
