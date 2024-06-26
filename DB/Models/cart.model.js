

import { Schema, model } from 'mongoose'

const cartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'IUser',
      required: true,
    },
    products: [
      {
        title:{
          type:String,
          ref:'product',
          required:true
        },
        price:{
          type:Number,
          ref:'product',
          required:true

        },
        _id:{
          type: Schema.Types.ObjectId,
          ref: 'product',
          required: true
        },
        barcode: {
          type:Number,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },

        Images: [
          {
            secure_url: {
              type: String,
              required: true,
            },
            public_id: {
              type: String,
              required: true,
            },
          },
        ],
      
      }
    ],
    subTotal: {
      type: Number,
      required: true,
      default:0
    },
  },
  {
    timestamps: true,
  },
)

export const cartModel = model('cart', cartSchema)
