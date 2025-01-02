const express=require('express');
const router=express.Router();
const userAuthController=require('../controller/userAuthController')
const validateSignUpData=require('../middleware/signupvalidate')


router.get('/signup',userAuthController.loadsignup)
router.post('/signup',validateSignUpData,userAuthController.signup)


router.get('/login',userAuthController.loadLogin)

module.exports=router