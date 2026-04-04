'use server';

import {cookies} from 'next/headers';
import {Locale, defaultLocale} from '@/config';
import {revalidatePath} from 'next/cache';

// In this example the locale is read from a cookie. You could alternatively
// also read it from a database, backend service, or any other source.
const COOKIE_NAME = 'NEXT_LOCALE';

export async function getUserLocale() {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value || defaultLocale;
}

export async function setUserLocale(locale: Locale) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: COOKIE_NAME,
    value: locale,
    path: '/',
    maxAge: 31536000
  });
  revalidatePath('/');
}