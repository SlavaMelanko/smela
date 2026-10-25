import { BackButton } from '@ui/components/buttons'

import {
  PageHeader,
  PageHeaderContent,
  PageHeaderGroup,
  PageHeaderSvgIcon,
  PageHeaderTitle,
  PageHeaderWebsite
} from './PageHeader'

export const SocialLinkPageHeader = ({ name, url, svg }) => (
  <PageHeader>
    <PageHeaderGroup>
      <BackButton />
      <PageHeaderSvgIcon svg={svg} label={name} />
      <PageHeaderContent>
        <PageHeaderTitle>{name}</PageHeaderTitle>
        <PageHeaderWebsite url={url} />
      </PageHeaderContent>
    </PageHeaderGroup>
  </PageHeader>
)
