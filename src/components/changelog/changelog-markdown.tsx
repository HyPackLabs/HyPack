import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ChangelogMarkdownProps = {
  content: string;
};

export function ChangelogMarkdown({ content }: ChangelogMarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h2: ({ children }) => (
          <h3 className="mt-6 text-base font-semibold text-white">{children}</h3>
        ),
        h3: ({ children }) => (
          <h4 className="mt-4 text-sm font-semibold text-zinc-200">
            {children}
          </h4>
        ),
        p: ({ children }) => (
          <p className="mt-3 text-sm leading-7 text-zinc-400">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-400">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-400">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="leading-7">{children}</li>,
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-violet-400 underline-offset-2 hover:text-violet-300 hover:underline"
            target={href?.startsWith("http") ? "_blank" : undefined}
            rel={href?.startsWith("http") ? "noreferrer" : undefined}
          >
            {children}
          </a>
        ),
        code: ({ children }) => (
          <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-violet-200">
            {children}
          </code>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-zinc-200">{children}</strong>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
