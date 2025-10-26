const jwt=require('jsonwebtoken');
const redisClient=require('../config/redis');
const user=require('../models/user');


const userMiddleware = async (req,res,next)=>{

  try{
     
      const {token} = req.cookies;
      
      if(!token)
          throw new Error("Token is not persent");

      const payload = jwt.verify(token,process.env.JWT_SECRET);
     

      const {_id} = payload;

      if(!_id){
          throw new Error("Invalid token");
      }

      const result = await user.findById(_id);
     

      if(!result){
          throw new Error("User Doesn't Exist");
      }

      // Redis ke blockList mein persent toh nahi hai

      const IsBlocked = await redisClient.exists(`token:${token}`);
     

      if(IsBlocked)
          throw new Error("Invalid Token");

      req.result = result;
     

      next();
  }
  catch(err){
      console.error('🔐 Authentication failed:', err.message);
      res.status(401).send("Error: "+err);
  }

}

module.exports=userMiddleware;
