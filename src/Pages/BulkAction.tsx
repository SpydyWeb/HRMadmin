import React, { useState } from 'react';
import { BiChevronDown, BiDownload, BiSearch, BiSend, BiUpload, BiUser, BiUserCheck } from 'react-icons/bi';
import { FiFileText, FiSettings } from 'react-icons/fi';
import { BsChevronDown, BsFileText, BsSend } from 'react-icons/bs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Button from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const dashboardData = {
  bulkAction: {
    title: "Bulk Action Processor",
    steps: [
      {
        id: 1,
        title: "Select Template",
        description: "Choose the appropriate template for your bulk action",
        icon: FiFileText
      },
      {
        id: 2,
        title: "Upload Filled Template", 
        description: "Upload the completed template with agent data",
        icon: BiUpload
      },
      {
        id: 3,
        title: "Submit for Processing",
        description: "Review and submit your bulk action",
        icon: BiSend
      }
    ]
  },
  individualAction: {
    title: "Individual Agent Action",
    steps: [
      {
        id: 1,
        title: "Search Agent",
        description: "Use agent code, name, or PAN to find the specific agent.",
        icon: BiSearch
      },
      {
        id: 2,
        title: "Review Agent Details",
        description: "View personal, license, and financial details before action.",
        icon: BiUser
      },
      {
        id: 3,
        title: "Take Action",
        description: "Choose the required change from the dropdown and complete the form to proceed.",
        icon: BsSend
      }
    ]
  }
};

export default function BulkAction() {
  const [activeTab, setActiveTab] = useState('individual');

  const StepCard = ({ step, index, totalSteps }) => {
    const IconComponent = step.icon;
    const isLast = index === totalSteps - 1;
    
    return (
      <div className="relative">
        <div className="flex items-start gap-4 bg-gray-100 rounded-lg p-4 mb-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border">
              <IconComponent size={20} className="text-gray-600" />
            </div>
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-600 mb-1">Step {step.id}</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
            <p className="text-sm text-gray-600">{step.description}</p>
          </div>
        </div>
        
        {!isLast && (
          <div className="absolute left-[18px] top-[72px] w-0.5 h-6 bg-gray-300"></div>
        )}
      </div>
    );
  };

  const renderBulkActionContent = () => (
    <div className="flex-1 bg-white rounded-lg p-8">
      <h2 className="text-2xl font-semibold mb-8 text-center">{dashboardData.bulkAction.title}</h2>
      
      <div className="max-w-md mx-auto space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Template
          </label>
          <Select>
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <FiSettings size={16} />
                <SelectValue placeholder="New Code Creation" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new-code">New Code Creation</SelectItem>
              <SelectItem value="transfer">Employee Transfer</SelectItem>
              <SelectItem value="promotion">Promotion</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button variant="outline" className="">
            Cancel
          </Button>
          <Button variant='blue' className="flex items-center gap-2">
            <BiDownload size={16} />
            Download Template
          </Button>
        </div>
      </div>
    </div>
  );

  const renderIndividualActionContent = () => (
    <div className="flex-1 bg-white rounded-lg p-8">
      <h2 className="text-2xl font-semibold mb-8 text-center">{dashboardData.individualAction.title}</h2>
      
      <div className="max-w-md mx-auto space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Action Type
          </label>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Change In Branch" />
      
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="branch-change">Change In Branch</SelectItem>
              <SelectItem value="promotion">Promotion</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Agent
          </label>
         <div className="relative w-full max-w-md">
  <Input
    placeholder="Search by Code/Name/Phone"
    className="pr-24" // extra padding to avoid text overlapping with button
  />
  <Button
    className="absolute right-1 top-1/2 -translate-y-1/2"
    size="sm"
    variant='blue'
  >
    Search
  </Button>
</div>

        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Tab Navigation */}
        <div className="flex justify-end mb-8">
          <div className="flex bg-gray-200 rounded-lg p-1">
            <Button
              variant={activeTab === 'bulk' ? 'blue' : 'default'}
              onClick={() => setActiveTab('bulk')}
              className={`px-6 py-2 rounded-md `}
            >
              <BsFileText size={16} className="mr-2" />
              Bulk Action
            </Button>
            <Button
              variant={activeTab === 'individual' ? 'blue' : 'default'}
              onClick={() => setActiveTab('individual')}
              className={`px-6 py-2 rounded-md `}
              
            >
              <BiUserCheck size={16} className="mr-2" />
              Individual Action
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex gap-8">
          {/* Steps Sidebar */}
          <div className="w-96 flex-shrink-0">
            {activeTab === 'bulk' && 
              dashboardData.bulkAction.steps.map((step, index) => (
                <StepCard 
                  key={step.id} 
                  step={step} 
                  index={index}
                  totalSteps={dashboardData.bulkAction.steps.length}
                />
              ))
            }
            
            {activeTab === 'individual' && 
              dashboardData.individualAction.steps.map((step, index) => (
                <StepCard 
                  key={step.id} 
                  step={step} 
                  index={index}
                  totalSteps={dashboardData.individualAction.steps.length}
                />
              ))
            }
          </div>

          {/* Content Area */}
          {activeTab === 'bulk' && renderBulkActionContent()}
          {activeTab === 'individual' && renderIndividualActionContent()}
        </div>

        {/* Bottom right corner text */}
        <div className="fixed bottom-4 right-4 text-gray-400 text-sm">
          <div>Activate Windows</div>
          <div>Go to Settings</div>
        </div>
      </div>
    </div>
  );
}