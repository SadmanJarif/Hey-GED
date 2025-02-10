"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Clock, GraduationCap } from "lucide-react"
import { TestInterface } from "./test-interface"
import { type Subject, type Score, TEST_CONFIG } from "../types"

export function Dashboard() {
  const [scores, setScores] = useState<Score[]>([])
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)

  const subjectColors = {
    "Language Arts": "bg-purple-500/20 hover:bg-purple-500/30",
    "Social Studies": "bg-green-500/20 hover:bg-green-500/30",
    Science: "bg-orange-500/20 hover:bg-orange-500/30",
    "Mathematical Reasoning": "bg-blue-500/20 hover:bg-blue-500/30",
  }

  const subjectIcons = {
    "Language Arts": "📚",
    "Social Studies": "🌎",
    Science: "🔬",
    "Mathematical Reasoning": "📐",
  }

  if (selectedSubject) {
    return (
      <TestInterface
        subject={selectedSubject}
        config={TEST_CONFIG[selectedSubject]}
        onComplete={(newScore) => {
          setScores([...scores.filter((s) => s.subject !== selectedSubject), newScore])
          setSelectedSubject(null)
        }}
        onExit={() => setSelectedSubject(null)}
      />
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Object.keys(TEST_CONFIG).map((subject) => {
          const score = scores.find((s) => s.subject === (subject as Subject))
          const config = TEST_CONFIG[subject as Subject]

          return (
            <Card key={subject} className={`${subjectColors[subject as Subject]} border-white/10 text-white`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg font-medium">
                    <span className="mr-2">{subjectIcons[subject as Subject]}</span>
                    {subject}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {score ? (
                  <>
                    <div className="space-y-4">
                      <div>
                        <div className="text-2xl sm:text-3xl font-bold mb-1">{score.score}</div>
                        <div className="text-xs sm:text-sm text-gray-300">
                          {score.status === "Pass" ? "✅ Passed" : "❌ Not Passed"}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span>Questions</span>
                          <span>
                            {score.questionsCorrect}/{score.totalQuestions}
                          </span>
                        </div>
                        <Progress value={(score.questionsCorrect / score.totalQuestions) * 100} />
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-gray-300">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        {Math.floor(score.timeSpent / 60)}m {score.timeSpent % 60}s
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="text-xs sm:text-sm text-gray-300">
                      <div className="flex items-center mb-2">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        {config.timeLimit} minutes
                      </div>
                      <div className="flex items-center">
                        <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        {config.totalQuestions} questions
                      </div>
                    </div>
                  </div>
                )}
                <Button
                  className="w-full mt-4"
                  variant={score ? "secondary" : "default"}
                  onClick={() => setSelectedSubject(subject as Subject)}
                >
                  {score ? "Retake Test" : "Start Test"}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="bg-white/5 border-white/10 text-white">
        <CardHeader>
          <CardTitle>About GED Testing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm sm:text-base">
            Hey GED helps you prepare for each GED subtest, which is scored on a scale of 100 to 200. You need a minimum
            score of 145 on each subtest to pass.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="font-semibold mb-2 text-sm sm:text-base">Test Format</h3>
              <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
                <li>Language Arts: 46-53 questions + 45-minute essay section</li>
                <li>Mathematical Reasoning: 40-45 questions</li>
                <li>Social Studies: 35 questions</li>
                <li>Science: 34-40 questions</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-sm sm:text-base">Time Limits</h3>
              <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
                <li>Language Arts: 150 minutes (including 45 minutes for the essay)</li>
                <li>Mathematical Reasoning: 115 minutes</li>
                <li>Social Studies: 70 minutes</li>
                <li>Science: 90 minutes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

