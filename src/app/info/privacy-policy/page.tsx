import { Metadata } from 'next';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

export const metadata: Metadata = {
  title: "Privacy Policy - CouponMia | How We Protect Your Privacy",
  description: "Read CouponMia's Privacy Policy to understand how we collect, use, and protect your information. Learn about our commitment to your privacy and data security.",
  alternates: {
    canonical: "https://couponmia.com/info/privacy-policy"
  },
  openGraph: {
    title: "Privacy Policy - CouponMia | How We Protect Your Privacy",
    description: "Read CouponMia's Privacy Policy to understand how we collect, use, and protect your information. Learn about our commitment to your privacy and data security.",
    url: "https://couponmia.com/info/privacy-policy",
    type: "website"
  }
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "December 2024";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-brand-lightest">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl shadow-lg border border-card-border p-8 md:p-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              Privacy Policy
            </h1>
            <p className="text-text-secondary">
              Last updated: {lastUpdated}
            </p>
          </div>
          
          <div className="prose prose-lg max-w-none text-text-secondary leading-relaxed space-y-8">
            <div className="bg-brand-lightest rounded-lg p-6 border-l-4 border-brand-light">
              <p className="text-text-primary font-medium mb-0">
                At CouponMia, your privacy is of utmost importance to us. This Privacy Policy outlines how we collect, use, disclose, and protect your information when you visit our website. By using CouponMia, you consent to the practices described in this policy.
              </p>
            </div>

            <section>
              <h2 className="text-3xl font-bold text-text-primary mb-6 flex items-center">
                <span className="text-3xl mr-3">📊</span>
                Information We Collect
              </h2>
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <p className="text-green-800 font-semibold mb-2">✅ Our Privacy Commitment</p>
                <p className="text-green-700 mb-0">
                  CouponMia does not store any personal data from users. We do not collect or retain any personally identifiable information when you visit our site. Our primary goal is to provide you with a seamless shopping experience without requiring personal information.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-text-primary mb-6 flex items-center">
                <span className="text-3xl mr-3">🍪</span>
                Cookies and Tracking Technologies
              </h2>
              <p className="mb-4">
                CouponMia may use cookies and similar tracking technologies to enhance your experience on our site. Cookies are small files that are stored on your device to help us improve our services.
              </p>
              
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 mb-4">
                <h3 className="font-semibold text-yellow-800 mb-2">🔧 Cookie Management</h3>
                <p className="text-yellow-700 text-sm mb-0">
                  You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-card-bg border border-card-border rounded-lg p-4">
                  <h4 className="font-semibold text-text-primary mb-2">Essential Cookies</h4>
                  <p className="text-sm text-text-secondary">Required for basic site functionality and security.</p>
                </div>
                <div className="bg-card-bg border border-card-border rounded-lg p-4">
                  <h4 className="font-semibold text-text-primary mb-2">Analytics Cookies</h4>
                  <p className="text-sm text-text-secondary">Help us understand how visitors interact with our website.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-text-primary mb-6 flex items-center">
                <span className="text-3xl mr-3">🔄</span>
                Use of Information
              </h2>
              <p className="mb-4">
                Since we do not collect personal data, we do not use your information for any marketing or promotional purposes. Our website may display deals and discounts from various retailers, but this information is aggregated from public sources and does not require personal data for access.
              </p>
              
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">ℹ️ How We Use Non-Personal Data</h3>
                <ul className="text-blue-700 text-sm space-y-1 mb-0">
                  <li>• Improve website performance and user experience</li>
                  <li>• Analyze traffic patterns and popular content</li>
                  <li>• Optimize our coupon and deal recommendations</li>
                  <li>• Ensure website security and prevent fraud</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-text-primary mb-6 flex items-center">
                <span className="text-3xl mr-3">🚫</span>
                Disclosure of Your Information
              </h2>
              <p className="mb-4">
                We do not sell, rent, or share any personal information because we do not collect any. We may share aggregated non-personal data with third parties for analytical purposes, but this data does not identify individual users.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-2xl mb-2">❌</div>
                  <h4 className="font-semibold text-red-800 mb-1">No Selling</h4>
                  <p className="text-xs text-red-700">We never sell your data</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-2xl mb-2">❌</div>
                  <h4 className="font-semibold text-red-800 mb-1">No Renting</h4>
                  <p className="text-xs text-red-700">We never rent your data</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-2xl mb-2">❌</div>
                  <h4 className="font-semibold text-red-800 mb-1">No Sharing</h4>
                  <p className="text-xs text-red-700">We never share personal data</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-text-primary mb-6 flex items-center">
                <span className="text-3xl mr-3">🔒</span>
                Data Security
              </h2>
              <p className="mb-4">
                While we do not store personal data, we take reasonable measures to protect the information that may be collected through cookies and other tracking technologies.
              </p>
              
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <h3 className="font-semibold text-orange-800 mb-2">⚠️ Security Disclaimer</h3>
                <p className="text-orange-700 text-sm mb-0">
                  Please remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect any information, we cannot guarantee its absolute security.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-text-primary mb-6 flex items-center">
                <span className="text-3xl mr-3">👶</span>
                Children&apos;s Privacy
              </h2>
              <p className="mb-4">
                CouponMia does not knowingly collect personally identifiable information from anyone under the age of 13. If we become aware that we have inadvertently collected personal data from a child under age 13, we will take steps to remove that information from our servers.
              </p>
              
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h3 className="font-semibold text-purple-800 mb-2">👨‍👩‍👧‍👦 Parental Notice</h3>
                <p className="text-purple-700 text-sm mb-0">
                  If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately so we can take appropriate action.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-text-primary mb-6 flex items-center">
                <span className="text-3xl mr-3">🔄</span>
                Changes to This Privacy Policy
              </h2>
              <p className="mb-4">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-2">📅 Policy Updates</h3>
                <p className="text-gray-700 text-sm mb-0">
                  Changes to this Privacy Policy are effective when they are posted on this page. We recommend checking this page periodically to stay informed about how we protect your privacy.
                </p>
              </div>
            </section>

            <section className="bg-gradient-to-r from-brand-light to-brand-accent rounded-2xl p-8 text-white text-center">
              <h2 className="text-3xl font-bold mb-4 flex items-center justify-center">
                <span className="text-3xl mr-3">✅</span>
                Your Consent
              </h2>
              <p className="text-lg mb-6">
                By using CouponMia, you acknowledge that you have read this Privacy Policy and agree to its terms.
              </p>
              <p className="text-sm opacity-90">
                If you have any questions about this Privacy Policy, please contact us through our website.
              </p>
            </section>

            <div className="text-center text-sm text-text-muted bg-gray-50 rounded-lg p-4">
              <p className="mb-0">
                <strong>Last Updated:</strong> {lastUpdated} • 
                <strong> Effective Date:</strong> {lastUpdated} • 
                <strong> Version:</strong> 1.0
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}