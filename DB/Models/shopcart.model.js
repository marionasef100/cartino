

import { Schema, model } from 'mongoose'

const shopingcartSchema = new Schema(
  {
    usedby:{
        type:Schema.Types.ObjectId,
        ref:'user'
    },
    products: [
        {
          title:{
            type:String,
            ref:'product',
           
          },
          price:{
            type:Number,
            ref:'product',
           
  
          },
          _id:{
            type: Schema.Types.ObjectId,
            ref: 'product',
            
          },
          barcode: {
            type: Number,
            ref: 'Product',
            
          },
          quantity:{
            type: Number,
          },
        
        }
      ],
      subTotal: {
        type: Number,

        default:0
      },

    QrCode:{
        type:Number,
        required:true
    },
    createdby: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required:true,
      },
  },
  {
    timestamps: true,
  },
)

export const shopcartModel = model('shopcart', shopingcartSchema)