const express=require('express');
const problemRouter=express.Router();
const adminMiddleware=require('../middleware/adminMiddleware');
const {problemCreate,problemUpdate,problemDelete,problemFetch,getAllProblem,solvedProblem,solvedsubmission, dailyproblem,markDailyProblemProgress,getDailyStreak}=require("../controllers/createproblem");
const userMiddleware = require('../middleware/usermiddleware');

problemRouter.post("/create",adminMiddleware,problemCreate);
problemRouter.patch("/update/:id",adminMiddleware, problemUpdate);
problemRouter.delete("/delete/:id",adminMiddleware,problemDelete);


problemRouter.get("/problemfetch/:id",problemFetch);
problemRouter.get("/daily-problem",dailyproblem)
problemRouter.post("/daily-progress", userMiddleware, markDailyProblemProgress);
problemRouter.get("/daily-streak", userMiddleware, getDailyStreak);
problemRouter.get("/getallproblem", getAllProblem);
problemRouter.get("/solvedProblem",userMiddleware,solvedProblem);
problemRouter.get("/solvedsubmission/:pid",userMiddleware,solvedsubmission);

module.exports = problemRouter;
