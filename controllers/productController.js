const Product = require("../models/product");
const User = require("../models/user");
const category = require("../models/category");
const path = require('path');
const { log, error } = require("console");
const sharp  = require('sharp')

const loadProducts = async (req, res) => {
    try {

        const PAGE_SIZE = 10; // Number of items per page
        const page = parseInt(req.query.page, 10) || 1; // Ensure to specify radix 10
        const totalProducts = await User.countDocuments();

        const totalPages = Math.ceil(totalProducts / PAGE_SIZE);
        const skip = (page - 1) * PAGE_SIZE;
        const productdata = await Product.find().populate("category").sort({ name: 1 }).skip(skip).limit(PAGE_SIZE);


        const categorydata = await category.find();

        // console.log(productdata);
        res.render('products.hbs', {
            Product: productdata, categorydata,
             page,
            totalPages: totalPages,
            itemsPerPage: PAGE_SIZE,
        });
    } catch (error) {
        console.log(error.message);
    }
}
const loadAddProduct = async (req, res) => {
    try {
        const categorydata = await category.find();
        res.render('addproduct.hbs', { categorydata });
    } catch (error) {
        
        console.log(error.message);
    }
}
const verifyAddProduct = async (req, res) => {
    try {
        const catData = await category.find()
        const errors = {};
        if (Object.values(req.body).some(value => !value.trim() || value.trim().length === 0)) {
            errors.name = 'Please Update a product name.';
            errors.description = 'Please Update a product description.';
            errors.images = 'Please Update image'
            errors.brand = 'Please update a brand name'
            errors.price = 'please update provide price'
            errors.quantity = 'Please  Update provide Quantity'
            errors.category = 'Please select category '
            errors.status = 'Please select category '
            errors.size = 'Please enter size '
            res.render('addproduct.hbs', { message: "", errors ,categorydata: catData })
        }
        else if(req.body.price < 0){
            errors.price = '-ve price not allowed'
            return res.render('addproduct.hbs', { message: "", errors ,categorydata: catData })
        }
        const img1 = req.files.img1
        const img2 = req.files.img2
        const img3 = req.files.img3
      
       //  const imagePath = img1[0].path;

        // Resize and convert to PNG format
         // Get the requested cropping dimensions (you can adjust these as needed)
      const width = parseInt(req.query.width) || 100; // Default width
      const height = parseInt(req.query.height) || 100; // Default height
  
      // Use sharp to resize and crop the image
      const croppedImageBuffer = await sharp(req.files.img1[0].path)
        .resize(width, height, { fit: 'cover' }) // Crop to the specified dimensions
        .toFile(req.files.img1[0].filename)
        console.log(img1)
        let imagesPaths1 = [];
        let imagesPaths2 = [];
        let imagesPaths3 = [];
        const basePath = `${req.protocol}://${req.get('host')}/public/productImages/`;

        if (img1) {
            console.log(img1)
          
           
            img1.map(async (file) => {
                try {
                   
                    imagesPaths1.push(`${basePath}${file.filename}`);
        
                 
                } catch (error) {
                    console.error('Error processing image:', error);
                    
                }
            });
        }
        if (img2) {
            img2.map(file => {
                imagesPaths2.push(`${basePath}${file.filename}`);
            })
        }
        if (img3) {
            img3.map(file => {
                imagesPaths3.push(`${basePath}${file.filename}`);
            })
        }
        const product = new Product({
            name: req.body.name,
            description: req.body.description,
            brand: req.body.brand,
            price: req.body.price,
            status:req.body.status,
            category: req.body.category,
            quantity: req.body.quantity,
            size:req.body.size,
            is_blocked: false,
            image1: imagesPaths1,
            image2: imagesPaths2,
            image3: imagesPaths3
        })
        const productData = await product.save()
        if (productData) {
            res.redirect('/admin/addproduct')
        } else {
            res.render('/admin/addproduct')
        }
    } catch (err) {
        console.log(err)
    }

}


const loadEditProduct = async (req, res) => {
    try {

        const id = req.query.id
        console.log(id)

        const productData = await Product.findById(id)

        const catData = await category.find()
        console.log(productData)

        res.render('editproduct.hbs', { details: catData, pdata: productData })
    } catch (err) {
        console.log(err)
    }
}


const verifyEditProduct = async (req, res) => {
    try {
      
        const id = req.body.id
        const himg1 = req.body.himg1
        const himg2 = req.body.himg2
        const himg3 = req.body.himg3
        const img1 = req.files.img1
        const img2 = req.files.img2
        const img3 = req.files.img3
        let imagesPaths1 = [];
        let imagesPaths2 = [];
        let imagesPaths3 = [];
        if (!img1) {

            imagesPaths1.push(`${himg1}`)
        }
        if (!img2) {
           
            imagesPaths2.push(`${himg2}`)
        }
        if (!img3) {
            imagesPaths3.push(`${himg3}`)
        }
        console.log(imagesPaths2)
        const data = await Product.findById({ _id: id })
        const basePath = `${req.protocol}://${req.get('host')}/public/productImages/`;

        if (img1) {
            img1.map(file => {
               
                imagesPaths1.push(`${basePath}${file.filename}`);
            })
        }
        if (img2) {
            img2.map(file => {
                imagesPaths2.push(`${basePath}${file.filename}`);
            })
        }

        if (img3) {
            img3.map(file => {
                imagesPaths3.push(`${basePath}${file.filename}`);
            })
        }
        console.log(imagesPaths1)

        const pdata = await Product.findByIdAndUpdate({ _id: id }, {
            $set: {
                name: req.body.name,
                price: req.body.price,
                category: req.body.category,
                quantity: req.body.stock,
                status: req.body.status,
                size: req.body.size,
                description: req.body.description,
                image1: imagesPaths1,
                image2: imagesPaths2,
                image3: imagesPaths3
            }
        })
        res.redirect('/admin/products')
    } catch (err) {
        console.log(err)
    }
}

const blockProduct = async (req, res) => {
    try {

        await Product.findOneAndUpdate(
            { _id: req.query.id },
            { $set: { is_blocked: true } }
        )
        console.log("block")
        res.redirect('products');
    } catch (error) {
        console.log(error.message)
    }
}

const unBlockProduct = async (req, res) => {

    try {
        await Product.findOneAndUpdate(
            { _id: req.query.id },
            { $set: { is_blocked: false } }
        );
        // console.log(productdata,'line 158..........');
        res.redirect('products');
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadProducts,
    loadAddProduct,
    verifyAddProduct,
    loadEditProduct,
    verifyEditProduct,
    blockProduct,
    unBlockProduct
    
}