"use client"

import { useState, useEffect } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query)
    const listener = () => setMatches(mediaQueryList.matches)

    // Initial check
    listener()

    // Subscribe to changes
    mediaQueryList.addEventListener("change", listener)

    // Cleanup
    return () => mediaQueryList.removeEventListener("change", listener)
  }, [query])

  return matches
}
