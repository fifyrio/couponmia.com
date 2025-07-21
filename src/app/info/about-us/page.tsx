import { Metadata } from 'next';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

export const metadata: Metadata = {
  title: "About Us - CouponMia | Your Trusted Source for Online Savings",
  description: "Learn about CouponMia's mission to help you save money on online shopping. Discover how we find and verify the best coupon codes, deals, and discounts from thousands of stores.",
  alternates: {
    canonical: "https://couponmia.com/info/about-us"
  },
  openGraph: {
    title: "About Us - CouponMia | Your Trusted Source for Online Savings",
    description: "Learn about CouponMia's mission to help you save money on online shopping. Discover how we find and verify the best coupon codes, deals, and discounts from thousands of stores.",
    url: "https://couponmia.com/info/about-us",
    type: "website"
  }
};

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-brand-lightest">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl shadow-lg border border-card-border p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-8 text-center">
            About Us
          </h1>
          
          <div className="prose prose-lg max-w-none text-text-secondary leading-relaxed space-y-8">
            <p className="text-xl text-center mb-12 text-text-primary">
              At CouponMia, we help you save money whenever you shop online. We make it easy to find discount codes, coupons, and special offers from thousands of online stores, all in one convenient place. Whether you&apos;re shopping for clothes, electronics, home goods, or anything else, we&apos;ve got money-saving deals that will help stretch your budget further.
            </p>

            <section className="mb-10">
              <h2 className="text-3xl font-bold text-text-primary mb-6 flex items-center">
                <span className="text-3xl mr-3">🏢</span>
                Who We Are
              </h2>
              <p className="mb-4">
                CouponMia is your one-stop destination for finding the best online shopping deals. We collect coupons and discounts from all major online shops and growing businesses. We know how overwhelming it can be to search through dozens of websites looking for the best price, so we&apos;ve created a simple solution - a single website where you can find all the current discounts.
              </p>
              <p>
                Our team works around the clock to verify deals and add new ones, ensuring you always have access to working coupons.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-3xl font-bold text-text-primary mb-6 flex items-center">
                <span className="text-3xl mr-3">🎯</span>
                Our Goal
              </h2>
              <p className="mb-4">
                We want to help you shop smarter and spend less on everything you buy online. Instead of wasting hours searching for discounts across different websites, we gather them all in one easy-to-browse place. Whether you&apos;re looking for big seasonal sales, exclusive holiday deals, or everyday savings on your favorite brands, CouponMia has the discount codes you need.
              </p>
              <p>
                We believe everyone deserves to get the best price possible, and our platform makes that simple. Our mission is to make online shopping more affordable for everyone, one coupon at a time.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-3xl font-bold text-text-primary mb-6 flex items-center">
                <span className="text-3xl mr-3">⚙️</span>
                How It Works
              </h2>
              <p className="mb-6">
                We use advanced technology and a dedicated team to find and verify coupons and deals from countless sources. Our website offers:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-brand-lightest rounded-lg p-4">
                  <h3 className="font-semibold text-brand-light mb-2 flex items-center">
                    <span className="mr-2">🔍</span>
                    Easy Search
                  </h3>
                  <p className="text-sm">Find deals quickly by store name, brand, category, or type of discount. Our smart filters help you find exactly what you need in seconds.</p>
                </div>
                
                <div className="bg-brand-lightest rounded-lg p-4">
                  <h3 className="font-semibold text-brand-light mb-2 flex items-center">
                    <span className="mr-2">🆕</span>
                    Fresh Deals
                  </h3>
                  <p className="text-sm">We add new coupons every hour and remove expired ones right away. Our team checks each deal to make sure it works.</p>
                </div>
                
                <div className="bg-brand-lightest rounded-lg p-4">
                  <h3 className="font-semibold text-brand-light mb-2 flex items-center">
                    <span className="mr-2">👆</span>
                    Simple to Use
                  </h3>
                  <p className="text-sm">Get your discount with just a few clicks. Copy the code, click to the store, and save money instantly.</p>
                </div>
                
                <div className="bg-brand-lightest rounded-lg p-4">
                  <h3 className="font-semibold text-brand-light mb-2 flex items-center">
                    <span className="mr-2">🔔</span>
                    Deal Alerts
                  </h3>
                  <p className="text-sm">Set up alerts for your favorite stores and get notified when new discounts become available.</p>
                </div>
                
                <div className="bg-brand-lightest rounded-lg p-4">
                  <h3 className="font-semibold text-brand-light mb-2 flex items-center">
                    <span className="mr-2">📱</span>
                    Mobile Friendly
                  </h3>
                  <p className="text-sm">Access deals on any device - perfect for shopping on the go.</p>
                </div>
                
                <div className="bg-brand-lightest rounded-lg p-4">
                  <h3 className="font-semibold text-brand-light mb-2 flex items-center">
                    <span className="mr-2">💰</span>
                    Savings Calculator
                  </h3>
                  <p className="text-sm">See how much you&apos;re saving on each purchase with our built-in calculator.</p>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-3xl font-bold text-text-primary mb-6 flex items-center">
                <span className="text-3xl mr-3">⭐</span>
                Why Choose Us?
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-brand-light font-bold text-lg">•</span>
                  <div>
                    <strong className="text-text-primary">Huge Selection:</strong> We have thousands of coupons from major retailers and small businesses alike. From fashion to furniture, electronics to entertainment, we cover every shopping category.
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-brand-light font-bold text-lg">•</span>
                  <div>
                    <strong className="text-text-primary">Special Offers:</strong> Get exclusive deals you won&apos;t find anywhere else, thanks to our direct partnerships with stores.
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-brand-light font-bold text-lg">•</span>
                  <div>
                    <strong className="text-text-primary">Save Time:</strong> Find all deals in one place instead of searching many websites. Our organized layout means you&apos;ll never waste time hunting for discounts again.
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-brand-light font-bold text-lg">•</span>
                  <div>
                    <strong className="text-text-primary">Verified Coupons:</strong> We test our codes regularly to ensure they work.
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-brand-light font-bold text-lg">•</span>
                  <div>
                    <strong className="text-text-primary">Shopping Guides:</strong> Learn money-saving tips and strategies from our expert team.
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-brand-light font-bold text-lg">•</span>
                  <div>
                    <strong className="text-text-primary">Price Comparison:</strong> Compare prices across different stores to ensure you&apos;re getting the best deal.
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-brand-light font-bold text-lg">•</span>
                  <div>
                    <strong className="text-text-primary">User Reviews:</strong> See what other shoppers say about each deal and share your own experiences.
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-r from-brand-light to-brand-accent rounded-2xl p-8 text-white text-center">
              <h2 className="text-3xl font-bold mb-6 flex items-center justify-center">
                <span className="text-3xl mr-3">🤝</span>
                Join Our Community
              </h2>
              <p className="mb-6 text-lg">
                Start saving with CouponMia today! Sign up for our personalized email alerts to get the newest deals for your favorite stores. Follow us on social media for flash sales and limited-time offers. Join our growing community of smart shoppers who never pay full price.
              </p>
              <p className="mb-8">
                We&apos;ll help you save more money while shopping online, and our friendly support team is always here to help if you need assistance. Plus, download our mobile app to have deals at your fingertips wherever you go.
              </p>
              <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
                <button className="bg-white text-brand-light font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 w-full sm:w-auto">
                  Get Started Today
                </button>
                <button className="border-2 border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-white hover:text-brand-light transition-colors duration-200 w-full sm:w-auto">
                  Download App
                </button>
              </div>
              <p className="mt-6 text-sm opacity-90">
                Don&apos;t miss out on another great discount - join CouponMia now and start saving!
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}