const User = require('../models/user')
const Product = require('../models/product')
const Address = require('../models/address')
const Order = require('../models/order')
const path = require('path');
const fs = require('fs');
const hbs = require('hbs');
const moment = require("moment");
const easyinvoice = require('easyinvoice');

const { validateHeaderValue } = require('http');

const myOrders = async (req, res) => {
    try {



        const PAGE_SIZE = 10; // Number of items per page
        const page = parseInt(req.query.page, 10) || 1; // Ensure to specify radix 10
        const totalOrders = await User.countDocuments();

        const totalPages = Math.ceil(totalOrders / PAGE_SIZE);
        const skip = (page - 1) * PAGE_SIZE;


        const userData = req.session.userData;
        const userId = userData._id

        // console.log(userData, "From orderDetails")
        const orders = await Order.find({ userId }).sort({ date: -1 }).skip(skip).limit(PAGE_SIZE);


        const formattedOrders = orders.map(order => {
            const formattedDate = moment(order.date).format('MMMM D,YYYY');
            return { ...order.toObject(), date: formattedDate }
        })

        // console.log("orders" + orders)
console.log(page)
        res.render('my_orders', {
            userData,
            myOrders: formattedOrders || [],
            page,
            currentPage: page,
            totalPages: totalPages,
            itemsPerPage: PAGE_SIZE,
        })
    } catch (error) {
        console.log(error.message)
    }
}

hbs.registerHelper("addOne", function (value) {
    return value + 1;
});


hbs.registerHelper("eq", function (a, b) {
    return a === b;
});

hbs.registerHelper("grt", function (a, b) {
    return a >b;
});

  
hbs.registerHelper("noteq", function (a, b) {
    return a !== b;
});
hbs.registerHelper("or", function (a, b) {
    return a || b;
});

hbs.registerHelper("formatDate", function (date, format) {
    const options = {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    };
    const formattedDate = new Date(date).toLocaleString("en-US", options);
    return formattedDate;
});

hbs.registerHelper("for", function (from, to, incr, block) {
    let accum = "";
    for (let i = from; i <= to; i += incr) {
        accum += block.fn(i);
    }
    return accum;
});



const orderDetails = async (req, res) => {
    try {
        const userData = req.session.userData;
        const orderId = req.query.id;
        const myOrderDetails = await Order.findById(orderId);
        const orderedProDet = myOrderDetails.product;
        console.log(orderedProDet)
        const addressId = myOrderDetails.address;
        const address = await Address.findById(addressId)
        res.render('order_Details', { myOrderDetails, orderedProDet, userData, address });
    } catch (err) {
        console.log(err)
    }
}
const orderSuccess = (req, res) => {
    try {
        const userData = req.session.userData
        res.render('order_success', { userData })
    } catch (error) {
        console.log(error.message);
    }
}
const orderCancel = async (req, res) => {
    try {

        const userId = req.session.userData._id;
        const userData = await User.findById(userId)
        const orderId = req.body.id

        const orderData = await Order.findById(orderId)
        const paymentMethod = orderData.paymentMethod

        const currentBalance = userData.wallet

        const refundAmount = orderData.total;

        const updateTotalAmount = currentBalance + refundAmount
        console.log(updateTotalAmount, 146666);
        const date = new Date();
        if (paymentMethod == "razorpay" || paymentMethod == "wallet") {
            console.log('this is inside if')
            const updatewalletAmount = await User.findByIdAndUpdate(
                userData._id,
                { $set: { wallet: updateTotalAmount } , $push: { walletHistory: { date: date, amount: refundAmount,type:"Refund" } }},
                { new: true })
            console.log("order completed");
        }
        const { id } = req.body;
        let productDetails = await Order.findById(orderId)
        let orderProduct = productDetails.product
        orderProduct.forEach(async item => {
            const productId = item.id
            const qty = item.quantity
            console.log(qty, "Quantity From place Order........")
            const product = await Product.findById(productId)
            const stock = product.quantity
            const updatedStock = stock + qty
            console.log(updatedStock, "updatedQuantity From place Order........")

            await Product.updateOne(
                { _id: productId },
                { $set: { quantity: updatedStock } }
            );
        })
        const updatedData = await Order.findByIdAndUpdate(
            { _id: id },
            { status: "Cancelled" },
            { new: true }
        );
        res.json(updatedData);
    } catch (error) {
        console.log(error.message);
    }
};

// Return Order
const orderReturn = async (req, res) => {
    try {

        const userId = req.session.userData._id;
        const userData = await User.findById(userId)
        const orderId = req.body.id

        const orderData = await Order.findById(orderId)
        const paymentMethod = orderData.paymentMethod
        const currentBalance = userData.wallet
        const refundAmount = orderData.total;

        const updateTotalAmount = currentBalance + refundAmount
        console.log(updateTotalAmount, 182222);


        const updatewalletAmount = await User.findByIdAndUpdate(

            userData._id,
            { $set: { wallet: updateTotalAmount },  $push: { walletHistory: { date: date, amount: amount,type:"Refund" } } },
            { new: true })
        let productDetails = await Order.findById(orderId)
        let orderProduct = productDetails.product
        orderProduct.forEach(async item => {
            const productId = item.id
            const qty = item.quantity
            console.log(qty, "Quantity From place Order........")
            const product = await Product.findById(productId)
            const stock = product.quantity
            const updatedStock = stock + qty
            console.log(updatedStock, "updatedQuantity From place Order........")

            await Product.updateOne(
                { _id: productId },
                { $set: { quantity: updatedStock } }
            );
        })
        console.log("order completed");
        const { id } = req.body;
        const updatedData = await Order.findByIdAndUpdate(
            id,
            { status: 'Returned' },
            { new: true }
        );
        res.json(updatedData);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Something went wrong' });
    }
};


const getInvoice = async (req, res) => {
    try {
        const orderId = req.query.id;
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).send({ message: 'Order not found' });
        }
        const { userId, address: addressId } = order;

        const [user, address] = await Promise.all([
            User.findById(userId),
            Address.findById(addressId),
        ]);

        const products = order.product.map((product) => ({
            quantity: product.quantity.toString(),
            description: product.name,
            price: product.price,

        }));

        const date = moment(order.date).format('MMMM D, YYYY');

        if (!user || !address) {
            return res.status(404).send({ message: 'User or address not found' });
        }

        const filename = `invoice_${orderId}.pdf`;

        const data = {
            currency: 'INR',
            taxNotation: 'GST',
            marginTop: 25,
            marginRight: 25,
            marginLeft: 25,
            marginBottom: 25,
            background: 'https://public.easyinvoice.cloud/img/watermark-draft.jpg',
            // Your own data
            sender: {
                company: 'Shopwise',
                address: 'Hustle Hub,Hsr Layout',
                zip: '500502',
                city: 'Banglore',
                country: 'India',
            },
            // Your recipient
            client: {
                company: user.name,
                address: address.adressLine1,
                zip: address.pin,
                city: address.city,
                country: 'India',
            },

            information: {
                // Invoice number
                number: "2023.0001",
                // Invoice data
                date: date,
                // Invoice due date
                // duedate: "31-12-2024"
            },
            // invoiceNumber: '2023001',
            // invoiceDate: date,
            products: products

        };

        // easyinvoice.createInvoice(data, function (result) {

        easyinvoice.createInvoice(data, function (result) {
            const fileName = 'invoice.pdf'
            const pdfBuffer = Buffer.from(result.pdf, 'base64');
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
            res.send(pdfBuffer);
        })
        console.log('PDF base64 string: ');
        // });
    }
    catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
};
const filter = async (req, res) => {
    try {
        const orederStatus = req.query.orderType
        if (orederStatus === "Delivered") {
            const data = await Order.find({ status: orederStatus })
            console.log(data)
            res.json({ data: data })
        } else if (orederStatus === "Cancelled") {
            const data = await Order.find({ status: orederStatus })
            console.log(data)
            res.json({ data: data })
        }

    } catch (err) {
        console.log(err)
    }
}

const orderByDate = async (req, res) => {
    try {
        const start = new Date(req.body.start); // Convert start date to a Date object
        const end = new Date(req.body.end);     // Convert end date to a Date object
        const PAGE_SIZE = 10; // Number of items per page
        const page = parseInt(req.query.page, 10) || 1; // Ensure to specify radix 10
        const totalOrders = await User.countDocuments();

        const totalPages = Math.ceil(totalOrders / PAGE_SIZE);
        const skip = (page - 1) * PAGE_SIZE;


        const userData = req.session.userData;
        const userId = userData._id
        // Check if start and end are valid date objects
        if (isNaN(start) || isNaN(end)) {
            return res.status(400).send("Invalid date format");
        }

        // Use the $match stage to filter data between start and end dates
        const orders = await Order.find({
            $or: [
              {
                userId: userId, // Your user ID condition
                date: {
                  $gte: start,
                  $lte: end,
                },
              },
              // Add more conditions if needed
            ],
          })
            .sort({ date: -1 })
            .skip(skip)
            .limit(PAGE_SIZE);

            const formattedOrders = orders.map(order => {
                const formattedDate = moment(order.date).format('DD,MM,YYYY');
                return { ...order.toObject(), date: formattedDate }
            })
        
        

            res.render('my_orders', {
                userData,
                myOrders: formattedOrders || [],
                currentPage: page,
                totalPages: totalPages,
                itemsPerPage: PAGE_SIZE,
            })
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Errorr");
    }
}
module.exports = {
    myOrders,
    orderSuccess,
    orderDetails,
    orderCancel,
    orderReturn,
    getInvoice,
    filter,
    orderByDate

}