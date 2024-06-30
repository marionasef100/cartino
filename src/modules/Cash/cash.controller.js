import {shopcartModel} from '../../../DB/Models/shopcart.model.js'
import { cartModel } from '../../../DB/Models/cart.model.js';
import { cashModel } from '../../../DB/Models/cash.js';
import { orderModel } from '../../../DB/Models/order.model.js';
import { couponModel } from '../../../DB/Models/coupon.model.js';
import { productModel} from '../../../DB/Models/product.model.js';
import { userModel}from '../../../DB/Models/user.model.js';
import createInvoice from '../../utils/pdfkit.js';
import { sendEmailService } from '../../services/sendEmailService.js';
import { generateToken, verifyToken } from '../../utils/tokenFunctions.js';
import { paymentFunction } from '../../utils/payment.js';
import Stripe from 'stripe'
//=[]=============cashlogin================//
export const empCash = async (req, res, next) => {
    const empId = req.authUser._id;

    if (!await cashModel.findOne({usedby:empId})) {
      
        const cashObject = {
          usedby:empId,
        }
      
        const cahsSetup = await cashModel.create(cashObject)
      
        res.status(200).json({ message: 'emp in duty ', cahsSetup })
    }
    res.status(200).json({message:'emp already in duty'})
  }




//================ emp chosse cart ========
export const choosecartAtcash = async (req, res, next) => {
    const empId = req.authUser._id;
    const { number } = req.query;

  const choosecart= await shopcartModel.findOne({numberoncart:number}) 
  const cashChosee=await cashModel.findOne({usedby:empId})

cashChosee.cart.products=choosecart.products
cashChosee.subTotal=choosecart.subTotal
cashChosee.token=choosecart.token

  cashChosee.save()

  res.status(200).json({ message: 'Done', cashChosee })
}

//============emp delete item =========
export const empDeleteitem = async (req, res, next) => {
    const empId = req.authUser._id;
    const { barcode ,no } = req.body;

  const cashChosee=await cashModel.findOne({usedby:empId})
  const listofuser =await shopcartModel.findOne({numberoncart:no})  
  cashChosee.cart.products.forEach(async (ele) => {
    if (ele.barcode == barcode) {
      cashChosee.cart.products.splice(cashChosee.cart.products.indexOf(ele), 1);
      const newsubtotal=cashChosee.subTotal-(ele.price*ele.quantity)
      cashChosee.subTotal=newsubtotal
      await cashChosee.save();
    }
    
  });
  listofuser.products.forEach(async (ele) => {
    if (ele.barcode == barcode) {
      listofuser.products.splice(listofuser.products.indexOf(ele), 1);
      const newsubtotal=listofuser.subTotal-ele.price*ele.quantity
      listofuser.subTotal=newsubtotal
      await listofuser.save();
    }})

  res.status(200).json({ message: 'deltet done', cashChosee })
}



//==============pay at casher=======================//
export const checkout = async (req, res, next) => {
  // const { cartnumber } = req.query
  const empId = req.authUser._id
  const cahsout = await cashModel.findOne({usedby:empId}) 
  console.log(cahsout);

  const { paymentMethod, address, phoneNumbers, couponCode } = req.body
  ////search of products by cart
  const shopcart = await shopcartModel.findOne({token:cahsout.token})
  if (!shopcart || !shopcart.products.length) {
    return next(new Error('please add products to your cart', { cause: 400 }))
  }
  //=================== couponCode check ==============
  if (couponCode) {
    const coupon = await couponModel
      .findOne({ couponCode })
      .select('isFixedAmount isPercentage couponAmount couponAssginedToUsers')
    const isCouponValid = await couponValidationFunction({
      couponCode,
      userId,
      next,
    }) // TODO: some fixes
    // console.log(isCouponValid)
    if (!isCouponValid == true) {
      return isCouponValid
    }
    req.coupon = coupon
  }

  //=============== products=================
  let products = []
  for (const product of shopcart.products) {
    console.log(product);
    const productExist = await productModel.findById(product._id)
    products.push({
      productId: product._id,
      quantity: product.quantity,
      title: productExist.title,
      price: productExist.priceAfterDiscount,
      finalPrice: productExist.priceAfterDiscount * product.quantity,
     
    })
    
  }

  //=============== subTotal ==============
  const subTotal = shopcart.subTotal

  //===================== paidAmount ================
  let paidAmount
  if (req.coupon?.isPercentage) {
    paidAmount = subTotal * (1 - (req.coupon?.couponAmount || 0) / 100)
  } else if (req.coupon?.isFixedAmount) {
    paidAmount = subTotal - req.coupon.couponAmount
  } else {
    paidAmount = subTotal
  }

  //===================== orderStatus + paymentMethod ================
  let orderStatus
  paymentMethod == 'cash' ? (orderStatus = 'placed') : (orderStatus = 'pending')

  const orderObject = {
    userId:shopcart.usedby,
    products,
    subTotal,
    paidAmount,
    couponId: req.coupon?._id,
    address,
    phoneNumbers,
    paymentMethod,
    orderStatus,
  }

  const orderDB = await orderModel.create(orderObject)
  if (!orderDB) {
    return next(new Error('fail to order'))
  }
  // ======================= payment ================================
  let orderSession
  if (orderDB.paymentMethod == 'card') {
    if (req.coupon) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
      let coupon
      if (req.coupon.isPercentage) {
        coupon = await stripe.coupons.create({
          percent_off: req.coupon.couponAmount,
        })
      }
      if (req.coupon.isFixedAmount) {
        coupon = await stripe.coupons.create({
          amount_off: req.coupon.couponAmount * 100,
          currency: 'EGP',
        })
      }
      req.couponId = coupon.id
    }
    const tokenOrder = generateToken({
      payload: { orderId: orderDB._id },
      signature: process.env.ORDER_TOKEN,
      expiresIn: '1h',
    })
    orderSession = await paymentFunction({
      payment_method_types: [orderDB.paymentMethod],
      mode: 'payment',
      customer_email: req.authUser.email,
      metadata: { orderId: orderDB._id.toString() },
      success_url: `${req.protocol}://${req.headers.host}/order/successOrder?token=${tokenOrder}`,
      cancel_url: `${req.protocol}://${req.headers.host}/order/cancelOrder?token=${tokenOrder}`,
      line_items: orderDB.products.map((ele) => {
        return {
          price_data: {
            currency: 'EGP',
            product_data: {
              name: ele.title,
            },
            unit_amount: ele.price * 100,
          },
          quantity: ele.quantity,
        }
      }),
      discounts: req.couponId ? [{ coupon: req.couponId }] : [],
    })
  }

  // =========================== invoice generation =====================
  const name =await userModel.findOne({_id:empId})
  const orderCode =name.userName 
  const orderinvoice = {
    orderCode,
    date: orderDB.createdAt,
    shipping: {
      name: req.authUser.userName,
      address: orderDB.address,
      city: 'Cairo',
      country: 'cairo',
      state: 'Cairo',
    },
    items: orderDB.products,
    subTotal: orderDB.subTotal,
    paidAmount: orderDB.paidAmount,
  }
  createInvoice(orderinvoice, `${orderCode}.pdf`)
  const isEmailSent = await sendEmailService({
    to: req.authUser.email,
    subject: 'Order Confirmation',
    message: `<h1>please find your invoice attachment below</h1>`,
    attachments: [
      {
        path: `./Files/${orderCode}.pdf`,
      },
    ],
  })
  if (!isEmailSent) {
    return next(new Error('email fail', { cause: 500 }))
  }
  // decrease products stock by quantity
  for (const product of shopcart.products) {
    await productModel.findOneAndUpdate(
      { _id: product.productId },
      {
        $inc: { stock: -parseInt(product.quantity) },
      },
    )
  }
  // increase coupon Usage
  if (req.coupon) {
    for (const user of req.coupon?.couponAssginedToUsers) {
      if (user.userId.toString() == userId.toString()) {
        user.usageCount += 1
      }
    }
    await req.coupon.save()
  }
///==============reset to list and cart at market to another user======
const list =await cartModel.findOne({userId:shopcart.usedby})
//reset cart at amrket   
  shopcart.products = []
  shopcart.subTotal=0
  shopcart.token=''
  shopcart.usedby=null
  // reset list at mobile
list.products=[]
list.subTotal=0
// reset casher
cahsout.cart.products=[]
cahsout.subTotal=0
cahsout.token=''
// save changes
  await cahsout.save()
  await list.save()
  await shopcart.save()
  res.status(201).json({ message: 'done', orderDB,list,shopcart,orderSession })
}