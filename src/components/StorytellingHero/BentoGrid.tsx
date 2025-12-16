'use client'

import { stories } from './data/stories'
import BentoStoryCard from './BentoStoryCard'

export default function BentoGrid() {
    return (
        <section id="stories-anchor" className="bg-gradient-to-b from-white to-slate-50 py-24 px-4 sm:px-6 md:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[400px]">
                    {stories.map((story, index) => {
                        // Layout Logic:
                        // First item: Span 2 cols, 1 row (Landscape Feature)
                        // Second item: Span 1 col, 2 rows (Tall Feature)
                        // Others: Standard 1x1

                        let gridClass = ''
                        if (index === 0) gridClass = 'md:col-span-2'
                        else if (index === 1) gridClass = 'md:row-span-2'
                        else if (index === 4) gridClass = 'md:col-span-2' // Variation

                        return (
                            <BentoStoryCard
                                key={index}
                                index={index}
                                story={story}
                                className={gridClass}
                            />
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
