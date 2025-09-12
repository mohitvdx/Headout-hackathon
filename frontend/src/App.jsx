import { useState } from 'react'
import PostInput from './components/PostInput'
import Settings from './components/Settings'
import './App.css'

function App() {
  const [posts, setPosts] = useState([])
  const [showSettings, setShowSettings] = useState(false)

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
        console.log('Post classified as:', result.data.type)
        // For now, just log the result - will implement preview later
        alert(`Post detected as: ${result.data.type}`)
      } else {
        console.error('Error:', result.error)
        alert('Error processing post: ' + result.error)
      }
    } catch (error) {
      console.error('Error submitting post:', error)
      alert('Error connecting to server')
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
        <PostInput onSubmit={handlePostSubmit} />
        
        {/* Feed will be implemented later */}
        <div className="mt-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-gray-500 text-center">Your posts will appear here</p>
          </div>
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
