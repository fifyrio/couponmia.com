import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import CouponSubmissionForm from '@/components/sections/CouponSubmissionForm';

export const metadata: Metadata = {
  title: "Submit a Coupon - CouponMia | Share Deals with Community",
  description: "Have a great coupon or deal? Share it with the CouponMia community! Submit your coupon codes and help others save money.",
  alternates: {
    canonical: "https://couponmia.com/submission/coupon/add"
  },
  openGraph: {
    title: "Submit a Coupon - CouponMia | Share Deals with Community", 
    description: "Have a great coupon or deal? Share it with the CouponMia community! Submit your coupon codes and help others save money.",
    url: "https://couponmia.com/submission/coupon/add",
    type: "website"
  }
};

export default function CouponSubmissionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-brand-lightest">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Submit a Coupon
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Have a great deal to share? Help the CouponMia community save money by submitting your coupon code or deal.
          </p>
        </div>

        {/* Backlink Promotion Section - Prominent Position */}
        <div className="mb-12 bg-gradient-to-r from-brand-light/10 to-brand-accent/10 backdrop-blur-sm rounded-2xl shadow-lg border border-brand-light/20 p-8">
          <h2 className="text-2xl font-bold text-text-primary mb-6 text-center flex items-center justify-center">
            <span className="text-2xl mr-3">🔗</span>
            Get Featured Faster - Add Our Backlink
          </h2>
          
          <div className="max-w-3xl mx-auto">
            <div className="bg-card-bg/70 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-text-primary mb-3 flex items-center">
                <span className="text-green-500 mr-2 text-lg">⚡</span>
                Priority Review Benefits
              </h3>
              <ul className="text-text-secondary text-sm space-y-2 ml-6">
                <li>• <span className="text-brand-accent font-medium">Faster approval</span> - Usually within 12-24 hours</li>
                <li>• <span className="text-brand-accent font-medium">Higher visibility</span> - Featured placement in search results</li>
                <li>• <span className="text-brand-accent font-medium">Better ranking</span> - Priority in our coupon listings</li>
                <li>• <span className="text-brand-accent font-medium">Long-term partnership</span> - Ongoing collaboration opportunities</li>
              </ul>
            </div>

            <div className="bg-card-bg/50 rounded-xl p-6">
              <h3 className="font-semibold text-text-primary mb-3 flex items-center">
                <span className="text-blue-500 mr-2 text-lg">📋</span>
                How to Add Our Backlink
              </h3>
              <div className="space-y-4">
                <div className="text-sm text-text-secondary">
                  <p className="mb-3">Simply add one of these links to your website (choose what fits best):</p>
                  
                  <div className="space-y-3">
                    <div className="bg-background/50 rounded-lg p-4 border border-card-border">
                      <div className="text-xs text-text-muted mb-2">Option 1: Text Link</div>
                      <code className="text-xs text-brand-accent bg-background/70 px-2 py-1 rounded font-mono break-all">
                        &lt;a href=&quot;https://couponmia.com&quot; target=&quot;_blank&quot;&gt;Best Coupon Codes &amp; Deals&lt;/a&gt;
                      </code>
                    </div>
                    
                    <div className="bg-background/50 rounded-lg p-4 border border-card-border">
                      <div className="text-xs text-text-muted mb-2">Option 2: Branded Link</div>
                      <code className="text-xs text-brand-accent bg-background/70 px-2 py-1 rounded font-mono break-all">
                        &lt;a href=&quot;https://couponmia.com&quot; target=&quot;_blank&quot;&gt;CouponMia - Save Money Today&lt;/a&gt;
                      </code>
                    </div>

                    <div className="bg-background/50 rounded-lg p-4 border border-card-border">
                      <div className="text-xs text-text-muted mb-2">Option 3: Footer Link</div>
                      <code className="text-xs text-brand-accent bg-background/70 px-2 py-1 rounded font-mono break-all">
                        &lt;a href=&quot;https://couponmia.com&quot;&gt;Coupon Codes&lt;/a&gt;
                      </code>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-xs flex items-center">
                      <span className="mr-2">💡</span>
                      <strong>Pro Tip:</strong> Add the link to your homepage footer, deals page, or blog for maximum SEO benefit.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-6">
              <p className="text-text-secondary text-sm">
                After adding the backlink, mention it in your coupon description or{' '}
                <Link href="/info/contact-us" className="text-brand-light hover:text-brand-accent transition-colors">
                  contact us
                </Link>{' '}
                to get priority review status.
              </p>
            </div>
          </div>
        </div>

        <CouponSubmissionForm />

        {/* Guidelines Section */}
        <div className="mt-16 bg-card-bg/90 backdrop-blur-sm rounded-2xl shadow-lg border border-card-border p-8">
          <h2 className="text-3xl font-bold text-text-primary mb-8 text-center flex items-center justify-center">
            <span className="text-3xl mr-3">📋</span>
            Submission Guidelines
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-text-primary mb-2 flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Do Submit
                </h3>
                <ul className="text-text-secondary text-sm space-y-1 ml-6">
                  <li>• Working coupon codes you&apos;ve tested</li>
                  <li>• Current deals and promotions</li>
                  <li>• Accurate expiration dates</li>
                  <li>• Clear offer descriptions</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-2 flex items-center">
                  <span className="text-blue-500 mr-2">💡</span>
                  Tips for Better Submissions
                </h3>
                <ul className="text-text-secondary text-sm space-y-1 ml-6">
                  <li>• Test the coupon before submitting</li>
                  <li>• Include minimum purchase requirements</li>
                  <li>• Mention product restrictions if any</li>
                  <li>• Use clear, descriptive titles</li>
                </ul>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-text-primary mb-2 flex items-center">
                  <span className="text-red-500 mr-2">❌</span>
                  Don&apos;t Submit
                </h3>
                <ul className="text-text-secondary text-sm space-y-1 ml-6">
                  <li>• Expired or fake coupon codes</li>
                  <li>• Spam or promotional content</li>
                  <li>• Misleading offer information</li>
                  <li>• Duplicate existing coupons</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-2 flex items-center">
                  <span className="text-purple-500 mr-2">⏰</span>
                  Review Process
                </h3>
                <ul className="text-text-secondary text-sm space-y-1 ml-6">
                  <li>• All submissions are reviewed manually</li>
                  <li>• Approval typically takes 24-48 hours</li>
                  <li>• You&apos;ll receive email confirmation</li>
                  <li>• Invalid submissions are rejected</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
