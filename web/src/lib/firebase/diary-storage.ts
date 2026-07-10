import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase/client";
import { clientDiarioPhotoPath } from "@/lib/firebase/paths";
import type { DiarioPhoto } from "@/types/firestore";

const maxPhotoBytes = 8 * 1024 * 1024;
const acceptedPhotoTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

export function validateDiarioPhoto(file: File) {
  if (!acceptedPhotoTypes.has(file.type)) {
    return "Formato non supportato. Usa JPG, PNG o WEBP.";
  }

  if (file.size > maxPhotoBytes) {
    return "La foto supera i 8 MB.";
  }

  return null;
}

export async function uploadDiarioPhoto({
  userId,
  clientId,
  entryId,
  phase,
  file
}: {
  userId: string;
  clientId: string;
  entryId: string;
  phase: "before" | "after";
  file: File;
}): Promise<DiarioPhoto> {
  const photoId = crypto.randomUUID();
  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const storagePath = clientDiarioPhotoPath(userId, clientId, entryId, phase, `${photoId}.${extension}`);
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, file, { contentType: file.type });
  const downloadUrl = await getDownloadURL(storageRef);

  return {
    id: photoId,
    storagePath,
    downloadUrl,
    phase
  };
}

export async function deleteDiarioPhotos(photos: DiarioPhoto[]) {
  await Promise.allSettled(
    photos.map((photo) => {
      if (!photo.storagePath) {
        return Promise.resolve();
      }

      return deleteObject(ref(storage, photo.storagePath));
    })
  );
}
