const signupModel=require('../model/signupModel')

const nodemailer = require('nodemailer');
const jwt=require("jsonwebtoken")
require('dotenv').config();
const bcrypt=require('bcrypt')


// Store OTP and its expiry temporarily (in production, use Redis or similar)
const otpStore = new Map();

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


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

    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Create JWT token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Set cache control headers BEFORE sending any response
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '-1'
    });

    // Set cookie with secure options
    res.cookie("token", token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });

    // Send the response LAST, after setting headers and cookies
    return res.status(200).json({
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

const loademail=async(req,res)=>{
  try{
     res.render('userAuth/email',{title:"email",csspage:"email.css",layout:"./layout/auth-layout"})
  }catch(err)
  {
    res.send(err.message)
  }
}

const email = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate email input
    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: "Email is required" 
      });
    }

    // Find user
    const user = await signupModel.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "Enter registered Email" 
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Set expiry time to 30 seconds
    const expiryTime = Date.now() + 30 * 1000;
    
    // Store OTP with expiry time
    otpStore.set(email, { otp, expiryTime });

    try {
      // Send OTP email
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset OTP',
        text: `Your OTP for password reset is: ${otp}. Valid for 30 seconds.`
      });
      
      // Send success response
      return res.status(200).json({
        success: true,
        message: "OTP has been sent to your email",
        redirectUrl: '/user/otp'  // Include redirect URL if needed
      });

    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Clean up OTP if email fails
      otpStore.delete(email);
      return res.status(500).json({ 
        success: false,
        message: "Failed to send OTP email. Please try again." 
      });
    }

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'An unexpected error occurred. Please try again.' 
    });
  }
};

const password=async(req,res)=>{
  try{
     res.render('userAuth/password',{title:"password",csspage:"password.css",layout:"./layout/auth-layout"})
  }catch(err)
  {
    res.send(err.message)
  }
}

const loadotp=async(req,res)=>{
  
 try{

     res.render('userAuth/otp',{title:"otp",csspage:"otp.css",layout:"./layout/auth-layout"})
  }catch(err)
  {
    res.send(err.message)
  }
}
const verifyotp=async(req,res)=>{
  try {
    const { email, otp } = req.body;
    const storedOTPData = otpStore.get(email);

    if (!storedOTPData) {
      return res.status(400).json({ error: 'OTP expired or invalid' });
    }

    if (Date.now() > storedOTPData.expiryTime) {
      otpStore.delete(email);
      return res.status(400).json({ error: 'OTP expired' });
    }

    if (otp !== storedOTPData.otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    res.render('userAuth/password', { email });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}

const resendotp= async (req, res) => {
  try {
    const { email } = req.body;

    const otp = generateOTP();
    const expiryTime = Date.now() + 30 * 1000;
    otpStore.set(email, { otp, expiryTime });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your new OTP for password reset is: ${otp}. Valid for 30 seconds.`
    });

    res.json({ message: 'OTP resent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}
const resetPassword= async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await signupModel.findOneAndUpdate(
      { email },
      { password: hashedPassword }
    );

    otpStore.delete(email);

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}


module.exports={loadsignup,loadLogin,signup,login,email,verifyotp,password,loademail,loadotp,resendotp,resetPassword}