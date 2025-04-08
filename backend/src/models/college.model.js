import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
    },
    establishYear: {
        type: Number,
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }],
    private: {
        type: Boolean,
        default: false
    },
    affiliatedTo: {
        type: String,
        ref: "University"
    }
    
});
export const College = mongoose.model("College", collegeSchema);