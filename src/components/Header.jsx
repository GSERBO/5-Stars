import React from 'react';

export default function Header({ level = 'Level 3' }) {
  return (
    <header className="bg-black text-white w-full">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-yellow-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="currentColor" />
          </svg>
          <span className="sr-only">Courtesy Star</span>
        </div>

        <div className="text-sm tracking-wide text-gray-300 font-medium">DAILY CATEGORY: LIQUID</div>

        <div className="text-sm text-gray-300">{level}</div>
      </div>
    </header>
  );
}
