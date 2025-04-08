import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        
    },
    description: {
        type: String,
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    joinRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
    events: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }],
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }],
    
}, {
    timestamps: true
});

export const Group = mongoose.model('Group', groupSchema);