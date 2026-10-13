import { getTranslations } from "next-intl/server";
import type { MessageDescriptor } from "./message";

/** Traduce un MessageDescriptor en el servidor, con el idioma de la petición. */
export async function translateMessage(descriptor: MessageDescriptor): Promise<string> {
  const t = await getTranslations();
  return t(descriptor.key, descriptor.values);
}
