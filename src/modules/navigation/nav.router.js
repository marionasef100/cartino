import { Router } from 'express'
const router = Router()
import * as nC from '..//navigation/nav.controller.js';
import { asyncHandler } from '../../utils/errorhandling.js'

router.get('/', asyncHandler(nC.getuserPos))
router.get('/dest',asyncHandler(nC.getdestination))
router.post('/path',asyncHandler(nC.drawPath))
export default router