var mongoose = require('mongoose');
//Schema: structure of collection
var CommentSchema = mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
            default: null
        },
        
        // The user that posts the comment
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        date: {
            type: Date,
            default: Date.now 
        }
    }
);
var CommentModel = mongoose.model("Comment", CommentSchema);
module.exports = CommentModel;