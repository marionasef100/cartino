import { nanoid } from 'nanoid'
import { cartModel } from '../../../DB/Models/cart.model.js'
import { couponModel } from '../../../DB/Models/coupon.model.js'
import { orderModel } from '../../../DB/Models/order.model.js'
import { productModel } from '../../../DB/Models/product.model.js'
import { couponValidationFunction } from '../../utils/couponValidation.js'
import createInvoice from '../../utils/pdfkit.js'
import { productRouter } from '../index.routes.js'
import { sendEmailService } from '../../services/sendEmailService.js'

//=============================== create order ===============
export const createOrder = async (req, res, next) => {
  const userId = req.authUser._id
  const {
    address,
    phoneNumbers,
    productId,
    quantity,
    paymentMethod,
    couponCode,
  } = req.body

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

  // ================== products checks ============
  const product = await productModel.findOne({
    _id: productId,
    stock: { $gte: quantity },
  })
  if (!product) {
    return next(new Error('not valid product', { cause: 400 }))
  }

  const products = []
  products.push({
    productId,
    quantity,
    title: product.title,
    price: product.priceAfterDiscount,
    finalPrice: product.priceAfterDiscount * quantity,
  })

  // ===================== subTotal =================
  const subTotal = product.priceAfterDiscount * quantity

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
    userId,
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
  // =========================== invoice generation =====================
  const orderCode = `${req.authUser.userName}_${nanoid(3)}`
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
  await createInvoice(orderinvoice, `${orderCode}.pdf`)
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
  await productModel.findOneAndUpdate(
    { _id: productId },
    {
      //   stock,inc
      $inc: { stock: -parseInt(quantity) },
    },
  )
  // increase coupon Usage
  if (req.coupon) {
    for (const user of req.coupon?.couponAssginedToUsers) {
      if (user.userId.toString() == userId.toString()) {
        user.usageCount += 1
      }
    }
    await req.coupon.save()
  }

  res.status(201).json({ message: 'Done', orderDB })
}

//============================== convert cart to order ===============
export const fromCartToOrde = async (req, res, next) => {
  const { cartId } = req.query
  const userId = req.authUser._id

  const { paymentMethod, address, phoneNumbers, couponCode } = req.body
  const cart = await cartModel.findById(cartId)
  if (!cart || !cart.products.length) {
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
  for (const product of cart.products) {
    const productExist = await productModel.findById(product.productId)
    products.push({
      productId: product.productId,
      quantity: product.quantity,
      title: productExist.title,
      price: productExist.priceAfterDiscount,
      finalPrice: productExist.priceAfterDiscount * product.quantity,
    })
  }

  //=============== subTotal ==============
  const subTotal = cart.subTotal

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
    userId,
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

  // =========================== invoice generation =====================
  const orderCode = `${req.authUser.userName}_${nanoid(3)}`
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
  await createInvoice(orderinvoice, `${orderCode}.pdf`)
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
  for (const product of cart.products) {
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

  cart.products = []
  await cart.save()
  res.status(201).json({ message: 'done', orderDB, cart })
}

