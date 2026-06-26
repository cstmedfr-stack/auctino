import {
  BadgeCheck,
  Clock3,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { Card } from "../ui/Card";
import { Container } from "../layout/Container";

const features = [
  {
    icon: Wallet,
    title: "Publicare gratuită",
    description:
      "Adaugă produse fără taxe și începe licitația în câteva minute.",
  },
  {
    icon: BadgeCheck,
    title: "Licitații transparente",
    description:
      "Toate ofertele sunt vizibile și câștigă întotdeauna cea mai bună ofertă.",
  },
  {
    icon: Clock3,
    title: "Rapid",
    description:
      "Proces simplu și intuitiv pentru vânzători și cumpărători.",
  },
  {
    icon: ShieldCheck,
    title: "Siguranță",
    description:
      "Platformă construită pentru tranzacții de încredere.",
  },
];

export function WhyVendora() {
  return (
    <section className="bg-[#FAFAF8] py-24">
      <Container>
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-orange-500">
            De ce Vendora?
          </p>

          <h2 className="text-4xl font-extrabold text-slate-900">
            O experiență premium pentru licitații.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            Am construit Vendora pentru oameni care vor să vândă și să cumpere
            simplu, rapid și în siguranță.
          </p>
        </div>

        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card
                key={feature.title}
                className="p-8 text-center transition-all hover:-translate-y-1"
              >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100">
                  <Icon className="h-8 w-8 text-orange-500" />
                </div>

                <h3 className="mb-3 text-xl font-bold text-slate-900">
                  {feature.title}
                </h3>

                <p className="leading-7 text-slate-500">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}