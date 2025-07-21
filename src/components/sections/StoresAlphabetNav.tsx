'use client';

import Link from 'next/link';

interface StoresAlphabetNavProps {
  currentLetter?: string;
}

export default function StoresAlphabetNav({ currentLetter }: StoresAlphabetNavProps) {
  const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'Other'];

  return (
    <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl shadow-lg border border-card-border p-6">
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {alphabet.map((letter) => {
          const isActive = currentLetter?.toLowerCase() === letter.toLowerCase() || 
                          (letter === 'Other' && currentLetter === 'other');
          const href = letter === 'Other' ? '/stores/startwith/other' : `/stores/startwith/${letter.toLowerCase()}`;
          
          return (
            <Link
              key={letter}
              href={href}
              className={`
                px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 hover:scale-105
                ${isActive 
                  ? 'bg-brand-light text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                }
              `}
            >
              {letter}
            </Link>
          );
        })}
      </div>
      
      {/* Progress indicator for current letter */}
      {currentLetter && (
        <div className="mt-4 w-full bg-gray-200 rounded-full h-1">
          <div 
            className="bg-brand-light h-1 rounded-full transition-all duration-300"
            style={{ 
              width: `${((alphabet.findIndex(l => l.toLowerCase() === currentLetter.toLowerCase()) + 1) / alphabet.length) * 100}%` 
            }}
          />
        </div>
      )}
    </div>
  );
}