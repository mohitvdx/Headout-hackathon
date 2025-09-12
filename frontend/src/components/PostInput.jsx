import { useState } from 'react'

const PostInput = ({ onSubmit }) => {
  const [content, setContent] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPromptInput, setShowPromptInput] = useState(false)
  const [prompt, setPrompt] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (content.trim()) {
      onSubmit(content.trim())
      setContent('')
      setIsExpanded(false)
    }
  }

  const handleFocus = () => {
    setIsExpanded(true)
  }

  const handleGeneratePost = async () => {
    const apiKey = localStorage.getItem('openai_api_key')
    
    if (!apiKey) {
      alert('Please configure your OpenAI API key in settings first')
      return
    }

    if (!prompt.trim()) {
      setShowPromptInput(true)
      return
    }

    setIsGenerating(true)
    
    try {
      const response = await fetch('http://localhost:5000/api/posts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: prompt.trim(),
          apiKey: apiKey 
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        setContent(result.data.generatedContent)
        setPrompt('')
        setShowPromptInput(false)
      } else {
        alert('Error generating post: ' + result.error)
      }
    } catch (error) {
      console.error('Error generating post:', error)
      alert('Error connecting to server')
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePromptSubmit = (e) => {
    e.preventDefault()
    handleGeneratePost()
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start space-x-3">
          {/* Profile Avatar Placeholder */}
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-gray-600 font-medium text-lg">U</span>
          </div>
          
          {/* Input Area */}
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={handleFocus}
              placeholder="What would you like to share?"
              className={`w-full border border-gray-300 rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                isExpanded ? 'min-h-[120px]' : 'min-h-[50px]'
              }`}
              rows={isExpanded ? 4 : 1}
            />
            
            {/* Action Buttons - Only show when expanded */}
            {isExpanded && (
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Media buttons placeholder */}
                  <button
                    type="button"
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">Photo</span>
                  </button>
                  
                  <button
                    type="button"
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">Video</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleGeneratePost}
                    disabled={isGenerating}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 disabled:text-blue-400 transition-colors"
                  >
                    <span className="text-lg">✨</span>
                    <span className="text-sm font-medium">
                      {isGenerating ? 'Generating...' : 'Generate Post'}
                    </span>
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setContent('')
                      setIsExpanded(false)
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!content.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Post
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* AI Prompt Modal */}
      {showPromptInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Generate Post with AI</h3>
              <button
                onClick={() => {
                  setShowPromptInput(false)
                  setPrompt('')
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handlePromptSubmit}>
              <div className="mb-4">
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                  What would you like to post about?
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., 'My recent promotion to Senior Developer' or 'Tips for remote work productivity'"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  autoFocus
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPromptInput(false)
                    setPrompt('')
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!prompt.trim() || isGenerating}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isGenerating ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PostInput
