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
      user: {           
         type: mongoose.SchemaTypes.ObjectId,
         ref: 'User',
         default: null  
      }
   }
)
var ContributionModel = mongoose.model("Contribution", ContributionSchema);
module.exports = ContributionModel;