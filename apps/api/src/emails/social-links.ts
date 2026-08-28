export interface SocialLink {
  network: string
  url: string
  svg: string
}

export interface SocialLinksProvider {
  list: () => Promise<SocialLink[]>
  invalidate: () => void
}
