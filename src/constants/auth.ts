/**
 * Temporary password for newly seeded squad accounts.
 * Firebase Auth requires at least 6 characters (so "1234" is not allowed).
 * First successful sign-in forces a password change via mustChangePassword.
 */
export const DEFAULT_PASSWORD = '123456'

/** Minimum length for a user-chosen password (Firebase Auth requirement). */
export const MIN_PASSWORD_LENGTH = 6
