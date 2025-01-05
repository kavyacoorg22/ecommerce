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
    const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = 8; // Products per page
        const skip = (page - 1) * limit;  //1-1*3=0 ,,,2-1*3=3
    
        // Fetch products with pagination
        const products = await productModel.find({ isDeleted: false })
                                      .skip(skip)
                                      .limit(limit);
    
        // Total products for pagination
        const totalProducts = await productModel.countDocuments({ isDeleted: false });
        const totalPages = Math.ceil(totalProducts / limit);
    
       
        
    
    res.render('user/shop', { title: "shop",products,page,totalPages });
  } catch (err) {
    res.status(500).send(err.message); // Send an error response if something goes wrong
  }
};
const product = async (req, res) => {
  try {
    const {id}=req.params;
    const product=await productModel.findById(id)
    const relatedProducts=await productModel.find({isDeleted:false})
    res.render('user/product', { title: "product" ,product,relatedProducts});
  } catch (err) {
    res.status(500).send(err.message); 
  }
};
module.exports = { home,shop,product };
