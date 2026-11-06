
"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Mail,
  FileText,
} from "lucide-react";

import { useLocale } from "@/i18n/LocaleProvider";

export default function LegalInformationPage() {
  const { locale } = useLocale();
  const isFr = locale === "fr";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-900"
        >
          <ArrowLeft size={17} />
          {isFr
            ? "Retour à l'accueil"
            : "Înapoi la prima pagină"}
        </Link>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
            <Building2 size={28} />
          </div>

          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-indigo-700">
            Auctino
          </p>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            {isFr
              ? "Mentions légales"
              : "Informații legale"}
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-600">
            {isFr
              ? "Informations relatives à la société exploitant et administrant la plateforme Auctino."
              : "Informații privind societatea care operează și administrează platforma Auctino."}
          </p>

          <section className="mt-9 border-t border-slate-200 pt-8">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-950">
              <FileText
                size={21}
                className="text-indigo-700"
              />

              {isFr
                ? "Identification de la société"
                : "Datele de identificare ale societății"}
            </h2>

            <div className="grid gap-6 sm:grid-cols-2">
              <InfoRow
                label={
                  isFr
                    ? "Dénomination sociale"
                    : "Denumire societate"
                }
                value="CST FAMILY HOME SRL"
              />

              <InfoRow
                label={
                  isFr
                    ? "Code d'identification fiscale"
                    : "Cod unic de înregistrare (CUI)"
                }
                value="43415338"
              />

              <InfoRow
                label={
                  isFr
                    ? "Registre du commerce"
                    : "Nr. Registrul Comerțului"
                }
                value="J35/3636/2020"
              />

              <InfoRow
                label={
                  isFr
                    ? "Date d'immatriculation"
                    : "Data înregistrării"
                }
                value="07.12.2020"
              />

              <InfoRow
                label={
                  isFr
                    ? "Siège social"
                    : "Sediu social"
                }
                value="Str. Câmpului nr. 84, Timișoara, jud. Timiș, România"
              />

              <InfoRow
                label={
                  isFr
                    ? "Plateforme exploitée"
                    : "Platformă administrată"
                }
                value="Auctino"
              />
            </div>

            <div className="mt-7">
              <p className="text-sm font-semibold text-slate-500">
                {isFr ? "Contact" : "Date de contact"}
              </p>

              <a
                href="mailto:contact@auctino.ro"
                className="mt-2 inline-flex items-center gap-2 font-medium text-indigo-700 hover:underline"
              >
                <Mail size={17} />
                contact@auctino.ro
              </a>
            </div>
          </section>

          <section className="mt-9 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5 sm:p-6">
            <h2 className="text-lg font-bold text-slate-950">
              {isFr
                ? "Activité de la plateforme"
                : "Activitatea platformei"}
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-700">
              {isFr
                ? "Auctino est une plateforme numérique de petites annonces et d'enchères entre utilisateurs, exploitée par CST FAMILY HOME SRL. La société fournit les fonctionnalités techniques nécessaires à la publication d'annonces, aux enchères et aux échanges entre utilisateurs."
                : "Auctino este o platformă digitală de anunțuri și licitații între utilizatori, operată de CST FAMILY HOME SRL. Societatea pune la dispoziție funcționalitățile tehnice necesare publicării anunțurilor, desfășurării licitațiilor și comunicării dintre utilizatori."}
            </p>

            <p className="mt-3 text-sm leading-7 text-slate-700">
              {isFr
                ? "Sauf indication contraire, les produits proposés par les utilisateurs ne sont pas vendus directement par CST FAMILY HOME SRL."
                : "Cu excepția situațiilor indicate explicit, produsele publicate de utilizatori nu sunt vândute direct de CST FAMILY HOME SRL."}
            </p>
          </section>

          <section className="mt-9 border-t border-slate-200 pt-7">
            <h2 className="text-lg font-bold text-slate-950">
              {isFr
                ? "Informations complémentaires"
                : "Informații suplimentare"}
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              {isFr
                ? "Pour en savoir plus sur les règles de la plateforme et le traitement des données personnelles, consultez les documents ci-dessous."
                : "Pentru mai multe informații despre regulile platformei și prelucrarea datelor personale, consultă documentele de mai jos."}
            </p>

            <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold text-indigo-700">
              <Link
                href="/terms"
                className="hover:underline"
              >
                {isFr
                  ? "Conditions d'utilisation"
                  : "Termeni și condiții"}
              </Link>

              <Link
                href="/privacy"
                className="hover:underline"
              >
                {isFr
                  ? "Confidentialité"
                  : "Politica de confidențialitate"}
              </Link>

              <Link
                href="/contact"
                className="hover:underline"
              >
                {isFr ? "Contact" : "Contact"}
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-medium text-slate-900">
        {value}
      </p>
    </div>
  );
}
