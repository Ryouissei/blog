import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import BLOG from '@/blog.config'

export default function Mermaid ({ block }) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    // Initial check
    const isDark = BLOG.appearance === 'dark' || 
      (BLOG.appearance === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setDark(isDark)

    // Listen for system changes if 'auto'
    if (BLOG.appearance === 'auto') {
      const matcher = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (e) => setDark(e.matches)
      matcher.addEventListener('change', handler)
      return () => matcher.removeEventListener('change', handler)
    }
  }, [])

  useEffect(() => {
    mermaid.initialize({ 
      startOnLoad: true,
      theme: dark ? 'dark' : 'neutral',
      securityLevel: 'loose'
    })
  }, [dark])

  const source = block.properties.title[0][0]
  const container = useRef(null)
  const [svg, setSVG] = useState('')

  useEffect(() => {
    if (source) {
      mermaid.render(`mermaid-${block.id.replace(/-/g, '')}`, source)
        .then(({ svg }) => setSVG(svg))
        .catch(err => console.error('Mermaid render error:', err))
    }
  }, [block.id, source])

  return (
    <div
      ref={container}
      className="w-full leading-normal flex justify-center my-4 overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
