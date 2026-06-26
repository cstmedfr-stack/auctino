import { ArrowRight, Bike, Gem, Home, Laptop, Shirt, Smartphone } from "lucide-react";
import { Container } from "../layout/Container";
import { Card } from "../ui/Card";

const categories = [
  { name: "Electronice", icon: Smartphone },
  { name: "Laptopuri", icon: Laptop },
  { name: "Mobilă", icon: Home },
  { name: "Fashion", icon: Shirt },
  { name: "Sport", icon: Bike },
  { name: "Colecții", icon: Gem },
];

export function Categories() {
  return (
    <section className="bg-[#FAFAF8] py-20">
      <Container>
        <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-orange-500">
              Categorii
            </p>
            <h2 className="max-w-2xl text-4xl font-extrabold text-slate-900">
              Găsește rapid obiectele care merită o nouă viață.
            </h2>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <Card
                key={category.name}
                className="group cursor-pointer p-7"
              >
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                  <Icon className="h-7 w-7" />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-xl font-bold text-slate-900">
                    {category.name}
                  </h3>

                  <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-orange-500" />
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Vezi licitațiile disponibile în această categorie.
                </p>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}