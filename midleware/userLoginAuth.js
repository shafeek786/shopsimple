const isLogin = async(req,res,next)=>{
    try{
        if(req.session.userData){

        }else{
            res.redirect('/login')
        }
        next()
    }catch(err){
        console.log(err)
    }
}

const isLogout = async(req,res,next)=>{
    try{
        if(req.session.userData){
           
           return res.redirect('/')
        }
       
        next()
   
    
    }catch(error){
        console.log(error.message)
    }
}


module.exports = {
    isLogin,
    isLogout
}