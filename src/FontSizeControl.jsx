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
    <div className="inline-flex items-center gap-0.5 bg-amber-100/70 border border-amber-200/80 px-2 py-0.5 rounded-full text-xs select-none shrink-0" style={{ fontSize: '12px' }}>
      <span className="text-amber-800 font-bold text-[11px] pr-0.5">字型</span>
      {[
        { label: '小', val: 'small' },
        { label: '中', val: 'normal' },
        { label: '大', val: 'large' }
      ].map((item) => (
        <button
          key={item.val}
          type="button"
          onClick={() => applySize(item.val)}
          className={`px-1.5 py-0.5 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
            currentSize === item.val
              ? 'bg-amber-600 text-white font-bold'
              : 'text-amber-900/70 hover:bg-amber-200/50'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
