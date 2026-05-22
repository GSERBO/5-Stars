import React from 'react';

export default function GameBoard({ onWrongGuess = () => {} }) {
  const boxes = new Array(5).fill(null);

  return (
    <div className="w-full">
      <div className="flex justify-center mt-8">
        <div className="flex gap-3">
          {boxes.map((_, i) => (
            <button
              key={i}
              onClick={onWrongGuess}
              className="w-16 h-16 md:w-20 md:h-20 bg-gray-800 border border-gray-700 rounded-sm flex items-center justify-center text-gray-400 hover:border-gray-500"
              aria-label={`slot-${i}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
