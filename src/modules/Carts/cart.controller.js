import { cartModel } from "../../../DB/Models/cart.model.js";
import { productModel } from "../../../DB/Models/product.model.js";

// ====================== add to cart ======================
export const addToCart = async (req, res, next) => {
  const userId = req.authUser._id;
  const { _barcode, quantity } = req.body;
  const product = await productModel.findOne({
    barcode: _barcode,
    stock: { $gte: quantity },
  });

  if (!product) {
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
      userCart.products.push({ _barcode, quantity,pricePerUnit });
    }

    // subtotal
    for (const product of userCart.products) {
      // const productExists = await productModel.findById(product.barcode);
      subTotal += product.quantity *product.pricePerUnit;
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
    return res.status(200).json({ message: "Updated done", cartUpdate });
  }

  //new cart
  const cartObject = {
    userId,
    products: [{ barcode: _barcode, quantity,pricePerUnit:product.price }],
    subTotal: quantity * product.price,
  };
  const cartdb = await cartModel.create(cartObject);
  res.status(201).json({ message: "Done", cartdb });
};

// ====================== delete from cart ==========================
export const deleteFromCart = async (req, res, next) => {
  const userId = req.authUser._id;
  const { _barcode } = req.body;
  const product = await productModel.findOne({
    barcode: _barcode,
  });

  if (!product) {
    return next(new Error("invalid product ", { cause: 400 }));
  }

  const userCart = await cartModel.findOne({
    userId,
    "products.barcode": _barcode,
  });
  if (!userCart) {
    return next(new Error("invalid cart", { cause: 400 }));
  }
  userCart.products.forEach((ele) => {
    if (ele.barcode == _barcode) {
      userCart.products.splice(userCart.products.indexOf(ele), 1);
    }
    const newsubtotal=userCart.subTotal-userCart.products.pricePerUnit
  });


  await userCart.save();
  res.status(200).json({ message: "Done", userCart });
};


