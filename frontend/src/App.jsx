import { useState, useEffect } from 'react'
import PostInput from './components/PostInput'
import PostPreview from './components/PostPreview'
import PostCard from './components/PostCard'
import ErrorBoundary from './components/ErrorBoundary'
import Toast from './components/Toast'
import LoadingSpinner from './components/LoadingSpinner'
import { useToast } from './hooks/useToast'
import { api, ApiError } from './utils/api'
import Settings from './components/Settings'
import { ensureSession, getSession } from './utils/session'
import './App.css'

function App() {
  const [posts, setPosts] = useState([])
  const [currentPost, setCurrentPost] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const { toasts, showSuccess, showError, hideToast } = useToast()

  // Load posts on component mount
  useEffect(() => {
    ensureSession()
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      const result = await api.getPosts()
      setPosts(result.data)
    } catch (error) {
      console.error('Error loading posts:', error)
      if (error instanceof ApiError) {
        showError(`Failed to load posts: ${error.message}`)
      } else {
        showError('Failed to connect to server')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (content) => {
    try {
      setLoading(true)

      // First detect the post type
      const typeResponse = await api.detectPostType(content)

      setCurrentPost({
        content: content,
        type: typeResponse.data.type,
        extractedEntities: typeResponse.data.extractedEntities,
        timestamp: typeResponse.data.timestamp
      })
      setShowPreview(true)
      showSuccess(`Post classified as: ${typeResponse.data.type}`)
    } catch (error) {
      console.error('Error submitting post:', error)
      if (error instanceof ApiError) {
        showError(`Error processing post: ${error.message}`)
      } else {
        showError('Error connecting to server')
      }
    }
  }

  const handleRestart = () => {
    setCurrentPost(null)
    setShowPreview(false)
  }

  const handlePublish = async (post) => {
    try {
      const session = getSession()
      const result = await api.createPost({
        content: post.content,
        type: post.type,
        author: session?.displayName || 'You',
        extractedEntities: post.extractedEntities
      })

      setPosts(prevPosts => [result.data, ...prevPosts])
      setCurrentPost(null)
      setShowPreview(false)
      showSuccess('Post published successfully!')
    } catch (error) {
      console.error('Error saving post:', error)
      if (error instanceof ApiError) {
        showError(`Error saving post: ${error.message}`)
      } else {
        showError('Error connecting to server')
      }
    }
  }

  const handleRSVP = async (postId, status) => {
    try {
      const result = await api.updateRSVP(postId, status)

      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId ? result.data : post
        )
      )
      showSuccess(`RSVP updated to: ${status}`)
    } catch (error) {
      console.error('Error updating RSVP:', error)
      if (error instanceof ApiError) {
        showError(`Error updating RSVP: ${error.message}`)
      } else {
        showError('Error connecting to server')
      }
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="max-w-2xl mx-auto py-8 px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Campus Feed
              </h1>
              <p className="text-slate-600 text-sm mt-1">Textbox → AI Preview → Confirmation → Feed</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSettings(true)}
                className="inline-flex items-center space-x-2 px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
              >
                <span className="text-sm font-medium">Settings</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          {!showPreview ? (
            <PostInput onSubmit={handleSubmit} />
          ) : (
            <PostPreview
              post={currentPost}
              onRestart={handleRestart}
              onPublish={handlePublish}
            />
          )}

          {/* Posts Feed */}
          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded-lg shadow-md p-6">
                <LoadingSpinner text="Loading posts..." />
              </div>
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <PostCard
                  key={post._id || post.id}
                  post={{ ...post, id: post._id || post.id }}
                  onRSVP={handleRSVP}
                />
              ))
            ) : !showPreview && (
              <div className="bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded-lg shadow-md p-6">
                <p className="text-slate-600 text-center">Your posts will appear here</p>
              </div>
            )}
          </div>

          {/* Settings Modal */}
          <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />

          {/* Toast Notifications */}
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => hideToast(toast.id)}
            />
          ))}
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default App
