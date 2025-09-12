import { useState, useEffect } from 'react'
import PostInput from './components/PostInput'
import PostPreview from './components/PostPreview'
import PostCard from './components/PostCard'
import Settings from './components/Settings'
import './App.css'

function App() {
  const [posts, setPosts] = useState([])
  const [showSettings, setShowSettings] = useState(false)
  const [currentPost, setCurrentPost] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load posts on component mount
  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/posts')
      const result = await response.json()
      
      if (result.success) {
        setPosts(result.data)
      }
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePostSubmit = async (postContent) => {
    try {
      // Get API key from localStorage
      const apiKey = localStorage.getItem('openai_api_key')
      
      if (!apiKey) {
        alert('Please configure your OpenAI API key in settings first')
        setShowSettings(true)
        return
      }

      // Call backend to detect post type
      const response = await fetch('http://localhost:5000/api/posts/detect-type', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content: postContent,
          apiKey: apiKey 
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        setCurrentPost({
          content: postContent,
          type: result.data.type,
          timestamp: result.data.timestamp
        })
        setShowPreview(true)
      } else {
        console.error('Error:', result.error)
        alert('Error processing post: ' + result.error)
      }
    } catch (error) {
      console.error('Error submitting post:', error)
      alert('Error connecting to server')
    }
  }

  const handleRestart = () => {
    setCurrentPost(null)
    setShowPreview(false)
  }

  const handlePublish = async (post) => {
    try {
      // Save post to database
      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: post.content,
          type: post.type,
          author: 'You'
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        // Add to local state
        setPosts(prevPosts => [result.data, ...prevPosts])
        setCurrentPost(null)
        setShowPreview(false)
      } else {
        alert('Error saving post: ' + result.error)
      }
    } catch (error) {
      console.error('Error saving post:', error)
      alert('Error connecting to server')
    }
  }

  const handleRSVP = async (postId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/rsvp`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      const result = await response.json()
      
      if (result.success) {
        // Update local state with new RSVP counts
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post._id === postId ? result.data : post
          )
        )
      }
    } catch (error) {
      console.error('Error updating RSVP:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Professional Network</h1>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            title="Settings"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {!showPreview ? (
          <PostInput onSubmit={handlePostSubmit} />
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-gray-500 text-center">Loading posts...</p>
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <PostCard 
                key={post._id || post.id} 
                post={{...post, id: post._id || post.id}} 
                onRSVP={handleRSVP}
              />
            ))
          ) : !showPreview && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-gray-500 text-center">Your posts will appear here</p>
            </div>
          )}
        </div>
      </main>

      {/* Settings Modal */}
      <Settings 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </div>
  )
}

export default App
