export type Subject = "Mathematical Reasoning" | "Science" | "Language Arts" | "Social Studies"

export type TestConfig = {
  subject: Subject
  totalQuestions: number
  timeLimit: number // in minutes
  passingScore: number
  withCalculator?: boolean
}

export type Question = {
  id: string
  subject: Subject
  question: string
  options: string[]
  correctAnswer: string
  explanation: string
  requiresCalculator?: boolean
}

export type Score = {
  subject: Subject
  score: number
  status: "Pass" | "Not Passed"
  questionsCorrect: number
  totalQuestions: number
  timeSpent: number // in seconds
}

export const TEST_CONFIG: Record<Subject, TestConfig> = {
  "Mathematical Reasoning": {
    subject: "Mathematical Reasoning",
    totalQuestions: 45,
    timeLimit: 115,
    passingScore: 145,
    withCalculator: true,
  },
  Science: {
    subject: "Science",
    totalQuestions: 40,
    timeLimit: 90,
    passingScore: 145,
  },
  "Language Arts": {
    subject: "Language Arts",
    totalQuestions: 53,
    timeLimit: 150,
    passingScore: 145,
  },
  "Social Studies": {
    subject: "Social Studies",
    totalQuestions: 35,
    timeLimit: 70,
    passingScore: 145,
  },
}

