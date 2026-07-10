export const routes = {
  login: "/login",
  register: "/register",
  resetPassword: "/reset-password",
  dashboard: "/dashboard",
  clients: "/clients",
  clientSheet: (clientId: string) => `/clients/${clientId}`,
  clientDiario: (clientId: string) => `/clients/${clientId}/diario`,
  clientDiarioNew: (clientId: string) => `/clients/${clientId}/diario/new`,
  clientDiarioEntry: (clientId: string, entryId: string) => `/clients/${clientId}/diario/${entryId}`,
  clientDiarioEdit: (clientId: string, entryId: string) => `/clients/${clientId}/diario/${entryId}/edit`,
  appointments: "/appointments",
  appointmentsForClient: (clientId: string) => `/appointments?clientId=${clientId}`,
  services: "/services",
  statistics: "/statistics",
  profile: "/profile"
} as const;
