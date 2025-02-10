import { useEffect, useState } from "react"
import { Clock, AlertCircle } from "lucide-react"

interface TimerProps {
  initialTime: number
  onTimeUp: () => void
  timeSpent: number
}

export function Timer({ initialTime, onTimeUp, timeSpent }: TimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(initialTime - timeSpent)

  useEffect(() => {
    setTimeRemaining(initialTime - timeSpent)

    if (timeRemaining <= 0) {
      onTimeUp()
    }
  }, [initialTime, timeSpent, timeRemaining, onTimeUp])

  function formatTime(seconds: number) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${hours > 0 ? hours + ":" : ""}${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`
  }

  const isLowTime = timeRemaining < 300

  return (
    <div className={`flex items-center ${isLowTime ? "text-red-400" : "text-white"}`}>
      {isLowTime && <AlertCircle className="w-4 h-4 mr-1" />}
      <Clock className="w-4 h-4 mr-1" />
      <span className="font-mono">{formatTime(timeRemaining)}</span>
    </div>
  )
}

