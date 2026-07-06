import { ArrowRight, Gavel, PackagePlus, Trophy } from "lucide-react";
import { Container } from "../layout/Container";
import { Card } from "../ui/Card";

const steps = [
  {
    icon: PackagePlus,
    title: "Publici produsul",
    description: "În câteva minute adaugi fotografii, descrierea și stabilești prețul de pornire al licitației.",
  },
  {
    icon: Gavel,
    title: "Primești oferte",
    description: "Primești oferte în timp real și urmărești evoluția licitației direct din contul tău.",
  },
  {
    icon: Trophy,
    title: "Vinzi celui mai bun ofertant",
    description: "La încheierea licitației, produsul este adjudecat automat celui mai bun ofertant.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-white py-24">
      <Container>
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-orange-500">
            Cum funcționează
          </p>

          <h2 className="text-4xl font-extrabold text-slate-900">
            Vinzi simplu, în 3 pași.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            Publică gratuit, urmărește licitația în timp real și vinde rapid celui care oferă cel mai bun preț.
          </p>
        </div>

        <div className="grid gap-7 lg:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div key={step.title} className="relative">
                <Card className="h-full p-8">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100">
                    <Icon className="h-8 w-8 text-orange-500" />
                  </div>

                  <p className="mb-4 text-sm font-bold text-orange-500">
                    Pasul {index + 1}
                  </p>

                  <h3 className="mb-4 text-2xl font-bold text-slate-900">
                    {step.title}
                  </h3>

                  <p className="leading-7 text-slate-500">
                    {step.description}
                  </p>
                </Card>

                {index < steps.length - 1 && (
                  <ArrowRight className="absolute -right-5 top-1/2 hidden h-6 w-6 text-slate-300 lg:block" />
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}