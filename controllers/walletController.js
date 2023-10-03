const user = require('../models/user');
const User = require('../models/user')
const moment = require("moment");


const addtoWallet = async(req,res)=>{
    try{
        const userData = req.session.userData;
        const user = await User.findById({_id: userData._id})
        const userId = user._id
        const amount = parseInt(req.body.amount)
        console.log(amount)
        const date = new Date(); // Correct JavaScript syntax
        
        const oldBalance = userData.wallet || 0;
        const newBalance = oldBalance + amount;
        
        const update = {
            wallet: newBalance,
            $push: { walletHistory: { date: date, amount: amount } }
        };
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            update,
            { new: true }
        );
            // Save the updated user document
           res.redirect('/myaccount')
    }catch(err){
        console.log(err)
    }
}


module.exports  = {
    addtoWallet
}