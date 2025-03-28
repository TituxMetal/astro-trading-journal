export const AUTH_MODES = ['login', 'signup'] as const
export type AuthMode = (typeof AUTH_MODES)[number]

export const isValidAuthMode = (mode: unknown): mode is AuthMode => {
  return typeof mode === 'string' && AUTH_MODES.includes(mode as AuthMode)
}
