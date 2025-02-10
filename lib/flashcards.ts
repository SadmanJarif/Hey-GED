"use server"

import type { Subject } from "../types"

const GEMINI_API_KEY = "AIzaSyBieDPh0MlWXTL6IFCcIwbatfXP_iPa2l4"
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"

const fallbackFlashcards: Record<Subject, { question: string; answer: string }[]> = {
  "Mathematical Reasoning": [
    { question: "What is the derivative of ln(x^2 + 1) with respect to x?", answer: "2x / (x^2 + 1)" },
    { question: "Solve the equation: log₂(x) + log₂(x - 3) = 3", answer: "x = 5" },
    { question: "What is the limit of (1 - cos(x)) / x^2 as x approaches 0?", answer: "1/2" },
  ],
  "Language Arts": [
    {
      question: "Explain the concept of dramatic irony and provide an example from a well-known work of literature.",
      answer:
        "Dramatic irony occurs when the audience knows something that the characters do not. For example, in Shakespeare's 'Romeo and Juliet', the audience knows that Juliet is not dead, merely sleeping, while Romeo believes she is dead and kills himself.",
    },
    {
      question:
        "What is the difference between a metaphor and a simile, and how do they contribute to imagery in poetry?",
      answer:
        "A metaphor directly states that one thing is another, while a simile compares two things using 'like' or 'as'. Both create vivid imagery by drawing unexpected connections between different concepts or objects, enhancing the reader's understanding and emotional response.",
    },
    {
      question: "Explain the concept of unreliable narrator and its effect on storytelling.",
      answer:
        "An unreliable narrator is a narrator whose credibility is compromised, either intentionally or unintentionally. This technique creates ambiguity, forces readers to question the narrative, and can lead to surprising plot twists or deeper character insights.",
    },
  ],
  Science: [
    {
      question: "Explain the concept of quantum entanglement and its implications for quantum computing.",
      answer:
        "Quantum entanglement is a phenomenon where two or more particles become interconnected and share physical properties regardless of distance. This allows for potentially instantaneous communication and is crucial for quantum computing, enabling operations that are impossible with classical bits.",
    },
    {
      question: "Describe the process of cellular respiration and its relationship to photosynthesis.",
      answer:
        "Cellular respiration is the process by which cells break down glucose to produce ATP, releasing CO2 and H2O as byproducts. It's essentially the reverse of photosynthesis, which uses CO2 and H2O to produce glucose and O2. These processes form a cycle that sustains life on Earth.",
    },
    {
      question: "What is the significance of the Higgs boson in particle physics?",
      answer:
        "The Higgs boson is a fundamental particle associated with the Higgs field, which gives mass to other particles. Its discovery in 2012 confirmed the Standard Model of particle physics and helps explain why some particles have mass while others, like photons, do not.",
    },
  ],
  "Social Studies": [
    {
      question:
        "Compare and contrast the political philosophies of John Locke and Thomas Hobbes regarding the social contract theory.",
      answer:
        "Both Locke and Hobbes believed in the social contract, but Hobbes argued for absolute monarchy as people are naturally selfish, while Locke advocated for limited government and natural rights, influencing modern democracy.",
    },
    {
      question: "Analyze the long-term economic and social impacts of the Industrial Revolution.",
      answer:
        "The Industrial Revolution led to urbanization, technological advancements, and economic growth, but also resulted in poor working conditions, child labor, and increased social inequality. It fundamentally changed society, leading to the rise of capitalism, labor movements, and modern economic systems.",
    },
    {
      question:
        "Explain the concept of soft power in international relations and provide examples of its use in modern diplomacy.",
      answer:
        "Soft power is the ability to influence behavior through attraction and persuasion rather than coercion. Examples include cultural exchanges, foreign aid, and public diplomacy. The U.S. often uses soft power through Hollywood, educational exchanges, and technological innovations to shape global opinions and policies.",
    },
  ],
}

const usedFlashcards = new Set<string>()

async function generateFlashcardsWithGemini(
  subject: Subject,
  count: number,
): Promise<{ question: string; answer: string }[]> {
  const prompt = `Generate ${count} unique and challenging GED ${subject} flashcards. The flashcards should cover advanced concepts and require critical thinking. Return a JSON array of objects, each with "question" and "answer" fields. Ensure all questions are distinct and of high difficulty.`

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
    }

    const data = await response.json()
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No content generated")
    }

    const generatedText = data.candidates[0].content.parts[0].text

    let parsedFlashcards
    try {
      parsedFlashcards = JSON.parse(generatedText)
    } catch (parseError) {
      console.error("Error parsing flashcards JSON:", parseError)
      throw new Error("Failed to parse flashcard data")
    }

    if (!Array.isArray(parsedFlashcards) || parsedFlashcards.length === 0) {
      throw new Error("Invalid flashcard format: expected a non-empty array")
    }

    return parsedFlashcards.map((card: any) => ({
      question: card.question,
      answer: card.answer,
    }))
  } catch (error) {
    console.error("Error in generateFlashcardsWithGemini:", error)
    throw error
  }
}

function getUniqueFlashcard(
  subject: Subject,
  flashcards: { question: string; answer: string }[],
): { question: string; answer: string } {
  const availableFlashcards = flashcards.filter((card) => !usedFlashcards.has(card.question))

  if (availableFlashcards.length === 0) {
    usedFlashcards.clear() // Reset used flashcards if all have been used
    return flashcards[Math.floor(Math.random() * flashcards.length)]
  }

  const selectedFlashcard = availableFlashcards[Math.floor(Math.random() * availableFlashcards.length)]
  usedFlashcards.add(selectedFlashcard.question)
  return selectedFlashcard
}

export async function generateFlashcards(
  subject: Subject,
  count: number,
): Promise<{ question: string; answer: string }[]> {
  console.log(`Starting flashcard generation for ${subject}`)

  try {
    const generatedFlashcards = await generateFlashcardsWithGemini(subject, count)
    console.log(`Successfully generated ${generatedFlashcards.length} flashcards for ${subject}`)
    return Array(count)
      .fill(null)
      .map(() => getUniqueFlashcard(subject, generatedFlashcards))
  } catch (error) {
    console.error(`Error in generateFlashcards for ${subject}:`, error)
    console.log("Using fallback flashcard generation method")
    return Array(count)
      .fill(null)
      .map(() => getUniqueFlashcard(subject, fallbackFlashcards[subject]))
  }
}

export async function generateSingleFlashcard(subject: Subject): Promise<{ question: string; answer: string }> {
  try {
    const flashcards = await generateFlashcardsWithGemini(subject, 1)
    if (flashcards.length === 0) {
      throw new Error("No flashcard generated")
    }
    return getUniqueFlashcard(subject, flashcards)
  } catch (error) {
    console.error(`Error generating single flashcard for ${subject}:`, error)
    // Use a fallback flashcard if generation fails
    return getUniqueFlashcard(subject, fallbackFlashcards[subject])
  }
}

