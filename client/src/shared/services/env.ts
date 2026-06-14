/**
 * Typed access to Vite environment variables.
 */
export const env = {
  apiUrl: import.meta.env.VITE_API_URL as string,
} as const;

if (!env.apiUrl) {
  console.warn(
    'VITE_API_URL is not set. Copy client/.env.example to client/.env',
  );
}
