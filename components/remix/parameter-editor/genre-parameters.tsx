'use client';

import type { ProportionalValue } from '../types';

interface GenreParametersProps {
  genreProportions: ProportionalValue[];
  onChange: (proportions: ProportionalValue[]) => void;
}

export function GenreParameters({ genreProportions, onChange }: GenreParametersProps) {
  const handleGenreChange = (name: string, value: number) => {
    const newProportions = genreProportions.map(item => 
      item.name === name ? { ...item, value } : item
    );
    onChange(newProportions);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-[#00ffaa]">Genre Proportions</h3>
      <p className="text-[#b388ff] mb-4">Set the proportion of each genre in your music</p>

      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {genreProportions.map((genre) => (
          <div key={genre.name} className="space-y-1">
            <div className="flex justify-between">
              <label className="text-white">{genre.name}</label>
              <span className="text-[#b388ff]">{genre.value}%</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min={0}
                max={100}
                value={genre.value}
                onChange={(e) => handleGenreChange(genre.name, parseInt(e.target.value))}
                className="w-full"
              />
              <div 
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#00ffaa] to-[#d600ff]" 
                style={{ width: `${genre.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
