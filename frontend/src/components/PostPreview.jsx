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
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-amber-200/50 p-6 hover:shadow-xl transition-all duration-300">
      <div className="mb-4">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent mb-2">Does everything look good?</h2>
        <p className="text-amber-700/70 text-sm">Review your post before publishing</p>
        
      </div>

      {/* Post Content */}
      <div className="mb-6">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-white font-semibold">U</span>
          </div>
          <div className="flex-1">
            <div className="bg-amber-50/50 backdrop-blur-sm rounded-xl p-4 border border-amber-200/30">
              {isEditing ? (
                <div>
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full border border-amber-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none bg-white/70 backdrop-blur-sm"
                    rows={6}
                  />
                  <div className="flex justify-end space-x-2 mt-3">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1 text-amber-600 hover:text-amber-700 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-4 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 text-sm font-medium shadow-md"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-amber-900 whitespace-pre-wrap">{editedContent}</p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-amber-600 hover:text-amber-700 text-sm mt-2 transition-colors font-medium"
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
          className="px-4 py-2 text-amber-600 hover:text-amber-700 transition-colors font-medium"
        >
          Nah! Restart flow
        </button>
        <button
          onClick={handlePublish}
          disabled={isEditing}
          className="px-6 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
        >
          Looks good! Post it
        </button>
      </div>
    </div>
  )
}

export default PostPreview
