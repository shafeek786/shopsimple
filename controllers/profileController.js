const User = require('../models/user');
const Address = require('../models/address');
const Order =require('../models/order')
const moment = require("moment");
const argon2 = require('argon2');

const loadProfile = async (req, res) => {
    try {
        const userId = req.session.userdata._id;
        const userData = await User.findById(userId)

        res.render('profile', { userData })
    } catch (error) {
        console.log(error.message)
    }
}

const editProfile = async (req, res) => {
    try {
        const userData = req.session.userData;
        res.render('edit_profile', { userData });
    } catch (error) {
        console.log(error.message)
    }
}

const updateProfile = async (req, res) => {
    try {
        const id = req.query.id;
        console.log(id)
        const updatedUser = await User.findByIdAndUpdate(id, {
            $set: {
                name: req.body.name,
                mobile: req.body.mobile,
            }
        }, { new: true });

        console.log(updatedUser, 32222);

        res.redirect('/myaccount')

    } catch (error) {
        console.log(error.message)
    }
}
const manageAddress = async (req, res) => {
    try {
        const userData = req.session.userData
        const id = userData._id
        const userAddress = await Address.find({ userId: id })
        res.render('manage_address', { userAddress, userData })

    } catch (error) {
        console.log(error.message)
    }
}

const addNewAddress = async (req, res) => {
    try {
        const userData = req.session.userdata

        res.render('checkout-address', { userData })
    } catch (error) {
        console.log(error.message)
    }
}
const insertNewAddress = async (req, res) => {
    try {
        const userData = req.session.userdata;
        const id = userData._id
        const address = new Address({
            userId: id,
            name: req.body.name,
            mobile: req.body.mobile,
            adressLine1: req.body.address1,
            adressLine2: req.body.address2,
            city: req.body.city,
            state: req.body.state,
            pin: req.body.pin,
            is_default: false
        })
        await address.save();
        res.redirect('/adresses')
    } catch (error) {
        console.log(error.message)
    }
}
const addNewAddresss = async (req, res) => {
    try {
        const userData = req.session.userData

        res.render('add-checkout-address', { userData })
    } catch (error) {
        console.log(error.message)
    }
}

const checkoutsaveaddress = async (req, res) => {
    try {
        const userData = req.session.userData;
        const id = userData._id;
        const { name, mobile, address1, address2, city, state, pin } = req.body
        const address = new Address({
            userId: id,
            name: name,
            mobile: mobile,
            adressLine1: address1,
            adressLine2: address2,
            city: city,
            state: state,
            pin: pin,
        });
        const add = await address.save();
        if (add) {
            res.redirect("/checkout")
        }

    } catch (error) {
        console.log(error.message)
    }

}
const deleteAddress = async (req, res) => {
    try {
        const id = req.params.id

        await Address.findByIdAndDelete(id)
        res.redirect('/adresses')
    } catch (error) {
        console.log(error);
    }
}

const loadeditaddress = async (req, res) => {
    try {
        const userData = req.session.userdata;
        const addressId = req.params.id
        
        const address = await Address.findById(addressId)
        res.render('editaddress', { userData, address })
    } catch (error) {
        console.log(error.message);
    }
}

const editaddress = async (req, res) => {
    try {
        const addressid = req.query.id
        console.log(addressid);
        const id = req.session.userdata._id
        const userData = await User.findById(id)
        console.log(userData,1499)
        const addressData = await Address.findById(addressid)
        console.log(addressData,151);
        if (Object.values(req.body).some(value => !value.trim() || value.trim().length === 0)) {
            res.render('manage_address', { message: 'please fill the field', userData })

        } else {

            addressData.push({
                name: req.body.name,
                mobile: req.body.mobile,
                adressLine1: req.body.address1,
                adressLine2: req.body.address2,
                city: req.body.city,
                state: req.body.state,
                pin: req.body.pin,
                is_default: false
            }, { new: true });
        }
        res.redirect('/adresses')

    } catch (error) {
        console.log(error.message);
    }
}
const loadMyAccount = async(req,res)=>{
    try{
      const userDat = req.session.userData;
      const user = await User.findById({_id: userDat._id})
      const userId = user._id
      
      const userData = await User.findById(userId)
      const myOrders = await Order.find({ userId }).sort({ date: -1 }).limit(2);
      const address = await Address.find({userId})
      const firstThreeEntries = user.walletHistory.sort((b, a) => new Date(a.date) - new Date(b.date)).slice(0, 5);
        const addressData = await Address.find({ userId: userId })

      console.log(userData);


console.log("After sorting:");
console.log(user.walletHistory);
      const formattedOrders = myOrders.map(order => {
        const formattedDate = moment(order.date).format('MMMM D,YYYY');
        return { ...order.toObject(), date: formattedDate }
    })

    const formatWalletDate = firstThreeEntries.map(wallet => {
        const formattedDate = moment(wallet.date).format('DD MMMM,YYYY');
        return { ...wallet.toObject(), date: formattedDate }
    })
    userData.wallet =userData.wallet.toFixed(2)
        res.render('myaccount',{
          myOrders:formattedOrders || [],
          address : address,
          userData,
          firstThreeEntries: formatWalletDate || []
        })
    }catch(err){
        console.log(err)
    }
}
const editBillingAddress = async(req,res)=>{
    try{
      const user = req.session.userData;
      const userId = user._id
      const id = req.query.id
      const address = await Address.find({_id:id})
      console.log(address)
      res.render('edit_billing_address',{address : address})
    }catch(err){
      console.log(err)
    }
  
  }

  const updateBillingAddress = async(req,res)=>{
    try {
        const addressid = req.query.id
        console.log(addressid);
        const id = req.session.userData._id
        const userData = await User.findById(id)
        console.log(userData,1499)
            const addressData = await Address.findByIdAndUpdate(addressid,{$set:{
                name: req.body.name,
                mobile: req.body.mobile,
                adressLine1: req.body.address1,
                adressLine2: req.body.address2,
                city: req.body.city,
                state: req.body.state,
                pin: req.body.pin,
                is_default: false}
            },{ new: true })
          

    
        res.redirect('/myaccount')
        

    } catch (error) {
        console.log(error.message);
    }
  }
  const resetPassword = async(req,res)=>{
    try{
        res.render('resetpassword')
    }catch(err){
        console.log(err)
    }
}

const verifyResetPassword = async(req,res)=>{
    try{
        const currentPassword = req.body.currentPassword
        const newPassword = req.body.newPassword
        const confirmPassword = req.body.confirmPassword

        const userId = req.session.userData._id
        const userData = await User.findById(userId)
        console.log(userData)
        var passwordMatch = await argon2.verify(userData.password, currentPassword);
        if(passwordMatch){
            if(newPassword === confirmPassword){
                const password = await argon2.hash(newPassword );
                const data = await User.findByIdAndUpdate(userId,{$set:{password:password}})
                res.render('login',{message:"Your password has been reset"})
            }
            else{
                res.render('resetpassword',{message:"password not match"})
            }
        }
        else{
            res.render('resetpassword',{message:"Current password if wrong"})
        }

    }catch(err){
        console.log(err)
    }
}
module.exports = {
    loadProfile,
    editProfile,
    updateProfile,
    manageAddress,
    addNewAddress,
    insertNewAddress,
    checkoutsaveaddress,
    addNewAddresss,
    deleteAddress,
    loadeditaddress,
    editaddress,
    loadMyAccount,
    editBillingAddress,
    updateBillingAddress,
    resetPassword,
    verifyResetPassword
}