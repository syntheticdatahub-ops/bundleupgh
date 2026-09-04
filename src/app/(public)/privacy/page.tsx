import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | BundleUp",
  description: "Privacy Policy for BundleUp",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-3xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose prose-invert max-w-none text-white/70">
        <p className="mb-4 text-white/90">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4 text-white">1. Information We Collect</h2>
        <p className="mb-4">
          When you use BundleUp, we collect the necessary information to process your transaction. This includes:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>The phone number receiving the data bundle.</li>
          <li>Payment transaction references provided by Paystack.</li>
          <li>Basic device and usage analytics to improve our service.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-white">2. How We Use Your Information</h2>
        <p className="mb-4">
          We use the collected information solely for the purpose of fulfilling your data purchase, providing customer support, and maintaining the security and reliability of our platform. We do not sell your personal data to third parties.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-white">3. Payment Processing</h2>
        <p className="mb-4">
          All payments are handled securely by our payment processor, Paystack. We do not store or have direct access to your credit card details or bank account information.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-white">4. Data Security</h2>
        <p className="mb-4">
          We implement standard security measures to protect the information we collect and store. Order details are securely logged in our database for support and fulfillment purposes only.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-white">5. Contact Us</h2>
        <p className="mb-4">
          For any privacy-related concerns or requests to delete your transaction history, please contact us at <strong>syntheticdatahub@gmail.com</strong> or call us at <strong>0207 959 595</strong>.
        </p>
      </div>
    </div>
  );
}
