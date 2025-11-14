import PageContent from '@/components/client/PageContent'

export const metadata = {
  title: 'Home - Soft Cream',
  description: 'اكتشف مجموعة السوفت كريم الغنية بالطاقة الطبيعية',
}

export const revalidate = 60 // ISR: revalidate every 60 seconds

// Mock products for now - will be replaced with API call
const mockProducts = [
  {
    id: '1',
    name: 'سوفت كريم الفراولة',
    price: 25,
    category: 'فواكه',
    description: 'طعم الفراولة الطازجة',
    calories: 150,
    protein: 3,
    carbs: 20,
    sugar: 15,
    fat: 5,
  },
  {
    id: '2',
    name: 'سوفت كريم الشوكولاتة',
    price: 25,
    category: 'شوكولاتة',
    description: 'شوكولاتة بلجيكية غنية',
    calories: 180,
    protein: 4,
    carbs: 22,
    sugar: 18,
    fat: 8,
  },
  {
    id: '3',
    name: 'سوفت كريم الفانيليا',
    price: 20,
    category: 'كلاسيكي',
    description: 'الفانيليا الكلاسيكية',
    calories: 140,
    protein: 2,
    carbs: 18,
    sugar: 14,
    fat: 4,
  },
]

export default function HomePage() {
  return (
    <PageContent initialProducts={mockProducts} />
  )
}
