import Image from 'next/image'
import Container from '@/components/Container'
import BLOG from '@/blog.config'

const FRIEND_LINKS = [
  {
    title: "Z.L Vansiit's blog",
    website: 'https://vansiit.cc/',
    description: '坐睡觉来无一事，满窗晴日看蚕生',
    image: 'https://vansiit.cc/img/logo.svg'
  }
]

const Friends = () => {
  return (
    <Container title={`友链 - ${BLOG.title}`} description="友情链接">
      <section>
        <h1 className="font-bold text-3xl text-black dark:text-white">
          友链
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          一些值得常去坐坐的朋友们。
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {FRIEND_LINKS.map(friend => (
            <a
              key={friend.website}
              href={friend.website}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center rounded-2xl border border-gray-200 bg-white/60 p-4 transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900/40 dark:hover:border-gray-700"
            >
              <Image
                src={friend.image}
                alt={`${friend.title} logo`}
                width={56}
                height={56}
                unoptimized
                className="h-14 w-14 flex-shrink-0 rounded-xl bg-gray-100 object-contain p-2 dark:bg-gray-800"
              />
              <div className="ml-4 min-w-0">
                <h2 className="truncate font-semibold text-black transition group-hover:text-gray-700 dark:text-white dark:group-hover:text-gray-200">
                  {friend.title}
                </h2>
                <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                  {friend.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </Container>
  )
}

export default Friends
