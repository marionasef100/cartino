import { Router } from 'express'
const router = Router()
import * as CC from './cash.controller.js'
import { asyncHandler } from '../../utils/errorhandling.js'
import { isAuth } from '../../middlewares/auth.js'
import { systemRoles } from '../../utils/systemRoles.js'

router.post('/', isAuth([systemRoles.ADMIN]), asyncHandler(CC.empCash))
router.get('/', isAuth(systemRoles.ADMIN), asyncHandler(CC.choosecartAtcash))
router.delete('/',isAuth(systemRoles.ADMIN),asyncHandler(CC.empDeleteitem))
router.post('/checkout',isAuth(systemRoles.ADMIN),asyncHandler(CC.checkout))
export default router
