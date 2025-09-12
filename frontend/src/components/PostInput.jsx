import { useState } from 'react'
import { api } from '../utils/api'
import { useToast } from '../hooks/useToast'

const PostInput = ({ onSubmit }) => {
  const [content, setContent] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPromptInput, setShowPromptInput] = useState(false)
  const [prompt, setPrompt] = useState('')
  const { showToast } = useToast()

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
    if (!prompt.trim()) {
      showToast('Please enter a prompt for post generation', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await api.generatePost(prompt);
      
      if (result.success) {
        setContent(result.data.generatedContent)
        setPrompt('')
        setShowPromptInput(false)
        showToast('Post generated successfully!', 'success')
      } else {
        showToast('Error generating post: ' + result.error, 'error')
      }
    } catch (error) {
      console.error('Error generating post:', error)
      showToast('Error connecting to server', 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePromptSubmit = (e) => {
    e.preventDefault()
    handleGeneratePost()
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-amber-200/50 p-6 hover:shadow-xl transition-all duration-300">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start space-x-4">
          {/* Profile Avatar Placeholder */}
          <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-white font-semibold text-lg">U</span>
          </div>
          
          {/* Input Area */}
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={handleFocus}
              placeholder="What would you like to share?"
              className={`w-full border border-amber-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm ${
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
                    className="flex items-center space-x-2 text-amber-600 hover:text-amber-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium">Photo</span>
                  </button>
                  
                  <button
                    type="button"
                    className="flex items-center space-x-2 text-amber-600 hover:text-amber-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium">Video</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowPromptInput(true)}
                    disabled={isGenerating}
                    className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 py-2 rounded-full hover:from-amber-600 hover:to-yellow-600 disabled:from-amber-300 disabled:to-yellow-300 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <span className="text-lg">✨</span>
                    <span className="text-sm font-medium">
                      {isGenerating ? 'Generating...' : 'Generate with AI'}
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
                    className="px-4 py-2 text-amber-600 hover:text-amber-700 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!content.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full hover:from-amber-600 hover:to-yellow-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md hover:shadow-lg"
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
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border border-amber-200/50">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">✨</span>
                </div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">Generate Post with AI</h3>
              </div>
              <button
                onClick={() => {
                  setShowPromptInput(false)
                  setPrompt('')
                }}
                className="text-amber-400 hover:text-amber-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handlePromptSubmit}>
              <div className="mb-4">
                <label htmlFor="prompt" className="block text-sm font-medium text-amber-700 mb-2">
                  What would you like to post about?
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., 'My recent promotion to Senior Developer' or 'Tips for remote work productivity'"
                  className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none bg-white/70 backdrop-blur-sm"
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
                  className="px-4 py-2 text-amber-600 hover:text-amber-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!prompt.trim() || isGenerating}
                  className="px-6 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl hover:from-amber-600 hover:to-yellow-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md hover:shadow-lg"
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
