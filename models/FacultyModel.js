var mongoose = require('mongoose');
//Schema: structure of collection
var FacultySchema = mongoose.Schema(
   {
      name: {
         type: String,
         required: true
      },
      description: String    //shorthand
   }
);
var FacultyModel = mongoose.model("faculties", FacultySchema);
module.exports = FacultyModel;

