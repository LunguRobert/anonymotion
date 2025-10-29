import nodemailer from 'nodemailer'

const smtpUrl = process.env.EMAIL_SERVER
const emailFrom = process.env.EMAIL_FROM

const transporter = nodemailer.createTransport(smtpUrl)

export async function sendEmail(to, subject, html) {
  return transporter.sendMail({
    from: `"Anonymous Journal" <${emailFrom}>`,
    to,
    subject,
    html,
  })
}
