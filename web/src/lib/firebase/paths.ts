export const userPath = (userId: string) => `users/${userId}`;
export const novabeautyUserPath = (userId: string) => `novabeautyUsers/${userId}`;
export const profilePath = (userId: string) => `novabeautyUsers/${userId}/profile/main`;
export const settingsPath = (userId: string) => `novabeautyUsers/${userId}/settings/main`;
export const clientsPath = (userId: string) => `novabeautyUsers/${userId}/clients`;
export const servicesPath = (userId: string) => `novabeautyUsers/${userId}/services`;
export const appointmentsPath = (userId: string) => `novabeautyUsers/${userId}/appointments`;
export const productsPath = (userId: string) => `novabeautyUsers/${userId}/products`;
export const inventoryPath = (userId: string) => `novabeautyUsers/${userId}/inventory`;
export const notificationsPath = (userId: string) => `novabeautyUsers/${userId}/notifications`;
export const messagingTokensPath = (userId: string) => `novabeautyUsers/${userId}/messagingTokens`;
export const profileImagePath = (userId: string) => `novabeautyUsers/${userId}/profile/profile.jpg`;
export const clientDiarioPath = (userId: string, clientId: string) => `novabeautyUsers/${userId}/clients/${clientId}/diario`;
export const clientDiarioPhotoPath = (
  userId: string,
  clientId: string,
  entryId: string,
  phase: "before" | "after",
  fileName: string
) => `apps/novabeauty/users/${userId}/clients/${clientId}/diario/${entryId}/${phase}/${fileName}`;
