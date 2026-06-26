import { Clock3 } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Container } from "../layout/Container";

const auctions = [
  {
    title: "iPhone 14 Pro",
    category: "Electronice",
    price: "2.150 RON",
    bids: "18 oferte",
    time: "02:34:12",
  },
  {
    title: "Bicicletă urbană",
    category: "Sport",
    price: "850 RON",
    bids: "12 oferte",
    time: "05:18:44",
  },
  {
    title: "Fotoliu vintage",
    category: "Mobilă",
    price: "430 RON",
    bids: "9 oferte",
    time: "11:02:07",
  },
];

export function FeaturedAuctions() {
  return (
    <section className="bg-white py-24">
      <Container>
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-orange-500">
              Licitații active
            </p>

            <h2 className="max-w-2xl text-4xl font-extrabold text-slate-900">
              Obiecte care își găsesc un nou proprietar chiar acum.
            </h2>
          </div>

          <Button variant="outline">Vezi toate licitațiile</Button>
        </div>

        <div className="grid gap-7 md:grid-cols-3">
          {auctions.map((auction) => (
            <Card key={auction.title} className="overflow-hidden p-4">
              <div className="mb-5 h-64 rounded-[24px] bg-slate-100" />

              <div className="px-2 pb-2">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <Badge variant="outline">{auction.category}</Badge>
                  <Badge variant="accent">{auction.bids}</Badge>
                </div>

                <h3 className="mb-4 text-xl font-bold text-slate-900">
                  {auction.title}
                </h3>

                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Oferta actuală</p>
                    <p className="mt-1 text-2xl font-extrabold text-slate-900">
                      {auction.price}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="flex items-center gap-1 text-sm text-slate-500">
                      <Clock3 className="h-4 w-4" />
                      Timp rămas
                    </p>
                    <p className="mt-1 font-bold text-orange-500">
                      {auction.time}
                    </p>
                  </div>
                </div>

                <Button className="w-full">Licitează</Button>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}