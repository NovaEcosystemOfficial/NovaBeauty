import type { CapacitorConfig } from "@capacitor/cli";

const defaultServerUrl = "https://nova-beauty-seven.vercel.app";
const serverUrl = (process.env.CAPACITOR_SERVER_URL ?? defaultServerUrl).trim();

const config: CapacitorConfig = {
  appId: "com.novaecosystem.novabeauty",
  appName: "NovaBeauty",
  webDir: "public",
  server: {
    url: serverUrl,
    cleartext: false,
    androidScheme: "https"
  },
  android: {
    allowMixedContent: false,
    backgroundColor: "#FDFAFB"
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#FDFAFB",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#D8A7B1"
    }
  }
};

export default config;
