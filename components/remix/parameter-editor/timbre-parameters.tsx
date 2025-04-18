'use client';

import type { ProportionalValue } from '../types';

interface TimbreParametersProps {
  timbreProportions: ProportionalValue[];
  onChange: (proportions: ProportionalValue[]) => void;
}

export function TimbreParameters({ timbreProportions, onChange }: TimbreParametersProps) {
  const handleTimbreChange = (name: string, value: number) => {
    const newProportions = timbreProportions.map(item => 
      item.name === name ? { ...item, value } : item
    );
    onChange(newProportions);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-[#00ffaa]">Timbre Proportions</h3>
      <p className="text-[#b388ff] mb-4">Set the tonal qualities and texture of your music</p>

      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {timbreProportions.map((timbre) => (
          <div key={timbre.name} className="space-y-1">
            <div className="flex justify-between">
              <label className="text-white">{timbre.name}</label>
              <span className="text-[#b388ff]">{timbre.value}%</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min={0}
                max={100}
                value={timbre.value}
                onChange={(e) => handleTimbreChange(timbre.name, parseInt(e.target.value))}
                className="w-full"
              />
              <div 
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#00ffaa] to-[#d600ff]" 
                style={{ width: `${timbre.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
