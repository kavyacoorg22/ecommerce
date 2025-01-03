const jwt=require("jsonwebtoken");
const loginModel=require('../model/loginModel')
require('dotenv').config()

const userAuth=async(req,res,next)=>{
  try{
      //read the token from the requested cookie
      const cookies=req.cookies;
      const {token}=cookies
      if(!token)
      {
        throw new Error("token is not valid")
      }
      //validate Token 
      const decoddedObj=await jwt.verify(token,process.env.JWT_SECRET)
      //find the user
      const {_id}=decoddedObj;

      const user=await loginModel.findById(_id)
      if(!user)
      {
        throw new Error("User not found")
      }
      req.user=user   //attaching user to the request handler
      next()
}
  catch(err)
  {
    res.status(400).send("ERROR"+err.message)
  }
}

module.exports={userAuth};