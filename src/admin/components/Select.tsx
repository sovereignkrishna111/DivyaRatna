import React from 'react';
import { ChevronDown } from 'lucide-react';

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
};

const Select: React.FC<Props> = ({ label, className = '', children, ...rest }) => {
  return (
    <label className="relative inline-flex items-center">
      {label && <span className="sr-only">{label}</span>}
      <select
        {...rest}
        className={
          `appearance-none rounded-lg border border-gray-200 bg-white pe-10 ps-3 py-2 ` +
          `shadow-sm focus:outline-none focus:ring-2 focus:ring-maroon-600 focus:border-maroon-600 ` +
          `text-sm ${className}`
        }
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-gray-500" />
    </label>
  );
};

export default Select;
