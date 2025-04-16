'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";

interface CharacterData {
  id: string;
  agent_name: string;
  display_name: string;
  content: any;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function EditCharacterClient({ id }: { id: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [character, setCharacter] = useState<CharacterData | null>(null);
  
  // Form state for each step
  const [basicInfo, setBasicInfo] = useState({
    name: '',
    role: '',
    description: '',
    isActive: true
  });
  
  const [background, setBackground] = useState({
    background: '',
    personality: '',
    interests: ''
  });
  
  const [communication, setCommunication] = useState({
    communicationStyle: '',
    exampleScenarios: ''
  });
  
  const [refinement, setRefinement] = useState({
    refinementPrompt: ''
  });
  
  // Fetch character data on page load
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
        
        // Initialize form state with character data
        setBasicInfo({
          name: data.display_name,
          role: data.agent_name,
          description: data.content.bio?.join('\n') || '',
          isActive: data.is_active
        });
        
        // Set background info
        const backgroundText = data.content.lore?.join('\n') || '';
        const personalityText = data.content.adjectives?.join(', ') || '';
        const interestsText = data.content.topics?.join(', ') || '';
        
        setBackground({
          background: backgroundText,
          personality: personalityText,
          interests: interestsText
        });
        
        // Set communication style
        const styleAll = data.content.style?.all?.join('\n') || '';
        const styleChat = data.content.style?.chat?.join('\n') || '';
        const stylePost = data.content.style?.post?.join('\n') || '';
        
        setCommunication({
          communicationStyle: `General: ${styleAll}\n\nChat: ${styleChat}\n\nPost: ${stylePost}`,
          exampleScenarios: ''
        });
        
      } catch (error) {
        console.error('Error fetching character details:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      fetchCharacterDetails();
    }
  }, [id]);
  
  // Navigation between steps
  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);
  
  // Handle basic info submission
  async function handleBasicInfoSubmit() {
    // Just move to the next step, no API call needed
    nextStep();
  }
  
  // Handle background info submission
  async function handleBackgroundSubmit() {
    // Just move to the next step, no API call needed
    nextStep();
  }
  
  // Handle communication style submission
  async function handleCommunicationSubmit() {
    // Just move to the next step, no API call needed
    nextStep();
  }
  
  // Handle refinement submission
  async function handleRefinementSubmit() {
    if (refinement.refinementPrompt) {
      setIsSaving(true);
      
      try {
        // Call API route to refine the character
        const response = await fetch('/api/generate-character', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'refineCharacter',
            character: character?.content,
            refinementPrompt: refinement.refinementPrompt
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to refine character');
        }
        
        const data = await response.json();
        
        // Update character content with the refined data
        if (character) {
          setCharacter({
            ...character,
            content: {
              ...character.content,
              ...data
            }
          });
        }
      } catch (error) {
        console.error('Error refining character:', error);
        alert('Failed to refine character. Please try again.');
      } finally {
        setIsSaving(false);
      }
    }
  }
  
  // Save the updated character to the database
  async function saveCharacter() {
    if (!character) return;
    
    setIsSaving(true);
    
    try {
      // Prepare updated character data
      const updatedCharacter = {
        ...character,
        display_name: basicInfo.name,
        agent_name: basicInfo.role,
        is_active: basicInfo.isActive,
        content: {
          ...character.content,
          bio: basicInfo.description.split('\n').filter(line => line.trim() !== ''),
          lore: background.background.split('\n').filter(line => line.trim() !== ''),
          adjectives: background.personality.split(',').map(adj => adj.trim()).filter(adj => adj !== ''),
          topics: background.interests.split(',').map(topic => topic.trim()).filter(topic => topic !== '')
        }
      };
      
      // Parse communication style
      const commStyles = communication.communicationStyle.split('\n\n');
      if (commStyles.length >= 3) {
        const generalStyle = commStyles[0].replace('General:', '').trim().split('\n');
        const chatStyle = commStyles[1].replace('Chat:', '').trim().split('\n');
        const postStyle = commStyles[2].replace('Post:', '').trim().split('\n');
        
        updatedCharacter.content.style = {
          all: generalStyle,
          chat: chatStyle,
          post: postStyle
        };
      }
      
      console.log('Updating character with data:', updatedCharacter);
      
      // Call the update-character API
      const response = await fetch('/api/update-character', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCharacter),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update character');
      }
      
      const data = await response.json();
      console.log('Character updated successfully:', data);
      
      // Redirect to the character details page
      router.push(`/characters/${character.id}`);
    } catch (error) {
      console.error('Error updating character:', error);
      alert('Failed to update character. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }
  
  // Render the appropriate step
  const renderStep = () => {
    if (isLoading) {
      return (
        <Card className="border-purple-500/30 bg-purple-900/20 text-white">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <p className="text-purple-300">Loading character data...</p>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    if (error) {
      return (
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
      );
    }
    
    if (!character) {
      return (
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
      );
    }
    
    switch (step) {
      case 1:
        return (
          <Card className="border-purple-500/30 bg-purple-900/20 text-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-green-400">Basic Information</CardTitle>
              <CardDescription className="text-purple-300">
                Edit the basic information about your character
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Character Name</Label>
                <Input 
                  id="name" 
                  value={basicInfo.name} 
                  onChange={(e) => setBasicInfo({...basicInfo, name: e.target.value})} 
                  className="bg-purple-950/50 border-purple-500/30"
                />
              </div>
              
              <div>
                <Label htmlFor="role">Role/Occupation</Label>
                <Input 
                  id="role" 
                  value={basicInfo.role} 
                  onChange={(e) => setBasicInfo({...basicInfo, role: e.target.value})} 
                  className="bg-purple-950/50 border-purple-500/30"
                  placeholder="e.g., K-pop vocalist, Software Engineer, Chef"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Bio</Label>
                <Textarea 
                  id="description" 
                  value={basicInfo.description} 
                  onChange={(e) => setBasicInfo({...basicInfo, description: e.target.value})} 
                  className="bg-purple-950/50 border-purple-500/30 h-32"
                  placeholder="Enter biographical information, one item per line"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="is-active" 
                  checked={basicInfo.isActive}
                  onChange={(e) => setBasicInfo({...basicInfo, isActive: e.target.checked})}
                  className="h-4 w-4 rounded border-purple-500/30 bg-purple-950/50 text-green-500"
                />
                <Label htmlFor="is-active">Active</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/characters/${character.id}`} className="mr-auto">
                <Button variant="outline" className="border-purple-500/30 text-purple-300">
                  Cancel
                </Button>
              </Link>
              <Button 
                onClick={handleBasicInfoSubmit} 
                disabled={!basicInfo.name || isSaving}
                className="bg-green-600 hover:bg-green-700"
              >
                Next
              </Button>
            </CardFooter>
          </Card>
        );
      
      case 2:
        return (
          <Card className="border-purple-500/30 bg-purple-900/20 text-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-green-400">Background & Personality</CardTitle>
              <CardDescription className="text-purple-300">
                Edit your character's background and personality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="background">Background Story</Label>
                <Textarea 
                  id="background" 
                  value={background.background} 
                  onChange={(e) => setBackground({...background, background: e.target.value})} 
                  className="bg-purple-950/50 border-purple-500/30 h-24"
                  placeholder="Enter background/lore information, one item per line"
                />
              </div>
              
              <div>
                <Label htmlFor="personality">Personality Traits</Label>
                <Textarea 
                  id="personality" 
                  value={background.personality} 
                  onChange={(e) => setBackground({...background, personality: e.target.value})} 
                  className="bg-purple-950/50 border-purple-500/30 h-24"
                  placeholder="Enter personality traits, separated by commas"
                />
              </div>
              
              <div>
                <Label htmlFor="interests">Interests & Expertise</Label>
                <Textarea 
                  id="interests" 
                  value={background.interests} 
                  onChange={(e) => setBackground({...background, interests: e.target.value})} 
                  className="bg-purple-950/50 border-purple-500/30 h-24"
                  placeholder="Enter topics of interest, separated by commas"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                onClick={prevStep} 
                variant="outline" 
                className="border-purple-500/30 text-purple-300"
              >
                Back
              </Button>
              <Button 
                onClick={handleBackgroundSubmit} 
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700"
              >
                Next
              </Button>
            </CardFooter>
          </Card>
        );
      
      case 3:
        return (
          <Card className="border-purple-500/30 bg-purple-900/20 text-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-green-400">Communication Style</CardTitle>
              <CardDescription className="text-purple-300">
                Edit how your character communicates and interacts with others
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="communicationStyle">Communication Style</Label>
                <Textarea 
                  id="communicationStyle" 
                  value={communication.communicationStyle} 
                  onChange={(e) => setCommunication({...communication, communicationStyle: e.target.value})} 
                  className="bg-purple-950/50 border-purple-500/30 h-48"
                  placeholder="Edit the communication style sections (General, Chat, Post)"
                />
              </div>
              
              <div>
                <Label htmlFor="exampleScenarios">Example Scenarios (Optional)</Label>
                <Textarea 
                  id="exampleScenarios" 
                  value={communication.exampleScenarios} 
                  onChange={(e) => setCommunication({...communication, exampleScenarios: e.target.value})} 
                  className="bg-purple-950/50 border-purple-500/30 h-24"
                  placeholder="Provide some example scenarios or topics your character might discuss, and how they would respond."
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                onClick={prevStep} 
                variant="outline" 
                className="border-purple-500/30 text-purple-300"
              >
                Back
              </Button>
              <Button 
                onClick={handleCommunicationSubmit} 
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700"
              >
                Next
              </Button>
            </CardFooter>
          </Card>
        );
      
      case 4:
        return (
          <Card className="border-purple-500/30 bg-purple-900/20 text-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-green-400">Review & Save</CardTitle>
              <CardDescription className="text-purple-300">
                Review your changes and save the updated character
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-purple-950/50 p-4 rounded-md overflow-auto max-h-96">
                <h3 className="text-lg font-medium mb-2">Character Preview</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-purple-300">Name</h4>
                    <p>{basicInfo.name}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-purple-300">Role</h4>
                    <p>{basicInfo.role}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-purple-300">Status</h4>
                    <p>{basicInfo.isActive ? 'Active' : 'Inactive'}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-purple-300">Bio</h4>
                    <p className="whitespace-pre-line">{basicInfo.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-purple-300">Background</h4>
                    <p className="whitespace-pre-line">{background.background}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-purple-300">Personality</h4>
                    <p>{background.personality}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-purple-300">Interests</h4>
                    <p>{background.interests}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-purple-300">Communication Style</h4>
                    <p className="whitespace-pre-line">{communication.communicationStyle}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="refinementPrompt">Refinement Instructions (Optional)</Label>
                <Textarea 
                  id="refinementPrompt" 
                  value={refinement.refinementPrompt} 
                  onChange={(e) => setRefinement({...refinement, refinementPrompt: e.target.value})} 
                  className="bg-purple-950/50 border-purple-500/30 h-24"
                  placeholder="Describe any changes or refinements you'd like to make to the character."
                />
              </div>
              
              {refinement.refinementPrompt && (
                <Button 
                  onClick={handleRefinementSubmit} 
                  disabled={isSaving}
                  className="bg-purple-600 hover:bg-purple-700 w-full"
                >
                  {isSaving ? 'Refining...' : 'Apply Refinements'}
                </Button>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                onClick={prevStep} 
                variant="outline" 
                className="border-purple-500/30 text-purple-300"
              >
                Back
              </Button>
              <Button 
                onClick={saveCharacter} 
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        );
      
      default:
        return null;
    }
  };
  
  // Progress indicator
  const renderProgress = () => {
    return (
      <div className="w-full bg-purple-900/20 h-2 rounded-full mb-6">
        <div 
          className="bg-green-400 h-2 rounded-full" 
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>
    );
  };
  
  const content = (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-green-400">Edit Character</h1>
        <Link href={`/characters/${id}`}>
          <Button variant="outline" className="border-purple-500/30 text-purple-300">
            Cancel
          </Button>
        </Link>
      </div>
      
      {!isLoading && !error && character && renderProgress()}
      
      {renderStep()}
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
