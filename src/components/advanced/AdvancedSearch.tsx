import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  X, 
  Calendar, 
  DollarSign, 
  Tag,
  SortAsc,
  SortDesc,
  RefreshCw
} from 'lucide-react';
import Fuse from 'fuse.js';
import { debounce } from 'lodash';

interface SearchFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between' | 'in';
  value: any;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect';
}

interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

interface AdvancedSearchProps {
  data: any[];
  onFilter: (filteredData: any[]) => void;
  searchFields: string[];
  filterFields: Array<{
    key: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select' | 'multiselect';
    options?: Array<{ value: any; label: string }>;
  }>;
  sortFields: Array<{
    key: string;
    label: string;
  }>;
  placeholder?: string;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  data,
  onFilter,
  searchFields,
  filterFields,
  sortFields,
  placeholder = "Search..."
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [sortOptions, setSortOptions] = useState<SortOption[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Initialize Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(data, {
      keys: searchFields,
      threshold: 0.3,
      includeScore: true,
      includeMatches: true
    });
  }, [data, searchFields]);

  // Debounced search function
  const debouncedSearch = useMemo(
    () => debounce((term: string, currentFilters: SearchFilter[], currentSort: SortOption[]) => {
      performSearch(term, currentFilters, currentSort);
    }, 300),
    [data, fuse]
  );

  useEffect(() => {
    setIsSearching(true);
    debouncedSearch(searchTerm, filters, sortOptions);
  }, [searchTerm, filters, sortOptions, debouncedSearch]);

  const performSearch = (term: string, currentFilters: SearchFilter[], currentSort: SortOption[]) => {
    let results = [...data];

    // Apply text search
    if (term.trim()) {
      const fuseResults = fuse.search(term);
      results = fuseResults.map(result => result.item);
    }

    // Apply filters
    currentFilters.forEach(filter => {
      results = results.filter(item => {
        const fieldValue = getNestedValue(item, filter.field);
        
        switch (filter.operator) {
          case 'equals':
            return fieldValue === filter.value;
          case 'contains':
            return String(fieldValue).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'greater':
            return Number(fieldValue) > Number(filter.value);
          case 'less':
            return Number(fieldValue) < Number(filter.value);
          case 'between':
            return Number(fieldValue) >= Number(filter.value.min) && 
                   Number(fieldValue) <= Number(filter.value.max);
          case 'in':
            return Array.isArray(filter.value) && filter.value.includes(fieldValue);
          default:
            return true;
        }
      });
    });

    // Apply sorting
    if (currentSort.length > 0) {
      results.sort((a, b) => {
        for (const sort of currentSort) {
          const aValue = getNestedValue(a, sort.field);
          const bValue = getNestedValue(b, sort.field);
          
          let comparison = 0;
          if (aValue < bValue) comparison = -1;
          if (aValue > bValue) comparison = 1;
          
          if (comparison !== 0) {
            return sort.direction === 'desc' ? -comparison : comparison;
          }
        }
        return 0;
      });
    }

    onFilter(results);
    setIsSearching(false);
  };

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const addFilter = () => {
    const newFilter: SearchFilter = {
      field: filterFields[0]?.key || '',
      operator: 'contains',
      value: '',
      type: filterFields[0]?.type || 'text'
    };
    setFilters([...filters, newFilter]);
  };

  const updateFilter = (index: number, updates: Partial<SearchFilter>) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], ...updates };
    
    // Reset value when field changes
    if (updates.field) {
      const fieldConfig = filterFields.find(f => f.key === updates.field);
      newFilters[index].type = fieldConfig?.type || 'text';
      newFilters[index].value = '';
    }
    
    setFilters(newFilters);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const addSort = () => {
    const newSort: SortOption = {
      field: sortFields[0]?.key || '',
      direction: 'asc'
    };
    setSortOptions([...sortOptions, newSort]);
  };

  const updateSort = (index: number, updates: Partial<SortOption>) => {
    const newSort = [...sortOptions];
    newSort[index] = { ...newSort[index], ...updates };
    setSortOptions(newSort);
  };

  const removeSort = (index: number) => {
    setSortOptions(sortOptions.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setSearchTerm('');
    setFilters([]);
    setSortOptions([]);
  };

  const renderFilterValue = (filter: SearchFilter, index: number) => {
    const fieldConfig = filterFields.find(f => f.key === filter.field);
    
    switch (filter.type) {
      case 'number':
        if (filter.operator === 'between') {
          return (
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={filter.value?.min || ''}
                onChange={(e) => updateFilter(index, { 
                  value: { ...filter.value, min: e.target.value } 
                })}
                className="w-20 p-2 border border-gray-300 rounded text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                value={filter.value?.max || ''}
                onChange={(e) => updateFilter(index, { 
                  value: { ...filter.value, max: e.target.value } 
                })}
                className="w-20 p-2 border border-gray-300 rounded text-sm"
              />
            </div>
          );
        }
        return (
          <input
            type="number"
            value={filter.value}
            onChange={(e) => updateFilter(index, { value: e.target.value })}
            className="w-32 p-2 border border-gray-300 rounded text-sm"
          />
        );
      
      case 'date':
        return (
          <input
            type="date"
            value={filter.value}
            onChange={(e) => updateFilter(index, { value: e.target.value })}
            className="w-40 p-2 border border-gray-300 rounded text-sm"
          />
        );
      
      case 'select':
        return (
          <select
            value={filter.value}
            onChange={(e) => updateFilter(index, { value: e.target.value })}
            className="w-40 p-2 border border-gray-300 rounded text-sm"
          >
            <option value="">Select...</option>
            {fieldConfig?.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'multiselect':
        return (
          <select
            multiple
            value={Array.isArray(filter.value) ? filter.value : []}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, option => option.value);
              updateFilter(index, { value: values });
            }}
            className="w-40 p-2 border border-gray-300 rounded text-sm"
          >
            {fieldConfig?.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      default:
        return (
          <input
            type="text"
            value={filter.value}
            onChange={(e) => updateFilter(index, { value: e.target.value })}
            className="w-40 p-2 border border-gray-300 rounded text-sm"
            placeholder="Enter value..."
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {isSearching && (
            <RefreshCw className="absolute right-3 top-3 h-4 w-4 text-blue-500 animate-spin" />
          )}
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
            showFilters || filters.length > 0 || sortOptions.length > 0
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {(filters.length > 0 || sortOptions.length > 0) && (
            <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1">
              {filters.length + sortOptions.length}
            </span>
          )}
        </button>

        {(searchTerm || filters.length > 0 || sortOptions.length > 0) && (
          <button
            onClick={clearAll}
            className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 border border-red-300 rounded-lg transition-colors"
          >
            <X className="h-4 w-4 mr-2" />
            Clear All
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4"
          >
            {/* Filters Section */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-800">Filters</h4>
                <button
                  onClick={addFilter}
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                >
                  <Tag className="h-4 w-4 mr-1" />
                  Add Filter
                </button>
              </div>
              
              <div className="space-y-2">
                {filters.map((filter, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center space-x-2 bg-white p-3 rounded border"
                  >
                    <select
                      value={filter.field}
                      onChange={(e) => updateFilter(index, { field: e.target.value })}
                      className="p-2 border border-gray-300 rounded text-sm"
                    >
                      {filterFields.map(field => (
                        <option key={field.key} value={field.key}>
                          {field.label}
                        </option>
                      ))}
                    </select>
                    
                    <select
                      value={filter.operator}
                      onChange={(e) => updateFilter(index, { operator: e.target.value as any })}
                      className="p-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="contains">Contains</option>
                      <option value="equals">Equals</option>
                      {filter.type === 'number' && (
                        <>
                          <option value="greater">Greater than</option>
                          <option value="less">Less than</option>
                          <option value="between">Between</option>
                        </>
                      )}
                      {filter.type === 'select' && (
                        <option value="in">In</option>
                      )}
                    </select>
                    
                    {renderFilterValue(filter, index)}
                    
                    <button
                      onClick={() => removeFilter(index)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Sorting Section */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-800">Sorting</h4>
                <button
                  onClick={addSort}
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                >
                  <SortAsc className="h-4 w-4 mr-1" />
                  Add Sort
                </button>
              </div>
              
              <div className="space-y-2">
                {sortOptions.map((sort, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center space-x-2 bg-white p-3 rounded border"
                  >
                    <select
                      value={sort.field}
                      onChange={(e) => updateSort(index, { field: e.target.value })}
                      className="p-2 border border-gray-300 rounded text-sm"
                    >
                      {sortFields.map(field => (
                        <option key={field.key} value={field.key}>
                          {field.label}
                        </option>
                      ))}
                    </select>
                    
                    <button
                      onClick={() => updateSort(index, { 
                        direction: sort.direction === 'asc' ? 'desc' : 'asc' 
                      })}
                      className={`flex items-center p-2 border rounded text-sm transition-colors ${
                        sort.direction === 'asc' 
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'bg-red-50 border-red-300 text-red-700'
                      }`}
                    >
                      {sort.direction === 'asc' ? (
                        <SortAsc className="h-4 w-4 mr-1" />
                      ) : (
                        <SortDesc className="h-4 w-4 mr-1" />
                      )}
                      {sort.direction === 'asc' ? 'Ascending' : 'Descending'}
                    </button>
                    
                    <button
                      onClick={() => removeSort(index)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedSearch;