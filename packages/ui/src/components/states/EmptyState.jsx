import { Inbox } from 'lucide-react'

import { StateIcon, StateRoot, StateTitle } from './State'

export const EmptyState = ({ text, className, centered = true, children }) => (
  <StateRoot className={className} centered={centered}>
    <StateIcon icon={Inbox} />
    <StateTitle>{text}</StateTitle>
    {children}
  </StateRoot>
)
