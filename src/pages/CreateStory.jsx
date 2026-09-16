import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiX, FiPlus } from 'react-icons/fi'
import MainLayout from '../components/MainLayout'
import { useAuth } from '../context/AuthContext'
import { createStory, uploadStoryImages } from '../lib/api'
import { fileToDataUrl } from '../lib/imageUtils'

const CATEGORIES = [
  'Oral History',
  'Architecture',
  'Traditions',
  'Personal Memory',
  'Maritime Lore',
  'Labor Archives',
  'Folklore',
]

const MAX_PHOTOS = 6

export default function CreateStory() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [era, setEra] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [content, setContent] = useState('')
  const [photos, setPhotos] = useState([]) // [{ file, preview }]
  const [busy, setBusy] = useState(false)

  const handleAddPhotos = async (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (!files.length) return
    const room = MAX_PHOTOS - photos.length
    if (files.length > room) {
      toast.error(`You can add up to ${MAX_PHOTOS} photos`)
    }
    const chosen = files.slice(0, room)
    const previews = await Promise.all(chosen.map(fileToDataUrl))
    const next = chosen.map((file, i) => ({ file, preview: previews[i] }))
    setPhotos((prev) => [...prev, ...next])
  }

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      toast.error('Title and story are required')
      return
    }
    setBusy(true)

    let image_url = null
    let image_urls = []
    if (photos.length) {
      const { urls, error: uploadError } = await uploadStoryImages(
        photos.map((p) => p.file),
        user.id
      )
      if (uploadError) {
        toast.error('Image upload failed: ' + uploadError.message)
        setBusy(false)
        return
      }
      image_urls = urls
      image_url = urls[0]
    }

    const { data, error } = await createStory({
      user_id: user.id,
      title: title.trim(),
      content: content.trim(),
      location: location.trim() || null,
      era: era.trim() || null,
      category,
      image_url,
      image_urls,
    })

    setBusy(false)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Kissa published!')
      navigate(`/story/${data.id}`)
    }
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-headline md:text-display-mobile font-bold mb-2">New Entry</h1>
        <p className="text-on-surface-variant mb-8">Document a history, memory, or place before it's forgotten.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="label-caps block mb-2">
              Visual Evidence <span className="text-on-surface-variant normal-case">(up to {MAX_PHOTOS} photos)</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {photos.map((p, i) => (
                <div key={p.preview} className="relative h-28 border-2 border-on-surface overflow-hidden">
                  <img src={p.preview} alt="" className="w-full h-full object-cover" />
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 bg-warm-white border border-on-surface px-1.5 py-0.5 text-[9px] label-caps">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-warm-white border-2 border-on-surface flex items-center justify-center hover:bg-error hover:text-on-error transition-colors"
                    aria-label="Remove photo"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <label className="h-28 border-2 border-dashed border-outline bg-warm-white flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-surface-container transition-colors">
                  <FiPlus size={20} className="text-on-surface-variant" />
                  <span className="text-xs text-on-surface-variant">Add Photo</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={handleAddPhotos}
                  />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="label-caps block mb-2">Story Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., The Lost Well of Baoli"
              className="input-field w-full px-3 py-3 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label-caps block mb-2">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Region, or Coordinates"
                className="input-field w-full px-3 py-3 text-sm"
              />
            </div>
            <div>
              <label className="label-caps block mb-2">Era</label>
              <input
                value={era}
                onChange={(e) => setEra(e.target.value)}
                placeholder="e.g., 1940s, British Raj"
                className="input-field w-full px-3 py-3 text-sm"
              />
            </div>
            <div>
              <label className="label-caps block mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field w-full px-3 py-3 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label-caps block mb-2">Your Story</label>
            <textarea
              required
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Document the history, memories, and significance..."
              className="input-field w-full px-3 py-3 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="btn-primary label-caps px-6 py-3 paper-shadow paper-interactive disabled:opacity-50 self-start"
          >
            {busy ? 'Publishing...' : 'Publish Kissa'}
          </button>
        </form>
      </div>
    </MainLayout>
  )
}
