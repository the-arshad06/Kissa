import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiSearch } from 'react-icons/fi'
import MainLayout from '../components/MainLayout'
import StoryCard from '../components/StoryCard'
import Loader from '../components/Loader'
import { searchStories, fetchFeed, fetchCategories } from '../lib/api'

export default function Search() {
  const [params, setParams] = useSearchParams()
  const initialQuery = params.get('q') || ''

  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState('All')
  const [categories, setCategories] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  const runSearch = async (q) => {
    setLoading(true)
    const { data, error } = q.trim() ? await searchStories(q.trim()) : await fetchFeed({ limit: 30 })
    if (error) toast.error('Search failed')
    setResults(data || [])
    setLoading(false)
  }

  useEffect(() => {
    runSearch(initialQuery)
    fetchCategories().then(({ data }) => setCategories(data))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    setParams(query ? { q: query } : {})
    runSearch(query)
  }

  const visible = category === 'All' ? results : results.filter((s) => s.category === category)

  return (
    <MainLayout>
      <h1 className="font-display text-headline md:text-display-mobile font-bold mb-6 animate-fade-in-up">
        Explore the Archive
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex items-center border-2 border-on-surface bg-warm-white px-3 py-2 mb-6 focus-within:shadow-[3px_3px_0_0_#8a4b32] transition-shadow"
      >
        <FiSearch className="text-on-surface-variant" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find stories, places, or authors..."
          className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm flex-1 px-2"
        />
        <button type="submit" className="label-caps text-primary hover:underline">
          Search
        </button>
      </form>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setCategory('All')}
            className={`label-caps px-3 py-2 border-2 border-on-surface transition-colors ${
              category === 'All' ? 'bg-terracotta text-on-primary' : 'bg-warm-white text-on-surface hover:bg-surface-container'
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`label-caps px-3 py-2 border-2 border-on-surface transition-colors ${
                category === c ? 'bg-terracotta text-on-primary' : 'bg-warm-white text-on-surface hover:bg-surface-container'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <Loader />
      ) : visible.length === 0 ? (
        <p className="text-on-surface-variant text-center py-16">No stories match your search.</p>
      ) : (
        <>
          <p className="text-sm text-on-surface-variant mb-4">Showing {visible.length} results</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {visible.map((s, i) => (
              <div key={s.id} className="animate-fade-in-up" style={{ animationDelay: `${(i % 12) * 50}ms` }}>
                <StoryCard story={s} />
              </div>
            ))}
          </div>
        </>
      )}
    </MainLayout>
  )
}
