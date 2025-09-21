import { useTranslations, useLocale } from "next-intl";
import {LocaleSwitcherSelect} from "./LocaleSwitcherSelect";

export const LanguageSelector = () => {

  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();

  return (
    <>
      <LocaleSwitcherSelect
        defaultValue={locale}
        items={[
          {
            value: 'en',
            label: t('en')
          },
          {
            value: 'es',
            label: t('es')
          }
        ]}
        label={t('label')}
      />
    </>
  );

};