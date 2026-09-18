import { Link } from 'react-router-dom'
import { FiMapPin, FiHeart, FiMessageCircle } from 'react-icons/fi'
import Avatar from './Avatar'
import { timeAgo, fullDate } from '../lib/dateUtils'

export default function StoryCard({ story }) {
  return (
    <Link
      to={`/story/${story.id}`}
      className="bg-warm-white border-2 border-on-surface paper-shadow hover-lift overflow-hidden flex flex-col group"
    >
      <div className="h-64 md:h-80 w-full border-b-2 border-on-surface relative overflow-hidden bg-surface-container-high">
        {story.image_url ? (
          <img
            src={story.image_url}
            alt={story.title}
            className="w-full h-full object-cover filter sepia-[.15] saturate-75 group-hover:saturate-100 transition-all duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-display text-4xl text-on-surface-variant opacity-30">
            KISSA
          </div>
        )}
        {story.location && (
          <div className="absolute top-3 left-3 bg-warm-white border-2 border-on-surface px-3 py-1 flex items-center gap-1 shadow-[2px_2px_0_0_#1b1c19]">
            <FiMapPin size={14} />
            <span className="text-meta uppercase tracking-wider">{story.location}</span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col gap-3">
        {(story.category || story.era) && (
          <span className="text-meta uppercase tracking-widest text-primary-container font-bold">
            {[story.category, story.era].filter(Boolean).join(' // ')}
          </span>
        )}
        <h3 className="font-display text-xl font-bold leading-tight group-hover:underline decoration-2 underline-offset-4">
          {story.title}
        </h3>
        <p className="text-sm text-on-surface-variant line-clamp-3">{story.content}</p>

        <div className="flex items-center justify-between mt-2 pt-3 border-t border-dashed border-outline-variant">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar src={story.avatar_url} size="xs" />
            <span className="text-xs truncate">{story.full_name || story.username}</span>
            <span className="text-xs text-on-surface-variant shrink-0" title={fullDate(story.created_at)}>
              · {timeAgo(story.created_at)}
            </span>
          </div>
          <div className="flex items-center gap-3 text-on-surface-variant">
            <span className="flex items-center gap-1 text-xs">
              <FiHeart size={14} /> {story.like_count ?? 0}
            </span>
            <span className="flex items-center gap-1 text-xs">
              <FiMessageCircle size={14} /> {story.comment_count ?? 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
