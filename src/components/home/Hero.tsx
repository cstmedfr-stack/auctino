
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";

import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Gavel,
  Heart,
  Lightbulb,
  MessageCircle,
  Package,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { useMessages } from "@/i18n/useMessages";
import { useLocale } from "@/i18n/LocaleProvider";

export function Hero() {
  const messages = useMessages();
  const t = messages.home.hero;

  const { locale } = useLocale();

  const router = useRouter();
  const [search, setSearch] = useState("");

  const suggestionText =
    locale === "fr"
      ? {
          title: "Construisons Vandivo ensemble !",
          description:
            "Vous avez une idée, une suggestion ou une nouvelle catégorie à proposer ?",
          button: "Partagez votre idée",
        }
      : {
          title: "Construim Vandivo împreună!",
          description:
            "Ai o idee, o sugestie sau o categorie nouă pe care ai vrea să o găsești?",
          button: "Trimite o sugestie",
        };

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const query = search.trim();

    if (!query) {
      router.push("/dashboard");
      return;
    }

    router.push(
      `/dashboard?search=${encodeURIComponent(query)}`
    );
  }

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#eef2ff,transparent_34%),radial-gradient(circle_at_top_right,#f5f3ff,transparent_28%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm backdrop-blur">
            <Sparkles size={16} />
            {t.badge}
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            {t.titleStart} {t.titleMiddle}{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              {t.titleAccent}
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            {t.subtitle}
          </p>

{/* Gratuitate Vandivo - RO / FR */}
<div className="mx-auto mt-7 max-w-2xl rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-5 shadow-sm sm:px-7">
  <div className="flex items-center justify-center gap-2">
    <BadgeCheck
      size={25}
      className="shrink-0 text-emerald-600"
    />

    <h2 className="text-lg font-black text-emerald-900 sm:text-xl">
      {locale === "fr"
        ? "100 % GRATUIT AU LANCEMENT !"
        : "100% GRATUIT LA LANSARE!"}
    </h2>
  </div>

  <p className="mt-2 text-center text-sm font-semibold leading-6 text-emerald-800 sm:text-base">
    {locale === "fr"
      ? "Inscription gratuite • Mise en vente gratuite • Enchères gratuites"
      : "Cont gratuit • Publicare gratuită • Licitare gratuită"}
  </p>

  <p className="mt-1 text-center text-xs leading-5 text-emerald-700">
    {locale === "fr"
      ? "Aucun frais d'inscription ni de publication."
      : "Fără taxe de înscriere sau publicare."}
  </p>
</div>
{/* Sfarsit sectiune gratuitate */}

          <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-6 text-slate-500">
            {t.trustLine}
          </p>

          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 max-w-2xl rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/70 transition focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-50"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex min-h-12 flex-1 items-center gap-3 px-3 sm:px-4">
                <Search
                  className="shrink-0 text-slate-400"
                  size={22}
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  className="min-w-0 flex-1 bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder={t.searchPlaceholder}
                />
              </div>

              <button
                type="submit"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                {t.searchButton}
              </button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm text-slate-500">
            {t.suggestions.map((item) => (
              <Link
                key={item}
                href={`/dashboard?search=${encodeURIComponent(
                  item
                )}`}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 transition hover:border-indigo-200 hover:text-indigo-700"
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
            >
              {t.primaryCta}
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/add-product"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-indigo-200 hover:text-indigo-700"
            >
              {t.secondaryCta}
            </Link>
          </div>

          {/* Sugestii comunitate - RO / FR */}
          <div className="mx-auto mt-9 max-w-2xl rounded-2xl border border-indigo-100 bg-indigo-50/70 px-5 py-5 shadow-sm sm:px-7">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:text-left">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                <Lightbulb size={23} />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-bold text-slate-900">
                  {suggestionText.title}
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm">
                  {suggestionText.description}
                </p>
              </div>

              <Link
                href="/sugestii"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:border-indigo-400 hover:bg-indigo-100"
              >
                {suggestionText.button}
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          {/* Sfarsit sectiune sugestii */}
        </div>

        <div className="relative mx-auto mt-16 grid max-w-5xl gap-4 md:grid-cols-4">
          <HeroInfoCard
            icon={<Package size={20} />}
            title={t.cards.product}
            description={t.cards.productDescription}
          />

          <HeroInfoCard
            icon={<Gavel size={20} />}
            title={t.cards.auction}
            description={t.cards.auctionDescription}
          />

          <HeroInfoCard
            icon={<ShieldCheck size={20} />}
            title={t.cards.offer}
            description={t.cards.offerDescription}
          />

          <HeroInfoCard
            icon={<MessageCircle size={20} />}
            title={t.cards.chat}
            description={t.cards.chatDescription}
          />
        </div>

        <div className="pointer-events-none absolute left-8 top-40 hidden rotate-[-6deg] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70 lg:block">
          <div className="mb-3 flex h-24 w-40 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <Package size={30} />
          </div>

          <div className="text-sm font-semibold text-slate-950">
            {t.cards.product}
          </div>

          <div className="mt-1 text-sm text-indigo-600">
            Vandivo
          </div>
        </div>

        <div className="pointer-events-none absolute right-10 top-44 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70 lg:block">
          <div className="flex items-center gap-3">
            <Bell
              className="text-indigo-600"
              size={20}
            />

            <div>
              <div className="text-sm font-semibold text-slate-950">
                {t.cards.offer}
              </div>

              <div className="text-xs text-slate-500">
                Vandivo
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-14 right-24 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70 xl:block">
          <div className="flex items-center gap-3">
            <Heart
              className="text-rose-500"
              size={20}
            />

            <MessageCircle
              className="text-indigo-600"
              size={20}
            />

            <ShieldCheck
              className="text-emerald-500"
              size={20}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroInfoCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/70">
      <div className="mb-3 text-indigo-600">
        {icon}
      </div>

      <div className="text-base font-semibold text-slate-950">
        {title}
      </div>

      <div className="mt-1 text-sm text-slate-500">
        {description}
      </div>
    </div>
  );
}
