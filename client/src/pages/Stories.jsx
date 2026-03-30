// client/src/pages/Stories.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const SEGMENTS = [
  { value: 'all',        label: 'All' },
  { value: '10th',       label: '10th Done' },
  { value: 'inter_mpc',  label: 'Inter MPC' },
  { value: 'inter_bipc', label: 'Inter BiPC' },
  { value: 'degree',     label: 'Degree' },
  { value: 'dropout',    label: 'Dropped Out' },
  { value: 'working',    label: 'Working' },
]

export default function Stories() {
  const { user } = useAuth()
  const [stories, setStories]   = useState([])
  const [segment, setSegment]   = useState('all')
  const [loading, setLoading]   = useState(true)
  const [page, setPage]         = useState(1)
  const [pagination, setPagination] = useState({})

  useEffect(() => {
    fetchStories()
  }, [segment, page])

  const fetchStories = async () => {
    setLoading(true)
    try {
      const params = { page }
      if (segment !== 'all') params.segment = segment
      const res = await api.get('/stories/feed', { params })
      setStories(res.data.stories)
      setPagination(res.data.pagination)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSegmentChange = (val) => {
    setSegment(val)
    setPage(1)  // reset to page 1 on filter change
  }

  const handleUpvote = async (storyId) => {
    if (!user) return
    try {
      const res = await api.patch(`/stories/${storyId}/upvote`)
      setStories(prev => prev.map(s =>
        s._id === storyId ? { ...s, upvotes: res.data.upvotes } : s
      ))
    } catch (err) {
      console.error(err)
    }
  }

  const handleSave = async (storyId) => {
    if (!user) return
    try {
      await api.patch(`/stories/${storyId}/save`)
      // Visual feedback — you can improve this later
      fetchStories()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Real journeys</h1>
        <p className="text-gray-500 mt-1">
          Stories from people who figured it out — filtered for your stage
        </p>
      </div>

      {/* Segment filter */}
      <div className="flex gap-2 flex-wrap mb-8">
        {SEGMENTS.map(s => (
          <button
            key={s.value}
            onClick={() => handleSegmentChange(s.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition
              ${segment === s.value
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Stories list */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-gray-100 rounded-2xl h-40 animate-pulse"/>
          ))}
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          No stories yet for this segment.
          {user && (
            <div className="mt-3">
              <Link to="/submit" className="text-indigo-600 hover:underline text-sm">
                Be the first to share yours →
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {stories.map(story => (
            <StoryCard
              key={story._id}
              story={story}
              user={user}
              onUpvote={handleUpvote}
              onSave={handleSave}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-500">
            {page} / {pagination.pages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

// Separate component — cleaner than putting everything inline
function StoryCard({ story, user, onUpvote, onSave }) {
  const segmentColors = {
    '10th':       'bg-blue-50 text-blue-700',
    'inter_mpc':  'bg-purple-50 text-purple-700',
    'inter_bipc': 'bg-pink-50 text-pink-700',
    'degree':     'bg-green-50 text-green-700',
    'dropout':    'bg-orange-50 text-orange-700',
    'working':    'bg-teal-50 text-teal-700',
  }

  const segmentLabels = {
    '10th':       '10th Done',
    'inter_mpc':  'Inter MPC',
    'inter_bipc': 'Inter BiPC',
    'degree':     'Degree',
    'dropout':    'Dropped Out',
    'working':    'Working',
  }

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date)
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 30) return `${days} days ago`
    return new Date(date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition">

      {/* Top row — segment tag + time */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${segmentColors[story.segment]}`}>
          {segmentLabels[story.segment]}
        </span>
        <span className="text-xs text-gray-400">{timeAgo(story.createdAt)}</span>
      </div>

      {/* Title */}
      <Link to={`/stories/${story._id}`}>
        <h2 className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition mb-2">
          {story.title}
        </h2>
      </Link>

      {/* Background preview */}
      <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">
        {story.background}
      </p>

      {/* Tags */}
      {story.tags?.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mb-4">
          {story.tags.map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Bottom row — author + actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-600">
            {story.author?.name?.[0]?.toUpperCase()}
          </div>
          <span className="text-sm text-gray-600">{story.author?.name}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Upvote */}
          <button
            onClick={() => onUpvote(story._id)}
            disabled={!user}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition disabled:opacity-40"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M5 15l7-7 7 7" />
            </svg>
            {story.upvotes}
          </button>

          {/* Save */}
          <button
            onClick={() => onSave(story._id)}
            disabled={!user}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition disabled:opacity-40"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            {story.saves}
          </button>

          {/* Read more */}
          <Link
            to={`/stories/${story._id}`}
            className="text-sm text-indigo-600 hover:underline font-medium"
          >
            Read →
          </Link>
        </div>
      </div>
    </div>
  )
}