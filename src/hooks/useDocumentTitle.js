import { useEffect } from 'react'
import { DEFAULT_DOCUMENT_TITLE, pageTitle } from '../config/branding'

/**
 * Sets document.title for the current route. Pass no segment to restore the default.
 */
export function useDocumentTitle(segment) {
  useEffect(() => {
    document.title = segment ? pageTitle(segment) : DEFAULT_DOCUMENT_TITLE
    return () => {
      document.title = DEFAULT_DOCUMENT_TITLE
    }
  }, [segment])
}
