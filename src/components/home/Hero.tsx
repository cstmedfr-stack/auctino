"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { Container } from "../layout/Container";

const benefits = [
  "Publicare gratuită",
  "Licitații în timp real",
  "Cumpărătorii concurează pentru cel mai bun preț",
];

export function Hero() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    const query = search.trim();

    if (!query) {
      router.push("/dashboard");
      return;
    }

    router.push(`/dashboard?search=${encodeURIComponent(query)}`);
  }

  return (
    <section className="bg-gradient-to-b from-orange-50 via-white to-white py-24">
      <Container>
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <Badge variant="accent" className="mb-6">
              Marketplace românesc de licitații
            </Badge>

            <h1 className="mb-8 text-5xl font-extrabold leading-tight text-slate-900 md:text-6xl">
              Vinde inteligent. Cumpără la cel mai bun preț.
            </h1>

            <p className="mb-8 max-w-xl text-lg leading-8 text-slate-600">
              Publică gratuit produse, urmărește ofertele în timp real și lasă
              cumpărătorii să liciteze pentru cel mai bun preț.
            </p>

            <form
              onSubmit={handleSearch}
              className="mb-6 flex max-w-xl flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row"
            >
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Caută produse, categorii sau orașe..."
                className="flex-1 rounded-2xl px-4 py-3 outline-none"
              />

              <Button type="submit">
                🔍 Caută
              </Button>
            </form>

            <div className="mb-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/add-product">
                <Button size="lg">
                  🚀 Vinde un produs
                </Button>
              </Link>

              <Link href="/dashboard">
                <Button variant="outline" size="lg">
                  Vezi toate licitațiile
                </Button>
              </Link>
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
              <div className="mb-6 rounded-[24px] bg-slate-900 p-6 text-white">
                <p className="text-sm text-slate-300">
                  Licitație populară
                </p>

                <h3 className="mt-3 text-3xl font-bold">
                  iPhone 15 Pro
                </h3>

                <p className="mt-2 text-slate-300">
                  256GB · Titanium · Ca nou
                </p>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Oferta actuală</p>
                    <p className="mt-1 text-3xl font-bold text-white">
                      3.850 lei
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">Timp rămas</p>
                    <p className="mt-1 text-3xl font-bold text-orange-400">
                      02:14:32
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                  <span className="font-semibold text-slate-800">
                    🔥 18 oferte
                  </span>
                  <span className="text-sm text-slate-500">
                    Activ acum
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                  <span className="font-semibold text-slate-800">
                    🛡 Vânzător verificat
                  </span>
                  <span className="text-sm text-slate-500">
                    Trust Score 94
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </section>
  );
}