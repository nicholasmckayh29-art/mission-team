import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

import { auth } from '../config/firebase';

export async function signInWithGoogleOnWeb(): Promise<void> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  await signInWithPopup(auth, provider);
}
