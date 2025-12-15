import { Metadata } from 'next';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

export const metadata: Metadata = {
  title: "Terms of Use - CouponMia | Website Terms and Conditions",
  description: "Read CouponMia's Terms of Use to understand the rules and guidelines for using our coupon and deals website. Learn about your rights and responsibilities.",
  alternates: {
    canonical: "https://couponmia.com/info/terms"
  },
  openGraph: {
    title: "Terms of Use - CouponMia | Website Terms and Conditions",
    description: "Read CouponMia's Terms of Use to understand the rules and guidelines for using our coupon and deals website. Learn about your rights and responsibilities.",
    url: "https://couponmia.com/info/terms",
    type: "website"
  }
};

export default function TermsPage() {
  const lastUpdated = "December 2024";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-brand-lightest">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl shadow-lg border border-card-border p-8 md:p-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              Terms of Use
            </h1>
            <p className="text-text-secondary">
              Last updated: {lastUpdated}
            </p>
          </div>
          
          <div className="prose prose-lg max-w-none text-text-secondary leading-relaxed space-y-8">
            <div className="bg-brand-lightest rounded-lg p-6 border-l-4 border-brand-light">
              <p className="text-text-primary font-medium mb-0">
                Welcome to CouponMia. By accessing or using our website, you agree to comply with and be bound by the following Terms of Use. Please read these terms carefully before using our site. If you do not agree to these terms, you should not use our website.
              </p>
            </div>

            <section>
              <h2 className="text-3xl font-bold text-text-primary mb-6 flex items-center">
                <span className="text-3xl mr-3">✅</span>
                Acceptance of Terms
              </h2>
              <p className="mb-4">
                These Terms of Use govern your access to and use of CouponMia and all associated services. By using this site, you confirm that you are at least 18 years old or that you have the consent of a parent or guardian to use this site.
              </p>
              
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">📋 Age Requirements</h3>
                <ul className="text-blue-700 text-sm space-y-1 mb-0">
                  <li>• You must be at least 18 years old to use this site independently</li>
                  <li>• Users under 18 must have parental or guardian consent</li>
                  <li>• Parents are responsible for their minor children&apos;s use of the site</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-text-primary mb-6 flex items-center">
                <span className="text-3xl mr-3">🔄</span>
                Modification of Terms
              </h2>
              <p className="mb-4">
                CouponMia reserves the right to modify these Terms of Use at any time. Any changes will be effective immediately upon posting on this page. Your continued use of the site after any modifications indicates your acceptance of the revised terms.
              </p>
              
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notice</h3>
                <p className="text-yellow-700 text-sm mb-0">
                  We recommend checking this page periodically to stay informed about any changes to our terms. Changes become effective immediately upon posting.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-text-primary mb-6 flex items-center">
                <span className="text-3xl mr-3">🎯</span>
                Use of the Site
              </h2>
              <p className="mb-4">
                You agree to use CouponMia only for lawful purposes and in a manner that does not infringe the rights of, restrict, or inhibit anyone else&apos;s use and enjoyment of the site.
              </p>
              
              <div className="bg-red-50 rounded-lg p-6 border border-red-200 mb-4">
                <h3 className="font-semibold text-red-800 mb-3">🚫 Prohibited Activities</h3>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <span className="text-red-600">•</span>
                      <span className="text-red-700">Harassment, threatening, or causing distress to other users</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-red-600">•</span>
                      <span className="text-red-700">Impersonating any person or entity</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <span className="text-red-600">•</span>
                      <span className="text-red-700">Transmitting defamatory, obscene, or offensive material</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-red-600">•</span>
                      <span className="text-red-700">Unauthorized advertising or promotional materials</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">✅ Acceptable Use</h3>
                <p className="text-green-700 text-sm mb-0">
                  Use our site to find legitimate deals and coupons, share positive experiences, and help other users save money through lawful means.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-text-primary mb-6 flex items-center">
                <span className="text-3xl mr-3">©️</span>
                Intellectual Property Rights
              </h2>
              <p className="mb-4">
                All content on CouponMia, including text, graphics, logos, and software, is the property of CouponMia or its content suppliers and is protected by copyright and other intellectual property laws.
              </p>
              
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h3 className="font-semibold text-purple-800 mb-2">📝 Usage Restrictions</h3>
                <p className="text-purple-700 text-sm mb-2">
                  You may not reproduce, distribute, modify, create derivative works from, publicly display, publicly perform, republish, download, store, or transmit any material from our site without our prior written consent.
                </p>
                <p className="text-purple-700 text-xs mb-0">
                  This includes but is not limited to our logo, design elements, coupon codes, and proprietary content.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-text-primary mb-6 flex items-center">
                <span className="text-3xl mr-3">⚠️</span>
                Disclaimer of Warranties
              </h2>
              <p className="mb-4">
                CouponMia provides its services on an &quot;as-is&quot; and &quot;as-available&quot; basis. We do not warrant that the information available on our site is accurate, complete, reliable, current, or error-free.
              </p>
              
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <h3 className="font-semibold text-orange-800 mb-2">🔍 No Guarantees</h3>
                <p className="text-orange-700 text-sm mb-0">
                  We make no representations about the accuracy or suitability of the information contained on the site for any purpose. Coupon availability and terms are subject to change by retailers.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-text-primary mb-6 flex items-center">
                <span className="text-3xl mr-3">🛡️</span>
                Limitation of Liability
              </h2>
              <p className="mb-4">
                To the fullest extent permitted by law, CouponMia shall not be liable for any direct, indirect, incidental, special, consequential damages arising out of or in connection with your use of our site.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-2">📋 This Includes But Is Not Limited To:</h3>
                <div className="text-gray-700 text-sm space-y-1">
                  <div>• Damages for loss of profits, goodwill, use, data, or other intangible losses</div>
                  <div>• Issues resulting from your access to or use of (or inability to access or use) our site</div>
                  <div>• Any conduct or content of any third party on our site</div>
                  <div>• Any content obtained from our site</div>
                  <div>• Unauthorized access, use or alteration of your transmissions or content</div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-text-primary mb-6 flex items-center">
                <span className="text-3xl mr-3">🔗</span>
                Links to Third-Party Websites
              </h2>
              <p className="mb-4">
                CouponMia may contain links to third-party websites that are not owned or controlled by us. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites.
              </p>
              
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <h3 className="font-semibold text-indigo-800 mb-2">🔍 Third-Party Responsibility</h3>
                <p className="text-indigo-700 text-sm mb-0">
                  We encourage you to review the terms and conditions and privacy policies of any third-party websites you visit. Your interactions with these sites are governed by their own terms and policies.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-text-primary mb-6 flex items-center">
                <span className="text-3xl mr-3">📞</span>
                Contact Information
              </h2>
              <p className="mb-4">
                If you have any questions about these Terms of Use, please contact us through our website. We will do our best to address your concerns promptly.
              </p>
            </section>

            <section className="bg-gradient-to-r from-brand-light to-brand-accent rounded-2xl p-8 text-white text-center">
              <h2 className="text-3xl font-bold mb-4 flex items-center justify-center">
                <span className="text-3xl mr-3">📜</span>
                Agreement
              </h2>
              <p className="text-lg mb-4">
                By using CouponMia, you acknowledge that you have read these Terms of Use and agree to be bound by them.
              </p>
              <p className="text-sm opacity-90">
                Your continued use of our website constitutes acceptance of these terms and any future modifications.
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