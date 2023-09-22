import IndexPage from 'components/IndexPage'
import PreviewIndexPage from 'components/PreviewIndexPage'
import { readToken } from 'lib/sanity.api'
import {
  getAllPosts,
  getAllTools,
  getClient,
  getSettings,
} from 'lib/sanity.client'
import { Post, Settings } from 'lib/sanity.queries'
import { GetStaticProps } from 'next'
import type { SharedPageProps } from 'pages/_app'

interface PageProps extends SharedPageProps {
  posts: Post[]
  tools: Tool[]
  settings: Settings
}

interface Query {
  [key: string]: string
}

export default function Page(props: PageProps) {
  const { posts, tools, settings, draftMode } = props

  if (draftMode) {
    return <PreviewIndexPage posts={posts} tools={tools} settings={settings} />
  }

  return <IndexPage posts={posts} tools={tools} settings={settings} />
}

export const getStaticProps: GetStaticProps<PageProps, Query> = async (ctx) => {
  const { draftMode = false } = ctx
  const client = getClient(draftMode ? { token: readToken } : undefined)

  const [settings, posts = [], tools = []] = await Promise.all([
    getSettings(client),
    getAllPosts(client),
    getAllTools(client),
  ])

  return {
    props: {
      posts,
      tools,
      settings,
      draftMode,
      token: draftMode ? readToken : '',
    },
  }
}
