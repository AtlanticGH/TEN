import { submitContact } from '../services/contactSubmissions'

export async function submitSubmission(payload) {
  if (payload?.source === 'contact') {
    const res = await submitContact(payload)
    if (!res?.ok) {
      throw new Error(res?.error || 'Unable to send message.')
    }
    return res
  }
  throw new Error('Unsupported submission type.')
}
