import type PasswordResetEmailContent from '../password-reset'

export const content: PasswordResetEmailContent = {
  subject: 'Скинути пароль',
  previewText: (companyName: string) =>
    `Скинути пароль для облікового запису ${companyName}`,
  greeting: (firstName?: string) =>
    `Вітаю ${firstName || 'дорогий користувач'},`,
  body: 'Ми отримали запит на скидання вашого пароля. Перейдіть за посиланням нижче, щоб встановити новий пароль:',
  ctaText: 'Скинути пароль',
  expiryNotice: 'З міркувань безпеки це посилання дійсне протягом 1 години.',
  disclaimer:
    'Якщо ви не запитували скидання пароля, ви можете безпечно ігнорувати цей лист.',
  signature: (companyName: string) => ({
    thanks: 'Дякуємо,',
    who: `Команда ${companyName}`
  })
}

export default content
