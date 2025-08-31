import HeaderClient from './HeaderClient';
import { getCategories } from '@/lib/api';

export default async function Header() {
  const categories = await getCategories();
  
  return <HeaderClient categories={categories} />;
}