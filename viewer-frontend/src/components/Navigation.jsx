import { useState } from 'react'
import { useCategories } from '../hooks/useEvents'

export default function Navigation({ onCategoryChange }) {
  const [activeCategory, setActiveCategory] = useState('ALL')
  const { categories } = useCategories()

  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId)
    onCategoryChange(categoryId)
  }

  return (
    <nav className="bg-white px-5 py-6">
      <div className="mx-auto flex max-w-[1100px] flex-wrap justify-center gap-x-6 gap-y-3 sm:gap-x-9">
        <button
          onClick={() => handleCategoryClick('ALL')}
          className={`whitespace-nowrap border-b pb-1 pt-0.5 font-sans text-[0.72rem] font-medium uppercase tracking-[0.16em] transition-colors sm:text-[0.78rem] ${
            activeCategory === 'ALL'
              ? 'border-ink text-ink'
              : 'border-transparent text-muted hover:border-gold hover:text-gold'
          }`}
        >
          ALL
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`whitespace-nowrap border-b pb-1 pt-0.5 font-sans text-[0.72rem] font-medium uppercase tracking-[0.16em] transition-colors sm:text-[0.78rem] ${
              activeCategory === category.id
                ? 'border-ink text-ink'
                : 'border-transparent text-muted hover:border-gold hover:text-gold'
            }`}
          >
            {category.name?.toUpperCase()}
          </button>
        ))}
      </div>
    </nav>
  )
}
