var mongoose = require('mongoose');
//Schema: structure of collection
var EventSchema = mongoose.Schema(
   {
      name: {
         type: String,
      },

      // Change type to Date
      firstClosureDate: {
        type: Date,
      },
      finalClosureDate: {
        type: Date,
      },

      image: {
         type: String
      },

      description: {
         type: String
      }
   }
);

var EventModel = mongoose.model("Event", EventSchema);
module.exports = EventModel;