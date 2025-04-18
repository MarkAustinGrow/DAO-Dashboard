'use client';

import { useState } from 'react';
import { BasicParameters } from './basic-parameters';
import { GenreParameters } from './genre-parameters';
import { MoodParameters } from './mood-parameters';
import { TimbreParameters } from './timbre-parameters';
import { Summary } from './summary';
import type { MusicParams } from '../types';

interface ParameterEditorProps {
  params: MusicParams;
  onChange: (params: Partial<MusicParams>) => void;
}

export function ParameterEditor({ params, onChange }: ParameterEditorProps) {
  const [activeTab, setActiveTab] = useState("basic");

  return (
    <div className="w-full bg-[#2a0f4c] rounded-lg overflow-hidden shadow-lg">
      {/* Tabs Navigation */}
      <div className="flex border-b border-[#4a1f7c] overflow-x-auto">
        {["basic", "genre", "mood", "timbre", "summary"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === tab
                ? "bg-[#4a1f7c] text-[#00ffaa] border-b-2 border-[#00ffaa]"
                : "text-[#b388ff] hover:bg-[#3a1a5c] hover:text-white"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "basic" && (
          <BasicParameters params={params} onChange={onChange} />
        )}
        {activeTab === "genre" && (
          <GenreParameters 
            genreProportions={params.genreProportions} 
            onChange={(proportions) => onChange({ genreProportions: proportions })} 
          />
        )}
        {activeTab === "mood" && (
          <MoodParameters 
            moodProportions={params.moodProportions} 
            onChange={(proportions) => onChange({ moodProportions: proportions })} 
          />
        )}
        {activeTab === "timbre" && (
          <TimbreParameters 
            timbreProportions={params.timbreProportions} 
            onChange={(proportions) => onChange({ timbreProportions: proportions })} 
          />
        )}
        {activeTab === "summary" && (
          <Summary params={params} />
        )}
      </div>
    </div>
  );
}
