var mongoose = require('mongoose');
//Schema: structure of collection
var RoleSchema = mongoose.Schema(
   {
      name: {
         type: String,
         required: true
      }
   }
);
var RoleModel = mongoose.model("Role", RoleSchema);
module.exports = RoleModel;