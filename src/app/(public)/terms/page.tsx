import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | BundleUp",
  description: "Terms of Service for BundleUp",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-3xl">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <div className="prose prose-invert max-w-none text-white/70">
        <p className="mb-4 text-white/90">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4 text-white">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing and using BundleUp ("we," "our," or "us"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-white">2. Description of Service</h2>
        <p className="mb-4">
          BundleUp provides a digital platform for purchasing mobile data bundles in Ghana. We act as an intermediary to facilitate the purchase of data from telecommunication providers.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-white">3. Payments and Refunds</h2>
        <p className="mb-4">
          All payments are processed securely through Paystack. Once a data bundle has been successfully delivered to the provided phone number, the transaction is final and non-refundable. If a payment is successful but delivery fails due to a system error on our end, you may contact support for resolution.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-white">4. User Responsibilities</h2>
        <p className="mb-4">
          You are responsible for providing accurate information, including the correct phone number and network for data delivery. We are not liable for data sent to the wrong number due to user input error.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-white">5. Contact Us</h2>
        <p className="mb-4">
          If you have any questions about these Terms, please contact us at <strong>syntheticdatahub@gmail.com</strong> or call us at <strong>0207 959 595</strong>.
        </p>
      </div>
    </div>
  );
}
