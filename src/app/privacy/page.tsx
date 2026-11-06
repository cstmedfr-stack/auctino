
"use client";

import LegalPageShell from "@/components/legal/LegalPageShell";
import { useMessages } from "@/i18n/useMessages";
import { useLocale } from "@/i18n/LocaleProvider";

export default function PrivacyPage() {
  const messages = useMessages();
  const { locale } = useLocale();

  const t = messages.legal.common;
  const page = messages.legal.privacy;

  const controllerSection = {
    title:
      locale === "fr"
        ? "Responsable du traitement des données"
        : "Operatorul datelor cu caracter personal",

    body:
      locale === "fr"
        ? [
            "CST FAMILY HOME SRL, société établie en Roumanie et exploitant la plateforme Auctino, est responsable du traitement des données personnelles effectué pour le fonctionnement de la plateforme lorsqu'elle en détermine les finalités et les moyens.",
            "Ces traitements concernent notamment la création et la gestion des comptes, les annonces, les enchères, la messagerie, les notifications, les transactions, la sécurité et l'assistance aux utilisateurs.",
            "Pour toute question concernant vos données personnelles ou l'exercice de vos droits, vous pouvez contacter l'exploitant via la page Contact d'Auctino.",
          ]
        : [
            "CST FAMILY HOME SRL, societate înregistrată în România și operator al platformei Auctino, este operatorul datelor cu caracter personal prelucrate pentru funcționarea platformei, în măsura în care stabilește scopurile și mijloacele prelucrării.",
            "Aceste prelucrări privesc, între altele, crearea și administrarea conturilor, anunțurile, licitațiile, mesageria, notificările, tranzacțiile, securitatea și asistența acordată utilizatorilor.",
            "Pentru întrebări referitoare la datele personale sau pentru exercitarea drepturilor prevăzute de legislația aplicabilă, poți contacta operatorul prin pagina Contact a platformei Auctino.",
          ],
  };

  return (
    <LegalPageShell
      eyebrow={page.eyebrow}
      title={page.title}
      description={page.description}
      lastUpdatedLabel={t.lastUpdated}
      lastUpdated={
        locale === "fr"
          ? "6 novembre 2026"
          : "6 noiembrie 2026"
      }
      sections={[controllerSection, ...page.sections]}
      backLabel={t.backHome}
    />
  );
}
