const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    NAME: {
        type:String,
        
        required:true
      },
      DESCRIPTION: {
        type:String
      }

})



module.exports = mongoose.model('Category',categorySchema)