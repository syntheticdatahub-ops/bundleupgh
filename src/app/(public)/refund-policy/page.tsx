import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy | BundleUp",
  description: "Refund Policy for BundleUp",
};

export default function RefundPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-3xl">
      <h1 className="text-4xl font-bold mb-8">Refund Policy</h1>
      <div className="prose prose-invert max-w-none text-white/70">
        <p className="mb-4 text-white/90">Last updated: {new Date().toLocaleDateString()}</p>
        
        <p className="mb-6">
          At BundleUp, we strive to ensure a seamless experience for purchasing mobile data. Because our products are digital goods delivered instantly, our refund policy is strictly outlined below to comply with industry standards and our payment provider (Paystack) requirements.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-white">1. Successful Deliveries (Non-Refundable)</h2>
        <p className="mb-4">
          Once a data bundle has been successfully credited to the phone number provided during checkout, the transaction is considered final. We cannot reverse the data allocation, and therefore, <strong>no refunds</strong> will be issued for successful deliveries.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-white">2. Failed Deliveries (Eligible for Refund)</h2>
        <p className="mb-4">
          If your payment is successfully processed and deducted from your account, but the data bundle is <strong>not delivered</strong> due to a system error, network downtime, or API failure on our end, you are entitled to a full refund. 
        </p>
        <p className="mb-4">
          In many cases, our system will automatically detect the failure and initiate a reversal. If you do not receive the data within 15 minutes and a refund has not been automatically issued, please contact our support team.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-white">3. User Error</h2>
        <p className="mb-4">
          Refunds will <strong>not</strong> be issued in cases where the customer provides an incorrect phone number or selects the wrong network, and the data is successfully delivered to that incorrect number. Please double-check the recipient phone number before confirming your payment.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-white">4. Refund Processing Time</h2>
        <p className="mb-4">
          Approved refunds are processed back to the original payment method (Mobile Money wallet or Bank Card) used for the transaction. Please allow <strong>24 to 48 hours</strong> for the refunded amount to reflect in your account, depending on your bank or mobile money issuer.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-white">5. How to Request a Refund</h2>
        <p className="mb-4">
          To request a refund for a failed delivery, please contact our support team with your transaction reference or phone number:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Email:</strong> syntheticdatahub@gmail.com</li>
          <li><strong>Phone:</strong> 0207 959 595</li>
        </ul>
      </div>
    </div>
  );
}
