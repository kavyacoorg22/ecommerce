const productModel=require("../model/productModel")

const home = async (req, res) => {
  try {
    const products=await productModel.find({isDeleted:false})
    res.render('user/home', { title: "Home",products });
  } catch (err) {
    res.status(500).send(err.message); 
  }
};

const shop = async (req, res) => {
  try {
    
    res.render('user/shop', { title: "shop" });
  } catch (err) {
    res.status(500).send(err.message); // Send an error response if something goes wrong
  }
};
const product = async (req, res) => {
  try {
    
    res.render('user/product', { title: "product" });
  } catch (err) {
    res.status(500).send(err.message); 
  }
};
module.exports = { home,shop,product };
