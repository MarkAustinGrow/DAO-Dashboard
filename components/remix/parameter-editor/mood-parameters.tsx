'use client';

import type { ProportionalValue } from '../types';

interface MoodParametersProps {
  moodProportions: ProportionalValue[];
  onChange: (proportions: ProportionalValue[]) => void;
}

export function MoodParameters({ moodProportions, onChange }: MoodParametersProps) {
  const handleMoodChange = (name: string, value: number) => {
    const newProportions = moodProportions.map(item => 
      item.name === name ? { ...item, value } : item
    );
    onChange(newProportions);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-[#00ffaa]">Mood Proportions</h3>
      <p className="text-[#b388ff] mb-4">Set the emotional qualities of your music</p>

      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {moodProportions.map((mood) => (
          <div key={mood.name} className="space-y-1">
            <div className="flex justify-between">
              <label className="text-white">{mood.name}</label>
              <span className="text-[#b388ff]">{mood.value}%</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min={0}
                max={100}
                value={mood.value}
                onChange={(e) => handleMoodChange(mood.name, parseInt(e.target.value))}
                className="w-full"
              />
              <div 
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#00ffaa] to-[#d600ff]" 
                style={{ width: `${mood.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
