import type { InterfaceLanguage } from "./types";

const en = {
  dashboard: "Dashboard",
  create: "Create notes",
  notes: "Library",
  folders: "Folders",
  settings: "Settings",
  billing: "Billing",
  logout: "Log out",
  welcome: "Welcome back",
  startFree: "Start Free",
  generate: "Generate notes",
};

const ur: typeof en = {
  dashboard: "ڈیش بورڈ",
  create: "نوٹس بنائیں",
  notes: "لائبریری",
  folders: "فولڈرز",
  settings: "ترتیبات",
  billing: "بلنگ",
  logout: "لاگ آؤٹ",
  welcome: "خوش آمدید",
  startFree: "مفت شروع کریں",
  generate: "نوٹس بنائیں",
};

const dict: Record<InterfaceLanguage, typeof en> = { en, ur };

export function t(lang: InterfaceLanguage, key: keyof typeof en): string {
  return dict[lang]?.[key] ?? dict.en[key];
}

export function dirForInterface(lang: InterfaceLanguage): "ltr" | "rtl" {
  return lang === "ur" ? "rtl" : "ltr";
}

export function dirForNoteLanguage(language: string): "ltr" | "rtl" {
  return language === "urdu" ? "rtl" : "ltr";
}
