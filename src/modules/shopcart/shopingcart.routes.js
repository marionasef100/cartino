import { Router } from 'express'
const router = Router()
import * as sc from './shopingcart.controller.js'
import { asyncHandler } from '../../utils/errorhandling.js'
import { isAuth } from '../../middlewares/auth.js'
import { systemRoles } from '../../utils/systemRoles.js'

router.post('/', isAuth([systemRoles.ADMIN]), asyncHandler(sc.inittablet))
router.get('/', isAuth(systemRoles.USER), asyncHandler(sc.showlist))
export default router
