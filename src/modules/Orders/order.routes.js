import { Router } from 'express'
const router = Router()

import * as oc from './order.controller.js'
import { isAuth } from '../../middlewares/auth.js'
import { asyncHandler } from '../../utils/errorhandling.js'
import { validationCoreFunction } from '../../middlewares/validation.js'
import { createOrderSchema } from './order.validationSchemas.js'
import { systemRoles } from '../../utils/systemRoles.js'

router.post(
  '/',
  isAuth([systemRoles.USER]),
  validationCoreFunction(createOrderSchema),
  asyncHandler(oc.createOrder),
)

router.post('/cartToOrder', isAuth([systemRoles.USER]), asyncHandler(oc.fromCartToOrde))

export default router
