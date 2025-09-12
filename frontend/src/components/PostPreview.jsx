import { useState, useMemo } from 'react'

const PostPreview = ({ post, onRestart, onPublish }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(post.content)
  const [entities, setEntities] = useState(post.extractedEntities || {})

  const getPostTypeIcon = (type) => {
    switch (type) {
      case 'event':
        return '📅'
      case 'lost_found':
        return '🔍'
      case 'announcement':
        return '📢'
      default:
        return '📝'
    }
  }

  const getPostTypeColor = (type) => {
    switch (type) {
      case 'event':
        return 'bg-emerald-100 text-emerald-800'
      case 'lost_found':
        return 'bg-amber-100 text-amber-800'
      case 'announcement':
        return 'bg-indigo-100 text-indigo-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  const fieldsForType = useMemo(() => {
    switch (post.type) {
      case 'event':
        return [
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'location', label: 'Location', type: 'text' },
          { key: 'date', label: 'Date', type: 'datetime-local' },
        ]
      case 'lost_found':
        return [
          { key: 'itemStatus', label: 'Status', type: 'select', options: ['lost', 'found'] },
          { key: 'itemName', label: 'Item name', type: 'text' },
          { key: 'location', label: 'Location', type: 'text' },
        ]
      case 'announcement':
        return [
          { key: 'department', label: 'Department', type: 'text' },
          { key: 'deadline', label: 'Deadline', type: 'datetime-local' },
          { key: 'priority', label: 'Priority', type: 'select', options: ['high', 'medium', 'low'] },
        ]
      default:
        return []
    }
  }, [post.type])

  const handleEntityChange = (key, value) => {
    setEntities((prev) => ({ ...prev, [key]: value }))
  }

  const handleSaveEdit = () => {
    setIsEditing(false)
    // Update the post content
    post.content = editedContent
  }

  const handlePublish = () => {
    onPublish({
      ...post,
      content: editedContent,
      extractedEntities: entities,
    })
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01] p-6">
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
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
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

      {/* Structured Entities Editor */}
      <div className="mb-6 border-t border-slate-200 pt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-slate-800">Details</h3>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPostTypeColor(post.type)}`}>
            {getPostTypeIcon(post.type)}
            <span className="ml-1 capitalize">{post.type.replace('_', ' ')}</span>
          </span>
        </div>
        {fieldsForType.length > 0 ? (
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3">
            {fieldsForType.map((field) => (
              <div key={field.key} className="grid grid-cols-4 items-center gap-3">
                <label className="col-span-1 text-sm font-medium text-slate-600">
                  {field.label}
                </label>
                <div className="col-span-3">
                  {field.type === 'select' ? (
                    <select
                      value={entities[field.key] ?? ''}
                      onChange={(e) => handleEntityChange(field.key, e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select</option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={entities[field.key] ?? ''}
                      onChange={(e) => handleEntityChange(field.key, e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No additional details for this post type.</p>
        )}
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
