import { Container } from "../layout/Container";

const stats = [
  {
    value: "18.000+",
    label: "produse vândute",
  },
  {
    value: "3.500+",
    label: "utilizatori activi",
  },
  {
    value: "4.9★",
    label: "rating utilizatori",
  },
  {
    value: "98%",
    label: "licitații finalizate",
  },
];

export function TrustSection() {
  return (
    <section className="bg-[#FAFAF8] pb-20">
      <Container>
        <div className="rounded-[28px] border border-slate-200/70 bg-white px-8 py-10 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-extrabold text-slate-900">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}