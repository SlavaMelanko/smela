import type UserInviteContent from '../user-invite'

const DEFAULT_TEAM = 'команди'

export const content: UserInviteContent = {
  subject: (teamName?: string) =>
    `Вас запрошено до ${teamName || DEFAULT_TEAM}`,
  previewText: (teamName?: string) =>
    `Вас запрошено до ${teamName || DEFAULT_TEAM}`,
  greeting: (nickname?: string) => `Вітаю ${nickname || 'пане'},`,
  body: (inviterName?: string, teamName?: string) =>
    `${inviterName || 'Адмін'} запросив вас приєднатися до команди ${teamName || DEFAULT_TEAM}.`,
  ctaInstruction:
    'Натисніть посилання нижче, щоб прийняти запрошення та завершити налаштування облікового запису:',
  signInCtaInstruction: 'Увійдіть, щоб прийняти запрошення:',
  ctaText: 'Прийняти запрошення',
  expiryNotice: 'З міркувань безпеки це посилання дійсне протягом 24 годин.',
  signature: (companyName: string) => ({
    thanks: 'Дякуємо,',
    who: `Команда ${companyName}`
  })
}

export default content
