import nodemailer from 'nodemailer'

export async function sendEmailService({
  to,
  subject,
  message,
  attachments = [],
} = {}) {
  // configurations
  const transporter = nodemailer.createTransport({
    host: 'localhost', 
    port: 587, 
    secure: false, 
    service: 'gmail',
    auth: {
      user: 'marionasef22@gmail.com',
      pass: 'gtrjecgfxjoaadae',
    },
  })

  const emailInfo = await transporter.sendMail({
    from: '"Fred Foo 👻" <amiraezaat824@gmail.com>',
    to: to ? to : '',
    subject: subject ? subject : 'Hello',
    html: message ? message : '',
    attachments,
  })
  if (emailInfo.accepted.length) {
    return true
  }
  return false
}
