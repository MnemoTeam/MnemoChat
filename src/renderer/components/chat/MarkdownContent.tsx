import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'

interface MarkdownContentProps {
  content: string
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        p: ({ children }) => (
          <p className="mb-2 text-sm leading-[1.75] last:mb-0">{children}</p>
        ),
        h1: ({ children }) => (
          <h1 className="mb-2 mt-3 text-lg font-bold text-zinc-100 first:mt-0">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="mb-2 mt-3 text-base font-bold text-zinc-100 first:mt-0">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-1.5 mt-2 text-sm font-semibold text-zinc-100 first:mt-0">{children}</h3>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-zinc-100">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-zinc-400">{children}</em>
        ),
        del: ({ children }) => (
          <del className="text-zinc-500 line-through">{children}</del>
        ),
        code: ({ children, className }) => {
          const isBlock = className?.startsWith('language-')
          if (isBlock) {
            return <code className={className}>{children}</code>
          }
          return (
            <code className="rounded bg-zinc-800 px-1 py-0.5 font-mono text-xs text-indigo-300">
              {children}
            </code>
          )
        },
        pre: ({ children }) => (
          <pre className="my-2 overflow-x-auto rounded-lg bg-zinc-900 p-3 font-mono text-xs">
            {children}
          </pre>
        ),
        ul: ({ children }) => (
          <ul className="mb-2 list-disc pl-5 text-sm last:mb-0">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-2 list-decimal pl-5 text-sm last:mb-0">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="mb-1 leading-[1.75]">{children}</li>
        ),
        blockquote: ({ children }) => (
          <blockquote className="my-2 border-l-2 border-zinc-600 pl-3 italic text-zinc-400">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-indigo-400 underline hover:text-indigo-300"
          >
            {children}
          </a>
        ),
        table: ({ children }) => (
          <div className="my-2 overflow-x-auto">
            <table className="w-full border-collapse text-sm">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-zinc-700 bg-zinc-800/60 px-2 py-1 text-left font-semibold text-zinc-200">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-zinc-700 px-2 py-1 text-zinc-300">{children}</td>
        ),
        hr: () => <hr className="my-3 border-zinc-700" />,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
