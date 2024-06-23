import { productModel } from "../../../DB/Models/product.model";


//get costumer current position
export const getuserPos=async(req,res,next)=>{

    const{qr}=req.query
    const currentPos =await productModel.findOne({QrCode:qr})
  
    if (!currentPos) {
      res.status(201).json({message:"pls scan another item"})
    }
    const indX=currentPos.indexX
    const indY=currentPos.indexY

    console.log(indX,indY);

}