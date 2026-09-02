export interface SocialLink {
  name: string
  url: string
  svg: string
}

export interface SocialLinksResolver {
  list: () => Promise<SocialLink[]>
  invalidate: () => void
}
