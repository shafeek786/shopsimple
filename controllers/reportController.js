const Product = require('../models/product')
const Category = require('../models/category')
const User = require('../models/user')
const user = require('../models/user')
const Order = require('../models/order')
const Address = require('../models/address')
const bcrypt = require('bcrypt')
const nodeMailer = require("nodemailer");
const moment = require("moment");
const mongoose = require('mongoose');
const hbs = require('hbs');
const ExcelJS = require('exceljs');
let dailyorders;
let totalOrderBill;

const loadReport = async(req,res)=>{
    try{
        res.render('report.hbs')
    }catch(err){
        console.log(err)
    }
}

const postReport = async (req, res) => {
    try {
      const startDate = new Date(req.body.start); // Convert start date to a Date object
      const endDate = new Date(req.body.end);     // Convert end date to a Date object
  
      // Check if start and end are valid date objects
      if (isNaN(startDate) || isNaN(endDate)) {
        return res.status(400).send("Invalid date format");
      }
  
      dailyorders = await Order.find({
        date: {
          $gte: startDate,
          $lte: endDate
        },status: { $in: ['pending', 'shipped', 'delivered'] }
      }).populate("address");
      // Use the $match stage to filter data between start and end dates
     // const dailyorders = await Order.aggregate([
     //   {
     //     $match: {
     //       date: {
     //         $gte: start,
     //         $lte: end,
     //       },
     //       status: { $in: ['pending', 'shipped', 'delivered'] },
     //     },
     //   },
     //   {
     //     $lookup: {
     //       from: "Address", // The name of the "adress" collection
     //       localField: "address",
     //       foreignField: "_id",
     //       as: "address",
     //     },
     //   },
     //   {
     //     $unwind: "$Address", // If you expect multiple addresses for an order, use $unwind to destructure the array
     //   },
     // ]);
       totalOrderBill = dailyorders.reduce((total, order) => total + order.total, 0);
      console.log(dailyorders);
      const formattedOrders = dailyorders.map(order => {
        const formattedDate = moment(dailyorders.date).format('DD,MM,YYYY');
        return { ...order.toObject(), date: formattedDate }
    })

  
      res.render('report.hbs', {
        dailyorders :formattedOrders || [],
        totalOrderBill
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Errorr");
    }
  };
  
const reportDownload = async(req,res)=>{
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sales Data");
  worksheet.columns = [
    { header: "Order ID", key: "orderId", width: 10 },
    { header: "Delivery Name", key: "deliveryName", width: 20 },
    { header: "Order Date", key: "orderDate", width: 15 },
    { header: "Discount", key: "discount", width: 10 },
    { header: "Total Bill", key: "totalBill", width: 10 },
    { header: "totalOrders", key: "totalOrders", width: 10 },
    { header: "totalRevenue", key: "totalRevenue", width: 20 },
  ];

  dailyorders.forEach((order) => {
    worksheet.addRow({
      orderId: order.orderId,
      deliveryName: order.address.name,
      orderDate: order.date,
      discount: order.discount,
      totalBill: order.total,
    });
  });
  worksheet.addRow({
    totalOrders: dailyorders.length,
    totalRevenue: totalOrderBill,
  });
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=" + "SalesData.xlsx"
  );

  workbook.xlsx
    .write(res)
    .then(() => {
      res.end();
    })
    .catch((err) => {

      res.status(500).send("An error occurred while generating the Excel file");
    });
}

module.exports = {
    loadReport,
    postReport,
    reportDownload
}