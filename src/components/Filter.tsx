import React, { useState } from 'react';
import { BiCheckSquare, BiChevronDown, BiDownload, BiSearch, BiSquare } from 'react-icons/bi';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { LuSlidersHorizontal } from 'react-icons/lu';
import { FiFileText, FiRotateCcw } from 'react-icons/fi';

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
  searchPlaceholder = "Enter search term...",
  dropdownLabel = "Channel",
  dropdownOptions = ["All", "Option 1", "Option 2", "Option 3"],
  searchValue = "",
  selectedOption = "All",
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
  className = "",
  searchBoxClassName = "",
  dropdownClassName = "",
  buttonClassName = "",
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchValue);
  const [localSelected, setLocalSelected] = useState(selectedOption);
  const [localAllSelected, setLocalAllSelected] = useState(allSelected);

  const handleSearchChange = (e) => {
    setLocalSearch(e.target.value);
    onSearchChange(e.target.value);
  };

  const handleDropdownSelect = (option) => {
    setLocalSelected(option);
    setIsDropdownOpen(false);
    onDropdownChange(option);
  };

  const handleResetFilter = () => {
    setLocalSearch("");
    setLocalSelected("All");
    setLocalAllSelected(false);
    onResetFilter();
  };

  const handleAdvancedSearch = () => {
    setIsAdvancedOpen(!isAdvancedOpen);
    onAdvancedSearch();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Filter Row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search Box */}
        {showSearchBox && (
          <div className={`relative flex-1 min-w-64 ${searchBoxClassName}`}>
            <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={localSearch}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        )}

        {/* Dropdown */}
        {showDropdown && (
          <div className={`relative ${dropdownClassName}`}>
            <Button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-w-32"
            >
              <span className="text-sm text-gray-600">{dropdownLabel} -</span>
              <span className="text-sm font-medium">{localSelected}</span>
              <BiChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </Button>
            
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-full">
                {dropdownOptions.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleDropdownSelect(option)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-md last:rounded-b-md"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Advanced Search Button */}
        {showAdvancedSearch && (
          <Button
            onClick={handleAdvancedSearch}
            className={`flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 outline-none transition-colors ${buttonClassName}`}
            title="Advanced Search"
          >
            <LuSlidersHorizontal className="w-4 h-4" />
            <span className="text-sm">Advanced</span>
          </Button>
        )}

        {/* Reset Filter Button */}
        {showResetFilter && (
          <Button
            onClick={handleResetFilter}
            className={`flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 outline-none transition-colors ${buttonClassName}`}
            title="Reset Filters"
          >
            <FiRotateCcw className="w-4 h-4" />
            <span className="text-sm">Reset</span>
          </Button>
        )}
               {showAcceptAll && (
            <Button
              onClick={onAcceptAll}
              className={`focus:ring-2 focus:ring-green-500 focus:ring-offset-2 outline-none transition-colors ${buttonClassName}`}
            style={{ backgroundColor: 'var(--brand-green)' }}
            >
              Approve All
            </Button>
          )}

          {/* Reject All Button */}
          {showRejectAll && (
            <Button
              onClick={onRejectAll}
              className={`border border-[#2F2F2F] text-red-500 bg-transparent text-sm hover:bg-transparent focus:ring-2 focus:ring-red-500 focus:ring-offset-2 outline-none transition-colors ${buttonClassName}`}
            >
              Reject All
            </Button>
          )}

          {/* Download Buttons */}
          {(showExcelDownload || showPdfDownload) && (
            <div className="flex items-center gap-1">
              {showExcelDownload && (
                <Button
                  onClick={onExcelDownload}
                  className={`flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 outline-none transition-colors ${buttonClassName}`}
                  title="Download Excel"
                >
                  <BiDownload className="w-4 h-4" />
                  <span className="text-xs font-medium">Excel</span>
                </Button>
              )}

              {showPdfDownload && (
                <button
                  onClick={onPdfDownload}
                  className={`flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 outline-none transition-colors ${buttonClassName}`}
                  title="Download PDF"
                >
                  <FiFileText className="w-4 h-4" />
                  <span className="text-xs font-medium">PDF</span>
                </button>
              )}
            </div>
          )}
      </div>
      {/* Advanced Search Panel */}
      {showAdvancedSearch && isAdvancedOpen && (
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Advanced Search</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date Range</label>
              <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                <option>All Time</option>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                <option>All Status</option>
                <option>Approved</option>
                <option>Pending</option>
                <option>Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
              <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
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
              className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 outline-none transition-colors"
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 outline-none transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};