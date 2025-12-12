import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import  Button  from './ui/button'
const companyData=[{
    name: 'Commissioned Budget',
    value: 608,
    color: 'var(--brand-blue)'
    },
    {
    name: 'Commissioned Paid',
    value: 212,
    color: 'var(--brand-green)'
    },
    {
    name: 'Total Commissions on Hold',
    value: 54,
    color: 'var(--destructive)'
    },
    {
    name: 'Commissions Not Paid(Due to bank issue)',
    value: 65,
    color: 'var(--destructive)'
    },
   ]

  const alerts = [
  {
    count: '52',
    agentCode: '52',
    agentName: 'SomeName',
    submittedOn: '2025-01-01',
    submittedBy: 'Admin User',
    btnColor: 'var(--brand-red)',
    title: 'Licenses Expiring Soon',
    subtitle: 'Expiring in 30 days',
    button1: 'outline-orange',
    button2: 'orange',
    button3: 'red',
    button4: 'white',
    status: "Pending",
    text: "Individual Commission",
    buttons: ["View Agent Details"]
  },
  {
    count: '23',
    agentCode: '23',
    agentName: 'somename',
    submittedOn: '2025-01-02',
    submittedBy: 'Manager User',
    btnColor: 'var(--brand-red)',
    title: 'Certifications Expiring',
    subtitle: 'Expiring in 30 days',
    button1: 'outline-green',
    button2: 'green',
    button3: 'red',
    button4: 'white',
    status: "Pending",
    text: "Individual Commission",
     buttons: ["Download Template","Upload changes"]
  },
  {
    count: '13',
    agentCode: '13',
    agentName: 'somename',
    submittedOn: '2025-01-03',
    submittedBy: 'Auditor User',
    btnColor: 'var(--brand-red)',
    title: 'MBG Criteria Not Met',
    subtitle: 'Entities not meeting MBG criteria',
    button1: 'outline-blue',
    button2: 'blue',
    button3: 'red',
    button4: 'white',
    status: "Pending",
    text: "Individual Commission",
     buttons: ["Download Template","Upload changes"]
  }
];

const CompanyOverview = () => {
  return (
          <Card className="px-0 py-3 gap-2 mb-5 rounded-md">
          <CardHeader className="flex flex-row justify-between items-center px-3">
            {/* <CardTitle className="text-xl font-semibold">
              Company Overview
            </CardTitle> */}
            {/* <Select defaultValue="this-month">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
              </SelectContent>
            </Select> */}
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {companyData.map((data, index) => (
              <Card
                className="rounded-md p-5 flex-1 min-w-0 bg-gray-100"
                key={index}
              >
                <div className="text-center">
                  <span className="text-sm font-medium text-gray-600 mb-2">
                    {data.name}
                  </span>
                  <div
                    className={`text-2xl font-bold`}
                    style={{ color: data.color }}
                  >
                    {data.value}
                  </div>
                </div>
              </Card>
            ))}
          </CardContent>
           <CardHeader>
            {/* second cards */}
         {/* <CardTitle className="text-xl font-semibold">Urgent Alerts</CardTitle> */}
       </CardHeader>
       <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {alerts.map((alert, index) => (
           <Card
             className="shadow-md rounded-md p-3 flex-1 min-w-0 bg-gray-100"
             key={index}
           >
             <div className="flex items-center justify-between gap-3 mb-2">
               <div>
                 {alert.text}
               </div>
            <Button style={{backgroundColor:alert.btnColor}} variant={alert.button3}>{alert.status}</Button>

             </div>

             <div className="flex justify-start items-center ">

                {/* Agent Info */}
             <div className="mb-1 mr-20">
               <h3 className="text-lg font-regular text-gray-400 mb-1">
                 Agent Name
               </h3>
               <p className="text-lg font-semibold text-black-500">{alert.agentName}</p>
             </div>
             <div className="mb-1">
               <h3 className="text-lg font-regular text-gray-400 mb-1">
                 Agent Code
               </h3>
               <p className="text-lg font-semibold text-black-500">{alert.agentCode}</p>
             </div>
             </div>

             <div className="flex justify-start items-center ">

               {/* Submitted Fields */}
             <div className="mb-1 mr-20">
               <h3 className="text-lg font-regular text-gray-400 mb-1">
                 Submitted On
               </h3>
               <p className="text-lg font-semibold text-black-500">{alert.submittedOn}</p>
             </div>
            
             <div className="mb-1">
               <h3 className="text-lg font-regular text-gray-400 mb-1">
                 Submitted By
               </h3>
               <p className="text-lg font-semibold text-black-500">{alert.submittedBy}</p>
             </div>
             </div>
      
 
            
 
             {/* Action Buttons */}
             <div className="flex justify-between ">
               <Button variant={alert.button1}>Reject</Button>
               <Button variant={alert.button2}>Approve</Button>
             </div>

             {/* other Buttons */}
                  <div className="flex justify-between gap-2">

                    {alert?.buttons.length === 0 && (
                      <Button variant='white' size='lg'>
                       {alert?.buttons[0]}
                      </Button>
                    )}

                    {alert?.buttons.length > 0 && alert?.buttons.map((btn, i) => (
                      <Button
                        key={i}
                        // className={`px-3 py-1 rounded border ${btn}`}
                      >
                       {btn}
                      </Button>
                    ))}

                  </div>
           </Card>
         ))}
       </CardContent>{' '}
        </Card>

  )
}

export default CompanyOverview
