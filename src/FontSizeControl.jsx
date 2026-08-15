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
      root.style.fontSize = '16px'; // 中 (預設標準)
    }
  };

  useEffect(() => {
    applySize(currentSize);
  }, []);

  return (
    <div className="inline-flex items-center gap-1 bg-amber-50/90 border border-amber-200/80 px-2.5 py-1 rounded-full shadow-sm text-xs select-none">
      <span className="text-amber-800 font-bold pr-0.5">字型</span>
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
              : 'text-amber-900/70 hover:bg-amber-100/80'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
