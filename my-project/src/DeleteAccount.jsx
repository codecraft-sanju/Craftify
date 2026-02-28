import React from 'react';

const DeleteAccount = () => {
  return (
    <div className="min-h-screen pt-24 pb-12 px-6 max-w-3xl mx-auto bg-slate-50">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold mb-6 text-slate-900">Account Deletion Request</h1>
        <p className="mb-4 text-slate-600">
          At Giftomize, we value your privacy. If you wish to delete your account and associated data, please follow the steps below.
        </p>
        
        <h2 className="text-xl font-bold mt-8 mb-4 text-slate-800">How to Request Deletion</h2>
        <p className="mb-4 text-slate-600">
          To request the deletion of your account, please send an email to our support team from the email address associated with your Giftomize account.
        </p>
        <ul className="list-disc pl-6 mb-6 text-slate-600 space-y-2">
          <li><strong>Email:</strong> <a href="mailto:giftomizeofficial@gmail.com" className="text-indigo-600 hover:underline">giftomizeofficial@gmail.com</a></li>
          <li><strong>Subject:</strong> Account Deletion Request</li>
          <li><strong>Body:</strong> Please include your full name and registered phone number so we can verify your account.</li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-4 text-slate-800">What Happens Next?</h2>
        <p className="mb-4 text-slate-600">Once we receive and verify your request, we will process your deletion within 7-14 business days.</p>
        
        <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-6">
          <h3 className="font-bold text-red-800 mb-2">Data We Delete:</h3>
          <ul className="list-disc pl-6 text-red-700 text-sm space-y-1">
            <li>Your personal profile (Name, Phone Number, Email)</li>
            <li>Your saved passwords and login credentials</li>
            <li>Your marketing preferences and wishlist data</li>
          </ul>
        </div>

        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
          <h3 className="font-bold text-emerald-800 mb-2">Data We Retain:</h3>
          <ul className="list-disc pl-6 text-emerald-700 text-sm space-y-1">
            <li>Past order invoices and transaction records (kept securely for legal, tax, and accounting purposes)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccount;