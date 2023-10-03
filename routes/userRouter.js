const express = require('express')
let router =express.Router()
const userController = require('../controllers/userControler')
const profileController = require('../controllers/profileController')
const orderController = require('../controllers/orderController')
const auth = require('../midleware/userLoginAuth')
const uth = require('../midleware/userBlock')
const User = require('../models/user')
const wishlistController  = require('../controllers/wishlistController');
const checkoutController = require('../controllers/checkoutController')
const walletContoller = require('../controllers/walletController')
const bodyParser = require('body-parser')
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))
const session = require('express-session')
var cookieParser = require('cookie-parser')
const user = require('../models/user')
router.use(cookieParser())
router.use(session({
    key:'user_id',
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie:{
        expires:10000000000000000
    }
})
)
function noCach(req, res, next) {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
}
router.get('/',noCach,userController.loadHome)
router.get('/login',noCach,auth.isLogout,userController.loadLogin)
router.post('/login',userController.loadVerifyLogin)
router.get('/signup',noCach,userController.loadSignUp)
//router.post('/signup',userController.loadVerifySignup)
router.post('/signup',userController.userInsert)
router.get('/otpverification',userController.loadOtp)
router.post('/otpverification',userController.verifyOtp)

router.get('/resendOTP',userController.resendOtp)

router.get('/logout',userController.loadLogout)

router.get('/productdetails',userController.loadProductDetails)
router.get('/forgototp',userController.loadForgotOtp)
router.post('/email',userController.loadEmail)
router.post('/forgototpverification',userController.loadForgotOtpVerification)
router.post('/resetpassword',userController.loadResetPassword)
router.get('/passresendOTP',userController.passwordResendOtp)


//userRoute.get('/cart', auth.isLogin)
router.get('/cart',uth.checkUserStatus,auth.isLogin, userController.loadCart)
router.get('/add_to_cart', auth.isLogin,uth.checkUserStatus, userController.addToCart)
router.get('/remove', auth.isLogin,uth.checkUserStatus, userController.removeCart)
router.post('/cart_updation', auth.isLogin,  userController.updateCart)

router.get('/product_list',auth.isLogin,uth.checkUserStatus,userController.loadProductList)

router.get('/checkout', auth.isLogin,uth.checkUserStatus, userController.loadCheckout);
router.get('/check_stock', auth.isLogin,uth.checkUserStatus, userController.checkStock);
router.post('/place_order', auth.isLogin,checkoutController.placeOrder);

router.get("/add-checkoutaddress", auth.isLogin,uth.checkUserStatus,  profileController.addNewAddresss);
router.post("/add-checkoutaddress", auth.isLogin,uth.checkUserStatus, profileController.checkoutsaveaddress);
router.get('/myaccount',profileController.loadMyAccount)
router.get('/edit_billing_address',auth.isLogin,uth.checkUserStatus,profileController.editBillingAddress)
router.post('/edit_billing_address',profileController.updateBillingAddress)
router.get('/edit_profile',auth.isLogin,uth.checkUserStatus,profileController.editProfile)
router.post('/edit_profile',profileController.updateProfile)
router.get('/resetpassword',auth.isLogin,uth.checkUserStatus,profileController.resetPassword)
router.post('/reset',profileController.verifyResetPassword)

router.get('/order_sucess', auth.isLogin,uth.checkUserStatus, orderController.orderSuccess);
router.post('/orderByDate',orderController.orderByDate)
router.get('/my_orders', auth.isLogin,uth.checkUserStatus, orderController.myOrders);
router.get('/order_details',auth.isLogin,uth.checkUserStatus,orderController.orderDetails)
router.post('/ordercancel',orderController.orderCancel);
router.post('/orderreturn',orderController.orderReturn);
router.get('/get_invoice',auth.isLogin,uth.checkUserStatus,orderController.getInvoice);

router.post('/productSearch',userController.productSerach)
router.get('/searchBycategory',userController.searchByCategory)

router.get('/men',auth.isLogin,uth.checkUserStatus,userController.catFilter)

router.post('/validate_coupon',  checkoutController.validateCoupon);

router.get('/wishlist',auth.isLogin,uth.checkUserStatus,wishlistController.loadWishlist);
router.get('/add_to_wishlist',auth.isLogin,uth.checkUserStatus,wishlistController.addToWishlist)
router.get('/remove_from_wishlist',auth.isLogin,uth.checkUserStatus,wishlistController.removeFromWishList);

router.post('/addWallet',auth.isLogin,uth.checkUserStatus,walletContoller.addtoWallet)
router.get('/contact_us',auth.isLogin,userController.contact)
router.get('/about_us',auth.isLogin,userController.about)
router.get('/filter_orders',auth.isLogin,uth.checkUserStatus,orderController.filter)
module.exports = router