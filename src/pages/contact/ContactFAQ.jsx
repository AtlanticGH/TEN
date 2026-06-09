import { FaqAccordion } from '../../components/shared/FaqAccordion'
import { CONTACT_FAQ_KEY, DEFAULT_CONTACT_FAQ } from '../../config/faqContentDefaults'
import { useFaqContent } from '../../hooks/useFaqContent'

export function ContactFAQ() {
  const { data: content = DEFAULT_CONTACT_FAQ } = useFaqContent(CONTACT_FAQ_KEY, DEFAULT_CONTACT_FAQ)
  return <FaqAccordion content={content} sectionId="contact-faq" />
}
