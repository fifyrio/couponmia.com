import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import StoreDetailClient from '@/components/pages/StoreDetailClient';

interface Props {
  params: Promise<{ storeAlias: string }>;
}

// Mock store data
const mockStoreData = {
  'buybeautykorea': {
    name: 'BuyBeautyKorea',
    logo: '/placeholder-logo.png',
    description: 'Shop Korean online beauty and fashion store online at CouponMia. Enjoy a 30% off store sale discount! Search 13 active coupons. Trusted DNA Beauty Platform by professionals, We will make our best choice for you. CouponMia exclusive coupons earn up to 30% cash back.',
    rating: 4.5,
    reviewCount: 1247,
    activeOffers: 17,
    categories: ['Beauty', 'Fashion', 'Skincare', 'K-Beauty'],
    website: 'buybeautykorea.com',
    established: '2018',
    headquarters: 'Seoul, South Korea',
    coupons: [
      {
        id: 1,
        title: '15% OFF',
        subtitle: 'Flash Sale: 15% Off Sitewide for 24 Hours Only',
        code: 'FLASH15',
        type: 'code' as const,
        discount: '15%',
        description: 'Get 15% off your entire purchase during our flash sale',
        expiresAt: '2025-01-25',
        isPopular: true,
        minSpend: null
      },
      {
        id: 2,
        title: '$75 OFF',
        subtitle: 'Spend $75 and Get a Free Gift with Your Order',
        code: null,
        type: 'deal' as const,
        discount: '$75',
        description: 'Automatic discount when you spend $75 or more',
        expiresAt: '2025-02-15',
        isPopular: false,
        minSpend: 75
      },
      {
        id: 3,
        title: '20% OFF',
        subtitle: '20% Off Best-selling Skincare Products - Limited Time!',
        code: 'SKIN20',
        type: 'code' as const,
        discount: '20%',
        description: 'Save 20% on all bestselling skincare items',
        expiresAt: '2025-01-30',
        isPopular: false,
        minSpend: null
      },
      {
        id: 4,
        title: '15% OFF',
        subtitle: 'Get 15% Off Your First Order at BuyBeautyKorea',
        code: 'WELCOME15',
        type: 'code' as const,
        discount: '15%',
        description: 'New customer exclusive discount',
        expiresAt: '2025-12-31',
        isPopular: true,
        minSpend: 50
      },
      {
        id: 5,
        title: '10% OFF',
        subtitle: 'Save 10% on All Beauty Tools and Accessories',
        code: 'BEAUTY10',
        type: 'code' as const,
        discount: '10%',
        description: 'Get 10% off on all beauty tools and accessories',
        expiresAt: '2025-02-28',
        isPopular: false,
        minSpend: null
      },
      {
        id: 6,
        title: 'Free Shipping',
        subtitle: 'Free Worldwide Shipping on Orders Over $50',
        code: null,
        type: 'deal' as const,
        discount: 'Free Shipping',
        description: 'No shipping costs on orders above $50',
        expiresAt: '2025-03-31',
        isPopular: false,
        minSpend: 50
      },
      {
        id: 7,
        title: '25% OFF',
        subtitle: 'Exclusive 25% Off on Premium K-Beauty Sets',
        code: 'PREMIUM25',
        type: 'code' as const,
        discount: '25%',
        description: 'Save big on curated K-Beauty premium sets',
        expiresAt: '2025-01-31',
        isPopular: true,
        minSpend: 100
      },
      {
        id: 8,
        title: '$100 OFF',
        subtitle: 'Save $100 on Orders Over $300',
        code: 'MEGA100',
        type: 'code' as const,
        discount: '$100',
        description: 'Huge savings on large orders',
        expiresAt: '2025-02-14',
        isPopular: false,
        minSpend: 300
      }
    ],
    similarStores: [
      { name: 'YesStyle', logo: '/placeholder-logo.png', offers: 25 },
      { name: 'Stylevana', logo: '/placeholder-logo.png', offers: 18 },
      { name: 'Peach & Lily', logo: '/placeholder-logo.png', offers: 12 },
      { name: 'Soko Glam', logo: '/placeholder-logo.png', offers: 15 },
      { name: 'Olive Young Global', logo: '/placeholder-logo.png', offers: 22 },
      { name: 'Beauty Bay', logo: '/placeholder-logo.png', offers: 31 }
    ],
    faq: [
      {
        question: 'What types of products does BuyBeautyKorea offer?',
        answer: 'BuyBeautyKorea specializes in authentic Korean beauty and skincare products, including cleansers, moisturizers, serums, masks, makeup, and K-beauty tools from popular brands.'
      },
      {
        question: 'Are the products sold on BuyBeautyKorea authentic?',
        answer: 'Yes, all products are 100% authentic and sourced directly from official distributors and brands in Korea. BuyBeautyKorea guarantees product authenticity.'
      },
      {
        question: 'How can I track my order after making a purchase?',
        answer: 'After placing your order, you will receive a tracking number via email. You can track your shipment on the BuyBeautyKorea website or the courier service website.'
      },
      {
        question: 'What is your return policy if I am not satisfied with my purchase?',
        answer: 'BuyBeautyKorea offers a 30-day return policy for unopened items. Products must be in original packaging and condition for returns to be accepted.'
      },
      {
        question: 'Do you offer international shipping?',
        answer: 'Yes, BuyBeautyKorea ships worldwide to most countries. Shipping costs and delivery times vary depending on your location and chosen shipping method.'
      }
    ]
  }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { storeAlias } = await params;
  const store = mockStoreData[storeAlias as keyof typeof mockStoreData];
  
  if (!store) {
    return {
      title: 'Store Not Found - CouponMia',
      description: 'The store you are looking for could not be found.'
    };
  }

  return {
    title: `${store.name} Coupons & Promo Codes - Save Up to ${store.coupons[0]?.discount || '50%'} | CouponMia`,
    description: `Get the latest ${store.name} coupon codes and discounts. Save money with ${store.activeOffers} verified promo codes and deals. ${store.description.substring(0, 120)}...`,
    alternates: {
      canonical: `https://couponmia.com/store/${storeAlias}`
    },
    openGraph: {
      title: `${store.name} Coupons & Promo Codes - Save Up to ${store.coupons[0]?.discount || '50%'} | CouponMia`,
      description: `Get the latest ${store.name} coupon codes and discounts. Save money with ${store.activeOffers} verified promo codes and deals.`,
      url: `https://couponmia.com/store/${storeAlias}`,
      type: 'website'
    }
  };
}

export default async function StoreDetailPage({ params }: Props) {
  const { storeAlias } = await params;
  const store = mockStoreData[storeAlias as keyof typeof mockStoreData];

  if (!store) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-brand-lightest">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-text-primary mb-4">Store Not Found</h1>
            <p className="text-text-secondary">The store you are looking for could not be found.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-brand-lightest">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-text-secondary">
            <li><Link href="/" className="hover:text-brand-light transition-colors">Home</Link></li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <Link href="/stores/startwith/a" className="hover:text-brand-light transition-colors">All Stores</Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span className="text-text-primary font-medium">{store.name}</span>
            </li>
          </ol>
        </nav>

        {/* Store Detail Client Component */}
        <StoreDetailClient store={store} />
      </main>
      
      <Footer />
    </div>
  );
}

export async function generateStaticParams() {
  return [
    { storeAlias: 'buybeautykorea' }
  ];
}