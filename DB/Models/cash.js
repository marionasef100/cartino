


import { Schema, model } from 'mongoose'

const cashSection = new Schema(
  {
    usedby:{
        type:Schema.Types.ObjectId,
        ref:'user'
    },

    cart:{
      
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
      ]},
      subTotal: {
        type: Number,

        default:0
      },

     numberofcash:{
        type:Number,
     },
     token: String,
  },
  {
    timestamps: true,
  },
)

export const cashModel = model('cash', cashSection)