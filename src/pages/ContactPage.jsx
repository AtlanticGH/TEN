import { ContactDetails } from './contact/ContactDetails'
import { ContactFAQ } from './contact/ContactFAQ'
import { ContactHero } from './contact/ContactHero'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export function ContactPage() {
  useDocumentTitle('Contact')

  return (
    <main id="page-main" data-component="page-main" className="overflow-x-hidden">
      <ContactHero />
      <ContactDetails />
      <ContactFAQ />
    </main>
  )
}

