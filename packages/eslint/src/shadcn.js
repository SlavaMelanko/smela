/** Shared shadcn/ui override — components export both components and variants. */
export const shadcnConfig = [
  {
    files: ['src/components/ui/**/*.{js,jsx}'],
    rules: {
      'react-refresh/only-export-components': 'off'
    }
  }
]
