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
      <SelectTrigger className='border-gray-200 bg-gray-200 !h-auto font-semibold w-40 px-5'>
        <SelectValue placeholder="Select zone" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all" >All Zones</SelectItem>
        <SelectItem value="last-month">Last Month</SelectItem>
        <SelectItem value="this-week">This Week</SelectItem>
      </SelectContent>
    </Select>
  )
}

export default ZoneList
