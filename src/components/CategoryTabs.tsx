import type { Category, CategoryId } from '../types'

interface CategoryTabsProps {
  categories: Category[]
  activeCategory: CategoryId
  onCategoryChange: (categoryId: CategoryId) => void
}

export function CategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryTabsProps) {
  return (
    <div className="category-tabs" role="tablist" aria-label="Produktkategorien">
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          role="tab"
          aria-selected={activeCategory === category.id}
          className={`category-tab ${activeCategory === category.id ? 'is-active' : ''}`}
          onClick={() => onCategoryChange(category.id)}
        >
          {category.label}
        </button>
      ))}
    </div>
  )
}
