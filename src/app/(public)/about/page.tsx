import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | BundleUp",
  description: "Learn more about BundleUp, Ghana's premier mobile data reselling platform.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-3xl">
      <h1 className="text-4xl font-bold mb-8">About Us</h1>
      <div className="prose prose-invert max-w-none text-white/70">
        <p className="mb-6 text-lg text-white/90 leading-relaxed">
          Welcome to <strong>BundleUp</strong>, Ghana's fastest and most reliable mobile data reselling platform. Our mission is simple: to keep you connected without the hassle, wait times, or complicated USSD menus.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-white">Who We Are</h2>
        <p className="mb-4 leading-relaxed">
          We are a technology-driven company based in Accra, Ghana, dedicated to simplifying how Ghanaians purchase digital goods. We understand that in today's fast-paced world, internet connectivity is not just a luxury—it is a necessity. BundleUp was built to bridge the gap between consumers and telecom networks, providing a seamless, one-click experience for topping up mobile data.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-white">What We Do</h2>
        <p className="mb-4 leading-relaxed">
          BundleUp acts as a secure intermediary between you and major telecommunication networks including MTN, Telecel, and AirtelTigo. 
        </p>
        <p className="mb-4 leading-relaxed">
          Instead of navigating through slow network prompts or worrying about failed transactions, our platform offers a streamlined web interface where you can purchase data bundles in under 60 seconds. Our automated systems ensure that the moment your payment is verified, your data is dispatched to your phone instantly.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-white">Security & Trust</h2>
        <p className="mb-4 leading-relaxed">
          Your security is our top priority. We do not store any sensitive payment information on our servers. All financial transactions are processed securely through our trusted payment partner, <strong>Paystack</strong>, ensuring bank-level security for every purchase you make.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-white">Get in Touch</h2>
        <p className="mb-4 leading-relaxed">
          We are constantly evolving and improving our services based on customer feedback. If you have any questions, partnerships inquiries, or simply want to say hello, our support team is always ready to assist you.
        </p>
        <p className="font-medium text-white/90">
          📍 Accra, Ghana <br/>
          📧 syntheticdatahub@gmail.com <br/>
          📞 0207 959 595
        </p>
      </div>
    </div>
  );
}
