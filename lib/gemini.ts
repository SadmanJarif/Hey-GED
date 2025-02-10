"use server"

import type { Question, Subject } from "../types"

const GEMINI_API_KEY = "AIzaSyBieDPh0MlWXTL6IFCcIwbatfXP_iPa2l4"

export async function generateQuestion(subject: Subject, isNonCalculator = false): Promise<Question> {
  const calculatorPrompt = subject === "Mathematical Reasoning" && isNonCalculator ? "non-calculator section " : ""
  const prompt = `Generate a challenging GED ${subject} ${calculatorPrompt}practice question. The question should be at a high difficulty level, requiring critical thinking and advanced knowledge of the subject. Return only a JSON object with the following format:
{
  "question": "the challenging question text",
  "options": ["option1", "option2", "option3", "option4"],
  "correctAnswer": "the correct option",
  "explanation": "detailed explanation of the answer"
}`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
    }

    const data = await response.json()
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No content generated")
    }

    const generatedText = data.candidates[0].content.parts[0].text
    // Remove any markdown formatting that might be present
    const jsonString = generatedText.replace(/```json\n|```/g, "").trim()
    const parsedQuestion = JSON.parse(jsonString)

    return {
      id: Math.random().toString(36).substring(7),
      subject,
      isNonCalculator: subject === "Mathematical Reasoning" && isNonCalculator,
      ...parsedQuestion,
    }
  } catch (error) {
    console.error("Error generating question:", error)
    // Return a fallback question if API fails
    return {
      id: Math.random().toString(36).substring(7),
      subject,
      isNonCalculator: subject === "Mathematical Reasoning" && isNonCalculator,
      question: "What is the result of integrating e^x with respect to x?",
      options: ["x + C", "e^x + C", "ln(x) + C", "e^x"],
      correctAnswer: "e^x + C",
      explanation:
        "The integral of e^x is e^x + C. This is because the derivative of e^x is itself, so integrating it results in the same function plus a constant of integration (C).",
    }
  }
}

