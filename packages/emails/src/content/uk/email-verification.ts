import type EmailVerificationContent from '../email-verification'

export const content: EmailVerificationContent = {
  subject: 'Підтвердіть вашу електронну адресу',
  previewText: (companyName: string) =>
    `Підтвердіть електронну адресу для ${companyName}`,
  greeting: (firstName?: string) => `Вітаю ${firstName || 'друже'},`,
  body: 'Натисніть посилання нижче, щоб підтвердити вашу електронну адресу:',
  ctaText: 'Підтвердити електронну адресу',
  expiryNotice: 'З міркувань безпеки це посилання дійсне протягом 24 годин.',
  disclaimer:
    'Якщо ви не створювали обліковий запис, просто проігноруйте цей лист.',
  signature: (companyName: string) => ({
    thanks: 'Дякуємо,',
    who: `Команда ${companyName}`
  })
}

export default content
