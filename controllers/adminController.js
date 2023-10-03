const Product = require("../models/product");
const Category = require("../models/category");
const User = require("../models/user");
const user = require("../models/user");
const Order = require("../models/order");
const Address = require("../models/address");
const bcrypt = require("bcrypt");
const nodeMailer = require("nodemailer");
const moment = require("moment");
const mongoose = require("mongoose");
const hbs = require("hbs");

let userRegData;
let count = 3;

let dailyorders;
let totalOrderBill;
let monthlyOrders;
let totalMonthlyBill;
let yearlyorders;
let totalYearlyBill;
hbs.registerHelper("json", function (context) {
  return JSON.stringify(context);
});
//Generate OTP
let otp = `${Math.floor(1000 + Math.random() * 9000)}`;
const sendmail = (name, email) => {
  try {
    const transporter = nodeMailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "shafydemo78@gmail.com",
        pass: "psawjvmyqvhoqdeg",
      },
      tls: {
        rejectUnauthorized: false, // Bypass SSL certificate verification
      },
    });
    const mailoptions = {
      from: "shafydemo78@gmail.com",
      to: email,
      cc: "shafydemo78@gmail.com",
      subject: "Verification Mail",
      text: `Hello ${name} Your OTP ${otp}`,
    };
    transporter.sendMail(mailoptions, function (error, info) {
      if (error) {
        console.log(error.message + "hiii");
      } else {
        console.log("email has been set" + info.response);
      }
      return otp;
    });
  } catch (error) {
    console.log(error.message);
  }
};
const loadHome = async (req, res) => {
  try {
    const data = await Order.find({
      status: { $nin: ["Cancelled", "Returned"] },
    });
    const totalSale = data.reduce((total, order) => total + order.total, 0);
    const orders = await Order.countDocuments({
      status: { $nin: ["Cancelled", "Returned"] },
    });
    const onlineOrders = await Order.countDocuments({
      paymentMethod: "razorpay",
    });
    const onlineOrderPercentage = Math.ceil((onlineOrders / orders) * 100);
    const walletOrders = await Order.countDocuments({
      paymentMethod: "wallet",
    });
    const walletOrderPercentage = Math.ceil((walletOrders / orders) * 100);
    const codOrders = await Order.countDocuments({
      paymentMethod: "cash-on-delivery",
    });
    const codOrderPercentage = Math.ceil((codOrders / orders) * 100);

    const profit = (totalSale * 25) / 100;
    const userCount = await User.find().count();

    // Render the chart in an HTML page
    res.render("home.hbs", {
      totalSale,
      profit,
      userCount,
      onlineOrders,
      onlineOrderPercentage,
      walletOrders,
      walletOrderPercentage,
      codOrders,
      codOrderPercentage,
    });
  } catch (err) {
    console.log(err);
  }
};

const loadAddCategory = async (req, res) => {
  try {
    res.render("addcategory.hbs");
  } catch (err) {
    console.log(err);
  }
};

const veriyLoadAddCategory = async (req, res) => {
  try {
    const name = req.body.name;
    const nameLo = name.toUpperCase();
    const data = await Category.findOne({ NAME: nameLo });
    if (data) {
      console.log("exist");
      res.render("addcategory.hbs", { message: "Category Exists" });
    } else {
      console.log("not exist");
      const category = new Category({
        NAME: nameLo,
        DESCRIPTION: req.body.description,
      });
      const categoryData = category.save();
      if (categoryData) {
        res.render("addcategory.hbs");
      } else {
        res.render("addcategory,hbs");
      }
    }
  } catch (err) {
    console.log(err);
  }
};

const loadDelete = async (req, res) => {
  try {
    const id = req.query.id;
    const data = await Product.findByIdAndDelete({ _id: id });
    res.redirect("/admin/products");
  } catch (err) {
    console.log(err);
  }
};

const loadCategory = async (req, res) => {
  try {
    const catData = await Category.find();
    res.render("category.hbs", { details: catData });
  } catch (err) {
    console.log(err);
  }
};

const loadEditCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const data = await Category.findOne({ _id: id });
    res.render("editcategory.hbs", { details: data });
  } catch (err) {
    console.log(err);
  }
};

const verifyLoadEditCategory = async (req, res) => {
  try {
    const id = req.body.id;
    const name = req.body.name;
    const namelo = name.toUpperCase();
    const catData = await Category.findOne({ NAME: namelo });
    if (catData) {
      res.render("editcategory.hbs", {
        message: "Category exists",
        details: catData,
      });
    } else {
      const data = await Category.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            NAME: req.body.name,

            DESCRIPTION: req.body.description,
          },
        }
      );
      res.redirect("/admin/category");
    }
  } catch (err) {
    console.log(err);
  }
};

const loadDeleteCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const data = await Category.findByIdAndDelete({ _id: id });
    res.redirect("/admin/category");
  } catch (err) {
    console.log(err);
  }
};
//User
const loadUser = async (req, res) => {
  try {
    const PAGE_SIZE = 10; // Number of items per page
    const page = parseInt(req.query.page, 10) || 1; // Ensure to specify radix 10
    const totalProducts = await User.countDocuments();

    const totalPages = Math.ceil(totalProducts / PAGE_SIZE);
    const skip = (page - 1) * PAGE_SIZE;
    const productdata = await Product.find()
      .populate("category")
      .sort({ name: 1 })
      .skip(skip)
      .limit(PAGE_SIZE);
    const data = await User.find();
    res.render("user.hbs", {
      details: data,
      currentPage: page,
      totalPages: totalPages,
      itemsPerPage: PAGE_SIZE,
    });
  } catch (err) {
    console.log(err);
  }
};
//Delete User
const loadDeleteUser = async (req, res) => {
  try {
    const id = req.query.id;
    const data = await user.findByIdAndDelete({ _id: id });
    res.redirect("/admin/user");
  } catch (err) {
    console.log(err);
  }
};

//Block User
const blockUser = async (req, res) => {
  try {
    const userData = await User.findOneAndUpdate(
      { _id: req.query.id },
      { $set: { is_blocked: true } }
    );
    console.log(userData);
    res.redirect("/admin/user");
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};
const unblockUser = async (req, res) => {
  try {
    const userData = await User.findOneAndUpdate(
      { _id: req.query.id },
      { $set: { is_blocked: false } }
    );
    console.log(userData);
    res.redirect("/admin/user");
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};
const loadLogin = async (req, res) => {
  try {
    return res.render("login.hbs");
  } catch (err) {
    console.log(err);
  }
};
const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    console.log(password);
    const userData = await User.findOne({ email: email });
    if (userData) {
      const passworfMatch = await bcrypt.compare(password, userData.password);
      if (passworfMatch) {
        if (userData.is_Admin === 0) {
          console.log("hiiii");
          res.render("login.hbs", { message: "You are not allowed" });
        } else {
          req.session.user = userData.name;
          res.redirect("/admin");
        }
      } else {
        res.render("login.hbs", { message: "login faile" });
      }
    } else {
      res.render("login.hbs", { message: "login failed" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin/login");
  } catch (error) {
    console.log(error.message);
  }
};
const loadForgotOtp = async (req, res) => {
  try {
    res.render("enteremail.hbs");
  } catch (err) {
    console.log(err);
  }
};
const loadEmail = async (req, res) => {
  try {
    const email = req.body.email;
    userRegData = await User.findOne({ email: email });
    if (userRegData.is_Admin === 0) {
      res.render("enteremail.hbs", { message: "You are not permitted" });
    }
    sendmail(userRegData.name, userRegData.email);
    res.render("forgototp.hbs", { count: count });
  } catch (err) {
    console.log(err);
  }
};
const passwordResendOtp = async (req, res) => {
  try {
    count--;
    console.log(userRegData.name);
    sendmail(userRegData.name, userRegData.email);
    if (count > 0) {
      res.render("forgototp.hbs", { message: "OTP resend", count: count });
    } else {
      res.render("forgototp.hbs", {
        message: "OTP resend",
        message1: "Resend tried maximum",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const loadOrders = async (req, res) => {
  try {
    const page_size = 10;
    const page = parseInt(req.query.page, 10) || 1;
    const totalOrders = await Order.countDocuments();
    const totalPages = Math.ceil(totalOrders / page_size);
    const skip = (page - 1) * page_size;
    const orders = await Order.find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(page_size);

    const now = moment();

    const ordersData = orders.map((order) => {
      const formattedDate = moment(order.date).format("MMMM D, YYYY");
      return {
        ...order.toObject(),
        date: formattedDate,
      };
    });
    // console.log(ordersData, 1234);
    res.render("orders.hbs", {
      ordersData: ordersData || [],
      page,
      totalPages: totalPages,
      itemsPerPage: page_size,
    });
  } catch (err) {
    console.log(err);
  }
};
const loadChangeStatus = async (req, res) => {
  try {
    const id = req.query.id;
    const status = req.body.status;
    const order = await Order.findByIdAndUpdate(
      id,
      { $set: { status: status } },
      { new: true }
    );
    res.redirect("/admin/orders");
  } catch (err) {
    console.log(err);
  }
};
const orderdetails = async (req, res) => {
  try {
    const userData = req.session.userData;
    const orderId = req.query.id;
    const myOrderDetails = await Order.findById(orderId);
    const orderedProDet = myOrderDetails.product;
    const addressId = myOrderDetails.address;
    const address = await Address.findById(addressId);
    res.render("order_Details.hbs", {
      myOrderDetails,
      orderedProDet,
      userData,
      address,
    });
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = {
  loadHome,
  loadAddCategory,
  veriyLoadAddCategory,
  loadDelete,
  loadCategory,
  loadEditCategory,
  verifyLoadEditCategory,
  loadDeleteCategory,
  loadUser,
  loadDeleteUser,
  blockUser,
  unblockUser,
  loadLogin,
  verifyLogin,
  loadLogout,
  loadForgotOtp,
  loadEmail,
  passwordResendOtp,
  loadOrders,
  loadChangeStatus,
  orderdetails,
};
