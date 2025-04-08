import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    date: {
        type: Date,
        default: Date.now
    }, // Track the date of the activity
  
    follows: {
        type: Number,
        default: 0
    },

    unfollows: {
        type: Number,
        default: 0
    },

    newPosts: {
        type: Number,
        default: 0
    },
  
    totalLikes: {
        type: Number,
        default: 0
    },
  
    totalComments: {
        type: Number,
        default: 0
    },
  
    totalShares: {
        type: Number,
        default: 0
    },  
});

export default mongoose.model('Analytics', analyticsSchema);