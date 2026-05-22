import React from 'react';

const rows = [
  'QWERTYUIOP'.split(''),
  'ASDFGHJKL'.split(''),
  ['Enter', ...'ZXCVBNM'.split(''), 'Del'],
];

export default function Keyboard({ onKeyPress = () => {} }) {
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="space-y-2">
        {rows.map((row, idx) => (
          <div key={idx} className="flex justify-center gap-2">
            {row.map((k) => (
              <button
                key={k}
                onClick={() => onKeyPress(k)}
                className={`py-2 px-3 md:px-4 rounded-md bg-gray-800 text-gray-200 hover:bg-gray-700 shadow-inner text-sm`}
              >
                {k}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
