const jwt=require('jsonwebtoken');
const redisClient=require('../config/redis');
const user=require('../models/user');


const userMiddleware = async (req,res,next)=>{

  try{
      console.log('🔐 userMiddleware: Checking authentication');
      const {token} = req.cookies;
      console.log('🔐 Token present:', !!token);
      
      if(!token)
          throw new Error("Token is not persent");

      const payload = jwt.verify(token,process.env.JWT_SECRET);
      console.log('🔐 Token verified, payload:', payload);

      const {_id} = payload;

      if(!_id){
          throw new Error("Invalid token");
      }

      const result = await user.findById(_id);
      console.log('🔐 User found:', !!result);

      if(!result){
          throw new Error("User Doesn't Exist");
      }

      // Redis ke blockList mein persent toh nahi hai

      const IsBlocked = await redisClient.exists(`token:${token}`);
      console.log('🔐 Token blocked:', !!IsBlocked);

      if(IsBlocked)
          throw new Error("Invalid Token");

      req.result = result;
      console.log('🔐 Authentication successful for user:', result._id);

      next();
  }
  catch(err){
      console.error('🔐 Authentication failed:', err.message);
      res.status(401).send("Error: "+err);
  }

}

module.exports=userMiddleware;