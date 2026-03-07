// @vitest-environment happy-dom
import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MarkdownContent } from '../../src/renderer/components/chat/MarkdownContent'

describe('MarkdownContent', () => {
  it('renders plain text unchanged', () => {
    render(<MarkdownContent content="Hello world" />)
    expect(screen.getByText('Hello world')).toBeTruthy()
  })

  it('renders bold text as <strong>', () => {
    const { container } = render(<MarkdownContent content="**bold text**" />)
    const el = container.querySelector('strong')
    expect(el).toBeTruthy()
    expect(el!.textContent).toBe('bold text')
  })

  it('renders italic text as <em>', () => {
    const { container } = render(<MarkdownContent content="*italic text*" />)
    const el = container.querySelector('em')
    expect(el).toBeTruthy()
    expect(el!.textContent).toBe('italic text')
  })

  it('renders h1 heading', () => {
    const { container } = render(<MarkdownContent content="# Heading One" />)
    const el = container.querySelector('h1')
    expect(el).toBeTruthy()
    expect(el!.textContent).toBe('Heading One')
  })

  it('renders h2 heading', () => {
    const { container } = render(<MarkdownContent content="## Heading Two" />)
    expect(container.querySelector('h2')).toBeTruthy()
  })

  it('renders h3 heading', () => {
    const { container } = render(<MarkdownContent content="### Heading Three" />)
    expect(container.querySelector('h3')).toBeTruthy()
  })

  it('renders inline code with mono styling', () => {
    const { container } = render(<MarkdownContent content="Use `console.log()` here" />)
    const el = container.querySelector('code')
    expect(el).toBeTruthy()
    expect(el!.textContent).toBe('console.log()')
    expect(el!.className).toContain('font-mono')
  })

  it('renders fenced code block as pre > code', () => {
    const { container } = render(
      <MarkdownContent content={'```js\nconst x = 1\n```'} />
    )
    expect(container.querySelector('pre')).toBeTruthy()
    expect(container.querySelector('pre code')).toBeTruthy()
  })

  it('renders GFM strikethrough as <del>', () => {
    const { container } = render(<MarkdownContent content="~~deleted~~" />)
    const el = container.querySelector('del')
    expect(el).toBeTruthy()
    expect(el!.textContent).toBe('deleted')
  })

  it('renders unordered list', () => {
    const { container } = render(
      <MarkdownContent content={'- item one\n- item two\n- item three'} />
    )
    expect(container.querySelector('ul')).toBeTruthy()
    const items = container.querySelectorAll('li')
    expect(items.length).toBe(3)
    expect(items[0].textContent).toBe('item one')
  })

  it('renders ordered list', () => {
    const { container } = render(
      <MarkdownContent content={'1. first\n2. second'} />
    )
    expect(container.querySelector('ol')).toBeTruthy()
    const items = container.querySelectorAll('li')
    expect(items.length).toBe(2)
  })

  it('renders blockquote', () => {
    const { container } = render(<MarkdownContent content="> a wise quote" />)
    const el = container.querySelector('blockquote')
    expect(el).toBeTruthy()
    expect(el!.textContent?.trim()).toBe('a wise quote')
  })

  it('renders link with target _blank', () => {
    const { container } = render(
      <MarkdownContent content="[click here](https://example.com)" />
    )
    const el = container.querySelector('a')
    expect(el).toBeTruthy()
    expect(el!.getAttribute('href')).toBe('https://example.com')
    expect(el!.getAttribute('target')).toBe('_blank')
    expect(el!.getAttribute('rel')).toBe('noreferrer')
  })

  it('renders GFM table', () => {
    const md = '| A | B |\n|---|---|\n| 1 | 2 |'
    const { container } = render(<MarkdownContent content={md} />)
    expect(container.querySelector('table')).toBeTruthy()
    expect(container.querySelector('th')).toBeTruthy()
    expect(container.querySelector('td')).toBeTruthy()
  })

  it('renders horizontal rule', () => {
    const { container } = render(<MarkdownContent content={'text\n\n---\n\nmore'} />)
    expect(container.querySelector('hr')).toBeTruthy()
  })
})
