'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";

// Map agent names directly to their no-background PNG avatars
const AGENT_AVATARS: { [key: string]: string } = {
  "yona": "/Yona_Avatar-nobg.png",
  "Yona": "/Yona_Avatar-nobg.png",
  "angus": "/Angus_Avatar-nobg.png",
  "Angus": "/Angus_Avatar-nobg.png",
  "mr kim": "/Mr_Kim_Avatar-nobg.png",
  "Mr Kim": "/Mr_Kim_Avatar-nobg.png",
  "nanny noo": "/Nanny_Noo_Avatar-nobg.png",
  "Nanny Noo": "/Nanny_Noo_Avatar-nobg.png",
  "system": "/system-Avatar-nobg.png",
  "System": "/system-Avatar-nobg.png"
};

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

export default function CharactersPage() {
  const [characters, setCharacters] = useState<CharacterFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchCharacters();
  }, []);

  async function fetchCharacters() {
    try {
      console.log('Fetching characters from API...');
      const response = await fetch('/api/get-characters');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch characters');
      }
      
      const data = await response.json();
      console.log(`Fetched ${data.length} characters from API`);
      setCharacters(data);
    } catch (error) {
      console.error('Error fetching characters:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      // Read the file as text
      const text = await file.text();
      let characterData;

      try {
        // Parse the JSON
        characterData = JSON.parse(text);
      } catch (error) {
        throw new Error('Invalid JSON file. Please upload a valid JSON file.');
      }

      // Upload the character data
      const response = await fetch('/api/upload-character', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(characterData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload character');
      }

      const data = await response.json();
      setUploadSuccess(`Character "${data.display_name}" uploaded successfully!`);
      
      // Refresh the character list
      fetchCharacters();
    } catch (error) {
      console.error('Error uploading character:', error);
      setUploadError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  async function handleDeleteCharacter(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete the character "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/delete-character?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete character');
      }

      // Refresh the character list
      fetchCharacters();
    } catch (error) {
      console.error('Error deleting character:', error);
      alert(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }

  async function handleDownloadCharacter(character: CharacterFile) {
    // Create a JSON blob from the character data
    const blob = new Blob([JSON.stringify(character, null, 2)], { type: 'application/json' });
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${character.display_name.replace(/\s+/g, '_')}.json`;
    
    // Trigger the download
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const content = (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-green-400">Character Files</h1>
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              ref={fileInputRef}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
            />
            <Button className="bg-green-600 hover:bg-green-700" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Character'}
            </Button>
          </div>
        </div>
      </div>

      {uploadError && (
        <div className="bg-red-900/20 border border-red-500/30 text-red-300 p-3 rounded-md">
          {uploadError}
        </div>
      )}

      {uploadSuccess && (
        <div className="bg-green-900/20 border border-green-500/30 text-green-300 p-3 rounded-md">
          {uploadSuccess}
        </div>
      )}

      {loading ? (
        <p className="text-purple-300">Loading characters...</p>
      ) : characters.length === 0 ? (
        <Card className="border-purple-500/30 bg-purple-900/20 text-white">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <p className="text-purple-300">No character files found</p>
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading}
                />
                <Button className="bg-green-600 hover:bg-green-700" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload Your First Character'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {characters.map((character) => (
            <Card key={character.id} className="border-purple-500/30 bg-purple-900/20 text-white">
              <CardHeader className="pb-3 flex flex-col items-center">
                <div className="mb-3">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={AGENT_AVATARS[character.agent_name] || ''} alt={character.agent_name} />
                    <AvatarFallback className="bg-purple-700 text-lg">
                      {character.display_name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex items-center justify-between w-full">
                  <CardTitle className="text-xl font-bold text-green-400">{character.display_name}</CardTitle>
                  <Badge
                    variant="outline"
                    className={character.is_active ? "border-green-500 bg-green-500/20 text-green-300" : "border-red-500 bg-red-500/20 text-red-300"}
                  >
                    {character.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <CardDescription className="text-purple-300 mt-1">
                  Agent: {character.agent_name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-purple-300">Version:</span>
                    <span className="text-sm">{character.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-purple-300">Created:</span>
                    <span className="text-sm">{formatDate(character.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-purple-300">Updated:</span>
                    <span className="text-sm">{formatDate(character.updated_at)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-2">
                <Link href={`/characters/${character.id}`}>
                  <Button variant="outline" className="border-purple-500/30 text-purple-300">
                    View Details
                  </Button>
                </Link>
                <Button 
                  onClick={() => handleDownloadCharacter(character)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Download
                </Button>
                <Button 
                  onClick={() => handleDeleteCharacter(character.id, character.display_name)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-auto">
            {content}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
