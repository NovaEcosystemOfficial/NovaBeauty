import { FirebaseError } from "firebase/app";
import { BootstrapWriteError } from "./user-documents";

const authErrorMessages: Record<string, string> = {
  "auth/invalid-email": "Inserisci un indirizzo email valido.",
  "auth/invalid-api-key": "Configurazione Firebase non valida: API key mancante o errata.",
  "auth/api-key-not-valid.-please-pass-a-valid-api-key.": "Configurazione Firebase non valida: API key mancante o errata.",
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
  console.error("Firebase auth flow failed", error);

  if (error instanceof BootstrapWriteError) {
    return "Account creato, ma non siamo riusciti a preparare lo spazio NovaBeauty. Riprova tra poco o contatta il supporto.";
  }

  if (error instanceof FirebaseError) {
    return authErrorMessages[error.code] ?? "Non siamo riusciti a completare l'operazione. Controlla i dati e riprova.";
  }

  return "Si e' verificato un errore inatteso. Riprova.";
}
