import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`font-bold text-2xl tracking-tighter text-black flex items-center gap-1 ${className}`}>
      <span>SOW</span>
      <span className="text-[#72bf03]">BRAND</span>
    </div>
  );
};

