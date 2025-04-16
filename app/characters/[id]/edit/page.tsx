'use client';

import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";

export default function EditCharacterPage() {
  const params = useParams();
  const router = useRouter();
  
  // This page is no longer needed with the simplified approach
  // Redirect to the character details page
  
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-auto">
            <div className="flex-1 space-y-4 p-4 md:p-8">
              <div className="flex items-center justify-between">
                <Link href="/characters">
                  <Button variant="outline" className="border-purple-500/30 text-purple-300">
                    ← Back to Characters
                  </Button>
                </Link>
              </div>
              
              <Card className="border-purple-500/30 bg-purple-900/20 text-white">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center space-y-4 py-8">
                    <p className="text-purple-300">
                      The character editing interface has been simplified. 
                      Characters can now be downloaded, modified externally, and re-uploaded.
                    </p>
                    <div className="flex space-x-4">
                      <Link href={`/characters/${params?.id}`}>
                        <Button className="bg-purple-600 hover:bg-purple-700">
                          View Character Details
                        </Button>
                      </Link>
                      <Link href="/characters">
                        <Button variant="outline" className="border-purple-500/30 text-purple-300">
                          Return to Characters
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
