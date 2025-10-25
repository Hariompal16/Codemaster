
const Problem=require("../models/problems");
const submission=require("../models/submissions");
const {getlanguagebyid,submitBatch,submittoken}=require('../utils/problemutitlity');
const DailyProblem = require('../models/dailyproblem');
const UserDailyProgress = require('../models/userdailyPrgress');
const submitCode=async(req,res)=>{
   try{
        const userId=req.result._id;
     const problemId=req.params.id;

     let {code,language}=req.body;
     if(!userId||!problemId||!code||!language){
        return res.send("field is missing");
     }

     const problem=await Problem.findById(problemId);
     // Normalize language names
     if(language.toLowerCase() === 'cpp' || language.toLowerCase() === 'c++'){
        language = 'c++';
     } else {
        language = language.toLowerCase();
     }

     const submit= await submission.create({
        problemId,
        userId,
        code,
        language,
        status:'pending',
        testCasesTotal:problem.hiddentestcases.length
})

    const languageid=getlanguagebyid(language);
   const submissions=problem.hiddentestcases.map((testcase)=>({
         source_code:code,
         language_id:languageid,
         stdin:testcase.input,
         expected_output:testcase.output
        }));
         const submitresult=await submitBatch(submissions);

        const testtoken=submitresult.map((value)=>value.token);
           
         const testresult=await submittoken(testtoken);

         let testcasespassed=0;
         let runtime=0;
         let memory=0;
         let status='accepted';
         let errorMessage=null;
       for(const test of testresult){
        console.log('Test result:', test); // Debug logging
        if(test.status_id === 3){ // Accepted
           testcasespassed++;
           runtime = runtime + parseFloat(test.time || 0);
           memory = Math.max(memory, test.memory || 0);
        } else {
          if(test.status_id === 4){ // Wrong Answer
            status = 'wrong';
            errorMessage = test.stderr || test.compile_output || 'Wrong Answer';
          } else if(test.status_id === 6){ // Compilation Error
            status = 'error';
            errorMessage = test.stderr || test.compile_output || 'Compilation Error';
          } else { // Other errors
            status = 'error';
            errorMessage = test.stderr || test.compile_output || `Status ID: ${test.status_id}`;
          }
          break; // Stop on first failure
        }
    }


    submit.status   = status;
    submit.testCasesPassed = testcasespassed;
    submit.errorMessage = errorMessage;
    submit.runtime = runtime;
    submit.memory = memory;

    await submit.save();
   if(status === 'accepted' && !req.result.problemsolved.includes(problemId)){
      req.result.problemsolved.push(problemId);
      await req.result.save();

      // Mark daily progress if this is today's daily problem
      try {
        // Get today's date in UTC at midnight
        const today = new Date();
        const utcYear = today.getUTCFullYear();
        const utcMonth = today.getUTCMonth();
        const utcDate = today.getUTCDate();
        
        const todayUTC = new Date(Date.UTC(utcYear, utcMonth, utcDate, 0, 0, 0, 0));
        const tomorrowUTC = new Date(Date.UTC(utcYear, utcMonth, utcDate + 1, 0, 0, 0, 0));

        console.log('🔍 DEBUG: Checking for today\'s daily problem');
        console.log('🔍 DEBUG: Today (UTC):', todayUTC.toISOString());
        console.log('🔍 DEBUG: Tomorrow (UTC):', tomorrowUTC.toISOString());
        console.log('🔍 DEBUG: Problem ID being submitted:', problemId);

        // Check if this problem is today's daily problem
        const dailyProblem = await DailyProblem.findOne({
          problemId,
          date: { $gte: todayUTC, $lt: tomorrowUTC }
        });

        console.log('🔍 DEBUG: Daily problem found:', dailyProblem);

        if (dailyProblem) {
          // Mark the daily progress as solved
          console.log('✅ Found today\'s daily problem! Marking user progress...');
          console.log('✅ Creating/updating UserDailyProgress record...');
          console.log('✅ userId:', userId);
          console.log('✅ problemId:', problemId);
          console.log('✅ date:', todayUTC);
          
          try {
            // First try to find existing record
            let progressRecord = await UserDailyProgress.findOne({
              userId,
              problemId,
              date: { $gte: todayUTC, $lt: tomorrowUTC }
            });

            if (progressRecord) {
              console.log('✅ Found existing record, updating status to solved');
              progressRecord.status = 'solved';
              await progressRecord.save();
              console.log('✅ Record updated:', progressRecord);
            } else {
              console.log('✅ No existing record found, creating new one');
              // Create new record
              const newRecord = new UserDailyProgress({
                userId,
                problemId,
                date: todayUTC,
                status: 'solved'
              });
              
              const savedRecord = await newRecord.save();
              console.log('✅ New UserDailyProgress record created:', savedRecord);
              progressRecord = savedRecord;
            }
            
            console.log('✅ UserDailyProgress record successfully processed');
            console.log('✅ User streak should update now');
          } catch (createError) {
            console.error('❌ Error creating UserDailyProgress record:', createError);
            throw createError;
          }
        } else {
          console.log('⚠️  This problem is not today\'s daily problem');
        }
      } catch (dailyError) {
        console.error('❌ Error marking daily progress:', dailyError);
        // Don't fail the submission if daily progress marking fails
      }
   }
    const accepted = (status == 'accepted')
    res.status(201).json({
      accepted,
      totalTestCases: submit.testCasesTotal,
      passedTestCases: testcasespassed,
      runtime,
      memory
    });
   }
   catch(err){
    res.send("Internal Server Error "+ err);
   }
  
}


const runcode=async(req,res)=>{

   try{
      
        const userId=req.result._id;
     const problemId=req.params.id;

     let {code,language}=req.body;
     if(!userId||!problemId||!code||!language){
        return res.send("field is missing");
     }

     const problem=await Problem.findById(problemId);
     
     // Normalize language names
     if(language.toLowerCase() === 'cpp' || language.toLowerCase() === 'c++'){
        language = 'c++';
     } else {
        language = language.toLowerCase();
     }

    const languageid=getlanguagebyid(language);
   const submissions=problem.visibletestcases.map((testcase)=>({
         source_code:code,
         language_id:languageid,
         stdin:testcase.input,
         expected_output:testcase.output
        }));
         const submitresult=await submitBatch(submissions);

        const testtoken=submitresult.map((value)=>value.token);
           
         const testresult=await submittoken(testtoken);
    
     let testcasespassed=0;
         let runtime=0;
         let memory=0;
         let status=true;
         let errorMessage=null;
  for(const test of testresult){
        console.log('Run test result:', test); // Debug logging
        if(test.status_id === 3){ // Accepted
           testcasespassed++;
           runtime = runtime + parseFloat(test.time || 0);
           memory = Math.max(memory, test.memory || 0);
        } else {
          status = false;
          if(test.status_id === 6){ // Compilation Error
            errorMessage = test.stderr || test.compile_output || 'Compilation Error';
          } else {
            errorMessage = test.stderr || test.compile_output || `Status ID: ${test.status_id}`;
          }
          break; // Stop on first failure
        }
    }

         

    res.json({
      success:status,
      testcase:testresult,
      runtime,
      memory
    })
   }
   catch(err){
      res.send("error"+err);
   }
}

module.exports={submitCode,runcode};