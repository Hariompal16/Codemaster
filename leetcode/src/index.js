const express=require("express");
const app=express();
require("dotenv").config();
const main=require('./config/db');
const redisClient=require('./config/redis');

require('./cron/dailyProblemCron');
const cookieParser=require("cookie-parser");
const userauth=require("./routes/userauth");
const problemRouter=require("./routes/problemcreator");
const submitrouter=require('./routes/submit');
const videoRouter=require("./routes/videoCreator")
const cors=require("cors")
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: https://leetcode-fronten.onrender.com,
    credentials: true 
}))

app.use("/user",userauth);
app.use('/problem',problemRouter)
app.use('/submit',submitrouter);
app.use('/video',videoRouter)

const intializeconnect=async()=>{
     await Promise.all([main(),redisClient.connect()]);
     console.log("connected to DB");
     app.listen(process.env.PORT,()=>{
                console.log("listening at port :"+process.env.PORT);
                console.log("connected to db");
            })

}
intializeconnect();

