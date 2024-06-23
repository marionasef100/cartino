import { productModel } from "../../../DB/Models/product.model.js";


//get costumer current position
export const getuserPos=async(req,res,next)=>{

    const{ _barcode}=req.body
    const currentPos =await productModel.findOne({barcode:_barcode})
  
    if (!currentPos) {
      res.status(201).json({message:"pls scan another item"})
    }
     const indX=currentPos.indexX;
     const indY=currentPos.indexY;
    

    res.status(200).json({ message: 'Done', indX,indY })

}


//get item position distination
export const getdestination=async(req ,res,next)=>{
    const { _barcode  } = req.body;
  
  
    const productt = await productModel.findOne({barcode:_barcode});
  
    if (!productt) {
      return next(
        new Error("invalid product please check the qunatity", { cause: 400 })
      );
    }
    const destX=productt.indexX
    const destY=productt.indexY
       
    res.status(200).json({ message: 'your destination is ',destX,destY })
      
}
