"use client";

import { useRef, useState, type FormEvent } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import {
  CheckCircle2,
  Lightbulb,
  MessageSquarePlus,
  Send,
} from "lucide-react";

import { Container } from "@/components/layout/Container";
import { useLocale } from "@/i18n/LocaleProvider";

type SuggestionCategory =
  | "category"
  | "feature"
  | "bug"
  | "design"
  | "other";

type SubmissionState = "idle" | "sending" | "success" | "error";

const categoryIds: SuggestionCategory[] = [
  "category",
  "feature",
  "bug",
  "design",
  "other",
];

const translations = {
  ro: {
    eyebrow: "Comunitatea Auctino",
    title: "Ajută-ne să îmbunătățim Auctino",
    subtitle:
      "Auctino crește alături de utilizatorii săi. Propune categorii noi, funcționalități utile sau spune-ne ce putem îmbunătăți.",
    sectionTitle: "Trimite-ne ideea ta",
    sectionDescription:
      "Fiecare sugestie este analizată. Nu este nevoie să ai cont pentru a ne scrie.",
    typeLabel: "Ce tip de sugestie ai?",
    messageLabel: "Descrie sugestia ta",
    placeholder:
      "De exemplu: Mi-ar plăcea să existe o categorie pentru obiecte de colecție sau posibilitatea de a salva căutările preferate...",
    send: "Trimite sugestia",
    sending: "Se trimite...",
    successTitle: "Mulțumim pentru sugestie!",
    successText:
      "Ideea ta a fost trimisă și va fi analizată de echipa Auctino.",
    sendAnother: "Trimite încă o sugestie",
    error: "Sugestia nu a putut fi trimisă. Te rugăm să încerci din nou.",
    validation: "Mesajul trebuie să conțină între 10 și 2000 de caractere.",
    privacy:
      "Nu introduce parole, adrese, numere de telefon sau alte informații personale în mesaj.",
    security: "Verificare anti-spam",
    securityPending: "Așteaptă finalizarea verificării de securitate.",
    footer:
      "Împreună putem construi o platformă de licitații mai simplă, utilă și sigură.",
    categories: {
      category: "Propun o categorie nouă de produse",
      feature: "Propun o funcționalitate nouă",
      bug: "Am descoperit o problemă pe site",
      design: "Am o sugestie despre design și navigare",
      other: "Altă sugestie",
    },
  },
  fr: {
    eyebrow: "Communauté Auctino",
    title: "Aidez-nous à améliorer Auctino",
    subtitle:
      "Auctino évolue avec ses utilisateurs. Proposez de nouvelles catégories, des fonctionnalités utiles ou dites-nous ce que nous pouvons améliorer.",
    sectionTitle: "Partagez votre idée",
    sectionDescription:
      "Chaque suggestion sera examinée. Aucun compte n'est nécessaire pour nous écrire.",
    typeLabel: "Quel type de suggestion souhaitez-vous envoyer ?",
    messageLabel: "Décrivez votre suggestion",
    placeholder:
      "Par exemple : J'aimerais une catégorie pour les objets de collection ou la possibilité d'enregistrer mes recherches favorites...",
    send: "Envoyer la suggestion",
    sending: "Envoi en cours...",
    successTitle: "Merci pour votre suggestion !",
    successText:
      "Votre idée a été envoyée et sera examinée par l'équipe Auctino.",
    sendAnother: "Envoyer une autre suggestion",
    error: "Votre suggestion n'a pas pu être envoyée. Veuillez réessayer.",
    validation: "Le message doit contenir entre 10 et 2000 caractères.",
    privacy:
      "Ne communiquez pas de mots de passe, adresses, numéros de téléphone ou autres données personnelles.",
    security: "Vérification anti-spam",
    securityPending: "Attendez la fin de la vérification de sécurité.",
    footer:
      "Ensemble, construisons une plateforme d'enchères plus simple, utile et sécurisée.",
    categories: {
      category: "Proposer une nouvelle catégorie de produits",
      feature: "Proposer une nouvelle fonctionnalité",
      bug: "Signaler un problème sur le site",
      design: "Suggérer une amélioration du design",
      other: "Autre suggestion",
    },
  },
} as const;

export default function SuggestionsPage() {
  const { locale } = useLocale();
  const t = translations[locale];
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const turnstileRef = useRef<TurnstileInstance | null>(null);

  const [category, setCategory] = useState<SuggestionCategory>("feature");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [captchaReady, setCaptchaReady] = useState(false);
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const messageLength = message.trim().length;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionState === "sending") return;

    if (messageLength < 10 || messageLength > 2000) {
      setErrorMessage(t.validation);
      setSubmissionState("error");
      return;
    }

    const turnstileToken = turnstileRef.current?.getResponse();
    if (!turnstileToken) {
      setErrorMessage(t.securityPending);
      setSubmissionState("error");
      return;
    }

    setSubmissionState("sending");
    setErrorMessage("");

    try {
      const response = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          message: message.trim(),
          website,
          turnstileToken,
        }),
      });

      if (!response.ok) {
        // Human-readable errors are defined by the server, with a localized fallback.
        const result: unknown = await response.json().catch(() => null);
        const serverError =
          result && typeof result === "object" && "error" in result
            ? (result as { error?: unknown }).error
            : null;
        throw new Error(typeof serverError === "string" ? serverError : t.error);
      }

      setSubmissionState("success");
      setMessage("");
      setWebsite("");
    } catch (error) {
      setSubmissionState("error");
      setErrorMessage(error instanceof Error ? error.message : t.error);
      // Turnstile tokens are single-use; a retry requires a fresh one.
      setCaptchaReady(false);
      turnstileRef.current?.reset();
    }
  }

  function resetForm() {
    setCategory("feature");
    setMessage("");
    setWebsite("");
    setErrorMessage("");
    setCaptchaReady(false);
    setSubmissionState("idle");
    turnstileRef.current?.reset();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Container>
        <div className="mx-auto max-w-3xl py-12 sm:py-16">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <Lightbulb size={32} />
            </div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              {t.eyebrow}
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              {t.title}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
              {t.subtitle}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
            {submissionState === "success" ? (
              <div role="status" className="py-10 text-center">
                <CheckCircle2 size={52} className="mx-auto text-green-600" />
                <h2 className="mt-5 text-2xl font-bold text-slate-950">
                  {t.successTitle}
                </h2>
                <p className="mx-auto mt-3 max-w-md text-slate-600">
                  {t.successText}
                </p>
                <button
                  type="button"
                  onClick={resetForm}
                  className="mt-7 rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800"
                >
                  {t.sendAnother}
                </button>
              </div>
            ) : (
              <>
                <div className="mb-7 flex items-start gap-3">
                  <MessageSquarePlus className="mt-1 shrink-0 text-blue-700" size={26} />
                  <div>
                    <h2 className="text-xl font-bold text-slate-950">
                      {t.sectionTitle}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {t.sectionDescription}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="suggestion-category"
                      className="mb-2 block text-sm font-semibold text-slate-800"
                    >
                      {t.typeLabel}
                    </label>
                    <select
                      id="suggestion-category"
                      value={category}
                      onChange={(event) => setCategory(event.target.value as SuggestionCategory)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      {categoryIds.map((id) => (
                        <option key={id} value={id}>
                          {t.categories[id]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="suggestion-message"
                      className="mb-2 block text-sm font-semibold text-slate-800"
                    >
                      {t.messageLabel}
                    </label>
                    <textarea
                      id="suggestion-message"
                      value={message}
                      onChange={(event) => {
                        setMessage(event.target.value);
                        if (submissionState === "error") {
                          setSubmissionState("idle");
                          setErrorMessage("");
                        }
                      }}
                      rows={7}
                      maxLength={2000}
                      required
                      placeholder={t.placeholder}
                      className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <p className="mt-2 text-right text-xs text-slate-400">
                      {messageLength} / 2000
                    </p>
                  </div>

                  <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
                    <label htmlFor="suggestion-website">Website</label>
                    <input
                      id="suggestion-website"
                      name="website"
                      type="text"
                      value={website}
                      onChange={(event) => setWebsite(event.target.value)}
                      autoComplete="off"
                      tabIndex={-1}
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-medium text-slate-500">
                      {t.security}
                    </p>
                    {turnstileSiteKey ? (
                      <Turnstile
                        ref={turnstileRef}
                        siteKey={turnstileSiteKey}
                        onSuccess={() => setCaptchaReady(true)}
                        onExpire={() => setCaptchaReady(false)}
                        onError={() => setCaptchaReady(false)}
                      />
                    ) : (
                      <p role="alert" className="text-sm text-red-600">
                        {t.error}
                      </p>
                    )}
                  </div>

                  {submissionState === "error" && (
                    <p
                      role="alert"
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                      {errorMessage}
                    </p>
                  )}

                  <p className="text-xs leading-5 text-slate-500">
                    {t.privacy}
                  </p>

                  <button
                    type="submit"
                    disabled={
                      submissionState === "sending" ||
                      !captchaReady ||
                      messageLength < 10 ||
                      messageLength > 2000
                    }
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send size={17} />
                    {submissionState === "sending" ? t.sending : t.send}
                  </button>
                </form>
              </>
            )}
          </div>

          <p className="mt-7 text-center text-sm text-slate-500">
            {t.footer}
          </p>
        </div>
      </Container>
    </main>
  );
}
