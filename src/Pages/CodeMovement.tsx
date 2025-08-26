import React from 'react'
import { FaNetworkWired } from 'react-icons/fa6'
import { MdOutlinePublishedWithChanges } from 'react-icons/md'
import { HiOutlineCodeBracketSquare } from 'react-icons/hi2'
import { LuSquareUserRound } from 'react-icons/lu'
import CustomTabs from '@/components/CustomTabs'
const tabs = [
  { value: 'new', label: 'New Code Creation', icon: <FaNetworkWired /> },
  {
    value: 'movement',
    label: 'Movements in Existing Codes',
    icon: <HiOutlineCodeBracketSquare />,
  },
  { value: 'pi', label: 'PI Change in Code', icon: <LuSquareUserRound /> },
  {
    value: 'status',
    label: 'Change in Status',
    icon: <MdOutlinePublishedWithChanges />,
  },
]

const CodeMovement = () => {
  return (
    <div className="py-4">
      <CustomTabs
        tabs={tabs}
        defaultValue="new"
        onValueChange={(value) => console.log('Selected Tab:', value)}
      />
      <div className='bg-white'>
        adsjfk
      </div>
    </div>
  )
}

export default CodeMovement
