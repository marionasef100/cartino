import { Router } from 'express'
const router = Router()
import * as bc from './brand.controller.js'
import { asyncHandler } from '../../utils/errorhandling.js'
import { multerCloudFunction } from '../../services/multerCloud.js'
import { allowedExtensions } from '../../utils/allowedExtensions.js'
import { isAuth } from '../../middlewares/auth.js'
import { brandApisRoles } from './brand.endppints.js'


// TODO: api validation
router.post(
  '/',isAuth(brandApisRoles.CREAT_CATEGORY),
  multerCloudFunction(allowedExtensions.Image).single('logo')//,asyncHandler(bc.addBrand),
)

router.get('/',asyncHandler(bc.getAllbrands))
export default router
