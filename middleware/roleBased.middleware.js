

const roleBased = (requiredRole) =>{
    return (req , res , next)=>{
        if(requiredRole === req.user.role){
            next()
        }
        return res.status(403).json({message:"You are not authorised person for this action."})
    }
}

module.exports = roleBased