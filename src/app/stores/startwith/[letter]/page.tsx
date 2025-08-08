import { Metadata } from 'next';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import StoresAlphabetNav from '@/components/sections/StoresAlphabetNav';
import StoresList from '@/components/sections/StoresList';
import { getStoresByLetter } from '@/lib/api';

interface Props {
  params: Promise<{ letter: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { letter } = await params;
  const letterUpper = letter.toUpperCase();
  return {
    title: `Stores of '${letterUpper}' - Coupon Codes & Deals | CouponMia`,
    description: `Browse stores starting with ${letterUpper}. Find the latest coupon codes, promo codes and discounts for ${letterUpper} stores at CouponMia.`,
    alternates: {
      canonical: `https://couponmia.com/stores/startwith/${letter.toLowerCase()}`
    }
  };
}

export default async function StoresStartWithPage({ params }: Props) {
  const { letter } = await params;
  const letterLower = letter.toLowerCase();
  const letterUpper = letter.toUpperCase();
  const stores = await getStoresByLetter(letterLower);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-brand-lightest">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            Stores of &apos;{letterUpper}&apos;
          </h1>
          <p className="text-text-secondary text-lg">
            Browse {stores.length} stores starting with letter {letterUpper}
          </p>
        </div>

        <StoresAlphabetNav currentLetter={letterLower} />
        
        <div className="mt-8">
          <h2 className="text-3xl font-bold text-text-primary mb-6">{letterUpper}</h2>
          <StoresList stores={stores} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export async function generateStaticParams() {
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'other'];
  
  return letters.map((letter) => ({
    letter: letter,
  }));
}