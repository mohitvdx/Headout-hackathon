const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['event', 'lost_found', 'announcement'],
    default: 'event'
  },
  author: {
    type: String,
    default: 'Anonymous User'
  },
  metadata: {
    rsvpCounts: {
      going: { type: Number, default: 0 },
      interested: { type: Number, default: 0 },
      notGoing: { type: Number, default: 0 }
    },
    pollOptions: [{
      text: String,
      votes: { type: Number, default: 0 }
    }],
    eventDetails: {
      date: Date,
      location: String,
      rsvpDeadline: Date
    },
    lostFoundDetails: {
      itemStatus: String, // 'lost' or 'found'
      itemName: String,
      location: String,
      contactInfo: String,
      imageUrl: String
    },
    announcementDetails: {
      department: String,
      attachmentUrl: String,
      attachmentType: String // 'image' or 'pdf'
    },
    extractedEntities: {
      dates: [Date],
      locations: [String],
      people: [String],
      organizations: [String]
    }
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: [{
    author: String,
    content: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
postSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Post', postSchema);
