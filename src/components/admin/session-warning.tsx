"use client"

import { useEffect, useState } from "react"
import { AlertCircleIcon } from "lucide-react"

export function SessionWarning() {
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    // Check session every minute
    const interval = setInterval(() => {
      // In a real app we'd parse the JWT expiry or hit a ping endpoint.
      // For this demo, let's assume session is valid for 1 hour.
      // We'll just show a warning after 55 minutes of page load.
      // But actually, we can decode the cookie if it's not httpOnly, or just hit /api/auth/session.
      fetch("/api/auth/session")
        .then(res => res.json())
        .then(data => {
          if (data.expiresIn && data.expiresIn < 5 * 60) {
            setShowWarning(true)
          } else {
            setShowWarning(false)
          }
        })
        .catch(() => {})
    }, 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  if (!showWarning) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-amber-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
      <AlertCircleIcon className="size-5" />
      <div className="text-sm">
        <p className="font-bold">Session expiring soon</p>
        <p className="opacity-90">Please save your work and refresh.</p>
      </div>
    </div>
  )
}
