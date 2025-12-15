import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cookie Policy | CouponMia',
  description: 'Learn about how CouponMia uses cookies and how we work with third-party affiliate networks to enhance your experience.',
  robots: 'index, follow',
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="text-purple-600 hover:text-purple-700 font-semibold">
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Cookie Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: December 11, 2025</p>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What Are Cookies?</h2>
            <p className="text-gray-700 leading-relaxed">
              Cookies are small text files that are placed on your computer or mobile device when you visit a website.
              They are widely used to make websites work more efficiently and to provide information to the site owners.
            </p>
          </section>

          {/* How We Use Cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How CouponMia Uses Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              CouponMia uses cookies to enhance your browsing experience and to help us understand how our website is being used.
              We use cookies for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>
                <strong>Essential Cookies:</strong> These cookies are necessary for the website to function properly.
                They enable basic features like page navigation and access to secure areas of the website.
              </li>
              <li>
                <strong>Analytics Cookies:</strong> We use analytics services like Google Analytics to understand how visitors
                interact with our website. This helps us improve our content and user experience.
              </li>
              <li>
                <strong>Preference Cookies:</strong> These cookies remember your preferences and settings, such as your
                cookie consent choice, to provide a more personalized experience.
              </li>
            </ul>
          </section>

          {/* Third-Party and Affiliate Cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party and Affiliate Network Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              CouponMia partners with third-party affiliate networks and retailers to provide you with the best deals and coupons.
              When you click on a coupon or visit a store through our website, these third parties may set cookies on your device to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Track affiliate referrals and attribute sales to CouponMia</li>
              <li>Provide personalized offers and recommendations</li>
              <li>Analyze shopping behavior and preferences</li>
              <li>Enable cashback and rewards programs</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              These cookies are governed by the privacy policies of the respective third-party services. We work with trusted
              affiliate networks such as BrandReward and individual retailers to ensure your data is handled responsibly.
            </p>
          </section>

          {/* Managing Cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How to Manage Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have the right to decide whether to accept or reject cookies. You can manage your cookie preferences through:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>
                <strong>Browser Settings:</strong> Most web browsers allow you to control cookies through their settings.
                You can set your browser to refuse cookies or delete certain cookies. Please note that disabling cookies
                may affect the functionality of our website.
              </li>
              <li>
                <strong>Opt-out Tools:</strong> You can opt out of analytics cookies by using browser extensions like
                Google Analytics Opt-out Browser Add-on.
              </li>
            </ul>
          </section>

          {/* Browser-Specific Instructions */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Browser-Specific Cookie Management</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              For more information on how to manage cookies in specific browsers, please refer to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>
                <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer"
                   className="text-purple-600 hover:text-purple-700 underline">
                  Google Chrome
                </a>
              </li>
              <li>
                <a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer"
                   target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 underline">
                  Mozilla Firefox
                </a>
              </li>
              <li>
                <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac"
                   target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 underline">
                  Safari
                </a>
              </li>
              <li>
                <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                   target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 underline">
                  Microsoft Edge
                </a>
              </li>
            </ul>
          </section>

          {/* Updates to Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Updates to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational,
              legal, or regulatory reasons. We encourage you to review this page periodically to stay informed about our use of cookies.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about our use of cookies, please contact us at{' '}
              <a href="mailto:support@couponmia.com" className="text-purple-600 hover:text-purple-700 underline">
                support@couponmia.com
              </a>
            </p>
          </section>
        </div>

        {/* Back to Home Button */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </main>
    </div>
  );
}
