const signupModel=require('../model/signupModel')
const loginModel=require('../model/loginModel')
const jwt=require("jsonwebtoken")
require('dotenv').config();


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
     res.render('userAuth/login',{title:"login",layout:"./layout/auth-layout",csspage:'login.css',email:' ',password:' '})
  }catch(err)
  {
    res.send(err.message)
  }
}




const signup = async (req, res) => {
  try {
    const { firstname, lastname, email, number, password, confirmPassword } = req.body;
    
    // Check for existing user
    const existingUser = await signupModel.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered."
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new signupModel({
      firstname,
      lastname,
      email,
      number,
      password: hashedPassword,
      confirmPassword
    });
    
    await user.save();
    
    return res.status(201).json({
      success: true,
      message: "User registered successfully."
    });

  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      success: false,
      message: "An error occurred during signup. Please try again later."
    });
  }
};

const login = async (req, res) => {
  try {
    
    const { email, password } = req.body;

    // Fetch user from the database by email
    const user = await signupModel.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Create JWT token
    const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  

    // Set cookie with secure options
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' ,sameSite: 'Strict',});

   const newUser=new loginModel({
     email,
     password
   })
   console.log(newUser)
   newUser.save()
  
    // Respond with success
    res.status(200).json({
      success: true,
      message: 'Login successful',
    });
  
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login',
    });
  }
};

module.exports={loadsignup,loadLogin,signup,login}