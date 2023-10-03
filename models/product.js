const mongoose = require('mongoose');
const Category = require('../models/category');


const productschema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: Array,
        required: true
    },
    category: {
      type:String,
      required:true

    },
    brand:{
        type:String,
        required:true
    },
    quantity: {
        type: Number,
        default: 0
    },
    is_blocked: {
        type: Boolean,
        default: false
    },
    size:{
        type:String,
        required:true
    },
    status:{
        type:String,
        required:true
    },
    isWishlisted:{
      type:Boolean,
      dafault:true
  },
    isOnCart: {
        type: Boolean,
        default: false,
    },
    image1:[{
      type:String,
      required:true
    }],
    image2:[{
      type:String,
      required:true
    }],
    image3:[{
      type:String,
      required:true
    }]

});
 module.exports = mongoose.model('Product', productschema);

