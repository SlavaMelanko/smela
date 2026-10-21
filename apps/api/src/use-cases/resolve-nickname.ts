import { NicknameConstraint } from '@smela/contracts'

export const resolveNickname = (
  email: string,
  ...candidates: (string | null | undefined)[]
) => {
  const nickname = candidates.map(value => value?.trim()).find(Boolean)
  const localPart = email.split('@')[0]
  const emailPrefix = localPart.split('+')[0] || localPart

  return (nickname ?? emailPrefix).slice(0, NicknameConstraint.MAX_LENGTH)
}
