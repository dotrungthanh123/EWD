var mongoose = require('mongoose');
var UserSchema = mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        // required: true,
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        // required: true,
        ref: 'Role'
    },
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        // required: true,
        ref: 'Faculty'
    }
}
);
var UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;