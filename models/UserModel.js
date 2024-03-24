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
        required: true,
        default: null
    },
    roleID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        default: null,
        ref: 'Role'
    },
    facultyID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        default: null,
        ref: 'Faculty'
    }
}
);
var UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;