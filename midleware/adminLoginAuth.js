const isLogin = async(req,res,next)=>{
    try{
        if(req.session.user){
            
        }else{
          return  res.redirect('/admin/login')
        }
        next()
    }catch(err){
        console.log(err)
    }
}

const isLogout = async(req,res,next)=>{
    try{
        if(req.session.user){
           
           return res.redirect('/admin')
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