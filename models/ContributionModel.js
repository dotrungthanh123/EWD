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
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
         default: null  
      },
      event: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Event',
         default: null
      },
      publish: {
         type: Boolean,
         require: true,
         default: false,
      },
      date: {
         type: Date,
         require: true,
         default: null
      },
      comment: [
         {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment'
         }
      ],

      // users can only filter for category after seeing the index (which means the contributions have already been filtered by faculty)
      category: [{
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Category'
      }]
   }
)
var ContributionModel = mongoose.model("Contribution", ContributionSchema);
module.exports = ContributionModel;