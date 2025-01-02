const signupModel=require('../model/signupModel')

const bcrypt=require('bcrypt')


const loadsignup=async(req,res)=>{
  try{
    res.render('userAuth/signup',{title:'Signup',
      layout:'./layout/auth-layout',
      csspage:"signup.css",
      firstname: " ",  
      lastname: " ",
      email: " ",
      number: " ",
      password: " ",
      confirmPassword: " "
    })
  }
  catch(err)
  {
    console.log(err.message)
  }
}

const loadLogin=async(req,res)=>{
  try{
     res.render('userAuth/login',{title:"login",layout:"./layout/auth-layout",csspage:'login.css'})
  }catch(err)
  {
    res.send(err.message)
  }
}

// const login=async(req,res)=>{
//   try{

//   }catch(err)
//   {

//   }
// }

const signup=async(req,res)=>{
  try{
    const { firstname, lastname, email, number, password, confirmPassword } = req.body;
        
      
    
        const exitstingUser=await signupModel.findOne({email:req.body.email})
        if(exitstingUser)
        {
          res.status(400).json({
            success:false,
            message:"Email is already registered."
          })
        }
        //hash password
        const hashedPassword=await bcrypt.hash(password,10)

        //create new user
        const user=new signupModel(
          {
            firstname,
            lastname,
            email,
            number,
            password:hashedPassword,
            confirmPassword
          }
        )
        await user.save();
        
        res.status(201).json({
          success: true,
          message: "User registered successfully.",
        });

  }catch(err)
  {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "An error occurred during signup. Please try again later.",
    });
  }
}
module.exports={loadsignup,loadLogin,signup}