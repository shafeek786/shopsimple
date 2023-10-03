const express = require('express')
const routerAdmin = express()
const adminControl = require('../controllers/adminController')
const auth = require('../midleware/adminLoginAuth')
const productController =require('../controllers/productController')
const couponController = require('../controllers/couponController')
const dashBoardController = require('../controllers/dashBoardController')
const reportController = require('../controllers/reportController')
const multer = require('multer')
const path = require('path')
const bodyParser = require('body-parser')
const router = require('./userRouter')
const session = require('express-session')
var cookieParser = require('cookie-parser')
routerAdmin.use(bodyParser.json())
routerAdmin.use(bodyParser.urlencoded({extended:true}))


routerAdmin.use(express.urlencoded({extended:true}))
routerAdmin.use(express.json())
routerAdmin.set('view engine','ejs')
routerAdmin.set('views','./views/admin')


function noCache(req, res, next) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  
}


const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'./public/productImages')
    },
    filename:(req,file,cb)=>{
        const name = Date.now()+'-'+file.originalname
        cb(null,name)
    }
})
const upload = multer({storage:storage})


router.use(cookieParser())
router.use(session({
    key:'user_id',
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie:{
        expires:1000000000000000
    }
})
)
const multipleUploads = upload.fields([{name:'img1'},{name:'img2'},{name:'img3'}])
function noCache(req, res, next) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  }
routerAdmin.get('/',noCache,auth.isLogin,adminControl.loadHome)
routerAdmin.get('/login',noCache,auth.isLogout,adminControl.loadLogin)
routerAdmin.get('/addproduct',productController.loadAddProduct)
routerAdmin.post('/addproduct',upload.fields([{name:'img1',maxCount:1},{name:'img2',maxCount:1},{name:'img3',maxCount:1}]),productController.verifyAddProduct)

routerAdmin.get('/addcategory',adminControl.loadAddCategory)
routerAdmin.post('/addCategory',adminControl.veriyLoadAddCategory)

routerAdmin.get('/products',productController.loadProducts)

routerAdmin.get('/editproduct',productController.loadEditProduct)
routerAdmin.post('/editproduct',upload.fields([{name:'img1',maxCount:1},{name:'img2',maxCount:1},{name:'img3',maxCount:1}]),productController.verifyEditProduct)

routerAdmin.get('/deleteproduct',adminControl.loadDelete)
routerAdmin.get('/category',adminControl.loadCategory)


routerAdmin.get('/editcategory',adminControl.loadEditCategory)
routerAdmin.post('/editCategory',adminControl.verifyLoadEditCategory)

routerAdmin.get('/deletecategory',adminControl.loadDeleteCategory)
routerAdmin.get('/user',adminControl.loadUser)
routerAdmin.get('/deleteuser',adminControl.loadDeleteUser)
routerAdmin.get('/blockuser',adminControl.blockUser)
routerAdmin.get('/unlockuser',adminControl.unblockUser)

routerAdmin.post('/login',auth.isLogout,adminControl.verifyLogin)
routerAdmin.get('/logout',noCache,auth.isLogin,adminControl.loadLogout)
routerAdmin.get('/logout',adminControl.loadLogout)
routerAdmin.get('/email',adminControl.loadForgotOtp)
routerAdmin.post('/email',adminControl.loadEmail)
routerAdmin.get('/passresendOTP',adminControl.passwordResendOtp)

routerAdmin.get('/orders',auth.isLogin,adminControl.loadOrders)
routerAdmin.get('/order_Details',auth.isLogin,adminControl.orderdetails)
routerAdmin.post('/change_status',auth.isLogin,adminControl.loadChangeStatus)

routerAdmin.get('/coupon',auth.isLogin,couponController.loadCoupon);
routerAdmin.get('/addNewCoupon',auth.isLogin,couponController.addCoupon);
routerAdmin.post('/addNewCoupon',auth.isLogin,couponController.addCouponPost);
routerAdmin.get('/delete_cpn',couponController.deleteCoupon);

routerAdmin.get('/weekReport',dashBoardController.oneWeekData)
routerAdmin.get('/monthReport',dashBoardController.monthData)
routerAdmin.get('/dayReport',dashBoardController.dayData)

routerAdmin.get('/report',auth.isLogin,reportController.loadReport)
routerAdmin.post('/daily-report',reportController.postReport)
routerAdmin.get('/report/download',auth.isLogin,reportController.reportDownload);
//block product
routerAdmin.get('/blockproduct',auth.isLogin,productController.blockProduct);
routerAdmin.get('/unblockproduct',auth.isLogin,productController.unBlockProduct);
routerAdmin.get('*',function(req,res){
    res.redirect('/admin')
})

module.exports = routerAdmin