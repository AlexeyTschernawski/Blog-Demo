import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <div className="space-y-6 text-gray-700">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
          <p>We collect information you provide directly to us when you register for an account, 
          subscribe to our newsletter, or contact us for support.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. How We Use Your Information</h2>
          <p>We use the information we collect to provide, maintain, and improve our services, 
          to communicate with you, and to protect our users.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. Information Sharing</h2>
          <p>We do not sell, trade, or rent your personal identification information to others.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Data Security</h2>
          <p>We implement appropriate security measures to protect against unauthorized access, 
          alteration, disclosure, or destruction of your personal information.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Changes to This Policy</h2>
          <p>We may update this privacy policy from time to time. We will notify you of any changes 
          by posting the new policy on this page.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us.</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;