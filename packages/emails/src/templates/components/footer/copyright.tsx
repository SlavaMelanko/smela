/** @jsxImportSource react */

import type { ThemeStyles } from '../../../styles'

import { Text } from '@react-email/components'

import { getThemeStyles } from '../../../styles'

interface Props {
  styles: ThemeStyles
  companyName?: string
}

const Copyright = ({ styles, companyName }: Props): React.ReactElement => {
  const year = new Date().getFullYear()

  return <Text style={styles.text.legal}>{`© ${year} ${companyName}`}</Text>
}

Copyright.PreviewProps = {
  styles: getThemeStyles('light'),
  companyName: 'Company Name'
} as Props

export default Copyright
