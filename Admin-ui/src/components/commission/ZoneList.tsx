import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

const ZoneList = () => {
  return (
    <Select defaultValue="all">
      <SelectTrigger className='rounded !text-sm border-gray-200 bg-gray-200 py-5.5 mt-2 font-semibold w-50 px-4'>
        <SelectValue placeholder="Select zone" />
      </SelectTrigger>
      <SelectContent className='text-md'>
        <SelectItem value="all" >All Zones</SelectItem>
        <SelectItem value="last-month">Last Month</SelectItem>
        <SelectItem value="this-week">This Week</SelectItem>
      </SelectContent>
    </Select>
  )
}

export default ZoneList
