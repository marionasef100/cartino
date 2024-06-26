import { Router } from 'express'
const router = Router()
import * as cc from './cart.controller.js'
import { asyncHandler } from '../../utils/errorhandling.js'
import { isAuth } from '../../middlewares/auth.js'
import { systemRoles } from '../../utils/systemRoles.js'

router.post('/', isAuth([systemRoles.USER]), asyncHandler(cc.addToCart))
router.delete('/', isAuth(systemRoles.USER), asyncHandler(cc.deleteFromCart))
router.get('/',isAuth(systemRoles.USER),asyncHandler(cc.getAllitemfromlist))
export default router
