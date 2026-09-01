import {
  PageHeader,
  PageHeaderContent,
  PageHeaderGroup,
  PageHeaderSvgIcon,
  PageHeaderTitle,
  PageHeaderWebsite
} from './PageHeader'

export const SocialLinkPageHeader = ({ network, url, svg }) => (
  <PageHeader>
    <PageHeaderGroup>
      <PageHeaderSvgIcon svg={svg} label={network} />
      <PageHeaderContent>
        <PageHeaderTitle>{network}</PageHeaderTitle>
        <PageHeaderWebsite url={url} />
      </PageHeaderContent>
    </PageHeaderGroup>
  </PageHeader>
)
