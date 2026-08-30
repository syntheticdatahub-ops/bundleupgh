"use client"

import dynamic from "next/dynamic"

const GlobeDemo = dynamic(() => import("@/components/globe-demo"), { ssr: false })

export function GlobeBackground() {
  return (
    <div className="absolute inset-0 -z-10 pointer-events-none flex items-center justify-center opacity-30">
      <div className="w-[150%] h-[150%] max-w-[900px] max-h-[900px]">
        <GlobeDemo />
      </div>
    </div>
  )
}
