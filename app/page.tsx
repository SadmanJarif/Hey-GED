import { Suspense } from "react"
import { Dashboard } from "../components/dashboard"

export default function Home() {
  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: `url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/BG%20Video-c7qtFue3OD79jmJ05S5K3CeiOsNhKq.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="min-h-screen bg-black/40 backdrop-blur-sm">
        <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Suspense fallback={<div className="text-white">Loading...</div>}>
            <Dashboard />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

