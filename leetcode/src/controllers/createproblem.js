
const Problem=require('../models/problems');
const submission = require('../models/submissions');
const User = require('../models/user');
const SolutionVideo =require("../models/solutionVideo")
const {getlanguagebyid,submitBatch,submittoken}=require('../utils/problemutitlity');
const DailyProblem = require('../models/dailyproblem');
const UserDailyProgress = require('../models/userdailyPrgress');
const problemCreate=async(req,res)=>{
    await redisClient.del("allproblems");
    const {title,description,difficulty,tags,visibletestcases,hiddentestcases,startcode,refrencesol,problemCreator}=req.body;
 
  try{
    for(const {language,completecode} of refrencesol){
        const languageid=getlanguagebyid(language);
       
      
        const submissions=visibletestcases.map((testcase)=>({
         source_code:completecode,
         language_id:languageid,
         stdin:testcase.input,
         expected_output:testcase.output
        }));
    
 
    const submitresult=await submitBatch(submissions);
     
     
    const testtoken=submitresult.map((value)=>value.token);
     
   const testresult=await submittoken(testtoken);
    

    for(const test of testresult){
      if(test.status_id!=3){
       return res.status(400).send("Error Occured");
      }
     }
  
  }
  await Problem.create({
    ...req.body,
    problemCreator:req.result._id
  }
  );

  res.send("problem created successfully");
  
}
  catch(err){
      console.log("error"+err);
  }
}
const problemUpdate=async(req,res)=>{

  const {title,description,difficulty,tags,visibletestcases,hiddentestcases,startcode,refrencesol,problemCreator}=req.body;
     const {id}=req.params;

  try{
   
  if(!id){
      return res.send("id is missing");
  }

  const isproblem=await Problem.findById(id);
  if(!isproblem){
   return  res.send("problem is not found");
  }

  for(const {language,completecode} of refrencesol){
        const languageid=getlanguagebyid(language);
      
        const submissions=visibletestcases.map((testcase)=>({
         source_code:completecode,
         language_id:languageid,
         stdin:testcase.input,
         expected_output:testcase.output
        }));
    
 
    const submitresult=await submitBatch(submissions);

     
    const testtoken=submitresult.map((value)=>value.token);

   const testresult=await submittoken(testtoken);


    for(const test of testresult){
      if(test.status_id!=3){
       return res.status(400).send("Error Occured");
      }
     }
  
  }
const newproblem=  await Problem.findByIdAndUpdate(id,{...req.body},{runValidators:true,new:true});

  res.send(newproblem);

  }
  catch(err){
    console.log("error"+err);
  }
}

const problemDelete=async(req,res)=>{
  const {id}=req.params;
  try{
        if(!id){
          return res.send("id is missing");
        }

     const deleted=await Problem.findByIdAndDelete(id);
     if(!deleted){
      return  res.send("problem is missing");
     }

     res.send("problem delted succesfully");
  }
  catch(err){
    console.log("error"+err);
  }
}
const problemFetch=async(req,res)=>{
  const {id} = req.params;
  try{
     
    if(!id)
      return res.status(400).send("ID is Missing");

    const getProblem = await Problem.findById(id).select('_id title description difficulty tags visibletestcases startcode refrencesol');
   
   if(!getProblem)
    return res.status(404).send("Problem is Missing");

    const videos = await SolutionVideo.findOne({problemId:id});

   if(videos){   
    
   const responseData = {
    ...getProblem.toObject(),
    secureUrl:videos.secureUrl,
    thumbnailUrl : videos.thumbnailUrl,
    duration : videos.duration,
   } 
  
   return res.status(200).send(responseData);
   }

   
   res.status(200).send(getProblem);
  }
  catch(err){
    res.status(500).send("Error: "+err);
  }
}
const getAllProblem=async(req,res)=>{
  try{
       const cached= await redisClient.get("allproblems");
       if(cached){
        return res.send(JSON.parse(cached));
       }
     const problems= await Problem.find({}).select('_id title tags  difficulty');
     if(problems.length==0){
      return res.send("problem is missing");
     }
  await redisClient.set("allproblems",JSON.stringify(problems));
     res.send(problems);
  }
  catch(err){
    res.send("error"+err);
  }
}

const solvedProblem=async(req,res)=>{
   try{
       
      const userId = req.result._id;
      

      const user =  await User.findById(userId).populate({
        path:"problemsolved",
        select:"_id title difficulty tags"
      });
      
      res.status(200).send(user.problemsolved);

    }
    catch(err){
      res.status(500).send("Server Error");
    }
}

const solvedsubmission = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.pid;

    const ans = await submission.find({ userId, problemId });

    if (ans.length === 0) {
      return res.status(200).json([]);  // Return an empty array for consistency
    }

    res.status(200).json(ans);
  } catch (err) {
    console.error('Error fetching submissions:', err);
    res.status(500).json({ error: 'Server error while fetching submissions' });
  }
};

const dailyproblem = async (req, res) => {
  try {
    // Get today's date in UTC at midnight
    const nowUTC = new Date();
    const utcYear = nowUTC.getUTCFullYear();
    const utcMonth = nowUTC.getUTCMonth();
    const utcDate = nowUTC.getUTCDate();
    const today = new Date(Date.UTC(utcYear, utcMonth, utcDate, 0, 0, 0, 0));
    const tomorrow = new Date(Date.UTC(utcYear, utcMonth, utcDate + 1, 0, 0, 0, 0));
    
    let daily = await DailyProblem.findOne({ 
      date: {
        $gte: today,
        $lt: tomorrow
      }
    }).populate({
      path: 'problemId',
      select: '_id title description difficulty tags visibletestcases startcode'
    });

    if (!daily) {
      // Fallback: create today's problem if it doesn't exist
      const allProblems = await Problem.find();
      if (allProblems.length === 0) {
        return res.status(404).json({ 
          message: 'No problems available for daily challenge' 
        });
      }
      
      const randomIndex = Math.floor(Math.random() * allProblems.length);
      const chosenProblem = allProblems[randomIndex];

      daily = await DailyProblem.create({
        date: today,
        problemId: chosenProblem._id
      });
      
      // Populate the created entry
      daily = await DailyProblem.findById(daily._id).populate({
        path: 'problemId',
        select: '_id title description difficulty tags visibletestcases startcode'
      });
    }

    // Check if user has solved today's problem (if authenticated)
    let userProgress = null;
    if (req.result && req.result._id) {
      userProgress = await UserDailyProgress.findOne({
        userId: req.result._id,
        date: {
          $gte: today,
          $lt: tomorrow
        },
        problemId: daily.problemId._id
      });
    }

    res.json({
      date: today.toISOString().split('T')[0],
      problem: daily.problemId,
      solved: userProgress ? userProgress.status === 'solved' : false
    });
  } catch (error) {
    console.error('Error fetching daily problem:', error);
    res.status(500).json({ 
      message: 'Error fetching daily problem',
      error: error.message 
    });
  }
}

const markDailyProblemProgress = async (req, res) => {
  try {
    
    const { problemId, status } = req.body;
    const userId = req.result._id;
    

    // Validate status
    if (!['solved', 'unsolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Get today's date in UTC at midnight
    const nowUTC = new Date();
    const utcYear = nowUTC.getUTCFullYear();
    const utcMonth = nowUTC.getUTCMonth();
    const utcDate = nowUTC.getUTCDate();
    const today = new Date(Date.UTC(utcYear, utcMonth, utcDate, 0, 0, 0, 0));
    const tomorrow = new Date(Date.UTC(utcYear, utcMonth, utcDate + 1, 0, 0, 0, 0));

    // Verify this is today's daily problem
    const dailyProblem = await DailyProblem.findOne({
      problemId,
      date: { $gte: today, $lt: tomorrow }
    });
   
    if (!dailyProblem) {
      return res.status(400).json({ message: 'This is not today\'s daily problem' });
    }

    // Update or create user progress
    const updatedProgress = await UserDailyProgress.findOneAndUpdate(
      {
        userId,
        problemId,
        date: { $gte: today, $lt: tomorrow }
      },
      {
        userId,
        problemId,
        date: today,
        status
      },
      { upsert: true, new: true }
    );
   

    // Recalculate streak after marking progress
    const progress = await UserDailyProgress.find({ userId, status: 'solved' })
      .sort({ date: -1 });

    

    let currentStreak = 0;
    let checkDate = new Date(today);

    for (const record of progress) {
      const recordDate = new Date(record.date);
      recordDate.setUTCHours(0, 0, 0, 0);

      if (recordDate.getTime() === checkDate.getTime()) {
        currentStreak++;
        checkDate.setUTCDate(checkDate.getUTCDate() - 1);
      } else if (recordDate.getTime() < checkDate.getTime()) {
        break; // Streak broken
      }
    }

   
    res.json({
      message: 'Daily problem progress updated',
      currentStreak,
      totalSolved: progress.length
    });

  } catch (error) {
    console.error('Error updating daily progress:', error);
    res.status(500).json({
      message: 'Error updating progress',
      error: error.message
    });
  }
};



const getDailyStreak = async (req, res) => {
  try {
   
    const userId = req.result._id;

    
    // Get today's date in UTC at midnight
    const nowUTC = new Date();
    const utcYear = nowUTC.getUTCFullYear();
    const utcMonth = nowUTC.getUTCMonth();
    const utcDate = nowUTC.getUTCDate();
    const today = new Date(Date.UTC(utcYear, utcMonth, utcDate, 0, 0, 0, 0));
  
    
    // Get user's daily progress sorted by date descending
    const progress = await UserDailyProgress.find({
      userId,
      status: 'solved'
    }).sort({ date: -1 }).limit(365); // Check last 365 days max
    
   
  ;
    
    if (progress.length === 0) {
      console.log('⚠️  No solved problems found!');
      return res.json({
        currentStreak: 0,
        totalSolved: 0
      });
    }
    
    let currentStreak = 0;
    let checkDate = new Date(today);
    
 
    
    // Calculate current streak
    for (let i = 0; i < progress.length; i++) {
      const record = progress[i];
      const recordDate = new Date(record.date);
      recordDate.setUTCHours(0, 0, 0, 0);
      
  
      
      if (recordDate.getTime() === checkDate.getTime()) {
        currentStreak++;
        checkDate.setUTCDate(checkDate.getUTCDate() - 1);
       
      } else if (recordDate.getTime() < checkDate.getTime()) {
        console.log(`❌ [${i}] GAP FOUND! Record is older than expected. Breaking streak.`);
        break;
      } else {
        console.log(`⚠️  [${i}] Record is NEWER than expected. This shouldn't happen with descending sort.`);
      }
    }
    
  
    
    res.json({
      currentStreak,
      totalSolved: progress.length
    });
  } catch (error) {
    console.error('❌ Error calculating daily streak:', error);
    res.status(500).json({
      message: 'Error calculating streak',
      error: error.message
    });
  }
};


module.exports={problemCreate,problemUpdate,problemDelete,problemFetch,getAllProblem,solvedProblem,solvedsubmission,dailyproblem,markDailyProblemProgress,getDailyStreak};
