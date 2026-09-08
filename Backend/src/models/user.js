const mongoose=require('mongoose');
const {Schema}=mongoose;

const userSchema=new Schema({
    firstName:{
        type:String,
        minLenght:3,
        maxLenght:30,
        required:true
    },
    lastName:{
        type:String,
        minLenght:2,
        maxLenght:30,
    },
    emailId:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        immutable:true,
        lowercase:true,
    },
    age:{
        type:Number,
        min:8,
        max:80,
    },
    password:{
        type:String,
        required:true,
    },
    problemsolved:{
       type:[{
            type:Schema.Types.ObjectId,
            ref:'problem'
        }],
        unique:true
        
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    }
},{
    timestamps:true
})

const User=mongoose.model("User",userSchema);
module.exports=User;