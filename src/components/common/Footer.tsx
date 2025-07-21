import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  const footerLinks = [
    { name: 'Submit', href: '#' },
    { name: 'Stores', href: '/stores/startwith/a' },
    { name: 'About Us', href: '/info/about-us' },
    { name: 'Contact Us', href: '#' },
    { name: 'Privacy Policy', href: '#' },
    { name: 'Terms Of Use', href: '#' },
    { name: 'Facebook', href: '#' },
    { name: 'Twitter(X)', href: '#' },
    { name: 'Blog', href: '#' }
  ];

  return (
    <footer className="bg-card-bg/90 backdrop-blur-md border-t border-card-border py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 space-y-6 md:space-y-0">
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/logo.svg"
                alt="CouponMia Logo"
                width={120}
                height={40}
                className="h-10 w-auto hover:opacity-80 transition-opacity cursor-pointer"
              />
            </Link>
          </div>
          
          <nav className="flex flex-wrap items-center justify-center gap-6">
            {footerLinks.map((link, index) => (
              <Link 
                key={index}
                href={link.href}
                className="text-sm text-text-secondary hover:text-brand-accent transition-colors font-medium"
              >
                {link.name}
              </Link>
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