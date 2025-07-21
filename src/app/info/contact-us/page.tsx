import { Metadata } from 'next';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import ContactForm from '@/components/sections/ContactForm';

export const metadata: Metadata = {
  title: "Contact Us - CouponMia | Get Support and Help",
  description: "Need help or have questions? Contact CouponMia's support team. We're here to assist you with coupons, deals, and any issues you may encounter.",
  alternates: {
    canonical: "https://couponmia.com/info/contact-us"
  },
  openGraph: {
    title: "Contact Us - CouponMia | Get Support and Help", 
    description: "Need help or have questions? Contact CouponMia's support team. We're here to assist you with coupons, deals, and any issues you may encounter.",
    url: "https://couponmia.com/info/contact-us",
    type: "website"
  }
};

export default function ContactUsPage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-brand-lightest">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Contact Us
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Have questions, feedback, or need help? We&apos;re here to assist you. Get in touch with our friendly support team.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl shadow-lg border border-card-border p-8">
            <h2 className="text-3xl font-bold text-text-primary mb-8 flex items-center">
              <span className="text-3xl mr-3">📞</span>
              Get in Touch
            </h2>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-brand-light text-white rounded-lg p-3 flex-shrink-0">
                  <span className="text-xl">📧</span>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-1">Email Support</h3>
                  <p className="text-text-secondary text-sm mb-2">Send us an email anytime</p>
                  <a 
                    href="mailto:support@couponmia.com" 
                    className="text-brand-light hover:text-brand-accent transition-colors font-medium"
                  >
                    support@couponmia.com
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-green-500 text-white rounded-lg p-3 flex-shrink-0">
                  <span className="text-xl">⏰</span>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-1">Response Time</h3>
                  <p className="text-text-secondary text-sm mb-2">We typically respond within</p>
                  <p className="text-green-600 font-medium">24-48 hours</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-purple-500 text-white rounded-lg p-3 flex-shrink-0">
                  <span className="text-xl">🌍</span>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-1">Global Support</h3>
                  <p className="text-text-secondary text-sm mb-2">Available worldwide</p>
                  <p className="text-purple-600 font-medium">24/7 Online Support</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-blue-500 text-white rounded-lg p-3 flex-shrink-0">
                  <span className="text-xl">💬</span>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-1">Support Languages</h3>
                  <p className="text-text-secondary text-sm mb-2">We speak your language</p>
                  <p className="text-blue-600 font-medium">English • Español • Français</p>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-brand-lightest rounded-lg p-6">
              <h3 className="font-bold text-brand-light mb-3 flex items-center">
                <span className="mr-2">💡</span>
                Quick Help Tips
              </h3>
              <ul className="text-sm text-text-secondary space-y-2">
                <li>• Check our FAQ section for instant answers</li>
                <li>• Include your browser and device info when reporting issues</li>
                <li>• Provide the store name when asking about specific coupons</li>
                <li>• Screenshots help us understand problems faster</li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <ContactForm />
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-card-bg/90 backdrop-blur-sm rounded-2xl shadow-lg border border-card-border p-8">
          <h2 className="text-3xl font-bold text-text-primary mb-8 text-center flex items-center justify-center">
            <span className="text-3xl mr-3">❓</span>
            Frequently Asked Questions
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-text-primary mb-2">How do I use a coupon code?</h3>
                <p className="text-text-secondary text-sm">Copy the code, click the &quot;Go to Store&quot; button, and paste the code at checkout to apply your discount.</p>
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-2">Why isn&apos;t my coupon working?</h3>
                <p className="text-text-secondary text-sm">Coupons may have expired, have minimum purchase requirements, or be limited to specific items. Check the terms and conditions.</p>
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-2">How often are new deals added?</h3>
                <p className="text-text-secondary text-sm">We add new coupons and deals every hour. Our team works around the clock to bring you the latest savings.</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-text-primary mb-2">Can I request coupons for specific stores?</h3>
                <p className="text-text-secondary text-sm">Yes! Contact us with your store requests and we&apos;ll do our best to add them to our platform.</p>
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-2">Is CouponMia free to use?</h3>
                <p className="text-text-secondary text-sm">Absolutely! All our coupons and deals are completely free. We never charge users for accessing our savings.</p>
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-2">How do you verify coupon codes?</h3>
                <p className="text-text-secondary text-sm">Our team regularly tests all codes to ensure they work. We remove expired codes and update deals in real-time.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}