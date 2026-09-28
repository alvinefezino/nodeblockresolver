'use server'

import nodemailer from 'nodemailer'

type FormState = {
  error: string | null
  success: boolean
}

export async function submitForm(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  const name = ((formData.get('name') as string) || 'Anonymous').trim()
  const email = ((formData.get('email') as string) || '').trim()
  const message = ((formData.get('message') as string) || '').trim()
  const extra = ((formData.get('extra') as string) || '').trim()
  const selectedOption =
    ((formData.get('selectedOption') as string) || 'Not specified').trim()

  const user = process.env.GMAIL_USER?.trim()
  // Remove any spaces or quotes accidentally copied with the App Password
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/[\s"']/g, '')

  if (!user || !pass) {
    console.error(
      'Missing env vars. GMAIL_USER set:',
      Boolean(user),
      '| GMAIL_APP_PASSWORD set:',
      Boolean(pass)
    )
    return { error: 'Email service is not configured.', success: false }
  }

  if (pass.length !== 16) {
    console.warn(
      `GMAIL_APP_PASSWORD is ${pass.length} characters; a Google App Password should be 16.`
    )
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    })

    // Fails fast with a clear error if the credentials are rejected
    await transporter.verify()

    const info = await transporter.sendMail({
      from: `"Website Form" <${user}>`,
      to: user,
      replyTo: email || undefined,
      subject: `New message from ${name} — ${selectedOption}`,
      text: [
        `Selected option: ${selectedOption}`,
        `Name: ${name}`,
        `Email: ${email}`,
        `Message: ${message}`,
        `Additional info: ${extra}`,
      ].join('\n'),
    })

    console.log('Email sent:', info.messageId)
    return { error: null, success: true }
  } catch (err) {
    console.error('Email send failed:', err)
    return {
      error: 'Failed to send message. Please try again later.',
      success: false,
    }
  }
}