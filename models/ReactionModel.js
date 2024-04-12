var mongoose = require('mongoose');
//Schema: structure of collection
var ReactionSchema = mongoose.Schema(
    {
        _id: {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            contribution: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Contribution'
            }
        },

        // 0 means not like, dislike,
        // 1 means like,
        // 2 means dislike,
        state: {
            type: Number
        }
    }
);

var ReactionModel = mongoose.model("Reaction", ReactionSchema);
module.exports = ReactionModel;