const validator=require('validator');


const validate=async(data)=>{
    
    const mandatoryField = ['firstName',"emailId",'password'];

    const IsAllowed = mandatoryField.every((k)=> Object.keys(data).includes(k));

    if(!IsAllowed){
        throw new Error("field is missing");
    }

    if(!validator.isEmail(data.emailId)){
           throw new Error("email is incorrect");
    }
    if(!validator.isStrongPassword(data.password)){
        throw new Error("weak password");
    }
}

module.exports=validate;
