"use client"

import * as React from "react"

export function GlobePreloader() {
  React.useEffect(() => {
    void import("@/components/globe-demo")
  }, [])

  return null
}
