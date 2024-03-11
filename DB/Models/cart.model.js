
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

        barcode: {
          type: Number,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        pricePerUnit:{
          type:Number,
          ref:'product',
          required:true,
        },
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
