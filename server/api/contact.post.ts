import { contactMessageSchema } from '~/shared/schemas/engagement'

// PUB-8/9: public contact form. Spam protection = honeypot (`website` must
// stay empty — zod-enforced, a filled honeypot fails validation like any bad
// field) + per-IP rate limit (5/hour, AUTH-9 bucket). The message is always
// stored; email delivery via Resend is best-effort and recorded on the row.
export default defineEventHandler(async (event) => {
  await rateLimit(event, { key: 'contact', limit: 5, windowMs: 60 * 60_000 })

  const { name, email, message } = await readValidatedBody(event, (payload) =>
    contactMessageSchema.parse(payload),
  )

  const row = await prisma.contactMessage.create({
    data: { name, email, message },
  })

  const delivered = await sendContactEmail({ name, email, message })
  if (delivered) {
    await prisma.contactMessage.update({
      where: { id: row.id },
      data: { emailDelivered: true },
    })
  }

  setResponseStatus(event, 201)
  return { ok: true, delivered }
})
