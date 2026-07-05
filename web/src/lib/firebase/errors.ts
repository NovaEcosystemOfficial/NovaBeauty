import { FirebaseError } from "firebase/app";

const authErrorMessages: Record<string, string> = {
  "auth/invalid-email": "Inserisci un indirizzo email valido.",
  "auth/user-disabled": "Questo account e' stato disabilitato.",
  "auth/user-not-found": "Non esiste un account con questa email.",
  "auth/wrong-password": "La password non e' corretta.",
  "auth/invalid-credential": "Email o password non corretti.",
  "auth/email-already-in-use": "Esiste gia' un account con questa email.",
  "auth/weak-password": "La password deve contenere almeno 6 caratteri.",
  "auth/missing-password": "Inserisci la password.",
  "auth/too-many-requests": "Troppi tentativi. Riprova tra qualche minuto.",
  "auth/network-request-failed": "Connessione non disponibile. Controlla la rete e riprova."
};

export function getReadableAuthError(error: unknown) {
  if (error instanceof FirebaseError) {
    return authErrorMessages[error.code] ?? "Si e' verificato un errore. Riprova.";
  }

  return "Si e' verificato un errore inatteso. Riprova.";
}
