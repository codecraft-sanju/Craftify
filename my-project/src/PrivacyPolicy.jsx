// src/PrivacyPolicy.jsx
import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from './Footer';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-20 flex flex-col">
      <div className="max-w-4xl mx-auto px-6 py-12 flex-1 w-full">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Privacy Policy</h1>
          <p className="text-slate-500 mb-8 font-medium">Last updated: February 2026</p>

          <div className="space-y-8 text-slate-600 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">1. Introduction</h2>
              <p>
                Welcome to Giftomize. We respect your privacy and are committed to protecting your personal data. 
                This privacy policy will inform you as to how we look after your personal data when you visit our 
                website or use our mobile application and tell you about your privacy rights and how the law protects you.
              </p>
            </section>

            <section>
              {/* MODIFIED: Updated to reflect manual UPI and Transaction ID collection */}
              <h2 className="text-xl font-bold text-slate-900 mb-3">2. The Data We Collect About You</h2>
              <p className="mb-2">We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                <li><strong>Contact Data:</strong> includes billing address, delivery address, email address and telephone numbers.</li>
                <li><strong>Financial Data:</strong> includes UPI transaction IDs, payment receipts, and seller payout details (UPI IDs/QR codes) submitted for manual order and payout verification. We do not collect or store credit/debit card numbers.</li>
                <li><strong>Transaction Data:</strong> includes details about payments to and from you and other details of products you have purchased from us.</li>
                <li><strong>Device Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, and platform used to access this app.</li>
              </ul>
            </section>

            <section>
              {/* MODIFIED: Added manual payment verification wording */}
              <h2 className="text-xl font-bold text-slate-900 mb-3">3. How We Use Your Data</h2>
              <p className="mb-2">We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>To register you as a new customer or seller.</li>
                <li>To verify manual payments via submitted Transaction IDs and process your orders.</li>
                <li>To process payouts to sellers upon successful delivery of goods.</li>
                <li>To manage our relationship with you.</li>
                <li>To improve our website, app, products/services, marketing, and customer relationships.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">4. Device Permissions (Mobile App)</h2>
              <p>
                When using our mobile application, we may request access or permission to certain features from your mobile device, 
                including your device's camera or photo gallery (to upload images for custom gifts or payment verification screenshots). You may change our access 
                or permissions at any time in your device's settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">5. Children's Privacy</h2>
              <p>
                Our services are not intended for children under the age of 13. We do not knowingly collect personal 
                identifiable information from children under 13. If we discover that a child under 13 has provided us 
                with personal information, we immediately delete this from our servers. If you are a parent or guardian 
                and you are aware that your child has provided us with personal information, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">6. Data Security and Retention</h2>
              <p>
                We have put in place appropriate security measures to prevent your personal data from being accidentally lost, 
                used, or accessed in an unauthorized way. We will only retain your personal data for as long as reasonably 
                necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, 
                regulatory, tax, accounting, or reporting requirements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">7. Contact Us</h2>
              <p>If you have any questions about this privacy policy or our privacy practices, please contact us at:</p>
              <div className="mt-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p><strong>Email:</strong> giftomizeofficial@gmail.com</p>
                <p><strong>Phone:</strong> +91 72983 17177 / +91 75680 45830</p>
                <p><strong>Company:</strong> GIFTOMIZE INC.</p>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;