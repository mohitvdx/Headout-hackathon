import { useState } from 'react'
import PostInput from './components/PostInput'
import './App.css'

function App() {
  const [posts, setPosts] = useState([])

  const handlePostSubmit = (postContent) => {
    console.log('Post submitted:', postContent)
    // Placeholder for now - will implement post processing later
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">Professional Network</h1>
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
    </div>
  )
}

export default App
