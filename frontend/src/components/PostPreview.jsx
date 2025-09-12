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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Post Preview</h3>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPostTypeColor(post.type)}`}>
              <span className="mr-1">{getPostTypeIcon(post.type)}</span>
              {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
            </span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Does everything look good? You can edit the content before publishing.
        </p>
      </div>

      {/* Post Content */}
      <div className="mb-6">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-gray-600 font-medium">U</span>
          </div>
          <div className="flex-1">
            <div className="bg-gray-50 rounded-lg p-4">
              {isEditing ? (
                <div>
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={6}
                  />
                  <div className="flex justify-end space-x-2 mt-3">
                    <button
                      onClick={() => {
                        setIsEditing(false)
                        setEditedContent(post.content)
                      }}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-900 whitespace-pre-wrap">{editedContent}</p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
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
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-md"
        >
          Nah! Restart flow
        </button>
        <button
          onClick={handlePublish}
          disabled={isEditing}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Looks good! Post it
        </button>
      </div>
    </div>
  )
}

export default PostPreview
