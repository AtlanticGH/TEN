/** Production branding & SEO — Atlantic Catering & Logistics / The Ember Network */

export const ORG_NAME = 'Atlantic Catering & Logistics'

export const PRODUCT_NAME = 'The Ember Network'
export const PRODUCT_SHORT = 'TEN'

export const SITE_TAGLINE = 'Small sparks ignite big dreams'

export const META_DESCRIPTION =
  'The Ember Network is a community of ignition and empowerment for aspiring entrepreneurs and early-stage founders — mentorship, structured learning, and meaningful connections.'

export const META_KEYWORDS =
  'The Ember Network, TEN, entrepreneurship, mentorship, founders, Atlantic Catering & Logistics'

export const DEFAULT_DOCUMENT_TITLE = PRODUCT_NAME

/** Browser tab / SEO title: "The Ember Network | About" */
export function pageTitle(segment) {
  return segment ? `${PRODUCT_NAME} | ${segment}` : DEFAULT_DOCUMENT_TITLE
}
