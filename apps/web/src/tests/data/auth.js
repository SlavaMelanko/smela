export const auth = {
  firstName: {
    ok: 'John',
    short: 'J',
    long: 'A'.repeat(51), // exceeds 50 char limit
    withNumbers: 'John123',
    withSpecialChars: 'John@#$',
    withSpaces: '  John  ',
    empty: '',
    twoChars: 'Jo'
  },
  lastName: {
    ok: 'Doe',
    short: 'D',
    long: 'B'.repeat(51), // exceeds 50 char limit
    withNumbers: 'Doe456',
    withSpecialChars: 'Doe!@#',
    withSpaces: '  Doe  ',
    empty: '',
    twoChars: 'Do'
  },
  captcha: {
    valid: 'valid-captcha-token',
    alternative: 'test-captcha-token',
    first: 'first-captcha-token',
    second: 'second-captcha-token'
  },
  email: {
    ok: 'example@example.com',
    invalid: 'examp@',
    noAt: 'example.com',
    noDomain: 'example@',
    noTld: 'example@domain',
    multipleAt: 'example@@example.com',
    withSpaces: '  example@example.com  ',
    uppercase: 'EXAMPLE@EXAMPLE.COM',
    specialChars: 'user+tag@example.com',
    subdomain: 'user@mail.example.com',
    numbers: 'user123@example.com',
    empty: ''
  },
  password: {
    strong: 'Password123!',
    mismatch: 'password123!',
    onlyNumbers: '12345',
    noLetter: '1234567!',
    short: 'Pass1', // less than 6 chars
    sixChars: 'Pass12', // exactly 6 chars
    withSpaces: 'Pass word123',
    onlyLowercase: 'password',
    onlyUppercase: 'PASSWORD',
    mixedCase: 'PassWord',
    withSpecialChars: 'Pass@#$123',
    unicode: 'Пароль123', // non-Latin chars
    empty: '',
    veryLong: 'P' + 'a'.repeat(100) + '123' // very long password
  }
}
