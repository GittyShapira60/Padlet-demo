import { ApiError } from '../services';
import type { AuthMode } from '../enums/auth-mode';
import { AuthMode as AuthModeValues } from '../enums/auth-mode';

export function getAuthErrorMessage(
  error: unknown,
  mode: AuthMode,
): string {
  if (error instanceof ApiError) {
    const body = error.body as
      | {
          message?: string | string[];
          error?: { message?: string | string[] };
        }
      | undefined;

    const rawMessage = body?.message ?? body?.error?.message;

    if (Array.isArray(rawMessage)) {
      return rawMessage[0];
    }

    if (typeof rawMessage === 'string') {
      return rawMessage;
    }

    return mode === AuthModeValues.Login
      ? 'שם משתמש או סיסמה שגויים'
      : 'ההרשמה נכשלה, נסי שוב';
  }

  return 'משהו השתבש, נסי שוב מאוחר יותר';
}
