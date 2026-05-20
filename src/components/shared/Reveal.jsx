import { useInView } from '../../hooks/useInView'

/**
 * Reveal — fade + slide-up animation on scroll into view.
 * Respects prefers-reduced-motion via CSS.
 *
 * Props:
 *   as        – element/component to render (default: 'div')
 *   delay     – stagger delay in ms (0, 100, 200 …)
 *   className – additional classes
 */
export function Reveal({ as: As = 'div', delay = 0, className = '', children, ...props }) {
  const { ref, inView } = useInView({ once: true, threshold: 0.12 })

  return (
    <As
      ref={ref}
      className={[
        'transition-[opacity,transform] ease-out will-change-transform motion-reduce:transition-none motion-reduce:translate-y-0 motion-reduce:opacity-100',
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        className,
      ].join(' ')}
      style={{
        transitionDuration: '380ms',
        transitionDelay: inView ? `${delay}ms` : '0ms',
      }}
      {...props}
    >
      {children}
    </As>
  )
}
