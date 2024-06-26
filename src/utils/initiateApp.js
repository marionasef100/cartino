import { connectionDB } from '../../DB/connection.js'
import { globalResponse } from './errorhandling.js'
import * as routers from '../modules/index.routes.js'
import { changeCouponStatusCron } from './crons.js'
import { gracefulShutdown } from 'node-schedule'
import router from '../modules/subCategories/subCategory.routes.js'

import cors from 'cors'
export const initiateApp = (app, express) => {
  const port = process.env.PORT || 5000

  app.use(express.json())
  connectionDB()
  // cors policy
  app.use('/tablet',routers.tabletRouter)
  app.use(cors())
  app.use('/category', routers.categoryRouter)
  app.use('/subCategory', routers.subCategoryRouter)
  app.use('/brand', routers.brandRouter)
  app.use('/product', routers.productRouter)
  app.use('/coupon', routers.couponRouter)
  app.use('/auth', routers.auhtRouter)
  app.use('/cart', routers.cartRouter)
  app.use('/order', routers.orderRouter)
  app.use('/review', routers.reviewsRouter)
  app.use('/cash',routers.cahsrouter)
  app.use("/navigation",routers.navigationrouter)

  app.all('*', (req, res, next) =>
    res.status(404).json({ message: 'hwa daaa Not Found URL' }),
  )

  changeCouponStatusCron()
  gracefulShutdown()

  app.use(globalResponse)

  app.get('/', (req, res) => res.send('Hello World!'))
  app.listen(port, () => console.log(`Example app listening on port ${port}!`))
}
