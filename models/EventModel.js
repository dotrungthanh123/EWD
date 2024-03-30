var mongoose = require('mongoose');
//Schema: structure of collection
var EventSchema = mongoose.Schema(
   {
      name: {
         type: String,
      },
      firstClosureDate: {
        type: String,
      },
      finalClosureDate: {
        type: String,
      },
   }
);

var EventModel = mongoose.model("Event", EventSchema);
module.exports = EventModel;