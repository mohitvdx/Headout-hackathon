import { useState } from 'react'
import { api } from '../utils/api'
import { useToast } from '../hooks/useToast'

const PostInput = ({ onSubmit }) => {
  const [content, setContent] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateHint, setGenerateHint] = useState('')
  const [showPromptInput, setShowPromptInput] = useState(false)
  const [prompt, setPrompt] = useState('')
  const { showToast } = useToast()
  const [file, setFile] = useState(null)
  const [fileUrl, setFileUrl] = useState('')
  const [fileType, setFileType] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (content.trim()) {
      const payload = fileUrl ? { content: content.trim(), attachment: { url: fileUrl, type: fileType, name: file?.name || '' } } : content.trim()
      onSubmit(payload)
      setContent('')
      setIsExpanded(false)
      if (fileUrl) URL.revokeObjectURL(fileUrl)
      setFile(null)
      setFileUrl('')
      setFileType('')
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
    setGenerateHint('')
    const slowTimer = setTimeout(() => {
      setGenerateHint('This is taking longer than usual…')
    }, 3500)
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
      if (error.name === 'AbortError') {
        showToast('Generation timed out. Please try again.', 'error')
      } else {
        showToast('Error connecting to server', 'error')
      }
    } finally {
      clearTimeout(slowTimer)
      setIsGenerating(false)
    }
  }

  const handlePromptSubmit = (e) => {
    e.preventDefault()
    handleGeneratePost()
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01] p-6">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start space-x-4">
          {/* Profile Avatar Placeholder */}
          <div className="w-12 h-12 bg-slate-300 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-slate-600 font-medium text-lg">U</span>
          </div>
          
          {/* Input Area */}
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={handleFocus}
              placeholder="What would you like to share?"
              className={`w-full border border-slate-200 rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                isExpanded ? 'min-h-[120px]' : 'min-h-[50px]'
              }`}
              rows={isExpanded ? 4 : 1}
            />

            {/* Attachment preview */}
            {fileUrl && (
              <div className="mt-3 flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-2">
                <div className="flex items-center space-x-3">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">{fileType.toUpperCase()}</span>
                  <span className="text-sm text-slate-700 truncate max-w-[220px]">{file?.name || (fileType==='pdf' ? 'Attachment.pdf' : 'Attachment')}</span>
                </div>
                <button type="button" onClick={()=>{ if(fileUrl) URL.revokeObjectURL(fileUrl); setFile(null); setFileUrl(''); setFileType('') }} className="text-slate-500 hover:text-slate-700 text-sm">Remove</button>
              </div>
            )}
            
            {/* Action Buttons - Only show when expanded */}
            {isExpanded && (
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Media: image/pdf */}
                  <label htmlFor="post-file-input" className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors cursor-pointer">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium">Image/PDF</span>
                  </label>
                  <input
                    id="post-file-input"
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e)=>{
                      const f = e.target.files && e.targetfiles ? e.target.files[0] : e.target.files && e.target.files[0]
                      const picked = e.target.files && e.target.files[0]
                      const fileObj = picked || null
                      if (!fileObj) return
                      if (fileUrl) URL.revokeObjectURL(fileUrl)
                      setFile(fileObj)
                      const isPdf = fileObj.type === 'application/pdf' || fileObj.name.toLowerCase().endsWith('.pdf')
                      setFileType(isPdf ? 'pdf' : 'image')
                      const url = URL.createObjectURL(fileObj)
                      setFileUrl(url)
                    }}
                  />
                  
                  <button
                    type="button"
                    onClick={() => setShowPromptInput(true)}
                    disabled={isGenerating}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
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
                      if (fileUrl) URL.revokeObjectURL(fileUrl)
                      setFile(null)
                      setFileUrl('')
                      setFileType('')
                    }}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!content.trim()}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg"
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 w-full max-w-md mx-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">✨</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Generate Post with AI</h3>
              </div>
              <button
                onClick={() => {
                  setShowPromptInput(false)
                  setPrompt('')
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handlePromptSubmit}>
              <div className="mb-4">
                <label htmlFor="prompt" className="block text-sm font-medium text-slate-700 mb-2">
                  What would you like to post about?
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., 'Study Jam at the Library tomorrow 6pm'"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  autoFocus
                />
                {isGenerating && (
                  <div className="mt-3 flex items-center space-x-3 text-sm text-slate-600">
                    <svg className="w-4 h-4 animate-spin text-slate-500" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    <span>{generateHint || 'Generating…'}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPromptInput(false)
                    setPrompt('')
                  }}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!prompt.trim() || isGenerating}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg"
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
