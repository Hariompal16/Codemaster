const User=require("../models/user");
const bcrypt=require('bcrypt');
const jwt=require("jsonwebtoken");
const validate=require('../utils/validater');
const redisClient = require("../config/redis");
const submission = require("../models/submissions");



const register=async (req,res)=>{

   try{
    validate(req.body);

    const {firstName,emailId,password}=req.body;
     
    req.body.password=await bcrypt.hash(password,10);
   const user= await User.create(req.body);
   const reply={
      firstName:user.firstName,
      emailId:user.emailId,
      _id:user._id,
      role:user.role
   }
    
    const token=jwt.sign({emailId:emailId,_id:user._id,role:user.role},process.env.JWT_SECRET,{expiresIn:60*60});
    res.cookie('token',token,{maxAge:60*60*1000});
    res.json({
  user:reply,
  message:"registered succesfully"
    });
   }
   catch(err){
    throw new Error("error"+err);
   }
}

const login = async (req,res)=>{

    try{
        const {emailId, password} = req.body;

        if(!emailId)
            throw new Error("Invalid Credentials");
        if(!password)
            throw new Error("Invalid Credentials");

        const user = await User.findOne({emailId});

        const match =await bcrypt.compare(password,user.password);

        if(!match)
            throw new Error("Invalid Credentials");

        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role:user.role,
        }

        const token =  jwt.sign({_id:user._id , emailId:emailId, role:user.role},process.env.JWT_SECRET,{expiresIn: 60*60});
        res.cookie('token',token,{maxAge: 60*60*1000});
        res.status(201).json({
            user:reply,
            message:"Loggin Successfully"
        })
    }
    catch(err){
        res.status(401).send("Error: "+err);
    }
}


const logout=async(req,res)=>{
   try{
   const {token}=req.cookies;
   const payload=jwt.decode(token);
    await redisClient.set(`token:${token}`,"blocked");
    await redisClient.expireAt(`token:${token}`,payload.exp);

    res.cookie("token",null,{expires:new Date(Date.now())});
    res.send("logged out succesfully");
   }
   catch(err){
      console.log("err"+err);
   }

}
const adminregister=async (req,res)=>{
  
   try{
      validate(req.body);
  
      const {firstName,emailId,password}=req.body;
       
      req.body.password=await bcrypt.hash(password,10);
      req.body.role='admin';
     const user= await User.create(req.body);
      
      const token=jwt.sign({emailId:emailId,_id:user._id,role:user.role},process.env.JWT_SECRET,{expiresIn:60*60});
      res.cookie('token',token,{maxAge:60*60*1000});
      res.send("user registered succesfully");
     }
     catch(err){
      throw new Error("error"+err);
     }
}
const deleteuser=async(req,res)=>{
     try{
      const userId=req.result._id;
     await User.findByIdAndDelete(userId);

     await submission.findByIdAndDelete(userId);

     res.send("deleted succesfully");
     }
     catch(err){
      res.send("error"+err);
     }
}


module.exports={register,login,logout,adminregister,deleteuser};