import { CheckCircle2 } from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { Container } from "../layout/Container";

const benefits = [
  "Publicare gratuită",
  "Fără negocieri inutile",
  "Licitații în timp real",
];

export function Hero() {
  return (
    <section className="bg-[#FAFAF8] py-24">
      <Container>
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <Badge variant="accent" className="mb-6">
              Marketplace premium de licitații
            </Badge>

            <h1 className="mb-8 text-5xl font-extrabold leading-tight text-slate-900 md:text-6xl">
              Transformă lucrurile pe care nu le mai folosești în bani.
            </h1>

            <p className="mb-10 max-w-xl text-lg leading-8 text-slate-600">
              Publică gratuit un produs și lasă cumpărătorii să liciteze pentru
              cel mai bun preț.
            </p>

            <div className="mb-8 flex flex-col gap-4 sm:flex-row">
              <Button size="lg">Vinde acum</Button>
              <Button variant="outline" size="lg">
                Explorează licitațiile
              </Button>
            </div>

            <div className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:flex-wrap">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-orange-500" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-orange-100 blur-3xl" />

            <Card className="relative p-6">
              <div className="mb-6 h-72 rounded-[24px] bg-slate-100" />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Bicicletă urbană
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Licitație activă
                  </p>
                </div>

                <Badge variant="accent">12 oferte</Badge>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Oferta actuală</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    850 RON
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Timp rămas</p>
                  <p className="mt-1 text-2xl font-bold text-orange-500">
                    02:14:32
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </section>
  );
}