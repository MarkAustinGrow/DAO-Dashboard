'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface CharacterFile {
  id: string;
  agent_name: string;
  display_name: string;
  content: any;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AgentCharacterAssignmentProps {
  agent: {
    id: string;
    name: string;
    character_id?: string;
  };
  onAssign?: (characterId: string) => void;
}

export function AgentCharacterAssignment({ agent, onAssign }: AgentCharacterAssignmentProps) {
  const [characters, setCharacters] = useState<CharacterFile[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<string>(agent.character_id || '');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentCharacter, setCurrentCharacter] = useState<CharacterFile | null>(null);
  const supabase = createClientComponentClient();
  
  // Fetch available characters
  useEffect(() => {
    async function fetchCharacters() {
      try {
        const { data, error } = await supabase
          .from('character_files')
          .select('*')
          .eq('is_active', true)
          .order('display_name');
          
        if (error) throw error;
        setCharacters(data || []);
        
        // If agent has a character assigned, fetch its details
        if (agent.character_id) {
          const { data: characterData, error: characterError } = await supabase
            .from('character_files')
            .select('*')
            .eq('id', agent.character_id)
            .single();
            
          if (!characterError && characterData) {
            setCurrentCharacter(characterData);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching characters:', error);
        setLoading(false);
      }
    }
    
    fetchCharacters();
  }, [supabase, agent.character_id]);
  
  // Handle character assignment
  async function handleAssign() {
    if (selectedCharacter === agent.character_id) return;
    
    setSaving(true);
    
    try {
      // Update the agent's character_id
      const { error } = await supabase
        .from('tasks') // or agents table, depending on your schema
        .update({ character_id: selectedCharacter || null })
        .eq('id', agent.id);
        
      if (error) throw error;
      
      // Log the assignment
      await supabase.from('activity_logs').insert({
        agent_name: agent.name,
        action: selectedCharacter ? 'was assigned a new character' : 'had its character removed',
        details: selectedCharacter ? `Character ID: ${selectedCharacter}` : 'No character assigned',
        category: 'character',
        timestamp: new Date().toISOString()
      });
      
      // Update the current character
      if (selectedCharacter) {
        const character = characters.find(c => c.id === selectedCharacter);
        setCurrentCharacter(character || null);
      } else {
        setCurrentCharacter(null);
      }
      
      // Call the onAssign callback if provided
      if (onAssign) {
        onAssign(selectedCharacter);
      }
    } catch (error) {
      console.error('Error assigning character:', error);
      alert('Failed to assign character. Please try again.');
    } finally {
      setSaving(false);
    }
  }
  
  return (
    <Card className="border-purple-500/30 bg-purple-900/20 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-green-400">Character Assignment</CardTitle>
        <CardDescription className="text-purple-300">
          Assign a character to this agent
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-purple-300">Loading characters...</p>
        ) : (
          <div className="space-y-4">
            {currentCharacter && (
              <div className="rounded-lg border border-purple-500/30 bg-purple-950/50 p-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{currentCharacter.display_name}</h3>
                  <Badge
                    variant="outline"
                    className="border-green-500 bg-green-500/20 text-green-300"
                  >
                    Active
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-purple-300">Version {currentCharacter.version}</p>
              </div>
            )}
            
            <Select
              value={selectedCharacter}
              onValueChange={setSelectedCharacter}
              disabled={loading || saving}
            >
              <SelectTrigger className="bg-purple-950/50 border-purple-500/30">
                <SelectValue placeholder="Select a character" />
              </SelectTrigger>
              <SelectContent className="bg-purple-900 border-purple-500/30">
                <SelectItem value="">None</SelectItem>
                {characters.map((character) => (
                  <SelectItem key={character.id} value={character.id}>
                    {character.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleAssign}
          disabled={loading || saving || selectedCharacter === agent.character_id}
          className="bg-green-600 hover:bg-green-700 ml-auto"
        >
          {saving ? 'Saving...' : 'Assign Character'}
        </Button>
      </CardFooter>
    </Card>
  );
}
