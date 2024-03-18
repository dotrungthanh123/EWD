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
        required: true
    },
    facultyID: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Faculty',
        default: null
    },
    roleID: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Role',
        default: null
    }
}
);
var UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;