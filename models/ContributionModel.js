var mongoose = require('mongoose');
var ContributionSchema = mongoose.Schema(
   {
      name: {
         type: String,
         required: true
      },
      image: String, // Store the image file name as a string
      docs: String,  // Store the document file name as a string
      description: String,
      faculty: {           
         type: mongoose.SchemaTypes.ObjectId,
         ref: 'faculties'  
      }
   }
)
var ContributionModel = mongoose.model("contribution", ContributionSchema);
module.exports = ContributionModel;

