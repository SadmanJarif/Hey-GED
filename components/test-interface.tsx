"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, ArrowRight, CheckCircle, XCircle, SkipForward, Loader2 } from "lucide-react"
import { generateQuestion } from "../lib/gemini"
import type { Question, Subject, Score, TestConfig } from "../types"
import { Timer } from "./timer"

interface TestInterfaceProps {
  subject: Subject
  config: TestConfig
  onComplete: (score: Score) => void
  onExit: () => void
}

interface AnsweredQuestion extends Question {
  userAnswer: string | null
  isCorrect: boolean
}

export function TestInterface({ subject, config, onComplete, onExit }: TestInterfaceProps) {
  const [question, setQuestion] = useState<Question | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string>("")
  const [showFeedback, setShowFeedback] = useState(false)
  const [questionsAnswered, setQuestionsAnswered] = useState(0)
  const [correctAnswers, setCorrectAnswered] = useState(0)
  const [timeSpent, setTimeSpent] = useState(0)
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set())
  const [isNonCalculator, setIsNonCalculator] = useState(subject === "Mathematical Reasoning")
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredQuestion[]>([])
  const [showSummary, setShowSummary] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent((prev) => {
        if (prev >= config.timeLimit * 60) {
          clearInterval(timer)
          handleTestComplete()
          return prev
        }
        return prev + 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [config.timeLimit])

  const loadQuestion = useCallback(async () => {
    setIsLoading(true)
    setLoadingProgress(0)
    let newQuestion: Question | null = null
    let attempts = 0
    const maxAttempts = 5

    const loadingInterval = setInterval(() => {
      setLoadingProgress((prev) => (prev < 90 ? prev + 10 : prev))
    }, 500)

    while (!newQuestion && attempts < maxAttempts) {
      try {
        const generatedQuestion = await generateQuestion(subject, isNonCalculator)
        if (!usedQuestions.has(generatedQuestion.id)) {
          newQuestion = generatedQuestion
          setUsedQuestions((prev) => new Set(prev).add(newQuestion!.id))
        }
      } catch (error) {
        console.error("Error generating question:", error)
      }
      attempts++
    }

    clearInterval(loadingInterval)

    if (!newQuestion) {
      // If we couldn't generate a unique question after max attempts, use a fallback
      newQuestion = {
        id: Math.random().toString(36).substring(7),
        subject,
        isNonCalculator: subject === "Mathematical Reasoning" && isNonCalculator,
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correctAnswer: "4",
        explanation: "Basic addition: 2 + 2 = 4",
      }
    }

    setQuestion(newQuestion)
    setSelectedAnswer("")
    setShowFeedback(false)
    setIsLoading(false)
    setLoadingProgress(100)

    // Switch to calculator section after 5 non-calculator questions for Mathematical Reasoning
    if (subject === "Mathematical Reasoning" && isNonCalculator && questionsAnswered >= 5) {
      setIsNonCalculator(false)
    }
  }, [subject, usedQuestions, isNonCalculator, questionsAnswered])

  useEffect(() => {
    if (!question) {
      loadQuestion()
    }
  }, [question, loadQuestion])

  function handleTestComplete() {
    const score = Math.round((correctAnswers / config.totalQuestions) * 100) + 100
    onComplete({
      subject,
      score,
      status: score >= config.passingScore ? "Pass" : "Not Passed",
      questionsCorrect: correctAnswers,
      totalQuestions: questionsAnswered,
      timeSpent,
    })
    setShowSummary(true)
  }

  function handleCheck() {
    if (question) {
      const isCorrect = selectedAnswer === question.correctAnswer
      setShowFeedback(true)
      setQuestionsAnswered((prev) => prev + 1)
      if (isCorrect) {
        setCorrectAnswered((prev) => prev + 1)
      }
      setAnsweredQuestions((prev) => [
        ...prev,
        {
          ...question,
          userAnswer: selectedAnswer,
          isCorrect,
        },
      ])
    }
  }

  function handleNext() {
    if (questionsAnswered >= config.totalQuestions) {
      handleTestComplete()
    } else {
      loadQuestion()
    }
  }

  function handleSkip() {
    if (question) {
      setQuestionsAnswered((prev) => prev + 1)
      setAnsweredQuestions((prev) => [
        ...prev,
        {
          ...question,
          userAnswer: null,
          isCorrect: false,
        },
      ])
      loadQuestion()
    }
  }

  const progress = (questionsAnswered / config.totalQuestions) * 100

  if (showSummary) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-white/5 border-white/10 text-white">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Exam Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-xl font-semibold">
                Your Score: {Math.round((correctAnswers / config.totalQuestions) * 100) + 100}
              </p>
              <p className="text-lg">
                Correct Answers: {correctAnswers} / {config.totalQuestions}
              </p>
              <p className="text-lg">
                Time Spent: {Math.floor(timeSpent / 60)}m {timeSpent % 60}s
              </p>
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Question Review:</h3>
                {answeredQuestions.map((q, index) => (
                  <div key={q.id} className="mb-4 p-4 bg-white/10 rounded-lg">
                    <p className="font-medium">
                      Question {index + 1}: {q.question}
                    </p>
                    <p className="text-sm mt-2">Your Answer: {q.userAnswer ? q.userAnswer : "Skipped"}</p>
                    <p className="text-sm mt-1">Correct Answer: {q.correctAnswer}</p>
                    <p className={`text-sm mt-1 ${q.isCorrect ? "text-green-400" : "text-red-400"}`}>
                      {q.isCorrect ? "Correct" : "Incorrect"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={onExit} className="w-full">
              Back to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <Card className="bg-white/5 border-white/10 text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">{subject} Exam</CardTitle>
        </CardHeader>
        <CardContent className="py-3">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-4">
              <Timer initialTime={config.timeLimit * 60} onTimeUp={handleTestComplete} timeSpent={timeSpent} />
              <div className="text-sm font-medium">
                Question {questionsAnswered + 1} of {config.totalQuestions}
              </div>
            </div>
            <div className="w-full sm:w-1/3">
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card className="bg-black/30 border-white/10 text-white">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-lg mb-4">Generating question...</p>
            <Progress value={loadingProgress} className="w-64 h-2" />
          </CardContent>
        </Card>
      ) : question ? (
        <Card className="bg-black/30 border-white/10 text-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              {question.isNonCalculator && <span className="text-yellow-400 mr-2">[Non-Calculator]</span>}
              {question.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={selectedAnswer}>
              {question.options.map((option, index) => (
                <div
                  key={index}
                  onClick={() => !showFeedback && setSelectedAnswer(option)}
                  className={`p-4 rounded-lg border border-white/10 transition-colors duration-200 ${
                    showFeedback
                      ? option === question.correctAnswer
                        ? "bg-green-500/20 border-green-500"
                        : selectedAnswer === option
                          ? "bg-red-500/20 border-red-500"
                          : "bg-white/5"
                      : selectedAnswer === option
                        ? "bg-white/10 border-blue-500"
                        : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <RadioGroupItem value={option} id={`option-${index}`} disabled={showFeedback} className="sr-only" />
                  <Label htmlFor={`option-${index}`} className="flex items-center cursor-pointer">
                    <div
                      className={`w-6 h-6 rounded-full border ${
                        showFeedback
                          ? "border-transparent"
                          : selectedAnswer === option
                            ? "border-blue-500"
                            : "border-white/30"
                      } flex items-center justify-center mr-3`}
                    >
                      {showFeedback &&
                        (option === question.correctAnswer ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : selectedAnswer === option ? (
                          <XCircle className="w-5 h-5 text-red-500" />
                        ) : null)}
                    </div>
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {showFeedback && (
              <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="font-medium text-lg mb-2 flex items-center">
                  {selectedAnswer === question.correctAnswer ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <span className="text-green-400">Correct!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-500 mr-2" />
                      <span className="text-red-400">Incorrect</span>
                    </>
                  )}
                </div>
                <div className="text-gray-300">{question.explanation}</div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
            <Button
              variant="outline"
              onClick={onExit}
              className="w-full sm:w-auto border-red-500 text-red-500 hover:bg-red-500/10"
            >
              Exit Test
            </Button>
            {!showFeedback ? (
              <>
                <Button onClick={handleSkip} className="w-full sm:w-auto bg-yellow-600 hover:bg-yellow-700 text-white">
                  Skip
                  <SkipForward className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  onClick={handleCheck}
                  disabled={!selectedAnswer}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Check Answer
                </Button>
              </>
            ) : (
              <Button onClick={handleNext} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white">
                {questionsAnswered >= config.totalQuestions ? (
                  "Finish Test"
                ) : (
                  <>
                    Next Question
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      ) : null}

      {timeSpent > config.timeLimit * 60 - 300 && (
        <div className="flex items-center justify-center text-red-400 bg-red-900/20 p-4 rounded-lg">
          <AlertCircle className="w-5 h-5 mr-2" />
          Less than 5 minutes remaining!
        </div>
      )}
    </div>
  )
}

