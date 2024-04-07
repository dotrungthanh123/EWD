var mongoose = require('mongoose');
//Schema: structure of collection
var CategorySchema = mongoose.Schema(
   {
      name: {
         type: String,
         required: true
      }
   }
);
var CategoryModel = mongoose.model("Category", CategorySchema);
module.exports = CategoryModel;