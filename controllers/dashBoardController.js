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


const dayData = async (req, res) => {
  try {
    const orderDate = moment()
    const startDate = moment(orderDate, 'YYYY-MM-DD').startOf('day').toDate();
    const endDate = moment(orderDate, 'YYYY-MM-DD').endOf('day').toDate();
    console.log(orderDate, "orderDate");
    console.log(startDate, "startDate");
    console.log(endDate, "endDate");
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const salesData = await Order.aggregate([
      {
        $match: {
          date: {
            $gte: startDate,
            $lte: endDate,
          },
          status: { $in: ['pending', 'shipped', 'delivered'] }, 
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$date',
            },
          },
          totalSales: { $sum: '$total' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    console.log(salesData);
    console.log("month");
    const chartData = salesData.map((entry) => ({
      y: moment(entry._id, 'YYYY-MM-DD').format('DD'), // Extract the date as a string
      a: entry.totalSales,
    }));
    res.json({ chartData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const oneWeekData = async(req,res)=>{
  try {
    const orderDate = moment()
    const startDate = moment(orderDate, 'YYYY-MM-DD').startOf('week').toDate();
    const endDate = moment(orderDate, 'YYYY-MM-DD').endOf('week').toDate();
    console.log(orderDate, "orderDate");
    console.log(startDate, "startDate");
    console.log(endDate, "endDate");
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const salesData = await Order.aggregate([
      {
        $match: {
          date: {
            $gte: startDate,
            $lte: endDate,
          },
          status: { $in: ['pending', 'shipped', 'delivered'] }, 
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$date',
            },
          },
          totalSales: { $sum: '$total' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    console.log(salesData);
    console.log("mo545nth");

    const chartData = salesData.map((entry) => ({
      y: moment(entry._id, 'YYYY-MM-DD').format('DD'), // Extract the date as a string
      a: entry.totalSales,
    }));
    console.log(chartData);
    res.json({ chartData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}


const monthData = async (req, res) => {
  try {
    const orderDate = moment()
    const startDate = moment(orderDate, 'YYYY-MM-DD').startOf('month').toDate();
    const endDate = moment(orderDate, 'YYYY-MM-DD').endOf('day').toDate();
    console.log(orderDate, "orderDate");
    console.log(startDate, "startDate");
    console.log(endDate, "endDate");
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const salesData = await Order.aggregate([
      {
        $match: {
          date: {
            $gte: startDate,
            $lte: endDate,
          },
          status: { $in: ['pending', 'shipped', 'delivered'] }, 
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$date',
            },
          },
          totalSales: { $sum: '$total' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    console.log(salesData);
    console.log("month");

    const chartData = salesData.map((entry) => ({
      y: moment(entry._id, 'YYYY-MM-DD').format('DD'), // Extract the date as a string
      a: entry.totalSales,
    }));
    console.log(chartData);
    res.json({ chartData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
    oneWeekData,
    monthData,
    dayData
}


