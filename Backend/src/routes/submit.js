const express=require('express');
const userMiddleware = require('../middleware/usermiddleware');
const submitrouter=express.Router();
const {submitCode,runcode}=require("../controllers/usersubmission");


submitrouter.post("/submitt/:id",userMiddleware,submitCode);
submitrouter.post("/run/:id",userMiddleware,runcode);
module.exports=submitrouter;

