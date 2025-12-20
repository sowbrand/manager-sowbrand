import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export const SowCheckbox: React.FC<CheckboxProps> = ({ label, checked, onChange, className = '' }) => {
  return (
    <label className={`flex items-center gap-2 cursor-pointer group ${className}`}>
      <div 
        className="relative w-4 h-4 border border-black flex items-center justify-center transition-all bg-white flex-shrink-0"
        onClick={(e) => {
          e.preventDefault();
          onChange(!checked);
        }}
      >
        {checked && (
          <Check size={14} className="text-sow-green stroke-[4]" />
        )}
      </div>
      {label && (
        <span className="text-xs group-hover:text-sow-green transition-colors select-none">
          {label}
        </span>
      )}
    </label>
  );
};

export const SowInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
  return (
    <input 
      {...props}
      className={`w-full bg-transparent text-black outline-none px-1 font-sans placeholder-gray-300 focus:placeholder-gray-400 print:placeholder-transparent print:bg-transparent print:border-none ${props.className || ''}`}
    />
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
}

export const SowSelect: React.FC<SelectProps> = ({ className = '', children, ...props }) => {
  return (
    <div className="relative w-full group">
      <select 
        {...props}
        className={`w-full bg-transparent text-black outline-none border-b border-gray-300 focus:border-sow-green print:border-none appearance-none py-1 pr-4 text-xs ${className}`}
      >
        {children}
      </select>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none no-print opacity-50 group-hover:opacity-100">
        <svg width="8" height="5" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
};

