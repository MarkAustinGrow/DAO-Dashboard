'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";

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

export default function CharacterDetailsClient({ id }: { id: string }) {
  const router = useRouter();
  const [character, setCharacter] = useState<CharacterFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCharacterDetails() {
      try {
        console.log('Fetching character details for ID:', id);
        const response = await fetch(`/api/get-character?id=${id}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch character details');
        }
        
        const data = await response.json();
        console.log('Fetched character details:', data);
        setCharacter(data);
      } catch (error) {
        console.error('Error fetching character details:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchCharacterDetails();
    }
  }, [id]);

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

      // Redirect to the characters page
      router.push('/characters');
    } catch (error) {
      console.error('Error deleting character:', error);
      alert(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }

  const content = (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <Link href="/characters">
          <Button variant="outline" className="border-purple-500/30 text-purple-300">
            ← Back to Characters
          </Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-purple-300">Loading character details...</p>
      ) : error ? (
        <Card className="border-red-500/30 bg-red-900/20 text-white">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <p className="text-red-300">Error: {error}</p>
              <Link href="/characters">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Return to Characters
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : !character ? (
        <Card className="border-purple-500/30 bg-purple-900/20 text-white">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <p className="text-purple-300">Character not found</p>
              <Link href="/characters">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Return to Characters
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-purple-500/30 bg-purple-900/20 text-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-green-400">{character.display_name}</CardTitle>
                <Badge
                  variant="outline"
                  className={character.is_active ? "border-green-500 bg-green-500/20 text-green-300" : "border-red-500 bg-red-500/20 text-red-300"}
                >
                  {character.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <CardDescription className="text-purple-300">
                Agent: {character.agent_name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-purple-300">Version</h3>
                  <p>{character.version}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-purple-300">Created</h3>
                  <p>{formatDate(character.created_at)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-purple-300">Last Updated</h3>
                  <p>{formatDate(character.updated_at)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-purple-300">ID</h3>
                  <p className="text-xs">{character.id}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button 
                onClick={() => handleDownloadCharacter(character)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Download JSON
              </Button>
              <Button 
                onClick={() => handleDeleteCharacter(character.id, character.display_name)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-purple-500/30 bg-purple-900/20 text-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-green-400">Character Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {character.content.bio && (
                <div>
                  <h3 className="text-md font-medium text-purple-300 mb-2">Bio</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {character.content.bio.map((item: string, index: number) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {character.content.lore && (
                <div>
                  <h3 className="text-md font-medium text-purple-300 mb-2">Lore</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {character.content.lore.map((item: string, index: number) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {character.content.adjectives && (
                <div>
                  <h3 className="text-md font-medium text-purple-300 mb-2">Adjectives</h3>
                  <p>{character.content.adjectives.join(', ')}</p>
                </div>
              )}

              {character.content.topics && (
                <div>
                  <h3 className="text-md font-medium text-purple-300 mb-2">Topics</h3>
                  <p>{character.content.topics.join(', ')}</p>
                </div>
              )}

              {character.content.style && (
                <div>
                  <h3 className="text-md font-medium text-purple-300 mb-2">Communication Style</h3>
                  
                  {character.content.style.all && (
                    <div className="mb-2">
                      <h4 className="text-sm font-medium text-purple-300">General</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {character.content.style.all.map((item: string, index: number) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {character.content.style.chat && (
                    <div className="mb-2">
                      <h4 className="text-sm font-medium text-purple-300">Chat</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {character.content.style.chat.map((item: string, index: number) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {character.content.style.post && (
                    <div>
                      <h4 className="text-sm font-medium text-purple-300">Post</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {character.content.style.post.map((item: string, index: number) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </>
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
