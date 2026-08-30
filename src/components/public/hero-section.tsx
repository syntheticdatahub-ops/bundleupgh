"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { CheckCircle2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { detectNetworkCode } from "@/lib/phone"
import dynamic from "next/dynamic"

const GlobeDemo = dynamic(() => import("@/components/globe-demo"), {
  ssr: false,
})

const NETWORK_META: Record<string, { name: string; color: string; text: string }> = {
  mtn: { name: "MTN", color: "#ffcc00", text: "text-black" },
  telecel: { name: "Telecel", color: "#e20010", text: "text-white" },
  airteltigo: { name: "AirtelTigo", color: "#0033a0", text: "text-white" },
}

export function HeroSection() {
  const [phone, setPhone] = useState("")
  const router = useRouter()

  const detectedCode = phone.length >= 3 ? detectNetworkCode(phone) : null
  const detectedNet = detectedCode ? NETWORK_META[detectedCode] : null

  const handleContinue = () => {
    if (phone) {
      router.push(`/buy?phone=${encodeURIComponent(phone)}`)
    } else {
      router.push("/buy")
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  } as const

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  }

  return (
    <section className="relative overflow-hidden min-h-[calc(100vh-4rem)] flex items-center py-12 md:py-24 lg:py-32">
      {/* Globe Background */}
      <div className="absolute inset-0 -z-20 pointer-events-none flex items-center justify-center opacity-50 translate-y-12 lg:translate-y-0 lg:translate-x-1/4 lg:opacity-40">
        <div className="w-[150%] h-[150%] max-w-[800px] max-h-[800px] lg:w-[100%] lg:h-[100%] lg:max-w-[1000px] lg:max-h-[1000px]">
          <GlobeDemo />
        </div>
      </div>

      {/* Background gradients for glass effect */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -z-10 mix-blend-screen opacity-50" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -z-10 mix-blend-screen opacity-50" />

      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          
          {/* Left Column: Copy */}
          <motion.div 
            className="flex flex-col items-center text-center lg:items-start lg:text-left"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
              Buy mobile data.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
                Instantly.
              </span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg text-muted-foreground mb-8 max-w-md">
              Top up any Ghanaian number in under 60 seconds. No registration required.
            </motion.p>
            

            
            {/* Mobile CTA (Replaced simple button with styled input card) */}
            <motion.div variants={itemVariants} className="lg:hidden w-full max-w-sm mt-4">
              <div className="bg-[#111318] border border-white/10 rounded-2xl p-4 w-full text-left shadow-2xl">
                <label className="text-sm font-medium text-white/90 mb-3 block">
                  Ghanaian mobile number
                </label>
                <div className="flex items-center bg-[#1C1F26] border border-white/10 rounded-xl overflow-hidden mb-4 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
                  {/* Country Code Prefix */}
                  <div className="flex items-center gap-2 pl-3 pr-2 py-3 border-r border-white/10 select-none">
                    <span className="text-base leading-none" title="Ghana">🇬🇭</span>
                    <span className="text-white font-medium text-sm">+233</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/50">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </div>
                  {/* Phone Input */}
                  <input 
                    type="tel"
                    placeholder="24 123 4567"
                    className="flex-1 bg-transparent border-none outline-none text-white px-3 py-3 text-sm placeholder:text-white/30 w-full min-w-0"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={(e) => e.key === "Enter" && handleContinue()}
                  />
                  {/* Network Badge */}
                  {detectedNet && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="shrink-0 flex items-center justify-center text-[10px] font-bold px-2 py-1 rounded-md mr-1"
                      style={{ backgroundColor: detectedNet.color, color: detectedNet.text === "text-black" ? "#000" : "#fff" }}
                    >
                      {detectedNet.name}
                    </motion.div>
                  )}
                  {/* Contact Icon */}
                  <div className="pr-3 pl-2 py-3 text-white/40 cursor-pointer hover:text-white/70 transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                      <circle cx="12" cy="10" r="3"/>
                      <path d="M7 22v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </div>
                </div>
                <Button 
                  onClick={handleContinue}
                  className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl h-12 text-base font-medium shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all"
                >
                  Buy Data <span className="ml-1">→</span>
                </Button>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Right Column: Inline Purchase Card */}
          <motion.div 
            className="hidden lg:block"
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
          >
            <Card className="w-full max-w-md mx-auto shadow-2xl border-white/20 bg-white/10 dark:bg-black/40 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/0 dark:from-white/5 dark:to-transparent pointer-events-none" />
              <CardContent className="p-8 relative z-10">
                <h3 className="text-2xl font-bold mb-2">Get Started</h3>
                <p className="text-muted-foreground mb-6">Enter your number to view bundles</p>
                
                <div className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
                    <div className="relative">
                      <Input 
                        id="phone" 
                        placeholder="+233 XX XXX XXXX" 
                        className="h-12 text-lg bg-background/50 backdrop-blur-sm border-white/20 dark:border-white/10 focus-visible:ring-primary/50 pr-24"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        onKeyDown={(e) => e.key === "Enter" && handleContinue()}
                      />
                      {detectedNet && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute right-3 top-2.5 text-xs font-bold px-2.5 py-1.5 rounded-md"
                          style={{ backgroundColor: detectedNet.color, color: detectedNet.text === "text-black" ? "#000" : "#fff" }}
                        >
                          {detectedNet.name}
                        </motion.span>
                      )}
                    </div>
                  </div>
                  <Button size="lg" className="w-full h-12 text-base mt-2 shadow-lg shadow-primary/25" onClick={handleContinue}>
                    Continue →
                  </Button>
                </div>
                
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Payments secured by Paystack
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
        </div>
      </div>
    </section>
  )
}
