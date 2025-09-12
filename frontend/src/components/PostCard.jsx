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
    <div className="bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01] p-6">
      <div className="flex items-start space-x-3">
        {/* Profile Avatar */}
        <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-slate-600 font-medium">U</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-medium text-slate-900">You</span>
            <span className="text-slate-600 text-sm">
              {new Date(post.timestamp).toLocaleString()}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <span className="mr-1">{getPostTypeIcon(post.type)}</span>
              {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
            </span>
          </div>
          <p className="text-slate-900 whitespace-pre-wrap mb-4">{post.content}</p>

          {/* Lost & Found Details */}
          {post.type === 'lost_found' && post.metadata?.lostFoundDetails && (
            <div className="border-t border-slate-200 pt-4 mt-4">
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  post.metadata.lostFoundDetails.itemStatus === 'lost' 
                    ? 'bg-rose-100 text-rose-800' 
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {post.metadata.lostFoundDetails.itemStatus?.toUpperCase()}
                </span>
                <div>
                  <p className="font-medium text-slate-800">{post.metadata.lostFoundDetails.itemName}</p>
                  {post.metadata.lostFoundDetails.location && (
                    <p className="text-sm text-slate-500">Last seen: {post.metadata.lostFoundDetails.location}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Announcement Details */}
          {post.type === 'announcement' && post.metadata?.announcementDetails && (
            <div className="border-t border-slate-200 pt-4 mt-4 bg-slate-50/80 rounded-lg p-3">
              <p className="text-sm font-semibold text-slate-700">
                From: <span className="font-medium text-indigo-700">{post.metadata.announcementDetails.department}</span>
              </p>
            </div>
          )}
          
          {/* RSVP Section for Event Posts */}
          {post.type === 'event' && (
            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-700">Will you attend?</span>
                <div className="flex items-center space-x-4 text-xs text-slate-500">
                  <span>{rsvpCounts.going} going</span>
                  <span>{rsvpCounts.maybe} maybe</span>
                  <span>{rsvpCounts.notGoing} not going</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleRSVP('going')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    rsvpStatus === 'going'
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  }`}
                >
                  ✓ Going
                </button>
                <button
                  onClick={() => handleRSVP('maybe')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    rsvpStatus === 'maybe'
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  }`}
                >
                  ? Maybe
                </button>
                <button
                  onClick={() => handleRSVP('notGoing')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    rsvpStatus === 'notGoing'
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                  }`}
                >
                  ✗ Not Going
                </button>
              </div>
            </div>
          )}

          {/* Engagement Actions */}
          <div className="border-t border-slate-200 pt-3 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button className="flex items-center space-x-1 text-slate-600 hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="text-sm font-medium">Like</span>
                </button>
                <button className="flex items-center space-x-1 text-slate-600 hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-sm font-medium">Comment</span>
                </button>
                <button className="flex items-center space-x-1 text-slate-600 hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  <span className="text-sm font-medium">Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostCard
