import { collection, deleteDoc, doc, getDocs, query } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { deleteDiarioPhotos } from "@/lib/firebase/diary-storage";
import { clientDiarioPath } from "@/lib/firebase/paths";
import type { DiarioEntryDocument, DiarioPhoto } from "@/types/firestore";

function collectEntryPhotos(entry: DiarioEntryDocument) {
  return [...(entry.photosBefore ?? []), ...(entry.photosAfter ?? []), ...(entry.photos ?? [])];
}

export async function deleteClientDiarioData(userId: string, clientId: string) {
  const diarioCollectionPath = clientDiarioPath(userId, clientId);
  const snapshot = await getDocs(query(collection(db, diarioCollectionPath)));

  await Promise.allSettled(
    snapshot.docs.map(async (entryDoc) => {
      const entry = entryDoc.data() as DiarioEntryDocument;
      await deleteDiarioPhotos(collectEntryPhotos(entry));
      await deleteDoc(doc(db, diarioCollectionPath, entryDoc.id));
    })
  );
}

export function collectDiarioPhotos(photosBefore: DiarioPhoto[], photosAfter: DiarioPhoto[]) {
  return [...photosBefore, ...photosAfter];
}
