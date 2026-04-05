import { fetchCusdisLang } from '@/lib/cusdisLang'
import BLOG from '@/blog.config'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import 'gitalk/dist/gitalk.css'

const GitalkComponent = dynamic(
  () => {
    return import('gitalk/dist/gitalk-component')
  },
  { ssr: false }
)
const UtterancesComponent = dynamic(
  () => {
    return import('@/components/Utterances')
  },
  { ssr: false }
)
const CusdisComponent = dynamic(
  () => {
    return import('react-cusdis').then(m => m.ReactCusdis)
  },
  { ssr: false }
)

const Comments = ({ frontMatter }) => {
  const router = useRouter()
  const wrapperRef = useRef(null)
  const [cusdisTheme, setCusdisTheme] = useState(
    BLOG.appearance === 'dark' ? 'dark' : 'light'
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    const getTheme = () => {
      if (document.documentElement.classList.contains('dark')) return 'dark'
      if (BLOG.appearance === 'dark') return 'dark'
      if (BLOG.appearance === 'light') return 'light'
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    }

    const applyTheme = () => setCusdisTheme(getTheme())
    applyTheme()

    if (BLOG.appearance === 'auto') {
      const media = window.matchMedia('(prefers-color-scheme: dark)')
      media.addEventListener('change', applyTheme)
      return () => media.removeEventListener('change', applyTheme)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const applyIframeStyle = () => {
      const iframe = wrapperRef.current?.querySelector('#cusdis_thread iframe')
      if (!iframe) return
      iframe.setAttribute('scrolling', 'no')
      iframe.style.background = 'transparent'
      iframe.style.overflow = 'hidden'
      iframe.style.border = '0'
    }

    const onMessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        if (msg?.from !== 'cusdis' || msg?.event !== 'resize') return
        const iframe = wrapperRef.current?.querySelector('#cusdis_thread iframe')
        if (!iframe) return
        iframe.style.height = `${msg.data}px`
        applyIframeStyle()
      } catch (_) {}
    }

    applyIframeStyle()
    const observer = new MutationObserver(applyIframeStyle)
    if (wrapperRef.current) {
      observer.observe(wrapperRef.current, { childList: true, subtree: true })
    }
    window.addEventListener('message', onMessage)

    return () => {
      observer.disconnect()
      window.removeEventListener('message', onMessage)
    }
  }, [frontMatter.id, cusdisTheme, router.asPath])

  return (
    <div className="cusdis-wrapper" ref={wrapperRef}>
      {BLOG.comment && BLOG.comment.provider === 'gitalk' && (
        <GitalkComponent
          options={{
            id: frontMatter.id,
            title: frontMatter.title,
            clientID: BLOG.comment.gitalkConfig.clientID,
            clientSecret: BLOG.comment.gitalkConfig.clientSecret,
            repo: BLOG.comment.gitalkConfig.repo,
            owner: BLOG.comment.gitalkConfig.owner,
            admin: BLOG.comment.gitalkConfig.admin,
            distractionFreeMode: BLOG.comment.gitalkConfig.distractionFreeMode
          }}
        />
      )}
      {BLOG.comment && BLOG.comment.provider === 'utterances' && (
        <UtterancesComponent issueTerm={frontMatter.id} />
      )}
      {BLOG.comment && BLOG.comment.provider === 'cusdis' && (
        <CusdisComponent
          key={`${frontMatter.id}-${cusdisTheme}-${router.asPath}`}
          lang={fetchCusdisLang()}
          style={{ minHeight: '220px', background: 'transparent' }}
          attrs={{
            host: BLOG.comment.cusdisConfig.host,
            appId: BLOG.comment.cusdisConfig.appId,
            pageId: frontMatter.id,
            pageTitle: frontMatter.title,
            pageUrl: BLOG.link + router.asPath,
            theme: cusdisTheme
          }}
        />
      )}
    </div>
  )
}

export default Comments
