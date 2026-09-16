import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import MainLayout from '../components/MainLayout'
import ImageCropperModal from '../components/ImageCropperModal'
import Avatar from '../components/Avatar'
import { useAuth } from '../context/AuthContext'
import { updateProfile, uploadAvatar } from '../lib/api'
import { fileToDataUrl } from '../lib/imageUtils'

export default function EditProfile() {
  const { profile, user, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url || null)
  const [avatarRemoved, setAvatarRemoved] = useState(false)
  const [cropFile, setCropFile] = useState(null)
  const [busy, setBusy] = useState(false)

  if (!profile) return null

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCropFile(file)
    e.target.value = '' // allow re-selecting the same file later
  }

  const handleCropped = async (blob) => {
    const croppedFile = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
    setAvatarFile(croppedFile)
    // Data URL instead of a blob: object URL — some browser setups block
    // blob: as an <img src>, which showed up as a broken/blank preview.
    const dataUrl = await fileToDataUrl(blob)
    setAvatarPreview(dataUrl)
    setAvatarRemoved(false)
    setCropFile(null)
  }

  const handleRemovePhoto = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
    setAvatarRemoved(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)

    let avatar_url = profile.avatar_url
    if (avatarFile) {
      const { url, error } = await uploadAvatar(avatarFile, user.id)
      if (error) {
        toast.error('Avatar upload failed: ' + error.message)
        setBusy(false)
        return
      }
      avatar_url = url
    } else if (avatarRemoved) {
      avatar_url = null
    }

    const { data, error } = await updateProfile(user.id, {
      full_name: fullName.trim(),
      bio: bio.trim(),
      avatar_url,
    })

    setBusy(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Profile updated')
      refreshProfile(data)
      navigate(`/profile/${profile.username}`)
    }
  }

  return (
    <MainLayout>
      {cropFile && (
        <ImageCropperModal file={cropFile} onCancel={() => setCropFile(null)} onCropped={handleCropped} />
      )}

      <div className="max-w-xl mx-auto">
        <h1 className="font-display text-headline font-bold mb-8">Edit Profile</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Avatar src={avatarPreview} size="lg" />
            <div className="flex flex-col gap-2">
              <label className="btn-secondary label-caps px-4 py-2 paper-shadow-sm paper-interactive cursor-pointer text-center">
                Change Photo
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
              </label>
              {avatarPreview && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="label-caps text-error hover:underline text-left"
                >
                  Remove Photo
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="label-caps block mb-2">Full Name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field w-full px-3 py-3 text-sm"
            />
          </div>

          <div>
            <label className="label-caps block mb-2">Username</label>
            <input value={profile.username} disabled className="input-field w-full px-3 py-3 text-sm opacity-60" />
            <p className="text-xs text-on-surface-variant mt-1">Username can't be changed yet.</p>
          </div>

          <div>
            <label className="label-caps block mb-2">Bio</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A little about you and the histories you care about..."
              className="input-field w-full px-3 py-3 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="btn-primary label-caps px-6 py-3 paper-shadow paper-interactive disabled:opacity-50 self-start"
          >
            {busy ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </MainLayout>
  )
}
