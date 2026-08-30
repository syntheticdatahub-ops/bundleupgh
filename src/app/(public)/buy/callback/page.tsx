"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2Icon, AlertCircleIcon, HashIcon, PackageIcon, SmartphoneIcon, ShieldCheckIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "motion/react";

type OrderDetails = {
  bundle: string;
  price: number;
  phone: string;
  network: string;
  orderId: string;
};

function CallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "failed" | "pending">("loading");
  const [message, setMessage] = useState("Verifying your payment...");
  const [details, setDetails] = useState<OrderDetails | null>(null);

  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref") || "";

    if (!reference) {
      setStatus("failed");
      setMessage("No payment reference was returned by Paystack.");
      return;
    }

    fetch(`/api/payments/verify?reference=${encodeURIComponent(reference)}`)
      .then(async (response) => {
        const data = await response.json();

        if (response.ok && data.success) {
          setStatus("success");
          setMessage("Payment verified successfully. Your bundle is being processed.");
          if (data.orderDetails) {
            setDetails({ ...data.orderDetails, orderId: data.orderId });
          }
          return;
        }

        setStatus("failed");
        setMessage(data?.error ?? "Payment could not be verified.");
      })
      .catch(() => {
        setStatus("failed");
        setMessage("Unable to verify your payment right now. Please try again.");
      });
  }, [searchParams]);

  return (
    <Card className="w-full max-w-md p-6 sm:p-8 text-center relative overflow-hidden">
      {status === "loading" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6">
          <Loader2Icon className="size-12 animate-spin mx-auto text-primary mb-6" />
          <h1 className="text-2xl font-bold mb-3 tracking-tight">Payment Pending</h1>
          <p className="text-muted-foreground">{message}</p>
        </motion.div>
      )}

      {status === "success" && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
        >
          {/* Animated Success Checkmark */}
          <div className="flex justify-center mb-6">
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
              className="bg-green-500/10 text-green-500 rounded-full p-4"
            >
              <svg 
                width="48" 
                height="48" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                  d="M20 6L9 17l-5-5"
                />
              </svg>
            </motion.div>
          </div>

          <h1 className="text-3xl font-bold mb-3 tracking-tight">Success!</h1>
          <p className="text-muted-foreground mb-8">{message}</p>

          {/* Order Details Card */}
          {details && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.5, duration: 0.5 }}
              className="bg-muted/50 rounded-xl p-5 mb-8 text-left space-y-4"
            >
              <div className="flex items-center gap-3">
                <HashIcon className="size-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Order Reference</div>
                  <div className="font-mono font-medium">{details.orderId}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <PackageIcon className="size-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Bundle</div>
                  <div className="font-medium capitalize">{details.network} • {details.bundle}</div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <SmartphoneIcon className="size-5 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Recipient Phone</div>
                    <div className="font-medium">{details.phone}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Amount Paid</div>
                  <div className="font-bold text-primary">GHS {details.price.toFixed(2)}</div>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link href="/track" className="w-full sm:w-auto">
              <Button className="w-full gap-2">
                <ShieldCheckIcon className="size-4" /> Track Order Status
              </Button>
            </Link>
            <Link href="/buy" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">Buy Another</Button>
            </Link>
          </motion.div>
        </motion.div>
      )}

      {(status === "failed" || status === "pending") && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-4">
          <AlertCircleIcon className="size-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Payment not verified</h1>
          <p className="text-muted-foreground mb-6">{message}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/buy">
              <Button variant="outline" className="w-full">Try again</Button>
            </Link>
            <Link href="/help">
              <Button className="w-full">Get help</Button>
            </Link>
          </div>
        </motion.div>
      )}
    </Card>
  );
}

export default function PaymentCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
      <Suspense fallback={<Card className="w-full max-w-md p-6 text-center"><Loader2Icon className="size-10 animate-spin mx-auto text-primary mb-4" /></Card>}>
        <CallbackContent />
      </Suspense>
    </div>
  );
}
