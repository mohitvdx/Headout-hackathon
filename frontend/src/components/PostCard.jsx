import { useState, useEffect } from 'react'

const PostCard = ({ post, onRSVP }) => {
  const [rsvpStatus, setRsvpStatus] = useState(null)
  const [rsvpCounts, setRsvpCounts] = useState({
    going: post.metadata?.rsvpCounts?.going ?? 0,
    interested: post.metadata?.rsvpCounts?.interested ?? 0,
    notGoing: post.metadata?.rsvpCounts?.notGoing ?? 0
  })
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes ?? 0)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState(post.comments ?? [])
  const [commentInput, setCommentInput] = useState('')

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

  const formatDateTime = (value) => {
    if (!value) return null;
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) {
        // Not a valid date, return as-is (e.g., "tomorrow")
        return String(value);
      }
      return d.toLocaleString();
    } catch (_e) {
      return String(value);
    }
  }

  const relativeTime = (value) => {
    try {
      const d = new Date(value);
      const now = new Date();
      const diff = Math.max(0, now - d);
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'just now';
      if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
      const days = Math.floor(hours / 24);
      return `${days} day${days === 1 ? '' : 's'} ago`;
    } catch { return ''; }
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

  const handleLike = () => {
    setLiked((prev) => !prev)
    setLikeCount((c) => (liked ? Math.max(0, c - 1) : c + 1))
  }

  const handleAddComment = () => {
    const text = commentInput.trim()
    if (!text) return
    const newComment = {
      author: 'You',
      content: text,
      createdAt: new Date().toISOString(),
    }
    setComments((prev) => [newComment, ...prev])
    setCommentInput('')
  }

  const handleShare = async () => {
    const shareText = `${post.author || 'Someone'} posted: ${post.content.slice(0, 120)}${post.content.length > 120 ? '…' : ''}`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Campus Feed', text: shareText, url: window.location.href })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareText}\n${window.location.href}`)
        alert('Link copied to clipboard!')
      }
    } catch (_e) { }
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01] p-6">
      <div className="flex items-start space-x-3">
        {/* Profile Avatar */}
        <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-slate-600 font-medium">U</span>
        </div>
        <div className="flex-1">
          {/* Header line akin to the sketch */}
          <div className="mb-3">
            <span className="text-xs uppercase tracking-wide text-slate-500">New {post.type === 'lost_found' ? 'Post' : post.type.charAt(0).toUpperCase() + post.type.slice(1)}</span>
            <div className="text-sm text-slate-700">
              <span className="font-semibold text-slate-900">{post.author || 'You'}</span> shared a {post.type.replace('_', ' ')} {relativeTime(post.createdAt || post.timestamp)}
            </div>
          </div>

          {/* Body */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-3">
              <p className="text-slate-900 whitespace-pre-wrap mb-2 leading-7">{post.content}</p>
              {/* Lost & Found Details */}
              {post.type === 'lost_found' && post.metadata?.lostFoundDetails && (
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${post.metadata.lostFoundDetails.itemStatus === 'lost' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {post.metadata.lostFoundDetails.itemStatus?.toUpperCase()}
                      </span>
                      <div>
                        <p className="font-medium text-slate-800">{post.metadata.lostFoundDetails.itemName}</p>
                        {post.metadata.lostFoundDetails.location && (
                          <p className="text-xs text-slate-500">Last seen: {post.metadata.lostFoundDetails.location}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  {post.metadata.lostFoundDetails.imageUrl && (
                    <div className="mt-3">
                      <img src={post.metadata.lostFoundDetails.imageUrl} alt={post.metadata.lostFoundDetails.itemName || 'Lost & Found item'} className="rounded-md border border-slate-200 max-h-56 object-cover w-full" />
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              {/* Announcement Details */}
              {post.type === 'announcement' && post.metadata?.announcementDetails && (
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                  <p className="text-sm font-semibold text-slate-700">
                    From: <span className="font-medium text-indigo-700">{post.metadata.announcementDetails.department}</span>
                  </p>
                  {post.metadata.announcementDetails.attachmentUrl && (
                    <div className="mt-3">
                      {post.metadata.announcementDetails.attachmentType === 'pdf' ? (
                        <a href={post.metadata.announcementDetails.attachmentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-md hover:bg-indigo-100 border border-indigo-100">📄 View attachment (PDF)</a>
                      ) : (
                        <img src={post.metadata.announcementDetails.attachmentUrl} alt="Announcement attachment" className="rounded-md border border-slate-200 max-h-56 object-cover w-full" />
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Event Details */}
              {post.type === 'event' && post.metadata?.eventDetails && (
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                  {post.metadata.eventDetails.title && (
                    <p className="font-semibold text-slate-900">{post.metadata.eventDetails.title}</p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-1 text-sm">
                    {post.metadata.eventDetails.location && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">📍 {post.metadata.eventDetails.location}</span>
                    )}
                    {post.metadata.eventDetails.date && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">🗓️ {formatDateTime(post.metadata.eventDetails.date)}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lost & Found Details */}
          {post.type === 'lost_found' && post.metadata?.lostFoundDetails && (
            <div className="border-t border-slate-200 pt-4 mt-4">
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${post.metadata.lostFoundDetails.itemStatus === 'lost'
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
              {post.metadata.lostFoundDetails.imageUrl && (
                <div className="mt-3">
                  <img
                    src={post.metadata.lostFoundDetails.imageUrl}
                    alt={post.metadata.lostFoundDetails.itemName || 'Lost & Found item'}
                    className="rounded-md border border-slate-200 max-h-56 object-cover"
                  />
                </div>
              )}
            </div>
          )}

          {/* Announcement Details */}
          {post.type === 'announcement' && post.metadata?.announcementDetails && (
            <div className="border-t border-slate-200 pt-4 mt-4 bg-slate-50/80 rounded-lg p-3">
              <p className="text-sm font-semibold text-slate-700">
                From: <span className="font-medium text-indigo-700">{post.metadata.announcementDetails.department}</span>
              </p>
              {post.metadata.announcementDetails.attachmentUrl && (
                <div className="mt-3">
                  {post.metadata.announcementDetails.attachmentType === 'pdf' ? (
                    <a
                      href={post.metadata.announcementDetails.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-md hover:bg-indigo-100 border border-indigo-100"
                    >
                      📄 View attachment (PDF)
                    </a>
                  ) : (
                    <img
                      src={post.metadata.announcementDetails.attachmentUrl}
                      alt="Announcement attachment"
                      className="rounded-md border border-slate-200 max-h-56 object-cover"
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Event Details + RSVP for Event Posts */}
          {post.type === 'event' && (
            <div className="border-t border-slate-200 pt-4">
              {post.metadata?.eventDetails && (
                <div className="mb-3 text-sm text-slate-700">
                  {post.metadata.eventDetails.title && (
                    <p className="font-semibold text-slate-900">{post.metadata.eventDetails.title}</p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-1">
                    {post.metadata.eventDetails.location && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        📍 {post.metadata.eventDetails.location}
                      </span>
                    )}
                    {post.metadata.eventDetails.date && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        🗓️ {formatDateTime(post.metadata.eventDetails.date)}
                      </span>
                    )}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-700">Will you attend?</span>
                <div className="flex items-center space-x-4 text-xs text-slate-500">
                  <span>{rsvpCounts.going} going</span>
                  <span>{rsvpCounts.interested} interested</span>
                  <span>{rsvpCounts.notGoing} not going</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleRSVP('going')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${rsvpStatus === 'going'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    }`}
                >
                  ✓ Going
                </button>
                <button
                  onClick={() => handleRSVP('interested')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${rsvpStatus === 'interested'
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    }`}
                >
                  ☆ Interested
                </button>
                <button
                  onClick={() => handleRSVP('notGoing')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${rsvpStatus === 'notGoing'
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
                <button onClick={handleLike} className={`flex items-center space-x-1 ${liked ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'} transition-colors`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="text-sm font-medium">Like ({likeCount})</span>
                </button>
                <button onClick={() => setShowComments((s) => !s)} className="flex items-center space-x-1 text-slate-600 hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-sm font-medium">Comment ({comments.length})</span>
                </button>
                <button onClick={handleShare} className="flex items-center space-x-1 text-slate-600 hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  <span className="text-sm font-medium">Share</span>
                </button>
              </div>
            </div>

            {showComments && (
              <div className="mt-3 border-t border-slate-200 pt-3">
                <div className="flex items-start space-x-2">
                  <input
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Write a comment…"
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button onClick={handleAddComment} disabled={!commentInput.trim()} className="px-3 py-2 bg-blue-600 text-white rounded-lg disabled:bg-slate-300">Post</button>
                </div>
                <div className="mt-3 space-y-2">
                  {comments.map((c, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <div className="w-7 h-7 rounded-full bg-slate-300 flex items-center justify-center text-xs text-slate-700">{(c.author || 'U')[0]}</div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex-1">
                        <div className="text-xs text-slate-600"><span className="font-medium text-slate-800">{c.author || 'User'}</span> • {relativeTime(c.createdAt)}</div>
                        <div className="text-sm text-slate-800 whitespace-pre-wrap">{c.content}</div>
                      </div>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-sm text-slate-500">Be the first to comment.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostCard
