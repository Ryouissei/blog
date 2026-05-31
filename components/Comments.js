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
const loadCusdisScript = (src, id) =>
  new Promise((resolve, reject) => {
    if (!src) {
      resolve()
      return
    }

    const existing = document.getElementById(id)
    if (existing) {
      if (existing.dataset.status === 'ready') {
        resolve()
        return
      }

      existing.addEventListener('load', resolve, { once: true })
      existing.addEventListener('error', reject, { once: true })
      return
    }

    const script = document.createElement('script')
    script.id = id
    script.src = src
    script.async = true
    script.dataset.status = 'loading'
    script.addEventListener(
      'load',
      () => {
        script.dataset.status = 'ready'
        resolve()
      },
      { once: true }
    )
    script.addEventListener(
      'error',
      () => {
        script.dataset.status = 'error'
        reject(new Error(`Failed to load ${src}`))
      },
      { once: true }
    )
    document.body.appendChild(script)
  })

const CusdisComponent = ({ attrs, lang, style }) => {
  const ref = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    let cancelled = false
    const host = attrs.host || 'https://cusdis.com'
    const scriptSrc =
      BLOG.comment.cusdisConfig.scriptSrc || `${host}/js/cusdis.es.js`
    const langSrc = lang ? `${host}/js/widget/lang/${lang}.js` : ''

    async function renderCusdis () {
      await loadCusdisScript(scriptSrc, 'cusdis-script')
      await loadCusdisScript(langSrc, 'cusdis-lang-script')

      if (!cancelled && window.renderCusdis && ref.current) {
        window.renderCusdis(ref.current)
      }
    }

    renderCusdis().catch(error => {
      console.error(error)
    })

    return () => {
      cancelled = true
    }
  }, [
    attrs.appId,
    attrs.host,
    attrs.pageId,
    attrs.pageTitle,
    attrs.pageUrl,
    attrs.theme,
    lang
  ])

  return (
    <div
      id="cusdis_thread"
      data-host={attrs.host}
      data-page-id={attrs.pageId}
      data-app-id={attrs.appId}
      data-page-title={attrs.pageTitle}
      data-page-url={attrs.pageUrl}
      data-theme={attrs.theme}
      style={style}
      ref={ref}
    />
  )
}

const Comments = ({ frontMatter }) => {
  const router = useRouter()
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

  return (
    <div className="cusdis-wrapper">
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
          style={{ background: 'transparent' }}
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
