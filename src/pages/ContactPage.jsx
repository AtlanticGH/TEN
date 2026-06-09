import { ContactDetails } from './contact/ContactDetails'
import { ContactFAQ } from './contact/ContactFAQ'
import { PageHeroSection } from '../components/shared/PageHeroSection'
import { CmsPublicPage } from '../components/cms/CmsPublicPage'

export function ContactPage() {
  return (
    <CmsPublicPage
      slug="contact"
      fallback={<ContactPageContent />}
      fallbackBody={
        <>
          <ContactDetails />
          <ContactFAQ />
        </>
      }
    />
  )
}

function ContactPageContent() {
  return (
    <main id="page-main" data-component="page-main" className="overflow-x-hidden">
      <PageHeroSection slug="contact" />
      <ContactDetails />
      <ContactFAQ />
    </main>
  )
}

