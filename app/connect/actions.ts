'use server'

export async function submitForm(prevState: any, formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const message = formData.get('message') as string
  const extra = (formData.get('extra') as string) || ''
  const selectedOption = (formData.get('selectedOption') as string) || 'Not specified'

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: process.env.WEB3FORMS_ACCESS_KEY,
        subject: `New message from ${name || 'Anonymous'} — ${selectedOption}`,
        from_name: name || 'Anonymous',
        replyto: email || undefined,
        'Selected option': selectedOption,
        Name: name,
        Email: email,
        Message: message,
        'Additional info': extra,
      }),
    })

    const result = await res.json()

    // WHAT: Prints Web3Forms' response to your terminal (the one running
    // `npm run dev`), not the browser console — Server Actions run on the
    // server, so console.log shows up there.
    // WHY: lets you see the exact success/error payload without checking
    // the Web3Forms dashboard.
    console.log('Web3Forms result:', result)

    if (!res.ok || !result.success) {
      console.error('Web3Forms returned an error:', result)
      return { error: 'Failed to send message', success: false }
    }

    return { error: null, success: true }
  } catch (err) {
    // WHAT: Prints the raw JavaScript error — network failures, etc.
    console.error('Form submission threw an exception:', err)
    return { error: 'Failed to send message', success: false }
  }
}