import { TbCertificate } from 'react-icons/tb'
import { BsWindowDock } from 'react-icons/bs'
import { LuSquareUserRound } from 'react-icons/lu'
import { CardContent } from '@mui/material'
import { Card, CardHeader, CardTitle } from './ui/card'
import Button from './ui/button'

const alerts = [
  {
    icon: <TbCertificate className={`w-5 h-5`} />,
    iconBgColor: 'var(--brand-orange)',
    count: '52',
    btnColor: 'var(--brand-orange)',
    title: 'Licenses Expiring Soon',
    subtitle: 'Expiring in 30 days',
    button1: 'outline-orange',
    button2: 'orange',
  },
  {
    icon: <BsWindowDock className={`w-5 h-5`} />,
    iconBgColor: 'var(--brand-green)',
    count: '23',
    btnColor: 'var(--brand-green)',
    title: 'Certifications Expiring',
    subtitle: 'Expiring in 30 days',
    button1: 'outline-green',
    button2: 'green',
  },
  {
    icon: <LuSquareUserRound className={`w-5 h-5`} />,
    iconBgColor: 'var(--brand-blue)',
    count: '13',
    btnColor: 'var(--brand-blue)',
    title: 'MBG Criteria Not Met',
    subtitle: 'Entities not meeting MBG criteria',
    button1: 'outline-blue',
    button2: 'blue',
  },
]
export const AlertCard = () => {
  return (
    <Card className="max-w-7xl gap-0 rounded-md">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Urgent Alerts</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alerts.map((alert, index) => (
          <Card
            className="shadow-md rounded-md p-3 flex-1 min-w-0 bg-gray-100"
            key={index}
          >
            {/* Icon and Count */}
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`w-10 h-10 rounded-md flex items-center justify-center text-white`}
                style={{ backgroundColor: alert.iconBgColor }}
              >
                {alert.icon}
              </div>
              <div
                className={`text-4xl font-bold`}
                style={{ color: alert.iconBgColor }}
              >
                {alert.count}
              </div>
            </div>

            {/* Title and Subtitle */}
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {alert.title}
              </h3>
              <p className="text-sm text-gray-500">{alert.subtitle}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between ">
              <Button variant={alert.button1}>Notify</Button>
              <Button variant={alert.button2}>View Details</Button>
            </div>
          </Card>
        ))}
      </CardContent>{' '}
    </Card>
  )
}
