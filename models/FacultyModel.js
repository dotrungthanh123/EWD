var mongoose = require('mongoose');
//Schema: structure of collection
var FacultySchema = mongoose.Schema(
   {
      name: {
         type: String,
         required: true
      }
   }
);
var FacultyModel = mongoose.model("Faculty", FacultySchema);
module.exports = FacultyModel;