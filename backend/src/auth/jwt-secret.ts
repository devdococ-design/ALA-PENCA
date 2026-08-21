const DEV_FALLBACK = 'ala-penca-dev-secret';

/** JWT signing secret. In production, JWT_SECRET must be set explicitly. */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    if (!secret || secret === DEV_FALLBACK || secret.includes('change-me')) {
      throw new Error(
        'JWT_SECRET must be set to a strong unique value when NODE_ENV=production.',
      );
    }
    return secret;
  }

  return secret || DEV_FALLBACK;
}
