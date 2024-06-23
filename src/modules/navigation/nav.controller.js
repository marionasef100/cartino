import { productModel } from "../../../DB/Models/product.model.js";


//get costumer current position
export const getuserPos=async(req,res,next)=>{

    const{ _barcode}=req.body
    const currentPos =await productModel.findOne({barcode:_barcode})
  
    if (!currentPos) {
      res.status(201).json({message:"pls scan another item"})
    }
    const indX=currentPos.indexX
    const indY=currentPos.indexY

    console.log(indX,indY);

}