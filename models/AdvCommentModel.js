var mongoose = require('mongoose');
var AdvCommentSchema = mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
            default: null
        },
        // The user that posts the comment
        userId: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User' 
        },
        date: {
            type: Date
        },
        contributionId: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Contribution'
        },
    }
);
var AdvCommentModel = mongoose.model("advcomments", AdvCommentSchema);
module.exports = AdvCommentModel;