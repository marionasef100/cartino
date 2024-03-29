import {shopcartModel} from '../../../DB/Models/shopcart.model.js'
import { cartModel } from '../../../DB/Models/cart.model.js';
//================init new tablet ========
export const inittablet = async (req, res, next) => {
  const userId = req.authUser._id;
  const { Qr } = req.body;



  if (await shopcartModel.findOne({QrCode:Qr})) {
    return next(
      new Error('please enter different qr code', { cause: 400 }),
    )
  }
  const shopcartobject = {
    QrCode:Qr,
    createdby: userId,

  }

  const newtablet = await shopcartModel.create(shopcartobject)

  res.status(200).json({ message: 'tablet init  Done', newtablet })
}

//============scan qr code and show list=========
export const showlist=async(req,res,next)=>{
  const id=req.authUser._id;
  const{qr}=req.body
  const findcart =await shopcartModel.findOneAndUpdate({QrCode:qr},{$set:{usedby:id}})

  if (!findcart) {
    res.status(201).json({message:"no available cart"})
  }
const listfind=await cartModel.findOne({userId:id})
if (!listfind) {
  res.status(400).json({message:"pls create list first"})
}
 findcart.products=listfind.products
findcart.subTotal=listfind.subTotal


findcart.save()
res.json({message:"done",findcart})
// const shopcartupdate =await shopcartModel.findOneAndUpdate({qr},{$set:{qrscan=listfind.products}})


}

