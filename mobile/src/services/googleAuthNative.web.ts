export function isNativeGoogleSignInAvailable(): boolean {
  return false;
}

export async function configureNativeGoogleSignIn(): Promise<void> {}

export async function signInWithGoogleNative(): Promise<void> {
  throw new Error('Native Google Sign-In is not available on web.');
}

export async function signOutNativeGoogle(): Promise<void> {}

export async function formatNativeGoogleSignInError(error: unknown): Promise<string> {
  return error instanceof Error ? error.message : 'Google sign-in failed.';
}
