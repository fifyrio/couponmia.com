'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl shadow-lg border border-card-border p-8">
      <h2 className="text-3xl font-bold text-text-primary mb-8 flex items-center">
        <span className="text-3xl mr-3">✉️</span>
        Send us a Message
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
              Your Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-card-border rounded-lg bg-card-bg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent transition-all duration-200"
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-card-border rounded-lg bg-card-bg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent transition-all duration-200"
              placeholder="your.email@example.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-text-primary mb-2">
            Subject *
          </label>
          <select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-card-border rounded-lg bg-card-bg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent transition-all duration-200"
          >
            <option value="">Please select a topic</option>
            <option value="coupon-issue">Coupon Not Working</option>
            <option value="store-request">Request New Store</option>
            <option value="technical-issue">Technical Problem</option>
            <option value="general-inquiry">General Question</option>
            <option value="partnership">Business Partnership</option>
            <option value="feedback">Feedback & Suggestions</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-2">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            required
            rows={6}
            className="w-full px-4 py-3 border border-card-border rounded-lg bg-card-bg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent transition-all duration-200 resize-none"
            placeholder="Please describe your question or issue in detail..."
          />
        </div>

        {submitStatus === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-green-500 text-xl mr-3">✅</span>
              <div>
                <h4 className="font-semibold text-green-800">Message Sent Successfully!</h4>
                <p className="text-green-700 text-sm">We&apos;ll get back to you within 24-48 hours.</p>
              </div>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-red-500 text-xl mr-3">❌</span>
              <div>
                <h4 className="font-semibold text-red-800">Error Sending Message</h4>
                <p className="text-red-700 text-sm">Please try again or email us directly.</p>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-brand-light to-brand-accent hover:from-brand-accent hover:to-brand-light hover:scale-105 shadow-lg hover:shadow-xl'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending Message...
            </span>
          ) : (
            'Send Message'
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-text-secondary">
        <p>
          By submitting this form, you agree to our{' '}
          <a href="/info/privacy-policy" className="text-brand-light hover:text-brand-accent transition-colors">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}