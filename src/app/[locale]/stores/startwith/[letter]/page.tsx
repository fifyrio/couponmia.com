import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
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
  const t = await getTranslations('storesDirectory');

  return {
    title: t('metaTitle', { letter: letterUpper }),
    description: t('metaDescription', { letter: letterUpper }),
    alternates: {
      canonical: `https://couponmia.com/stores/startwith/${letter.toLowerCase()}`
    }
  };
}

export default async function StoresStartWithPage({ params }: Props) {
  const { letter } = await params;
  const letterLower = letter.toLowerCase();
  const letterUpper = letter.toUpperCase();
  const [stores, t] = await Promise.all([
    getStoresByLetter(letterLower),
    getTranslations('storesDirectory')
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-brand-lightest">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            {t('title', { letter: letterUpper })}
          </h1>
          <p className="text-text-secondary text-lg">
            {t('description', { count: stores.length, letter: letterUpper })}
          </p>
        </div>

        <StoresAlphabetNav currentLetter={letterLower} />
        
        <div className="mt-8">
          <h2 className="text-3xl font-bold text-text-primary mb-6">
            {t('title', { letter: letterUpper })}
          </h2>
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
