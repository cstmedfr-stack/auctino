
"use client";

import LegalPageShell from "@/components/legal/LegalPageShell";
import { useMessages } from "@/i18n/useMessages";
import { useLocale } from "@/i18n/LocaleProvider";

export default function TermsPage() {
  const messages = useMessages();
  const { locale } = useLocale();

  const t = messages.legal.common;
  const page = messages.legal.terms;

  const operatorSection = {
    title:
      locale === "fr"
        ? "Identification de l'exploitant"
        : "Identificarea operatorului platformei",

    body:
      locale === "fr"
        ? [
            "La plateforme Vandivo est exploitée et administrée par CST FAMILY HOME SRL, société établie en Roumanie.",
            "CST FAMILY HOME SRL met à disposition une plateforme numérique permettant aux utilisateurs de publier des produits, de participer à des enchères et de communiquer dans le cadre de transactions.",
            "Sauf indication contraire explicite, CST FAMILY HOME SRL n'est pas le vendeur des produits publiés par les utilisateurs. Les transactions portant sur ces produits sont conclues entre les parties concernées, conformément à la législation applicable.",
          ]
        : [
            "Platforma Vandivo este operată și administrată de CST FAMILY HOME SRL, societate înregistrată în România.",
            "CST FAMILY HOME SRL pune la dispoziție o platformă digitală prin intermediul căreia utilizatorii pot publica produse, participa la licitații și comunica pentru realizarea tranzacțiilor.",
            "Cu excepția situațiilor indicate explicit, CST FAMILY HOME SRL nu este vânzătorul produselor publicate de utilizatori. Tranzacțiile privind aceste produse se încheie între părțile implicate, în condițiile legislației aplicabile.",
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
      sections={[operatorSection, ...page.sections]}
      backLabel={t.backHome}
    />
  );
}
