import {shopcartModel} from '../../../DB/Models/shopcart.model.js'
import { cartModel } from '../../../DB/Models/cart.model.js';
import { cashModel } from '../../../DB/Models/cash.js';
//==============cashlogin================//
export const empCash = async (req, res, next) => {
    const empId = req.authUser._id;

    if (!await cashModel.findOne({usedby:empId})) {
      
        const cashObject = {
          usedby:empId,
      
        }
      
        const cahsSetup = await cashModel.create(cashObject)
      
        res.status(200).json({ message: 'emp in duty ', cahsSetup })
    }
  }




//================ emp chosse cart ========
export const choosecartAtcash = async (req, res, next) => {
    const empId = req.authUser._id;
    const { number } = req.body;

  const choosecart= await shopcartModel.findOne({numberoncart:number}) 
  const cashChosee=await cashModel.findOne({usedby:empId})

cashChosee.cart.products=choosecart.products
cashChosee.subTotal=choosecart.subTotal
  

  cashChosee.save()

  res.status(200).json({ message: 'Done', cashChosee })
}

//============emp delete item =========
export const empDeleteitem = async (req, res, next) => {
    const empId = req.authUser._id;
    const { barcode } = req.body;

  const cashChosee=await cashModel.findOne({usedby:empId})
  cashChosee.cart.products.forEach(async (ele) => {
    if (ele.barcode == barcode) {
      cashChosee.cart.products.splice(cashChosee.cart.products.indexOf(ele), 1);
      const newsubtotal=cashChosee.subTotal-ele.price*ele.quantity
      cashChosee.subTotal=newsubtotal
      await cashChosee.save();
    }
  });
  

  res.status(200).json({ message: 'deltet done', cashChosee })
}