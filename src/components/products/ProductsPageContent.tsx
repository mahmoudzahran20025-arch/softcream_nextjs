'use client'

import ProductsHero from './ProductsHero'
import ProductStoryCard from './ProductStoryCard'
import BrandValuesGrid from './BrandValuesGrid'
import NutritionShowcase from './NutritionShowcase'
import BYOShowcase from './BYOShowcase'
import { storyCards } from './data/productsContent'

export default function ProductsPageContent() {
    return (
        <div className="bg-white dark:bg-slate-950">
            {/* Hero Section */}
            <ProductsHero />

            {/* Story Cards Section - Stacked */}
            <section className="bg-black">
                {storyCards.map((story, index) => (
                    <ProductStoryCard
                        key={story.id}
                        index={index}
                        story={story}
                        totalCards={storyCards.length}
                    />
                ))}
            </section>

            {/* Brand Values Grid */}
            <BrandValuesGrid />

            {/* Nutrition Showcase */}
            <NutritionShowcase />

            {/* BYO Showcase */}
            <BYOShowcase />
        </div>
    )
}
