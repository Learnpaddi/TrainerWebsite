import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search courses...',
  className = ''
}) => {
  const clearSearch = () => onChange('');

  return (
    <div className={`relative flex items-center w-full max-w-md ${className}`}>
      <Search className="w-5 h-5 text-gray-400 absolute left-4" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-12 py-4 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white/50 backdrop-blur-sm text-lg placeholder-gray-500 transition-all duration-300"
      />
      {value && (
        <button
          onClick={clearSearch}
          className="absolute right-4 p-1 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;

