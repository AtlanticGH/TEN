function splitHeadlineLines(text) {
  return String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

/** Split CMS headline on newlines — each segment is one straight horizontal line. */
export function HeroHeadlineLines({ text, className = '', style }) {
  const lines = splitHeadlineLines(text)
  if (!lines.length) return null

  return lines.map((line, index) => (
    <span key={`${line}-${index}`} className={`block ${className}`.trim()} style={style}>
      {line}
    </span>
  ))
}

/**
 * Home hero headline: keeps before + emphasis on one line when both are single-line
 * (e.g. "Here, Small Sparks Ignite" + "Big Dreams" → one unbroken phrase).
 */
export function HeroHeadline({ before, emphasis, lineClassName = '', emphasisClassName = '', emphasisStyle }) {
  const beforeLines = splitHeadlineLines(before)
  const emphasisLines = splitHeadlineLines(emphasis)

  if (beforeLines.length === 1 && emphasisLines.length === 1) {
    return (
      <span className={`block ${lineClassName}`.trim()}>
        {beforeLines[0]}{' '}
        <span className={emphasisClassName.trim()} style={emphasisStyle}>
          {emphasisLines[0]}
        </span>
      </span>
    )
  }

  if (beforeLines.length === 1 && !emphasisLines.length) {
    return <span className={`block ${lineClassName}`.trim()}>{beforeLines[0]}</span>
  }

  if (!beforeLines.length && emphasisLines.length === 1) {
    return (
      <span className={`block ${emphasisClassName}`.trim()} style={emphasisStyle}>
        {emphasisLines[0]}
      </span>
    )
  }

  return (
    <>
      <HeroHeadlineLines text={before} className={lineClassName} />
      <HeroHeadlineLines text={emphasis} className={emphasisClassName} style={emphasisStyle} />
    </>
  )
}
