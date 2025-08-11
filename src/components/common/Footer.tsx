import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  const footerLinks = [    
    { name: 'Stores', href: '/stores/startwith/a' },
    { name: 'Blog', href: '/blog' },
    { name: 'About Us', href: '/info/about-us' },
    { name: 'Contact Us', href: '/info/contact-us' },
    { name: 'Privacy Policy', href: '/info/privacy-policy' },
    { name: 'Terms Of Use', href: '/info/terms' }
  ];

  const socialLinks = [
    { name: 'Facebook', href: 'https://www.facebook.com/sharer.php?u=https://couponmia.com' },
    { name: 'Twitter(X)', href: 'https://twitter.com/intent/tweet?url=https://couponmia.com' },
    { name: 'Linkedin', href: 'https://www.linkedin.com/sharing/share-offsite/?url=https://couponmia.com' }
  ];

  return (
    <footer className="bg-card-bg/90 backdrop-blur-md border-t border-card-border py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-8 mb-8">
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
          
          {/* 主要链接 */}
          <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-center">
            {footerLinks.map((link, index) => (
              <Link 
                key={index}
                href={link.href}
                className="text-sm text-text-secondary hover:text-brand-accent transition-colors font-medium whitespace-nowrap px-2 py-1 min-h-[44px] flex items-center"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* 社交链接 */}
          <nav className="flex items-center justify-center gap-4 sm:gap-6">
            {socialLinks.map((link, index) => (
              <Link 
                key={index}
                href={link.href}
                className="text-sm text-text-secondary hover:text-brand-accent transition-colors font-medium whitespace-nowrap px-2 py-1 min-h-[44px] flex items-center"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="text-center text-sm text-text-muted font-medium">
          Copyright ©2025 CouponMia All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}