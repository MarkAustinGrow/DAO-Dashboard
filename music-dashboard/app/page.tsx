import MusicDashboard from "@/components/music-dashboard"
import { ThemeProvider } from "@/components/theme-provider"

export default function Home() {
  return (
    <ThemeProvider>
      <main className="min-h-screen bg-[#1a0933] text-white">
        <MusicDashboard />
      </main>
    </ThemeProvider>
  )
}
