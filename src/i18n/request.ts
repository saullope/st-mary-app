import {getRequestConfig} from 'next-intl/server';
import {getUserLocale} from '@/services/locale';

export default getRequestConfig(async () => {
  const locale = await getUserLocale();

  return {
    locale,
    // Misma referencia de "ahora" en el servidor y el cliente: las fechas relativas
    // ("hace 2 días") no cambian al hidratar ni caen en el valor de cada entorno.
    now: new Date(),
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});