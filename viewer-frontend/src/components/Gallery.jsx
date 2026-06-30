import { useState } from 'react'
import PortfolioCard from './PortfolioCard'
import Navigation from './Navigation'
import { useEvents } from '../hooks/useEvents'

export default function Gallery({ searchResults }) {
  const { events, loading, error } = useEvents()
  const [selectedCategory, setSelectedCategory] = useState('ALL')

  // Sort events by date descending (latest first)
  const sortedEvents = [...events].sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate))

  // If a search is active, bypass category filter entirely
  const activeEvents = searchResults !== null
    ? [...searchResults].sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate))
    : (selectedCategory === 'ALL'
        ? sortedEvents
        : sortedEvents.filter(event => event.categoryId === selectedCategory))

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
  }

  if (loading) {
    return (
      <section className="bg-white px-4 pb-20 pt-2 sm:px-8">
        <div className="mx-auto max-w-[1300px]">
          <p className="py-16 text-center font-sans text-muted">Loading events...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="bg-white px-4 pb-20 pt-2 sm:px-8">
        <div className="mx-auto max-w-[1300px]">
          <p className="py-16 text-center font-sans text-muted">Unable to load events. Please try again later.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-white px-4 pb-20 pt-2 sm:px-8">
      <div className="mx-auto max-w-[1300px]">
        {/* Always show category nav */}
        <Navigation onCategoryChange={handleCategoryChange} />

        {/* Show result count when search is active */}
        {searchResults !== null && (
          <div className="pb-4 pt-2 text-center font-sans text-[0.72rem] uppercase tracking-[0.16em] text-muted">
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 sm:gap-x-8 md:grid-cols-3 md:gap-x-10 md:gap-y-16">
          {activeEvents.length > 0 ? (
            activeEvents.map((event) => (
              <PortfolioCard
                key={event.id}
                eventId={event.id}
                image={event.coverImageUrl}
                coupleName={event.title}
                date={new Date(event.eventDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }).toUpperCase()}
                category={event.categoryName || 'EVENT'}
              />
            ))
          ) : (
            <p className="col-span-full py-16 text-center font-sans text-muted">
              {searchResults !== null ? 'No events match your search.' : 'No events found.'}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
