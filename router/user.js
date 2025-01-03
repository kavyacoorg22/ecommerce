const express=require('express');
const router=express.Router();
const userAuthController=require('../controller/userAuthController')
const validateSignUpData=require('../middleware/signupvalidate')
const {userAuth}=require('../middleware/userAuth')
const homeController=require('../controller/homecontroller')


router.get('/signup',userAuthController.loadsignup)
router.post('/signup',validateSignUpData,userAuthController.signup)


router.get('/login',userAuthController.loadLogin)
router.post('/login',userAuthController.login)

router.get('home',userAuth,)

module.exports=router