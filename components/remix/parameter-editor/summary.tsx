'use client';

import type { MusicParams } from '../types';

interface SummaryProps {
  params: MusicParams;
}

export function Summary({ params }: SummaryProps) {
  // Calculate average values for each category
  const avgGenre = params.genreProportions.reduce((sum, item) => sum + item.value, 0) / params.genreProportions.length;
  const avgMood = params.moodProportions.reduce((sum, item) => sum + item.value, 0) / params.moodProportions.length;
  const avgTimbre = params.timbreProportions.reduce((sum, item) => sum + item.value, 0) / params.timbreProportions.length;
  
  // Get top items in each category (items with value > 50)
  const topGenres = params.genreProportions
    .filter(item => item.value > 50)
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);
    
  const topMoods = params.moodProportions
    .filter(item => item.value > 50)
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);
    
  const topTimbres = params.timbreProportions
    .filter(item => item.value > 50)
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-bold text-[#00ffaa]">Parameter Summary</h3>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <h4 className="text-lg font-medium text-white">Basic Parameters</h4>
          <div className="bg-[#3a1a5c] p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[#b388ff]">Music Type</p>
                <p className="text-white font-medium">{params.type === 'vocal' ? 'Vocal' : 'Background Music'}</p>
              </div>
              {params.type === 'vocal' && (
                <div>
                  <p className="text-[#b388ff]">Gender</p>
                  <p className="text-white font-medium">{params.gender || 'Auto-detect'}</p>
                </div>
              )}
              <div>
                <p className="text-[#b388ff]">Duration</p>
                <p className="text-white font-medium">{params.duration} seconds</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-lg font-medium text-white">Top Genres</h4>
          <div className="bg-[#3a1a5c] p-4 rounded-lg">
            {topGenres.length > 0 ? (
              <div className="space-y-2">
                {topGenres.map(genre => (
                  <div key={genre.name} className="flex justify-between items-center">
                    <span className="text-white">{genre.name}</span>
                    <div className="flex items-center">
                      <span className="text-[#b388ff] mr-2">{genre.value}%</span>
                      <div className="w-20 h-2 bg-[#2a0f4c] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#00ffaa] to-[#d600ff]" 
                          style={{ width: `${genre.value}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#b388ff]">No dominant genres selected</p>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-lg font-medium text-white">Top Moods</h4>
          <div className="bg-[#3a1a5c] p-4 rounded-lg">
            {topMoods.length > 0 ? (
              <div className="space-y-2">
                {topMoods.map(mood => (
                  <div key={mood.name} className="flex justify-between items-center">
                    <span className="text-white">{mood.name}</span>
                    <div className="flex items-center">
                      <span className="text-[#b388ff] mr-2">{mood.value}%</span>
                      <div className="w-20 h-2 bg-[#2a0f4c] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#00ffaa] to-[#d600ff]" 
                          style={{ width: `${mood.value}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#b388ff]">No dominant moods selected</p>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-lg font-medium text-white">Top Timbres</h4>
          <div className="bg-[#3a1a5c] p-4 rounded-lg">
            {topTimbres.length > 0 ? (
              <div className="space-y-2">
                {topTimbres.map(timbre => (
                  <div key={timbre.name} className="flex justify-between items-center">
                    <span className="text-white">{timbre.name}</span>
                    <div className="flex items-center">
                      <span className="text-[#b388ff] mr-2">{timbre.value}%</span>
                      <div className="w-20 h-2 bg-[#2a0f4c] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#00ffaa] to-[#d600ff]" 
                          style={{ width: `${timbre.value}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#b388ff]">No dominant timbres selected</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
