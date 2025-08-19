import { Metadata } from 'next';
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