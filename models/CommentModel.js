var mongoose = require('mongoose');
//Schema: structure of collection
var CommentSchema = mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
            default: null
        },

        // The comment that this replies to
        replyComment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
            default: null,
        },
        
        // The user that posts the comment
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        }
        
    }
);
var CommentModel = mongoose.model("Comment", CommentSchema);
module.exports = CommentModel;