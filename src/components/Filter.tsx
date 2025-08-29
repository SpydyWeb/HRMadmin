import React, { useState } from 'react'
import {
  BiCheckSquare,
  BiChevronDown,
  BiDownload,
  BiSearch,
  BiSquare,
} from 'react-icons/bi'
import { Input } from './ui/input'
import Button from './ui/button'
import { LuSlidersHorizontal } from 'react-icons/lu'
import { FiFileText, FiRotateCcw } from 'react-icons/fi'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

export const Filter = ({
  // Control visibility props
  showSearchBox = true,
  showDropdown = true,
  showAcceptAll = true,
  showRejectAll = true,
  showExcelDownload = true,
  showPdfDownload = true,
  showResetFilter = true,
  showAdvancedSearch = true,

  // Props for functionality
  searchPlaceholder = 'Enter search term...',
  dropdownLabel = 'Channel',
  dropdownOptions = ['All', 'Option 1', 'Option 2', 'Option 3'],
  searchValue = '',
  selectedOption = 'All',
  allSelected = false,

  // Event handlers
  onSearchChange = () => {},
  onDropdownChange = () => {},
  onAcceptAll = () => {},
  onRejectAll = () => {},
  onExcelDownload = () => {},
  onPdfDownload = () => {},
  onResetFilter = () => {},
  onAdvancedSearch = () => {},

  // Styling props
  className = '',
  searchBoxClassName = '',
  dropdownClassName = '',
  buttonClassName = '',
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [localSearch, setLocalSearch] = useState(searchValue)
  const [localSelected, setLocalSelected] = useState(selectedOption)
  const [localAllSelected, setLocalAllSelected] = useState(allSelected)

  const handleSearchChange = (e) => {
    setLocalSearch(e.target.value)
    onSearchChange(e.target.value)
  }

  const handleDropdownSelect = (option) => {
    setLocalSelected(option)
    setIsDropdownOpen(false)
    onDropdownChange(option)
  }

  const handleResetFilter = () => {
    setLocalSearch('')
    setLocalSelected('All')
    setLocalAllSelected(false)
    onResetFilter()
  }

  const handleAdvancedSearch = () => {
    setIsAdvancedOpen(!isAdvancedOpen)
    onAdvancedSearch()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Filter Row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search Box */}
        {showSearchBox && (
          <div
            className={`relative flex-1 min-w-64 max-w-72 ${searchBoxClassName}`}
          >
            <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-all duration-300 ease-in-out hover:text-blue-500 hover:scale-110" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={localSearch}
              onChange={handleSearchChange}
              className=" w-full  pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300 ease-in-out hover:shadow-md hover:border-gray-400 focus:shadow-lg"
            />
          </div>
        )}

        {/* Reset Filter Button */}
        {showResetFilter && (
          <Tooltip>
            <TooltipTrigger asChild>
              <FiRotateCcw
                onClick={handleResetFilter}
                className="w-5 h-5 cursor-pointer transition-all duration-300 ease-in-out hover:rotate-180 hover:text-red-600"
              />
            </TooltipTrigger>
            <TooltipContent>
              Reset Filter
            </TooltipContent>
          </Tooltip>
        )}
        {/* Dropdown */}
        {showDropdown && (
          <div className={` ${dropdownClassName}`}>
            <Select defaultValue={dropdownOptions[0]}>
              <SelectTrigger className="w-40 border-gray-400">
                <SelectValue
                  placeholder={`${dropdownLabel} - ${localSelected}`}
                />
              </SelectTrigger>
              <SelectContent>
                {dropdownOptions.map((option, index) => (
                  <SelectItem value={option} key={index}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Reject All Button */}
        {showRejectAll && (
          <Button onClick={onRejectAll} variant="outline-red">
            <span>Reject All</span>
          </Button>
        )}
        {/* Accept All Button */}
        {showAcceptAll && (
          <Button onClick={onAcceptAll} variant="green">
            <span>Approve All</span>
          </Button>
        )}

        {/* Download Buttons */}
        {(showExcelDownload || showPdfDownload) && (
          <div className="flex items-center gap-1">
            {showExcelDownload && (
              <Button
                onClick={onExcelDownload}
                variant="outline-green"
                size="sm"
              >
                <BiDownload className="w-4 h-4 " />
                <span>Excel</span>
              </Button>
            )}

            {showPdfDownload && (
              <Button onClick={onPdfDownload} variant="outline-red" size="sm">
                <FiFileText className="w-4 h-4" />
                <span>PDF</span>
              </Button>
            )}
          </div>
        )}
        {/* Advanced Search Button */}
        {showAdvancedSearch && (
          <Button onClick={handleAdvancedSearch} variant="default">
           
            <Tooltip>
            <TooltipTrigger asChild>
              <LuSlidersHorizontal
              className={`w-4 h-4 transition-all duration-300 ease-in-out hover:text-blue-600 ${isAdvancedOpen ? 'rotate-180 text-blue-600' : ''}`}
            />
            </TooltipTrigger>
            <TooltipContent>
              Advance Filter
            </TooltipContent>
          </Tooltip>
          </Button>
        )}
      </div>

      {/* Advanced Search Panel with Smooth Slide Animation */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isAdvancedOpen && showAdvancedSearch
            ? 'max-h-96 opacity-100'
            : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm transform transition-all duration-300 ease-in-out hover:shadow-md">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 transition-colors duration-200">
            Advanced Search
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="transition-all duration-300 ease-in-out hover:transform hover:scale-105">
              <label className="block text-xs font-medium text-gray-600 mb-1 transition-colors duration-200">
                Date Range
              </label>
              <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300 ease-in-out hover:shadow-md hover:border-gray-400">
                <option>All Time</option>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </div>
            <div className="transition-all duration-300 ease-in-out hover:transform hover:scale-105">
              <label className="block text-xs font-medium text-gray-600 mb-1 transition-colors duration-200">
                Status
              </label>
              <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300 ease-in-out hover:shadow-md hover:border-gray-400">
                <option>All Status</option>
                <option>Approved</option>
                <option>Pending</option>
                <option>Rejected</option>
              </select>
            </div>
            <div className="transition-all duration-300 ease-in-out hover:transform hover:scale-105">
              <label className="block text-xs font-medium text-gray-600 mb-1 transition-colors duration-200">
                Priority
              </label>
              <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300 ease-in-out hover:shadow-md hover:border-gray-400">
                <option>All Priority</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setIsAdvancedOpen(false)}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 outline-none transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-md active:scale-95"
            >
              <span className="transition-colors duration-200">Cancel</span>
            </button>
            <button className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 outline-none transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95 hover:brightness-110">
              <span className="transition-colors duration-200">
                Apply Filters
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
