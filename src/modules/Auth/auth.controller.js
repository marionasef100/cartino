import { nanoid } from 'nanoid'
import { userModel } from '../../../DB/Models/user.model.js'
import { sendEmailService } from '../../services/sendEmailService.js'
import { emailTemplate } from '../../utils/emailTemplate.js'
import { generateToken, verifyToken } from '../../utils/tokenFunctions.js'
import pkg from 'bcrypt'
import { OAuth2Client } from 'google-auth-library'

//======================================== SignUp ===========================
export const signUp = async (req, res, next) => {
  const {
    userName,
    email,
    password,
    age,
    gender,
    phoneNumber,
    address,
  } = req.body
  // email check
  const isEmailDuplicate = await userModel.findOne({ email })
  if (isEmailDuplicate) {
    return next(new Error('email is already exist', { cause: 400 }))
  }
  const token = generateToken({
    payload: {
      email,
    },
    signature: process.env.CONFIRMATION_EMAIL_TOKEN,
    expiresIn: '1d',
  })
  const conirmationlink = `${req.protocol}://${req.headers.host}/auth/confirm/${token}`
  const isEmailSent = sendEmailService({
    to: email,
    subject: 'Confirmation Email',
    // message: `<a href=${conirmationlink}>Click here to confirm </a>`,
    message: emailTemplate({
      link: conirmationlink,
      linkData: 'Click here to confirm',
      subject: 'Confirmation Email',
    }),
  })

  if (!isEmailSent) {
    return next(new Error('fail to sent confirmation email', { cause: 400 }))
  }

  // hash password => from hooks
  const user = new userModel({
    userName,
    email,
    password,
    age,
    gender,
    phoneNumber,
    address,
    
  })
  const savedUser = await user.save()
  res.status(201).json({ message: 'Done', savedUser })
}
// =============================== confirm email ===============================
// search on how to save user in db in confirm email api not signUp api
// export const confirmEmail = async (req, res, next) => {
//   const { token } = req.params
//   const decode = verifyToken({
//     token,
//     signature: process.env.CONFIRMATION_EMAIL_TOKEN,
//   })
//   const user = await userModel.findOneAndUpdate(
//     { email: decode?.email, isConfirmed: false },
//     { isConfirmed: true },
//     { new: true },
//   )
//   if (!user) {
//     return next(new Error('already confirmed', { cause: 400 }))
//   }
//   res.status(200).json({ messge: 'Confirmed done, please try to login' })
// }

//=============================== Log In ===============================
export const logIn = async (req, res, next) => {
  const { email, password } = req.body
  const user = await userModel.findOne({ email })
  if (!user) {
    return next(new Error('invalid login credentials', { cause: 400 }))
  }
  const isPassMatch = pkg.compareSync(password, user.password)
  if (!isPassMatch) {
    return next(new Error('wrong password', { cause: 400 }))
  }

  const token = generateToken({
    payload: {
      email,
      _id: user._id,
      role: user.role,
    },
    signature: process.env.SIGN_IN_TOKEN_SECRET,
    expiresIn: '1d',
  })

  const userUpdated = await userModel.findOneAndUpdate(
    { email },
    {
      token,
      status: 'Online',
    },
    {
      new: true,
    },
  )
  res.status(200).json({ messge: 'Login done', userUpdated })
}

//===================================== forget password  =============================
export const forgetPassword = async (req, res, next) => {
  const { email } = req.body
  const user = await userModel.findOne({ email })
  if (!user) {
    return next(new Error('invalid email', { cause: 400 }))
  }
  const code = nanoid()
  const hashedCode = pkg.hashSync(code, +process.env.SALT_ROUNDS)
  const token = generateToken({
    payload: {
      email,
      sentCode: hashedCode,
    },
    signature: process.env.RESET_TOKEN,
    expiresIn: '1h',
  })
  const resetPasswordLink = `${req.protocol}://${req.headers.host}/auth/reset/${token}`
  const isEmailSent = sendEmailService({
    to: email,
    subject: 'Reset Password',
    message: emailTemplate({
      link: resetPasswordLink,
      linkData: 'Click to Reset your password',
      subject: 'Reset Password Email',
    }),
  })
  if (!isEmailSent) {
    return next(new Error('fail to sent reset password email', { cause: 400 }))
  }

  const userUpdates = await userModel.findOneAndUpdate(
    { email },
    {
      forgetCode: hashedCode,
    },
    {
      new: true,
    },
  )
  res.status(200).json({ message: 'Done', userUpdates })
}

//================================ reset password =================================
export const resetPassword = async (req, res, next) => {
  const { token } = req.params
  const decoded = verifyToken({ token, signature: process.env.RESET_TOKEN })
  const user = await userModel.findOne({
    email: decoded?.email,
    forgetCode: decoded?.sentCode,
  })
  if (!user) {
    return next(
      new Error('your already reset your password once before , try to login', {
        cause: 400,
      }),
    )
  }

  const { newPassword } = req.body
  user.password = newPassword
  user.forgetCode = null

  const resetedPassData = await user.save()
  res.status(200).json({ message: 'Done', resetedPassData })
}
//============loginWithGmail====================
export const loginWithGmail = async (req, res, next) => {
  const client = new OAuth2Client()
  const { idToken } = req.body
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    })
    const payload = ticket.getPayload()
    return payload
  }
  const { email_verified, email, name } = await verify()
  if (!email_verified) {
    return next(new Error('invalid email', { cause: 400 }))
  }
  const user = await userModel.findOne({ email, provider: 'GOOGLE' })
  //login
  if (user) {
    const token = generateToken({
      payload: {
        email,
        _id: user._id,
        role: user.role,
      },
      signature: process.env.SIGN_IN_TOKEN_SECRET,
      expiresIn: '1h',
    })

    const userUpdated = await userModel.findOneAndUpdate(
      { email },
      {
        token,
        status: 'Online',
      },
      {
        new: true,
      },
    )
    return res.status(200).json({ messge: 'Login done', userUpdated, token })
  }

  // signUp
  const userObject = {
    userName: name,
    email,
    password: nanoid(6),
    provider: 'GOOGLE',
    isConfirmed: true,
    phoneNumber: ' ',
    role: 'User',
  }
  const newUser = await userModel.create(userObject)
  const token = generateToken({
    payload: {
      email: newUser.email,
      _id: newUser._id,
      role: newUser.role,
    },
    signature: process.env.SIGN_IN_TOKEN_SECRET,
    expiresIn: '1h',
  })
  newUser.token = token
  newUser.status = 'Online'
  await newUser.save()
  res.status(200).json({ message: 'Verified', newUser })
}
