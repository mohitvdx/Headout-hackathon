import { useState } from 'react'

const PostCard = ({ post, onRSVP }) => {
  const [rsvpStatus, setRsvpStatus] = useState(null)
  const [rsvpCounts, setRsvpCounts] = useState({
    going: Math.floor(Math.random() * 20) + 5,
    maybe: Math.floor(Math.random() * 10) + 2,
    notGoing: Math.floor(Math.random() * 5) + 1
  })

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

  const handleRSVP = (status) => {
    // Update counts based on previous and new status
    const newCounts = { ...rsvpCounts }
    
    // Remove from previous status if any
    if (rsvpStatus) {
      newCounts[rsvpStatus] = Math.max(0, newCounts[rsvpStatus] - 1)
    }
    
    // Add to new status
    newCounts[status] = newCounts[status] + 1
    
    setRsvpCounts(newCounts)
    setRsvpStatus(status)
    
    if (onRSVP) {
      onRSVP(post.id, status)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-gray-600 font-medium">U</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-medium text-gray-900">You</span>
            <span className="text-gray-500 text-sm">
              {new Date(post.timestamp).toLocaleString()}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPostTypeColor(post.type)}`}>
              <span className="mr-1">{getPostTypeIcon(post.type)}</span>
              {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
            </span>
          </div>
          <p className="text-gray-900 whitespace-pre-wrap mb-4">{post.content}</p>
          
          {/* RSVP Section for Event Posts */}
          {post.type === 'event' && (
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Will you attend?</span>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>{rsvpCounts.going} going</span>
                  <span>{rsvpCounts.maybe} maybe</span>
                  <span>{rsvpCounts.notGoing} not going</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleRSVP('going')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    rsvpStatus === 'going'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700'
                  }`}
                >
                  ✓ Going
                </button>
                <button
                  onClick={() => handleRSVP('maybe')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    rsvpStatus === 'maybe'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-yellow-100 hover:text-yellow-700'
                  }`}
                >
                  ? Maybe
                </button>
                <button
                  onClick={() => handleRSVP('notGoing')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    rsvpStatus === 'notGoing'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700'
                  }`}
                >
                  ✗ Not going
                </button>
              </div>
            </div>
          )}

          {/* Poll Section for Poll Posts */}
          {post.type === 'poll' && (
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700 mb-2">Cast your vote:</div>
                <button className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Option A</span>
                    <span className="text-xs text-gray-500">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '45%'}}></div>
                  </div>
                </button>
                <button className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Option B</span>
                    <span className="text-xs text-gray-500">55%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '55%'}}></div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Engagement Actions */}
          <div className="flex items-center space-x-6 mt-4 pt-3 border-t border-gray-100">
            <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 6v4m-2 4h2m0 0h2m-2 0v2m0-2v-2" />
              </svg>
              <span className="text-sm">Like</span>
            </button>
            <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm">Comment</span>
            </button>
            <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              <span className="text-sm">Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostCard
