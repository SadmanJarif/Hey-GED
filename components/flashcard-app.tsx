"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  ChevronLeft,
  ChevronRight,
  Play,
  RotateCcw,
  BookOpen,
  Brain,
  Atom,
  Globe,
  Award,
  ArrowLeft,
  Loader2,
} from "lucide-react"
import { generateFlashcards } from "../lib/flashcards"
import type { Subject } from "../types"

const FlashcardApp = () => {
  const [currentView, setCurrentView] = useState("selection")
  const [isFlipped, setIsFlipped] = useState(false)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [currentSubject, setCurrentSubject] = useState<Subject>("Mathematical Reasoning")
  const [flashcards, setFlashcards] = useState<{ question: string; answer: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGeneratingMore, setIsGeneratingMore] = useState(false)
  const [totalCards, setTotalCards] = useState(10) // Set a default number of total cards

  const flashcardSets = [
    {
      title: "Mathematical Reasoning",
      cards: 100,
      gradient: "from-blue-600 to-indigo-600",
      icon: <Brain className="w-6 h-6 sm:w-8 sm:h-8" />,
    },
    {
      title: "Language Arts",
      cards: 100,
      gradient: "from-green-600 to-teal-600",
      icon: <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" />,
    },
    {
      title: "Science",
      cards: 100,
      gradient: "from-yellow-600 to-orange-600",
      icon: <Atom className="w-6 h-6 sm:w-8 sm:h-8" />,
    },
    {
      title: "Social Studies",
      cards: 100,
      gradient: "from-red-600 to-pink-600",
      icon: <Globe className="w-6 h-6 sm:w-8 sm:h-8" />,
    },
  ]

  const backgroundStyle = {
    backgroundImage: `url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/BG%20Video-c7qtFue3OD79jmJ05S5K3CeiOsNhKq.png')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  }

  const loadInitialFlashcards = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const initialFlashcards = await generateFlashcards(currentSubject, 5) // Load 5 initial flashcards
      setFlashcards(initialFlashcards)
      setLoading(false)
    } catch (err) {
      console.error("Error loading initial flashcards:", err)
      setError("Failed to load flashcards. Please try again later.")
      setLoading(false)
    }
  }, [currentSubject])

  useEffect(() => {
    if (currentView === "flashcard" && flashcards.length === 0) {
      loadInitialFlashcards()
    }
  }, [currentView, flashcards.length, loadInitialFlashcards])

  const loadMoreFlashcards = async () => {
    setIsGeneratingMore(true)
    try {
      const newFlashcards = await generateFlashcards(currentSubject, 5) // Load 5 more flashcards
      setFlashcards((prevFlashcards) => [...prevFlashcards, ...newFlashcards])
    } catch (err) {
      console.error("Error loading more flashcards:", err)
      setError("Failed to load more flashcards. Using available ones.")
    } finally {
      setIsGeneratingMore(false)
    }
  }

  const handleNext = async () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setIsFlipped(false)
    } else if (currentCardIndex < totalCards - 1) {
      await loadMoreFlashcards()
      setCurrentCardIndex(currentCardIndex + 1)
      setIsFlipped(false)
    } else {
      // All cards have been viewed
      setCurrentView("completion")
    }
  }

  const SelectionView = () => (
    <div className="min-h-screen text-white relative" style={backgroundStyle}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative z-10 pt-16 sm:pt-20 p-4 sm:p-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 sm:mb-12"
        >
          <h1 className="font-bold text-3xl sm:text-4xl md:text-6xl mb-2 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Hey GED Flashcards
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-gray-300 max-w-2xl mx-auto px-4">
            Master key concepts and boost your confidence for the GED test with our interactive flashcard sets.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {flashcardSets.map((set, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <Card
                className={`bg-gradient-to-br ${set.gradient} hover:shadow-lg transition-all duration-300 group overflow-hidden`}
              >
                <CardContent className="p-4 sm:p-6 relative">
                  <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 -mr-10 -mt-10 bg-white/10 rounded-full transform rotate-45"></div>
                  <div className="relative z-10">
                    <div className="flex items-center mb-2 sm:mb-4">
                      {set.icon}
                      <h2 className="font-bold text-base sm:text-lg md:text-xl ml-2 sm:ml-3">{set.title}</h2>
                    </div>
                    <p className="text-xs sm:text-sm md:text-base mb-3 sm:mb-4">{set.cards} Flashcards</p>
                    <div className="flex justify-between items-center">
                      <Button
                        onClick={() => {
                          setCurrentSubject(set.title as Subject)
                          setCurrentView("flashcard")
                          setFlashcards([])
                          setCurrentCardIndex(0)
                          setTotalCards(set.cards)
                        }}
                        variant="secondary"
                        size="sm"
                        className="bg-white/20 hover:bg-white/30 text-white text-xs sm:text-sm"
                      >
                        <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Start Practice
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )

  const FlashcardView = () => (
    <div className="min-h-screen text-white relative" style={backgroundStyle}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative z-10 pt-16 sm:pt-20 p-4 sm:p-8">
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-xs sm:text-sm text-gray-400">{currentSubject} Flashcard Set for the GED Test</h1>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
              Flashcard {currentCardIndex + 1} of {totalCards}
            </h2>
            <div className="text-xs sm:text-sm text-gray-400">{isFlipped ? "Answer" : "Question"}</div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 mt-2 sm:mt-0">
            <Button
              onClick={() => {
                setCurrentView("selection")
                setFlashcards([])
                setCurrentCardIndex(0)
              }}
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm px-2 sm:px-4"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back to Sets</span>
            </Button>
          </div>
        </div>

        {loading || isGeneratingMore ? (
          <div className="flex flex-col items-center justify-center h-48 sm:h-64">
            <div className="animate-spin rounded-full h-16 w-16 sm:h-24 sm:w-24 border-t-2 border-b-2 border-white mb-4"></div>
            <p className="text-sm sm:text-base">
              {isGeneratingMore ? "Generating more flashcards..." : "Loading flashcards..."}
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-500/20 border border-red-500 text-white p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm">{error}</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCardIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-lg shadow-lg mb-4 sm:mb-6 relative overflow-hidden border border-white/20 flex items-center justify-center"
              style={{ minHeight: "300px", height: "calc(100vh - 300px)", maxHeight: "500px" }}
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                style={{ perspective: 1000 }}
                className="w-full h-full relative"
              >
                <div
                  className={`absolute inset-0 p-6 sm:p-8 ${
                    isFlipped ? "opacity-0" : "opacity-100"
                  } transition-opacity duration-300 flex items-center justify-center`}
                >
                  <p className="text-base sm:text-lg md:text-xl text-center w-full">
                    {flashcards[currentCardIndex]?.question}
                  </p>
                </div>
                <div
                  className={`absolute inset-0 p-6 sm:p-8 ${
                    isFlipped ? "opacity-100" : "opacity-0"
                  } transition-opacity duration-300 flex items-center justify-center`}
                  style={{ transform: "rotateY(180deg)" }}
                >
                  <p className="text-base sm:text-lg md:text-xl text-center w-full">
                    {flashcards[currentCardIndex]?.answer}
                  </p>
                </div>
              </motion.div>

              <Button
                onClick={() => setIsFlipped(!isFlipped)}
                className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/30 text-white shadow-lg transition-all duration-300 border-none"
                size="sm"
              >
                <div className="flex items-center">
                  <motion.div animate={{ rotate: isFlipped ? 180 : 0 }} transition={{ duration: 0.6 }}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                  </motion.div>
                  <span className="text-sm">Flip</span>
                </div>
              </Button>
            </motion.div>
          </AnimatePresence>
        )}

        <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4">
          <Button
            onClick={() => {
              if (currentCardIndex > 0) {
                setCurrentCardIndex(currentCardIndex - 1)
                setIsFlipped(false)
              }
            }}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300 border-none px-2 sm:px-4 py-1 sm:py-2"
            size="sm"
            disabled={currentCardIndex === 0 || isGeneratingMore}
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="text-xs sm:text-sm">Previous</span>
          </Button>
          <div className="flex-1 flex justify-center items-center my-2 sm:my-0">
            <Progress value={((currentCardIndex + 1) / totalCards) * 100} className="w-full max-w-xs sm:max-w-md" />
          </div>
          <Button
            onClick={handleNext}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-300 border-none px-2 sm:px-4 py-1 sm:py-2"
            size="sm"
            disabled={isGeneratingMore}
          >
            {isGeneratingMore ? (
              <>
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 animate-spin" />
                <span className="text-xs sm:text-sm">Generating...</span>
              </>
            ) : (
              <>
                <span className="text-xs sm:text-sm">Next</span>
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )

  const CompletionView = () => (
    <div className="min-h-screen text-white relative" style={backgroundStyle}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative z-10 p-4 sm:p-8 flex flex-col items-center justify-center h-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center bg-gradient-to-br from-blue-600 to-purple-600 p-6 sm:p-8 rounded-lg shadow-lg max-w-xs sm:max-w-sm md:max-w-md w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 10 }}
          >
            <Award className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-yellow-400 mx-auto mb-4 sm:mb-6" />
          </motion.div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-4">Congratulations!</h1>
          <p className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6">
            You've completed the {currentSubject} flashcard set.
          </p>
          <Button
            onClick={() => {
              setCurrentView("selection")
              setFlashcards([])
              setCurrentCardIndex(0)
            }}
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white shadow-lg hover:shadow-green-500/25 transition-all duration-300 border-none px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm"
          >
            Back to Flashcard Sets
          </Button>
        </motion.div>
      </div>
    </div>
  )

  return (
    <>
      {currentView === "selection" && <SelectionView />}
      {currentView === "flashcard" && <FlashcardView />}
      {currentView === "completion" && <CompletionView />}
    </>
  )
}

export default FlashcardApp

