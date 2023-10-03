const path = require('path')
const multer = require('multer')

let storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,path.join(__dirname,'/public/productImages'))
    },
    filename:(req,file,cb)=>{
        let name = Date.now+'-'+file.originalname
        cb(null,name)
    }
})

var upload = multer({
    storage:storage,
    fileFilter:(req,file,callback)=>{
        if(file.mimetype == "image/png"||
            file.mimetype == "image/jpg"
            ){
                callback(null,true)
            }else{
                console.log("only jpeg and png")
            }
    }
})


module.exports = {
    upload
}