var mongoose = require('mongoose');
var ContributionSchema = mongoose.Schema(
   {
      name: {
         type: String,
         // required: true
      },
      path:[{
         type: String
      }],  // Store the document file name as a string
      description: String,
      faculty: {           
         type: mongoose.SchemaTypes.ObjectId,
         ref: 'faculties',
         default: null  
      }
   }
)
var ContributionModel = mongoose.model("contribution", ContributionSchema);
module.exports = ContributionModel;

