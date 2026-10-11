import React from 'react'

type GuideArticleProps = {
  title: string
  excerpt?: string | null
  body?: string | null
}

export function GuideArticle({ title, excerpt, body }: GuideArticleProps) {
  const paragraphs = (body ?? '')
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0)

  return (
    <article className="bg-white px-[5%] py-16 text-[#080706] md:py-24">
      <div className="container max-w-3xl">
        <p className="mb-3 text-sm font-medium text-[#0D9769]">Guides</p>
        <h1 className="font-heading text-4xl leading-tight md:text-6xl">{title}</h1>
        {excerpt ? <p className="mt-4 text-lg text-[#616161]">{excerpt}</p> : null}
        {paragraphs.length ? (
          <div className="mt-8 space-y-4 text-base leading-relaxed">
            {paragraphs.map((paragraph, index) => (
              <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  )
}
