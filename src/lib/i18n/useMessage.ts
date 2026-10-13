"use client";

import { useTranslations } from "next-intl";
import type { MessageDescriptor } from "./message";

/** Traduce un MessageDescriptor en un componente cliente. */
export function useMessage() {
  const t = useTranslations();
  return (descriptor: MessageDescriptor) => t(descriptor.key, descriptor.values);
}
