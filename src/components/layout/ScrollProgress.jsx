import { useEffect, useRef } from 'react'

export function ScrollProgress() {
  const barRef = useRef(null)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    let raf = 0
    const update = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0
      bar.style.width = `${pct}%`
    }

    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className="fixed left-0 top-0 z-[100] h-[2px] w-0 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600"
      style={{ transition: 'width 80ms linear' }}
    />
  )
}
