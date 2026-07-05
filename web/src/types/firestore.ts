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
  phone: string;
  notes: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type ServiceDocument = {
  ownerId: string;
  syncId: string;
  name: string;
  price: number;
  durationMinutes: number;
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
  reminderMinutes: number;
  notificationIdentifier: string | null;
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
