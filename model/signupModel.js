const mongoose=require('mongoose');

const signupSchema=new mongoose.Schema({
  firstname:{
    type:String,
    required:true
  },
  lastname:{
    type:String,
    required:true
  },
  number:{
    type:Number,
    required:true
  },
  email:{
    type:String,
    required:true
  },
  password:{
    type:String,
    required:true
  },
  confirmPassword:{
    type:String,
    required:true
  }
})

module.exports=mongoose.model('signup',signupSchema);
