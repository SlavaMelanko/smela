import type { CompanyProfile } from '../../company'

import type { SocialLink } from '../../social-links'
import type { EmailRenderer } from '../email-renderer'
import { describe, expect, it } from 'bun:test'

const company: CompanyProfile = { name: 'SMELA' }

// Body background colors from styles/themes.ts
const LIGHT_BACKGROUND = '#ffffff'
const DARK_BACKGROUND = '#0a0a0a'

const socialLinks: SocialLink[] = [
  {
    network: 'facebook',
    url: 'https://facebook.com/example',
    svg: '<svg><path d="M0 0" /></svg>'
  }
]

interface ContractCase<T> {
  name: string
  renderer: EmailRenderer<T>
  // Data whose firstName is 'John' and whose url field holds `url`
  data: T
  url: string
  // Builds the same email for another recipient, to prove data does not leak
  otherData: T
  englishSubject: RegExp
  ukrainianSubject: RegExp
}

// Exercises the EmailRenderer contract that every renderer shares. Assertions
// specific to one email belong in that renderer's own test file
export const testRendererContract = <T>({
  name,
  renderer,
  data,
  url,
  otherData,
  englishSubject,
  ukrainianSubject
}: ContractCase<T>) => {
  describe(`${name} renderer contract`, () => {
    it('returns a non-empty subject, html and text', async () => {
      const result = await renderer.render(data, { company })

      expect(result.subject.length).toBeGreaterThan(0)
      expect(result.html.length).toBeGreaterThan(0)
      expect(result.text.length).toBeGreaterThan(0)
    })

    it('includes the recipient name and url in both html and text', async () => {
      const result = await renderer.render(data, { company })

      expect(result.html).toContain('John')
      expect(result.html).toContain(url)
      expect(result.text).toContain('John')
      expect(result.text).toContain(url)
    })

    it('renders the subject in English by default', async () => {
      const result = await renderer.render(data, { company })

      expect(result.subject.toLowerCase()).toMatch(englishSubject)
    })

    it('renders the subject in Ukrainian when requested', async () => {
      const result = await renderer.render(data, {
        company,
        preferences: { locale: 'uk', theme: 'light' }
      })

      expect(result.subject.toLowerCase()).toMatch(ukrainianSubject)
    })

    it('applies the requested theme background without changing the subject', async () => {
      const light = await renderer.render(data, {
        company,
        preferences: { locale: 'en', theme: 'light' }
      })
      const dark = await renderer.render(data, {
        company,
        preferences: { locale: 'en', theme: 'dark' }
      })

      expect(light.html).toContain(
        `<body style="background-color:${LIGHT_BACKGROUND}"`
      )
      expect(dark.html).toContain(
        `<body style="background-color:${DARK_BACKGROUND}"`
      )
      expect(light.subject).toBe(dark.subject)
    })

    it('renders the company name in the footer copyright', async () => {
      const result = await renderer.render(data, { company })

      expect(result.html).toMatch(new RegExp(`©\\s*\\d{4}\\s*${company.name}`))
    })

    it('renders footer social links when provided', async () => {
      const result = await renderer.render(data, { company, socialLinks })

      expect(result.html).toContain('https://facebook.com/example')
      expect(result.html).toContain('<path d="M0 0" />')
    })

    it('keeps non-ASCII names intact', async () => {
      const result = await renderer.render(
        { ...data, firstName: 'José María' },
        { company }
      )

      expect(result.html).toContain('José María')
      expect(result.text).toContain('José María')
    })

    it('does not leak one recipient into another email', async () => {
      const first = await renderer.render(data, { company })
      const second = await renderer.render(otherData, { company })

      expect(first.html).toContain('John')
      expect(first.html).not.toContain('Alice')
      expect(second.html).toContain('Alice')
      expect(second.html).not.toContain('John')
    })
  })
}
