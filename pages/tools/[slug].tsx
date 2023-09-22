import PreviewToolPage from 'components/PreviewToolPage'
import ToolPage from 'components/ToolPage'
import { readToken } from 'lib/sanity.api'
import {
  getAllToolsSlugs,
  getClient,
  getSettings,
  getToolAndMoreStories,
} from 'lib/sanity.client'
import { Settings, Tool } from 'lib/sanity.queries'
import { GetStaticProps } from 'next'
import type { SharedPageProps } from 'pages/_app'

interface PageProps extends SharedPageProps {
  tool: Tool
  moreTools: Tool[]
  settings?: Settings
}

interface Query {
  [key: string]: string
}

export default function ProjectSlugRoute(props: PageProps) {
  const { settings, tool, moreTools, draftMode } = props

  if (draftMode) {
    return (
      <PreviewToolPage tool={tool} moreTools={moreTools} settings={settings} />
    )
  }

  return <ToolPage tool={tool} moreTools={moreTools} settings={settings} />
}

export const getStaticProps: GetStaticProps<PageProps, Query> = async (ctx) => {
  const { draftMode = false, params = {} } = ctx
  const client = getClient(draftMode ? { token: readToken } : undefined)

  const [settings, { tool, moreTools }] = await Promise.all([
    getSettings(client),
    getToolAndMoreStories(client, params.slug),
  ])

  if (!tool) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      tool,
      moreTools,
      settings,
      draftMode,
      token: draftMode ? readToken : '',
    },
  }
}

export const getStaticPaths = async () => {
  const slugs = await getAllToolsSlugs()

  return {
    paths: slugs?.map(({ slug }) => `/tools/${slug}`) || [],
    fallback: 'blocking',
  }
}
