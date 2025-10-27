// src/app/history/FilterBar.tsx

'use client';
import React from 'react';
import { Search, Filter, Calendar, Video } from 'lucide-react';
import { HistoryFilters } from '@/interfaces/models/history';

interface FilterBarProps {
  filters: HistoryFilters;
  onFilterChange: (filters: HistoryFilters) => void;
}

export default function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, searchQuery: e.target.value });
  };

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      dateRange: e.target.value as HistoryFilters['dateRange'],
    });
  };

  const handleRecordedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      recorded: e.target.value as HistoryFilters['recorded'],
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search meetings by title, participants..."
              value={filters.searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="w-full lg:w-48">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            <select
              value={filters.dateRange}
              onChange={handleDateRangeChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white"
            >
              <option value="all">All time</option>
              <option value="today">Today</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
              <option value="custom">Custom range</option>
            </select>
          </div>
        </div>

        {/* Recorded Filter */}
        <div className="w-full lg:w-48">
          <div className="relative">
            <Video className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            <select
              value={filters.recorded}
              onChange={handleRecordedChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white"
            >
              <option value="all">All meetings</option>
              <option value="yes">Recorded only</option>
              <option value="no">Not recorded</option>
            </select>
          </div>
        </div>

        {/* Filter Button */}
        <button className="lg:w-auto px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
          <Filter size={18} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">More filters</span>
        </button>
      </div>
    </div>
  );
}
