import {shopcartModel} from '../../../DB/Models/shopcart.model.js'
import { cartModel } from '../../../DB/Models/cart.model.js';
import { userModel } from '../../../DB/Models/user.model.js';
//================init new tablet ========
export const inittablet = async (req, res, next) => {
  const userId = req.authUser._id;
  const { Qr ,number} = req.body;



  if (await shopcartModel.findOne({QrCode:Qr})) {
    return next(
      new Error('please enter different qr code', { cause: 400 }),
    )
  }
  const shopcartobject = {
    QrCode:Qr,
    numberoncart:number,
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
  const userToken =await userModel.findOne({_id:id})
  const listfind=await cartModel.findOne({userId:id})
 if (!listfind) {
  res.status(400).json({message:"pls create list first"})
 }
 findcart.products=listfind.products
 findcart.subTotal=listfind.subTotal
 findcart.token=userToken.token 
 userToken.Qr=findcart.QrCode

 await userToken.save()
await findcart.save()
res.json({message:"done",findcart})
// const shopcartupdate =await shopcartModel.findOneAndUpdate({qr},{$set:{qrscan=listfind.products}})


}

///===============api to get token of user just scanned the barcode=====

export const usertoken =async(req,res,next)=>{
const {qr} =req.body
const cartqr=await shopcartModel.findOne({QrCode:qr})
const token=await userModel.findOne({Qr:cartqr.QrCode})

res.json({message:"user token is ",token})

}