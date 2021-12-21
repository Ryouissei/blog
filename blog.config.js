const BLOG = {
  title: "觉论",
  author: 'Issei',
  email: 'ryouissei@outlook.com',
  link: 'https://blog.ryouissei.com/',
  description: "The Sense of Design & Life. | Issei's Blog",
  lang: 'zh-CN', // ['en-US', 'zh-CN', 'zh-HK', 'zh-TW', 'ja-JP', 'es-ES']
  appearance: 'auto', // ['light', 'dark', 'auto'],
  font: 'sans-serif', // ['sans-serif', 'serif']
  lightBackground: '#fffff9', // use hex value, don't forget '#' e.g #fffefc
  darkBackground: '#18181B', // use hex value, don't forget '#'
  path: '', // leave this empty unless you want to deploy Nobelium in a folder
  since: 2017, // If leave this empty, current year will be used.
  postsPerPage: 12,
  sortByDate: true,
  showAbout: true,
  showArchive: true,
  autoCollapsedNavBar: false, // The automatically collapsed navigation bar
      ogImageGenerateURL: "https://og-image-craigary.vercel.app/**%E8%A7%89%E8%AE%BA**%20%20Issei's%20Blog.png?theme=dark&md=1&fontSize=175px&images=https%3A%2F%2Fnobelium.vercel.app%2Flogo-for-dark-bg.svg&widths=auto&heights=auto", // The link to generate OG image, don't end with a slash
  socialLink: 'https://twitter.com/Lyicheng',
  seo: {
    keywords: ['Blog', 'Website', 'Notion', 'ryouissei', 'rss'],
    googleSiteVerification: 'EOyOIBvRPl1U1dXPNPVTTCfBLDEf6Kty9iOCtzPDKDM' // Remove the value or replace it with your own google site verification code
  },
  notionPageId: process.env.NOTION_PAGE_ID, // DO NOT CHANGE THIS！！！
  notionAccessToken: process.env.NOTION_ACCESS_TOKEN, // Useful if you prefer not to make your database public
  analytics: {
    provider: 'ga', // Currently we support Google Analytics and Ackee, please fill with 'ga' or 'ackee', leave it empty to disable it.
    ackeeConfig: {
      tracker: '', // e.g 'https://ackee.craigary.net/tracker.js'
      dataAckeeServer: '', // e.g https://ackee.craigary.net , don't end with a slash
      domainId: '' // e.g '0e2257a8-54d4-4847-91a1-0311ea48cc7b'
    },
    gaConfig: {
      measurementId: 'G-ZMKNF0JN8G' // e.g: G-XXXXXXXXXX
    }
  },
  comment: {
    // support provider: gitalk, utterances, cusdis
    provider: 'cusdis', // leave it empty if you don't need any comment plugin
    gitalkConfig: {
      repo: '', // The repository of store comments
      owner: '',
      admin: [],
      clientID: '',
      clientSecret: '',
      distractionFreeMode: false
    },
    utterancesConfig: {
      repo: ''
    },
    cusdisConfig: {
      appId: 'd3cff456-7622-4122-b0f5-605b5e02afc9', // data-app-id
      host: 'https://cusdis.com', // data-host, change this if you're using self-hosted version
      scriptSrc: 'https://cusdis.com/js/cusdis.es.js' // change this if you're using self-hosted version
    }
  },
  isProd: process.env.VERCEL_ENV === 'production' // distinguish between development and production environment (ref: https://vercel.com/docs/environment-variables#system-environment-variables)
}
// export default BLOG
module.exports = BLOG
