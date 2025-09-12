import { useState } from 'react'

const PostPreview = ({ post, onRestart, onPublish }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(post.content)

  const getPostTypeIcon = (type) => {
    switch (type) {
      case 'event':
        return '📅'
      case 'poll':
        return '📊'
      case 'announcement':
        return '📢'
      case 'job':
        return '💼'
      case 'achievement':
        return '🏆'
      default:
        return '📝'
    }
  }

  const getPostTypeColor = (type) => {
    switch (type) {
      case 'event':
        return 'bg-green-100 text-green-800'
      case 'poll':
        return 'bg-purple-100 text-purple-800'
      case 'announcement':
        return 'bg-blue-100 text-blue-800'
      case 'job':
        return 'bg-orange-100 text-orange-800'
      case 'achievement':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleSaveEdit = () => {
    setIsEditing(false)
    // Update the post content
    post.content = editedContent
  }

  const handlePublish = () => {
    onPublish({
      ...post,
      content: editedContent
    })
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01] p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Does everything look good?</h2>
        <p className="text-slate-600 text-sm">Review your post before publishing</p>
        
      </div>

      {/* Post Content */}
      <div className="mb-6">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-slate-600 font-medium">U</span>
          </div>
          <div className="flex-1">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              {isEditing ? (
                <div>
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={6}
                  />
                  <div className="flex justify-end space-x-2 mt-3">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1 text-slate-600 hover:text-slate-800 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-md"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-slate-900 whitespace-pre-wrap">{editedContent}</p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-blue-600 hover:text-blue-700 text-sm mt-2 transition-colors font-medium"
                  >
                    Edit content
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onRestart}
          className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors font-medium"
        >
          Nah! Restart flow
        </button>
        <button
          onClick={handlePublish}
          disabled={isEditing}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg"
        >
          Looks good! Post it
        </button>
      </div>
    </div>
  )
}

export default PostPreview
