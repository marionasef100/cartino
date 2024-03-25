import { cartModel } from "../../../DB/Models/cart.model.js";
import { productModel } from "../../../DB/Models/product.model.js";
import { shopcartModel } from "../../../DB/Models/shopcart.model.js";

// ====================== add to cart ======================
export const addToCart = async (req, res, next) => {
  const userId = req.authUser._id;
  const { _barcode, quantity } = req.body;


  const productt = await productModel.findOne({
    barcode: _barcode,
    stock: { $gte: quantity },
  });

  if (!productt) {
    return next(
      new Error("invalid product please check the qunatity", { cause: 400 })
    );
  }

  const userCart = await cartModel.findOne({ userId }).lean();
  // have a cart
  if (userCart) {
    let updateFlag = false;
    let subTotal = 0;
    for (const product of userCart.products) {
      // update quantity
      if (product.barcode == _barcode) {
        product.quantity = quantity;
        updateFlag = true;
      }
    }
    // push product
    if (!updateFlag) {
      userCart.products.push({barcode:_barcode, quantity,title:productt.title,_id:productt._id,price:productt.price});
    }

    // subtotal
    for (const product of userCart.products) {
     //const productExists = await productModel.findById(product.barcode);
      subTotal += product.quantity *product.price;
    }
    const cartUpdate = await cartModel.findOneAndUpdate(
      { userId },
      {
        subTotal,
        products: userCart.products,
      },
      {
        new: true,
      }
    );
    const usingcart=await shopcartModel.findOne({usedby:userId})
    if(!usingcart){
      return res.status(200).json({ message: "Updated done", cartUpdate });
    }
    usingcart.products=userCart.products
    usingcart.subTotal=userCart.subTotal
    await usingcart.save();
    return res.status(200).json({ message: "Updated ", usingcart });

    
  }

  //new cart
  const cartObject = {
    userId,
    products: [{ _id:productt._id, title:productt.title , barcode: _barcode, quantity,price:productt.price}],
    subTotal: quantity * productt.price,
  }
  const cartdb = await cartModel.create(cartObject);
  res.status(201).json({ message: "Done", cartdb });
  
 
  
  
};

// ====================== delete from cart ==========================
export const deleteFromCart = async (req, res, next) => {
  const userId = req.authUser._id;
  const { _id } = req.body;

  const product = await productModel.findOne({
    _id: _id,
  });

  if (!product) {
    return next(new Error("invalid product ", { cause: 400 }));
  }

  const userCart = await cartModel.findOne({
    userId,
    // "products._id": _id,
  });

  if (!userCart) {
    return next(new Error("invalid cart", { cause: 400 }));
  }
  userCart.products.forEach(async (ele) => {
    if (ele._id == _id) {
      userCart.products.splice(userCart.products.indexOf(ele), 1);
      const newsubtotal=userCart.subTotal-ele.price*ele.quantity
      userCart.subTotal=newsubtotal
      await userCart.save();
    }
  });
  
  const usingcart=await shopcartModel.findOne({usedby:userId})
    if(!usingcart){
      res.status(200).json({ message: "Done", userCart });
    }
    usingcart.products=userCart.products
    usingcart.subTotal=userCart.subTotal
    usingcart.save();
    if(userCart.subTotal==0){
      await cartModel.deleteOne({userCart})
      await shopcartModel.deleteOne({usingcart})
      return res.status(200).json({ message: "your cart is empty" });
    }
    return res.status(200).json({ message: "Updated ", usingcart });
    
  


};



