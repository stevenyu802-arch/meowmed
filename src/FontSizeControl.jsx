import React, { useState, useEffect } from 'react';

export default function FontSizeControl() {
  const [currentSize, setCurrentSize] = useState(() => localStorage.getItem('meowmed-font-size') || 'normal');

  const applySize = (size) => {
    setCurrentSize(size);
    localStorage.setItem('meowmed-font-size', size);
    const root = document.documentElement;
    if (size === 'small') {
      root.style.fontSize = '14px';
    } else if (size === 'large') {
      root.style.fontSize = '18px';
    } else {
      root.style.fontSize = '16px';
    }
  };

  useEffect(() => {
    applySize(currentSize);
  }, []);

  return (
    <div 
      style={{ fontSize: '12px' }}
      className="inline-flex items-center gap-1 bg-amber-100/70 border border-amber-200/90 px-2 py-1 rounded-full shadow-xs shrink-0 select-none"
    >
      <span className="text-amber-800 font-bold pr-0.5" style={{ fontSize: '11px' }}>字型</span>
      {[
        { label: '小', val: 'small' },
        { label: '中', val: 'normal' },
        { label: '大', val: 'large' }
      ].map((item) => (
        <button
          key={item.val}
          type="button"
          onClick={() => applySize(item.val)}
          className={`px-2 py-0.5 rounded-full font-medium transition-all cursor-pointer ${
            currentSize === item.val
              ? 'bg-amber-500 text-white font-bold shadow-xs'
              : 'text-amber-900/70 hover:bg-amber-200/60'
          }`}
          style={{ fontSize: '11px', lineHeight: '1.2' }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
