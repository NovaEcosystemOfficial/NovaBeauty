import type { Timestamp } from "firebase/firestore";

export type BusinessType = "estetica";

export type UserDocument = {
  email: string;
  displayName: string;
  apps: {
    novabeauty: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type NovaBeautyUserDocument = {
  ownerId: string;
  email: string;
  displayName: string;
  onboardingCompleted: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type ProfileDocument = {
  ownerId: string;
  syncId: string;
  businessName: string;
  phone: string;
  address: string;
  email: string;
  ownerName: string;
  displayName: string;
  openingHours: string;
  description: string;
  businessType: BusinessType;
  imageUrl: string | null;
  onboardingCompleted: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type ClientDocument = {
  ownerId: string;
  syncId: string;
  name: string;
  surname: string;
  phone: string;
  email: string;
  birthDate: string | null;
  notes: string | null;
  photoUrl: string | null;
  lastVisit: Timestamp | null;
  appointmentsCount: number;
  totalSpent: number;
  source: "manual" | "contacts" | "vcard";
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type ServiceDocument = {
  ownerId: string;
  syncId: string;
  name: string;
  category: string;
  price: number | null;
  durationMinutes: number;
  description: string | null;
  active: boolean;
  source: "manual" | "template";
  templateId: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type ProductDocument = {
  ownerId: string;
  syncId: string;
  name: string;
  category: string;
  quantity: number;
  minimumThreshold: number;
  supplierLink: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type AppointmentDocument = {
  ownerId: string;
  syncId: string;
  date: Timestamp;
  clientId: string;
  clientNameSnapshot: string;
  serviceName: string;
  serviceId: string | null;
  price: number;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  notes: string | null;
  status: "Prenotato" | "Confermato" | "Completato" | "Annullato";
  reminderMinutes: number;
  notificationIdentifier: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type NotificationCategory = "appointment" | "client" | "finance" | "system" | "promotion";
export type NotificationPriority = "low" | "normal" | "high";

export type NotificationDocument = {
  ownerId: string;
  title: string;
  description: string;
  type: NotificationCategory;
  priority: NotificationPriority;
  date: Timestamp;
  read: boolean;
  action: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type MessagingTokenDocument = {
  ownerId: string;
  token: string;
  userAgent: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type SettingsDocument = {
  ownerId: string;
  email: string;
  displayName: string;
  theme: "estetica";
  locale: "it-IT";
  currency: "EUR";
  onboardingCompleted: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
