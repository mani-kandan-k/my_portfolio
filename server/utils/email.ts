// PUB-8: contact-form delivery via Resend. Plain fetch — no SDK dependency.
// Delivery is best-effort: a missing key/inbox or a failed send returns false
// (the message is still stored with emailDelivered=false), never throws.

interface ContactEmailInput {
  name: string
  email: string
  message: string
}

export async function sendContactEmail({ name, email, message }: ContactEmailInput): Promise<boolean> {
  const config = useRuntimeConfig()
  if (!config.resendApiKey || !config.contactToEmail) return false

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Resend's shared test sender — replace with a verified domain for prod
        // (README M8 checklist).
        from: 'Portfolio <onboarding@resend.dev>',
        to: [config.contactToEmail],
        subject: `Portfolio contact from ${name}`,
        reply_to: email,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      }),
    })
    if (!res.ok) {
      console.error('[contact] Resend rejected:', res.status, await res.text().catch(() => ''))
      return false
    }
    return true
  } catch (err) {
    console.error('[contact] Resend send failed:', err)
    return false
  }
}
