// client/src/pages/StoryDetail.jsx
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'

export default function StoryDetail() {
  const { id } = useParams()
  const [story, setStory]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/stories/${id}`)
      .then(res => setStory(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-6 bg-gray-100 rounded animate-pulse"/>)}
    </div>
  )

  if (!story) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-400">
      Story not found. <Link to="/stories" className="text-indigo-600">Go back</Link>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      <Link to="/stories" className="text-sm text-gray-400 hover:text-gray-600 mb-6 inline-block">
        ← Back to stories
      </Link>

      <h1 className="text-3xl font-semibold text-gray-900 mb-3">{story.title}</h1>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-medium text-indigo-600">
          {story.author?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">{story.author?.name}</p>
          <p className="text-xs text-gray-400">
            {new Date(story.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Story sections */}
      <Section label="Background" content={story.background} />
      <Section label="The decision" content={story.decision} />
      <Section label="The outcome" content={story.outcome} />
      {story.regrets && <Section label="Regrets / advice" content={story.regrets} />}

      {/* Tags */}
      {story.tags?.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-8">
          {story.tags.map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function Section({ label, content }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-2">
        {label}
      </p>
      <p className="text-gray-700 leading-relaxed">{content}</p>
    </div>
  )
}