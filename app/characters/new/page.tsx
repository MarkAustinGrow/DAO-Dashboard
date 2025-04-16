'use client';

import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";

export default function NewCharacterPage() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-auto">
            <div className="flex-1 space-y-4 p-4 md:p-8">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-green-400">Create New Character</h1>
                <Link href="/characters">
                  <Button variant="outline" className="border-purple-500/30 text-purple-300">
                    ← Back to Characters
                  </Button>
                </Link>
              </div>
              
              <Card className="border-purple-500/30 bg-purple-900/20 text-white">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center space-y-4 py-8">
                    <p className="text-purple-300 text-center max-w-2xl">
                      The character creation interface has been simplified. 
                      Characters are now created externally as JSON files and uploaded to the dashboard.
                    </p>
                    
                    <div className="bg-purple-950/50 p-4 rounded-md w-full max-w-2xl">
                      <h3 className="text-lg font-medium mb-2 text-green-400">Character JSON Structure</h3>
                      <pre className="text-xs overflow-auto p-2 bg-black/30 rounded">
{`{
  "display_name": "Character Name",
  "agent_name": "Role/Occupation",
  "content": {
    "bio": ["Biographical detail 1", "Biographical detail 2"],
    "lore": ["Background detail 1", "Background detail 2"],
    "adjectives": ["Trait 1", "Trait 2", "Trait 3"],
    "topics": ["Interest 1", "Interest 2", "Interest 3"],
    "style": {
      "all": ["General style 1", "General style 2"],
      "chat": ["Chat style 1", "Chat style 2"],
      "post": ["Post style 1", "Post style 2"]
    }
  },
  "version": 1,
  "is_active": true
}`}
                      </pre>
                    </div>
                    
                    <div className="flex space-x-4 mt-4">
                      <Link href="/characters">
                        <Button className="bg-green-600 hover:bg-green-700">
                          Go to Upload Page
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
