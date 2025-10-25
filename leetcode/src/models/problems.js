const mongoose=require('mongoose');
const {Schema}=mongoose;

const problemSchema=new Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true
    },
    difficulty:{
        type:String,
        enum:['easy','medium','hard'],
        required:true
    },
    tags:{
        type:String,
        enum:["array",'string','linkedlist','satck','queue','tree','graph','dynamic programming'],
        required:true
    },
    visibletestcases:[
        {
            input:{
                type:String,
                required:true,
            },
            output:{
                type:String,
                required:true
            },
            explanation:{
                type:String,
                required:true
            }
        }
    ],
    hiddentestcases:[
        {
            input:{
                type:String,
                required:true,
            },
            output:{
                type:String,
                required:true
            }
        }
    ],
    startcode:[
        {
            language:{
                type:String,
                required:true
            },
            initialcode:{
                type:String,
                required:true
            }
        }
    ],
    refrencesol:[
        {
            language:{
                type:String,
                required:true
            },
            completecode:{
                type:String,
                required:true
            }
        }
    ],
    problemCreator:{
        type: Schema.Types.ObjectId,
        ref:'user',
        required:true
    }
});

const Problem = mongoose.model('problem',problemSchema);

module.exports = Problem;