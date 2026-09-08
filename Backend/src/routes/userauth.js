const express=require('express');
const userauth=express.Router();
const usermiddleware=require('../middleware/usermiddleware');
const {register,login,logout,adminregister,deleteuser}=require('../controllers/userauthentication');
const adminMiddleware=require('../middleware/adminMiddleware');
const userMiddleware = require('../middleware/usermiddleware');

userauth.post("/register",register);
userauth.post("/login",login);
userauth.post("/logout",usermiddleware,logout);
userauth.post("/register/admin",adminMiddleware,adminregister);
userauth.post("/delete",usermiddleware,deleteuser);
userauth.post("/check",userMiddleware,(req,res)=>{
   try{
     const reply={
        firstName:req.result.firstName,
        emailId:req.result.emailId,
        _id:req.result._id,
        role:req.result.role
    }
    res.json({
        user:reply,
        message:"valid user"
    })
   }
   catch(error){
    console.log("nduifs");
   }

})


module.exports=userauth;