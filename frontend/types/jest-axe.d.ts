declare module 'jest-axe' {
  export function axe(html: any): Promise<any>
  export const toHaveNoViolations: any
}

declare namespace jest {
  interface Matchers<R> {
    toHaveNoViolations(): R
  }
}
