export const AuthMode = {
  Login: 'login',
  Register: 'register',
} as const;

export type AuthMode = (typeof AuthMode)[keyof typeof AuthMode];
