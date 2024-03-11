var mongoose = require('mongoose');
var ContributionSchema = mongoose.Schema(
   {
      name: {
         type: String,
         required: true
      },
      image: String,
      description: String,
      faculty: {           
         type: mongoose.SchemaTypes.ObjectId,
         ref: 'faculties'  
      }
   }
)
var ContributionModel = mongoose.model("contribution", ContributionSchema);
module.exports = ContributionModel;


