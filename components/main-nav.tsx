"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { GraduationCap, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function MainNav() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Logo Section */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
              <GraduationCap className="size-5 text-white" />
            </div>
            <Link href="/" className="text-lg font-bold text-white">
              Hey GED
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={cn(
                "text-sm font-medium transition-colors hover:text-white",
                pathname === "/" ? "text-white" : "text-gray-400",
              )}
            >
              Take Tests
            </Link>
            <Link
              href="/flashcards"
              className={cn(
                "text-sm font-medium transition-colors hover:text-white",
                pathname === "/flashcards" ? "text-white" : "text-gray-400",
              )}
            >
              Flashcards
            </Link>
          </nav>

          {/* Action Button and Menu Toggle */}
          <div className="flex items-center gap-4">
            <Button size="sm" className="bg-emerald-400 hover:bg-emerald-500 text-black font-medium rounded-full px-6">
              Start Practice
            </Button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Simple Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/10">
            <nav className="px-4 py-4 space-y-2">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "block py-2 text-sm font-medium transition-colors hover:text-white",
                  pathname === "/" ? "text-white" : "text-gray-400",
                )}
              >
                Take Tests
              </Link>
              <Link
                href="/flashcards"
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "block py-2 text-sm font-medium transition-colors hover:text-white",
                  pathname === "/flashcards" ? "text-white" : "text-gray-400",
                )}
              >
                Flashcards
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

