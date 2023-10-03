const User = require('../models/user')

const checkUserStatus = async(req, res, next) => {
    try {
      console.log("hghjghjai")
        if(req.session.userData){
            const user = req.session.userData
            const userId = user._id
            const userData = await User.findById({_id : userId})
            console.log(userData)
            let isUserBlocked = userData.is_blocked
            if(isUserBlocked=== true){
                req.session.destroy()
                req.app.locals.message = 'You are blocked by admin';
                return res.redirect('/login')
            }
        }
        next();
    } catch (error) {
        next(error)
    }
}


module.exports = {
    
    checkUserStatus
}
