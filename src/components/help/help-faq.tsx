"use client"

import { useState } from "react"
import { ChevronDownIcon, MailIcon, ClockIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

type FAQItem = {
  q: string
  a: string
}

type FAQCategory = {
  title: string
  items: FAQItem[]
}

const faqs: FAQCategory[] = [
  {
    title: "Buying Data",
    items: [
      { q: "How do I buy data on BundleUp?", a: "Simply enter your phone number, choose your network (we usually detect it automatically), pick the bundle you want, and pay via Paystack. Your data will be delivered instantly." },
      { q: "Do I need an account to buy data?", a: "No, you do not need to register or create an account. Just enter your phone number to get started." },
      { q: "Which networks do you support?", a: "We currently support MTN, Telecel, and AirtelTigo." },
      { q: "How fast will my data be delivered?", a: "Delivery is instant. Typically, you will receive your data in under 60 seconds after a successful payment." },
    ]
  },
  {
    title: "Payments",
    items: [
      { q: "How do I pay?", a: "All payments are processed securely through Paystack. You can pay using Mobile Money (MTN MoMo, Telecel Cash, AirtelTigo Money), Visa, or Mastercard." },
      { q: "Is it safe to pay on BundleUp?", a: "Yes. We use industry-standard 256-bit encryption and we never store your payment details. All transactions are securely handled by Paystack." },
      { q: "What if my payment fails?", a: "If a payment fails, your account or mobile money wallet will not be charged. If you were charged but the data wasn't delivered, please contact support for an immediate resolution." },
    ]
  },
  {
    title: "Orders & Delivery",
    items: [
      { q: "How do I track my order?", a: "You can visit the Track Order page (bundleup.com.gh/track) and enter your phone number to see the status of all your recent purchases." },
      { q: "What if my data doesn't arrive?", a: "In rare cases, network delays might occur. If your data doesn't arrive within 10 minutes, please contact our support team." },
      { q: "Can I get a refund?", a: "Yes. If your payment was successful but we failed to deliver the data bundle, we will process a full refund within 24-48 hours." },
      { q: "My number isn't detected correctly — what do I do?", a: "If our system misidentifies your network based on the prefix (e.g., if you ported your number), you can simply click on the correct network during the purchase flow." },
    ]
  }
]

export function HelpFaq() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="max-w-3xl mx-auto w-full pt-12 pb-24 px-4">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Help & FAQ</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Everything you need to know about using BundleUp. Can&apos;t find the answer you&apos;re looking for? Contact our support team.
        </p>
      </div>

      <div className="space-y-12 mb-16">
        {faqs.map((category, idx) => (
          <div key={idx}>
            <h2 className="text-xl font-bold mb-6 pb-2 border-b">{category.title}</h2>
            <div className="space-y-4">
              {category.items.map((item, itemIdx) => {
                const id = `${idx}-${itemIdx}`
                const isOpen = openItems[id]
                
                return (
                  <div key={itemIdx} className="border rounded-lg overflow-hidden bg-card">
                    <button
                      onClick={() => toggleItem(id)}
                      className="w-full flex justify-between items-center p-5 text-left font-semibold hover:bg-muted/50 transition-colors"
                    >
                      {item.q}
                      <ChevronDownIcon 
                        className={`size-5 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
                      />
                    </button>
                    {isOpen && (
                      <div className="p-5 pt-0 text-muted-foreground leading-relaxed border-t bg-muted/20">
                        <div className="pt-4">{item.a}</div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-8 text-center sm:text-left flex flex-col sm:flex-row items-center gap-8">
          <div className="flex-1 space-y-4">
            <h3 className="text-xl font-bold">Still need help?</h3>
            <p className="text-muted-foreground">
              Our support team is always ready to help you with any issues regarding your purchases.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <MailIcon className="size-4 text-primary" />
                syntheticdatahub@gmail.com
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <ClockIcon className="size-4 text-primary" />
                Available 8am–8pm GMT
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
