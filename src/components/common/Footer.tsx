export default function Footer() {
  const footerLinks = [
    'Submit', 'Stores', 'About Us', 'Contact Us', 'Privacy Policy', 
    'Terms Of Use', 'Facebook', 'Twitter(X)', 'Blog'
  ];

  return (
    <footer className="bg-card-bg/90 backdrop-blur-md border-t border-card-border py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 space-y-6 md:space-y-0">
          <div className="bg-gradient-to-r from-brand-medium to-brand-light px-6 py-3 rounded-xl shadow-lg">
            <span className="text-white font-bold text-lg">CouponMia</span>
          </div>
          
          <nav className="flex flex-wrap items-center justify-center gap-6">
            {footerLinks.map((link, index) => (
              <a 
                key={index}
                href="#" 
                className="text-sm text-text-secondary hover:text-brand-accent transition-colors font-medium"
              >
                {link}
              </a>
            ))}
          </nav>
        </div>
        
        <div className="text-center text-sm text-text-muted font-medium">
          Copyright ©2024 CouponMia All Rights Reserved. Bake CRM copyright for all. GIS systems. Updated on Feb 05, 2024.
        </div>
      </div>
    </footer>
  );
}