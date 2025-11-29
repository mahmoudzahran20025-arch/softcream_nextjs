'use client'

import ProductsHero from './ProductsHero'
import ProductShowcaseGrid from './ProductShowcaseGrid'
import BrandValuesGrid from './BrandValuesGrid'
import NutritionShowcase from './NutritionShowcase'
import BYOShowcase from './BYOShowcase'

export default function ProductsPageContent() {
    return (
        <div className="bg-warm-50 dark:bg-slate-950">
            {/* Hero Section */}
            <ProductsHero />

            {/* Story Cards Section - Visionary Bento Grid */}
            <ProductShowcaseGrid />

            {/* Brand Values Grid */}
            <BrandValuesGrid />

            {/* Nutrition Showcase */}
            <NutritionShowcase />

            {/* BYO Showcase */}
            <BYOShowcase />
        </div>
    )
}
