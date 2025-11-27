import React, { useState } from 'react'
import { BiDownload, BiSearch } from 'react-icons/bi'
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
import { cn } from '@/lib/utils' // Assuming utils exists, if not I'll define cn locally or use clsx/twMerge

// Define types for the props
interface FilterProps {
  // Visibility controls
  showSearchBox?: boolean
  showDropdown?: boolean
  showAcceptAll?: boolean
  showRejectAll?: boolean
  showExcelDownload?: boolean
  showPdfDownload?: boolean
  showResetFilter?: boolean
  showAdvancedSearch?: boolean

  // Data & State
  searchPlaceholder?: string
  dropdownLabel?: string
  dropdownOptions?: string[]
  searchValue?: string
  selectedOption?: string

  // Callbacks
  onSearchChange?: (value: string) => void
  onDropdownChange?: (value: string) => void
  onAcceptAll?: () => void
  onRejectAll?: () => void
  onExcelDownload?: () => void
  onPdfDownload?: () => void
  onResetFilter?: () => void

  // Advanced Search
  advancedSearchContent?: React.ReactNode
  isAdvancedOpen?: boolean
  onAdvancedToggle?: () => void

  // Styling
  className?: string
}

export const Filter = ({
  showSearchBox = true,
  showDropdown = true,
  showAcceptAll = true,
  showRejectAll = true,
  showExcelDownload = true,
  showPdfDownload = true,
  showResetFilter = true,
  showAdvancedSearch = true,

  searchPlaceholder = 'Enter search term...',
  dropdownLabel = 'Channel',
  dropdownOptions = ['All', 'Option 1', 'Option 2', 'Option 3'],
  searchValue = '',
  selectedOption = 'All',

  onSearchChange,
  onDropdownChange,
  onAcceptAll,
  onRejectAll,
  onExcelDownload,
  onPdfDownload,
  onResetFilter,

  advancedSearchContent,
  isAdvancedOpen: controlledIsAdvancedOpen,
  onAdvancedToggle,

  className,
}: FilterProps) => {
  // Internal state for advanced search if not controlled
  const [internalIsAdvancedOpen, setInternalIsAdvancedOpen] = useState(false)
  const isAdvancedOpen = controlledIsAdvancedOpen ?? internalIsAdvancedOpen

  const handleAdvancedToggle = () => {
    if (onAdvancedToggle) {
      onAdvancedToggle()
    } else {
      setInternalIsAdvancedOpen(!internalIsAdvancedOpen)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Filter Row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search Box */}
        {showSearchBox && (
          <div className="relative flex-1 min-w-64 max-w-72">
            <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-all duration-300 ease-in-out hover:text-blue-500 hover:scale-110" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-10 pr-4 py-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:shadow-md hover:border-gray-400 focus:shadow-lg"
            />
          </div>
        )}

        {/* Reset Filter Button */}
        {showResetFilter && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onResetFilter}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FiRotateCcw className="w-5 h-5 cursor-pointer transition-all duration-300 ease-in-out hover:rotate-180 hover:text-red-600" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Reset Filter</TooltipContent>
          </Tooltip>
        )}

        {/* Dropdown */}
        {showDropdown && (
          <div>
            <Select value={selectedOption} onValueChange={onDropdownChange}>
              <SelectTrigger className="w-40 border-gray-400">
                <SelectValue placeholder={dropdownLabel} />
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
                <BiDownload className="w-4 h-4" />
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
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleAdvancedToggle}
                variant="default"
                className="px-3"
              >
                <LuSlidersHorizontal
                  className={cn(
                    'w-4 h-4 transition-all duration-300 ease-in-out hover:text-blue-600',
                    isAdvancedOpen && 'rotate-180 text-blue-600',
                  )}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Advance Filter</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Advanced Search Panel */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-500 ease-in-out',
          isAdvancedOpen && showAdvancedSearch
            ? 'max-h-96 opacity-100'
            : 'max-h-0 opacity-0',
        )}
      >
        {advancedSearchContent && (
          <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm transform transition-all duration-300 ease-in-out hover:shadow-md">
            {advancedSearchContent}
          </div>
        )}
      </div>
    </div>
  )
}
