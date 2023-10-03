const { StreamDescription } = require("mongodb");
const mongoose = require("mongoose");



const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true

    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    mobile:{
        type:Number,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    is_Admin:{
        type:Number,
        required:true
    },
    is_blocked:{
        type:Boolean,
        required:true
    },
    is_verifed: {
        type: Boolean,
        required: false
    },
    wishlist: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Product'
        }
    ],
    cart:[
        {
            product:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            },
            quantity:{
                type: Number, 
                default: 1
            }      
        }
    ],
    wallet:{
        type: Number,
        default: 0
    },
    walletHistory:[
        {
            date:{
                type:Date
            },
            amount:{
                type:Number
            },
            type:{
                type:String,
                default:"Added from Wallet"
            }
        }
    ],
    address:[
       {
        userId: {type: String, required: true},
        name: {type: String,required: true},
        mobile: {type: String,required: true},
        adressLine1: {type: String,required: true},
        adressLine2: { type: String,},
        city: {type: String,required: true},
        state: { type: String,required: true},
        pin: {type: String,required: true},
        is_default: {type: Boolean,required: true}
       }
    ]
})



module.exports = mongoose.model('User',userSchema)








 


    
