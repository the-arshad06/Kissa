import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import MainLayout from '../components/MainLayout'
import StoryCard from '../components/StoryCard'
import Loader from '../components/Loader'
import MotifOrnament from '../components/MotifOrnament'
import { fetchFeed } from '../lib/api'

const PAGE_SIZE = 9

export default function Home() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const loadPage = async (offset) => {
    const { data, error } = await fetchFeed({ limit: PAGE_SIZE, offset })
    if (error) {
      toast.error('Could not load the archive feed')
      return []
    }
    if (data.length < PAGE_SIZE) setHasMore(false)
    return data
  }

  useEffect(() => {
    setLoading(true)
    loadPage(0).then((data) => {
      setStories(data)
      setLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLoadMore = async () => {
    setLoadingMore(true)
    const data = await loadPage(stories.length)
    setStories((prev) => [...prev, ...data])
    setLoadingMore(false)
  }

  return (
    <MainLayout>
      {/* Hero */}
      <section className="mb-16 border-b-2 border-on-surface pb-12 relative overflow-hidden animate-fade-in-up">
        <MotifOrnament className="motif-corner text-terracotta -right-4 -top-4 hidden md:block" />
        <div className="w-full md:w-2/3 relative">
          <span className="label-caps text-primary-container mb-3 inline-block">
            An Archive of Untold Stories
          </span>
          <h1 className="font-display text-display-mobile md:text-display-lg text-on-surface mb-4 leading-tight">
            Stories that remember.
          </h1>
          <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl">
            Discover the memories, places, traditions, and voices that history books left out —
            a crowd-sourced archive of local history, before it's gone.
          </p>
        </div>
      </section>

      <div className="flex justify-between items-end mb-8">
        <h2 className="font-display text-headline font-bold uppercase tracking-widest text-primary-container">
          Latest Records
        </h2>
      </div>

      {loading ? (
        <Loader />
      ) : stories.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-outline-variant">
          <p className="text-on-surface-variant">No stories yet — check back soon as the archive grows.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {stories.map((s, i) => (
              <div key={s.id} className="animate-fade-in-up" style={{ animationDelay: `${(i % PAGE_SIZE) * 60}ms` }}>
                <StoryCard story={s} />
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-12">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="btn-secondary label-caps px-8 py-4 paper-shadow paper-interactive disabled:opacity-50"
              >
                {loadingMore ? 'Loading...' : 'Load More Archives'}
              </button>
            </div>
          )}
        </>
      )}
    </MainLayout>
  )
}
