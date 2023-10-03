const User = require('../models/user')
const Category = require('../models/category')
const Product = require('../models/product')
const Address = require('../models/address')
const Coupon = require('../models/coupon')
const Order = require('../models/order')
const bcrypt = require('bcrypt')
const url = require('url')
const nodeMailer = require("nodemailer");
const argon2 = require('argon2');
const user = require('../models/user')
const session = require('express-session');
require('dotenv').config()
const moment = require("moment");
const Razorpay = require('razorpay');
let userRegData
let count = 3

//Generate OTP
let otp = `${Math.floor(1000 + Math.random() * 9000)}`
const sendmail = (name, email) => {
  try {

    const transporter = nodeMailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: 'shafydemo78@gmail.com',
        pass: 'psawjvmyqvhoqdeg'
      },
      tls: {
        rejectUnauthorized: false // Bypass SSL certificate verification
      }
    });
    const mailoptions = {

      from: "shafydemo78@gmail.com",
      to: email,
      cc: "shafydemo78@gmail.com",
      subject: "Verification Mail",
      text: `Hello ${name} Your OTP ${otp}`
    }
    transporter.sendMail(mailoptions, function (error, info) {
      if (error) {
        console.log(error.message + "hiii");
      } else {
        console.log('email has been set' + info.response);
      }
      return otp
    })

  } catch (error) {
    res.render('error', { message:error });
    console.log(error.message)
  }
}

//Password hashing
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10)
    return passwordHash

  } catch (err) {
    console.log(err)
  }
}



const loadSignUp = async (req, res) => {
  try {
    res.render('signup')
  } catch (err) {
    console.log(err)
  }
}

//Signup posth method
const userInsert = async (req, res) => {

  try {
    const { name, email, mobile } = req.body;
    userRegData = req.body;

    //    userRegData.password = userRegData.password[0]

    const existUser = await User.findOne({ email: email })
    const existUser1 = await User.findOne({ mobile: mobile })

    // req.session.userRegData = userRegData
    console.log(existUser1, 911);
    if (existUser == null && existUser1 == null) {
      sendmail(name, email)
      res.redirect('/otpverification')
    } else if (existUser != null) {
      console.log('hilli')
      if (existUser.email == email) {
        console.log('hiimm')
        res.render('signup', { message: "Email ID already Exits" })
      }
    } else if (existUser1 != null) {
      if (existUser1.mobile == mobile) {
        console.log('hii')
        res.render('signup', { message: "Mobile number already Exits" })
      }
    }
  }
  catch (error) {
    console.log(error.message);
  }
}
const loadOtp = async (req, res) => {

  try {
    if (count > 0) {
      res.render('otpverification', { count: count })

    } else {
      res.render('otpverification', { message1: "Resend tried maximum" })
    }
  } catch (err) {
    console.log(err)
  }
}

//OTP verification
const verifyOtp = async (req, res) => {

  try {
    const walletValue = userRegData.wallet || 0;
    const password = await argon2.hash(userRegData.password);
    const enteredotp = req.body.otp;
    if (otp === enteredotp) {
      const user = new User({
        name: userRegData.name,
        email: userRegData.email,
        mobile: userRegData.mobile,
        password: password,
        is_Admin: 0,
        is_blocked: false
      });
      const userData = await user.save()
      res.render('login', { message: "success" })
    }
    else {
      if (count > 0) {
        res.render('otpverification', { message: "Ivalid OTP", count: count })

      } else {
        res.render('otpverification', { message: "Ivalid OTP", message1: "Resend tried maximum" })
      }

    }

  } catch (error) {
    console.log(error.message)
  }
}

//Resend OTP


const loadLogin = async (req, res) => {
  try {
    res.render('login')
  } catch (err) {
    console.log(err)
  }
}

const loadVerifyLogin = async (req, res) => {
  try {

    const password = req.body.password
    const email = req.body.email
    const userData = await User.findOne({ email: email })

    if (userData) {

      var passwordMatch = await argon2.verify(userData.password, password);
      if (passwordMatch) {
        if (userData.is_blocked === true) {
          console.log("blocked")
          res.render('login', { message: "You are Blocked" })
        }
        else {
          req.session.userData = userData
          res.redirect('/')
        }
      }
      else {
        res.render('login', { message: "Login failed" })
      }
    }
  } catch (err) {
    console.log(err)
  }
}

//Home page Load
const loadHome = async (req, res) => {
  try {
    const pdata = await Product.find();
    const user = req.session.userData;
    const userId = user?._id;
    console.log(user)
    if (userId) {

      const userData = await User.findById(userId);
      res.render('index', { userData, pdata });
    } else {
      res.render('index', { pdata });
    }
  } catch (error) {
    console.log(error);
  }
};

const loadLogout = async (req, res) => {
  try {
    req.session.destroy()
    res.redirect('/login')

  } catch (err) {
    console.log(err)
  }
}

const loadProductDetails = async (req, res) => {
  try {
    const userdata = req.session.userData;
    if (userdata) {
      const proId = req.query.id
      console.log(proId, 'pro queryyyyy')
      const proData = await Product.findById(proId)
      const userId = userdata._id
      const userData = await User.findOne({ _id: userId }).populate("cart.product")
      const relProData = await Product.find()
      if (userData) {
        const user = req.session.userData
        const userData = await User.findById({ _id: user._id })
        res.render('productdetails', { proData, userData, relProData })
      } else {
        res.render('productdetails', { proData, userData, relProData })
      }
    }else{
      res.redirect('/login')
    }
   
    
    
  } catch (err) {
    console.log(err)
  }
}

const loadForgotOtp = async (req, res) => {
  try {
    res.render('enteremail')
  } catch (err) {
    console.log(err)
  }
}
const loadEmail = async (req, res) => {
  try {
    const email = req.body.email
    userRegData = await User.findOne({ email: email })
    sendmail(userRegData.name, userRegData.email)
    res.render('forgototp', { count: count, data: userRegData })
  } catch (err) {
    console.log(err)
  }
}
const loadForgotOtpVerification = async (req, res) => {
  try {
    const enteredotp = req.body.otp;
    if (otp === enteredotp) {
      res.render('forgotpassword')
    }
    res.render('forgototp', { message: "invalid OTP", count: count })
  } catch (err) {
    console.log(err)
  }
}
const loadResetPassword = async (req, res) => {
  try {
    if (req.body.newpassword === req.body.confirmpassword) {
      const password = await argon2.hash(req.body.newpassword);
      const data = await User.findByIdAndUpdate({ _id: userRegData.id }, { $set: { password: password } })
      res.render('login', { message: "Your password has been reset" })
    } else {
      res.render('forgotpassword', { message: "password not match" })
    }
  } catch (err) {
    console.log(err)
  }
}


const resendOtp = async (req, res) => {

  try {
    count--
    console.log(userRegData.name)
    sendmail(userRegData.name, userRegData.email)
    if (count > 0) {
      res.render('otpverification', { message: "OTP resend", count: count })

    }
    else {
      res.render('otpverification', { message: "OTP resend", message1: "Resend tried maximum" })

    }
  } catch (error) {
    console.log(error);
  }
}

const passwordResendOtp = async (req, res) => {

  try {
    count--
    sendmail(userRegData.name, userRegData.email)
    if (count > 0) {
      res.render('forgototp', { message: "OTP resend", count: count })

    }
    else {
      res.render('forgototp', { message: "OTP resend", message1: "Resend tried maximum" })

    }
  } catch (error) {
    console.log(error);
  }
}


const addToCart = async (req, res) => {
  try {
    
    const user = req.session.userData;
    const userData = await User.findById({ _id: user._id });
    const userId = userData._id;
    const proId = req.query.id;
    const product = await Product.findById(proId);
    const existed = await User.findOne({ _id: userId, 'cart.product': proId });
    console.log(userId)
    if (product.quantity < 1) {
      console.log(proId)
      res.json({ message: 'Out of stock. Cannot add to cart.' });
      return; // Stop the function execution here if the product is out of stock
    }

    if (existed) {
      
      await User.findOneAndUpdate(
        { _id: userId, 'cart.product': proId },
        { $inc: { 'cart.$.quantity': 1 } },
        { new: true }
      );
      res.json({ message: 'Item already in cart' });
    } else {
      
      await Product.findByIdAndUpdate(proId, { isOnCart: true });
      await User.findByIdAndUpdate(
        userId,
        { $push: { cart: { product: product._id } } },
        { new: true }
      );
      res.json({ message: 'Item added to cart' });
    }
  } catch (error) {
    console.log(error.message);
  }
}
const loadCart = async (req, res) => {
  try {
    const userId = req.query.id
    console.log(userId);
    const user1 = req.session.userData
    const userData = await User.findById({ _id: user1._id })

    const user = await User.findOne({ _id: userId }).populate('cart.product').lean()
    const cart = user.cart; // Get the 'cart' array from the user document

    console.log(cart, 'cartttt......................')

    let subTotal = 0
    cart.forEach((val) => {
      val.total = val.product.price * val.quantity
      subTotal += val.total
    })


    if (user.cart.length === 0) {
      res.render('empty_cart', { userData })
    } else {
      res.render('cart', { userData, cart, subTotal })
    }
  } catch (error) {
    console.log(error.message)
  }
}
const removeCart = async (req, res) => {
  try {
    console.log("remove")
    const user = req.session.userData
    const userData = await User.findById({ _id: user._id })
    const userId = userData._id;
    const proId = req.query.proId;
    const cartId = req.query.cartId;

    await Product.findOneAndUpdate(
      { _id: proId, isOnCart: true }, // Ensure the product is still in the cart
      { $set: { isOnCart: false } },
      { new: true }
    );

    await User.updateOne(
      { _id: userId },
      { $pull: { cart: { product: proId } } }
    );

    res.json('item removed');
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'An error occurred while removing the item from the cart.' });
  }
};

const updateCart = async (req, res) => {
  console.log('kkcartttt......................')
  try {
    const user = req.session.userData
    const userData = await User.findById({ _id: user._id })
    let data = await User.find(
      { _id: userData._id },
      { _id: 0, cart: 1 }
    ).lean();

    data[0].cart.forEach((val, i) => {
      val.quantity = req.body.datas[i].quantity;
      console.log(req.body.datas[i].quantity)
    });

    await User.updateOne(
      { _id: userData._id },
      { $set: { cart: data[0].cart } }
    );

    res.json("from backend ,cartUpdation json");
  } catch (error) {
    console.log(error.message)
  }
};

const loadCheckout = async (req, res) => {

  const user = req.session.userData
  const userData = await User.findById({ _id: user._id })
  const userId = userData._id

  const addressData = await Address.find({ userId: userId })
  const userDataa = await User.findOne({ _id: userId }).populate("cart.product").lean()
  const cart = userDataa.cart

  let subTotal = 0
  cart.forEach((val) => {
    val.total = val.product.price * val.quantity
    subTotal += val.total
  })

  const now = new Date();
  const availableCoupons = await Coupon.find({
    expiryDate: { $gte: now },
    usedBy: { $nin: [userId] }
  });
  console.log(availableCoupons, 'helooooooooooo coupon aaann');

  res.render('checkout', { userData, cart, addressData, subTotal, availableCoupons })
}

const checkStock = async (req, res) => {
  const user = req.session.userData
  const userData = await User.findById({ _id: user._id })
  const userId = userData._id;

  const addressData = await Address.find({ userId: userId });

  const userDataa = await User.findOne({ _id: userId }).populate("cart.product").lean();
  const cart = userDataa.cart;

  console.log(cart, 'cart 3777777777');

  // let subTotal = 0;
  // cart.forEach((val) => {
  //   val.total = val.product.price * val.quantity;
  //   subTotal += val.total;
  // });

  let stock = [];
  cart.forEach((el) => {
    if ((el.product.quantity - el.quantity) <= 0) {
      stock.push(el.product);
    }
  });

  console.log(stock, 'stockkkkkkkkkkkkkk');

  if (stock.length > 0) {
    console.log('Sending JSON response with stock array');
    res.status(200).json(stock);
  } else {
    res.json('ok')
  }
  // else {
  //   console.log('Rendering checkout page');
  //   res.render('user/checkout/checkout', { userData, cart, addressData, subTotal });

  // }
};

const placeOrder = async (req, res) => {

  try {
    const user = req.session.userData
    const userData = await User.findById({ _id: user._id })
    const userId = userData._id
    const addressId = req.body.selectedAddress
    const payMethod = req.body.selectedPayment
    console.log("payment method" + payMethod)

    const userDataa = await User.findOne({ _id: userId }).populate("cart.product")
    const cartPro = userDataa.cart

    let subTotal = 0

    cartPro.forEach((val) => {
      val.total = val.product.price * val.quantity
      subTotal += val.total
    })


    let productDet = cartPro.map(item => {
      return {
        id: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image1[0],
      }
    })


    const result = Math.random().toString(36).substring(2, 7);
    const id = Math.floor(100000 + Math.random() * 900000);
    const ordeId = result + id;

    /// order saving function
    console.log(req.session.couponData, "PlaceOrder CouponDataaaa")
    let saveOrder = async () => {
      console.log(req.body, "bodyyyyyy")
      if (req.body.couponData) {
        const order = new Order({
          userId: userId,
          product: productDet,
          address: addressId,
          orderId: ordeId,
          total: subTotal,
          paymentMethod: payMethod,
          discountAmt: req.body.couponData.discountAmt,
          amountAfterDscnt: req.body.couponData.newTotal,
          coupon: req.body.couponName
        })
        console.log(req.body.couponName, "couponnn name",)
        console.log(order, 'order with coupon data')
        const ordered = await order.save()

      } else {
        const order = new Order({
          userId: userId,
          product: productDet,
          address: addressId,
          orderId: ordeId,
          total: subTotal,
          paymentMethod: payMethod,
        })
        console.log(order, "order without coupon")
        await order.save()

      }

      let userDetails = await User.findById(userId)
      let userCart = userDetails.cart

      userCart.forEach(async item => {
        const productId = item.product
        const qty = item.quantity
        console.log(qty, "Quantity From place Order........")
        const product = await Product.findById(productId)
        const stock = product.quantity
        const updatedStock = stock - qty
        console.log(updatedStock, "updatedQuantity From place Order........")

        await Product.updateOne(
          { _id: productId },
          { $set: { quantity: updatedStock, isOnCart: false } }
        );
      })
      userDetails.cart = []
      await userDetails.save()
      console.log(userDetails.cart, "userDetails in cart");
    }


    if (addressId) {
      if (payMethod === 'cash-on-delivery') {
        console.log('From cash on delivery', 151111);

        saveOrder()

        res.json({
          CODsucess: true,
          toal: subTotal
        })
      }

      if (payMethod === 'razorpay') {
        console.log('created orderId request Razaorpay', req.body);

        const amount = req.body.amount;
        var instance = new Razorpay({
          key_id: 'rzp_test_Ernm0SK2wP94Mz',
          key_secret: 'izzQYWqosqnQJXI8iYNxYuzp'
        })

        const order = await instance.orders.create({
          amount: amount * 100,
          currency: 'INR',
          receipt: 'shafeeq',
        });

        saveOrder()

        res.json({
          razorPaySucess: true,
          order,
          amount,
        });
      }
      /// payment method wallet function


      if (payMethod === 'wallet') {
        console.log('he he he am from wallet.................')
        const newWallet = req.body.updateWallet
        const userData = req.session.userdata

        console.log(newWallet, 'new wallettttttttttttttttttt');

        await User.findByIdAndUpdate(userId, { $set: { wallet: newWallet } }, { new: true })
        //    userData = updatedUser
        //    req.session.user = userData
        saveOrder()
        res.json(newWallet)
      }
    }
  } catch (error) {
    console.log(error);
  }
}

const loadProductList = async (req, res) => {
  try {
    const pdata = await Product.find();
    const user = req.session.userData;
    const userId = user?._id;
    const userData = await User.findById(userId);
    res.render('productlist', {
      userData,
      pdata
    })
  } catch (err) {
    console.log(err)
  }
}


const productSerach =async(req,res)=>{
  try{
    const {search,catId} = req.body
    const user = req.session.userData;
    const userId = user?._id; 
    console.log(search)
    const userData = await User.findById(userId);
    if(catId){
      const pdata = await Product.find({ category: catId, name: { $regex: search, $options: 'i' } });
      console.log(pdata)
      res.render('productlist', {
        userData,
        pdata
      })
    }
    else{
      const pdata = await Product.find({ name: { $regex: search, $options: 'i' } });
      console.log(pdata)
      res.render('productlist', {
        userData,
        pdata
      })
    }
  }catch(err){
    console.log(err)
  }
}
const searchByCategory = async(req,res)=>{
  try{

  }catch(err){
    console.log(err)
  }
}

const catFilter = async(req,res)=>{
  try{
    console.log("catttyyyt")
    const user = req.session.userData;
    const userId = user?._id; 
    const userData = await User.findById(userId);
    const category = req.query.cat

    if(category === "men"){
      console.log("men")
      const pdata = await Product.find({category:"MEN"})
      console.log(pdata)
      res.render('productlist', {
        userData,
        pdata
      })
    } else    if(category === "women"){
      const pdata = await Product.find({category:"WOMEN"})
      console.log(pdata)
      res.render('productlist', {
        userData,
        pdata
      })
    }else    if(category === "boy"){
      const pdata = await Product.find({category:"BOYS"})
      console.log(pdata)
      res.render('productlist', {
        userData,
        pdata
      })
    }else    if(category === "girl"){
      const pdata = await Product.find({category:"GIRLS"})
      console.log(pdata)
      res.render('productlist', {
        userData,
        pdata
      })
    }
  }catch(err){
    console.log(err)
  }
}

const contact = async(req,res)=>{
  try{
    const user = req.session.userData
    const userId = user._id
    const userData = await User.findById({_id:userId})
    res.render('contact',{userData})
  }catch(err){
    console.log(err)
  }
}

const about = async(req,res)=>{
  try{
    const user = req.session.userData
    const userId = user._id
    const userData = await User.findById({_id:userId})
    res.render('aboutUs',{userData})
  }catch(err){
    console.log(err)
  }
}
module.exports = {
  loadHome,
  loadLogin,
  loadSignUp,
  userInsert,
  loadVerifyLogin,
  loadOtp,
  verifyOtp,
  loadLogout,
  resendOtp,
  loadProductDetails,
  loadForgotOtp,
  loadForgotOtpVerification,
  loadEmail,
  loadResetPassword,
  passwordResendOtp,
  addToCart,
  loadCart,
  removeCart,
  updateCart,
  checkStock,
  loadCheckout,
  placeOrder,
  loadProductList,
  productSerach,
  searchByCategory,
  catFilter,
  contact,
  about
}