import { Schema, model } from 'mongoose'
import pkg from 'bcrypt'
import { systemRoles } from '../../src/utils/systemRoles.js'
const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: systemRoles.USER,
      enum: [systemRoles.USER, systemRoles.ADMIN, systemRoles.SUPER_ADMIN],
    },
    noOfCart:{
      type:Number
  },
    isConfirmed: {
      type: Boolean,
      required: true,
      default: false,
    },
    address: [
      {
        type: String,
        required: true,
      },
    ],
    profilePicture: {
      secure_url: String,
      public_id: String,
    },
    status: {
      type: String,
      default: 'Offline',
      enum: ['Online', 'Offline'],
    },
    gender: {
      type: String,
      default: 'Not specified',
      enum: ['male', 'female', 'Not specified'],
    },
    age: Number,
    token: String,
    forgetCode: String,
    provider: {
      type: String,
      default: 'System',
      enum: ['System', 'GOOGLE', 'facebook'],
    },
  },
  { timestamps: true },
)

userSchema.pre('save', function (next, hash) {
  //   console.log(this.password)
  this.password = pkg.hashSync(this.password, +process.env.SALT_ROUNDS)
  //   console.log(this.password)
  next()
})

export const userModel = model('User', userSchema)
