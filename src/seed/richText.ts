type LexicalText = {
  type: 'text'
  detail: 0
  format: number
  mode: 'normal'
  style: ''
  text: string
  version: 1
}

type LexicalParagraph = {
  type: 'paragraph' | 'heading'
  format: ''
  indent: 0
  version: 1
  direction: 'ltr'
  tag?: 'h2' | 'h3'
  children: LexicalText[]
}

export function richText(blocks: Array<string | { heading: string; level?: 'h2' | 'h3' }>) {
  const children: LexicalParagraph[] = blocks.map((block) => {
    if (typeof block === 'string') {
      return {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: block,
            version: 1,
          },
        ],
      }
    }

    return {
      type: 'heading',
      tag: block.level || 'h2',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: [
        {
          type: 'text',
          detail: 0,
          format: 0,
          mode: 'normal',
          style: '',
          text: block.heading,
          version: 1,
        },
      ],
    }
  })

  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children,
    },
  }
}
