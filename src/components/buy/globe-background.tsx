"use client"

import dynamic from "next/dynamic"

const GlobeDemo = dynamic(() => import("@/components/globe-demo"), { ssr: false })

export function GlobeBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-40">
      <div className="h-[150%] w-[150%] max-h-[900px] max-w-[900px]">
        <GlobeDemo />
      </div>
    </div>
  )
}
