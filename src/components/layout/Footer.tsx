import Link from "next/link";
import { Container } from "./Container";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <Container>
        <div className="flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xl font-bold text-slate-900">Vendora</p>
            <p className="mt-2 text-sm text-slate-500">
              Vinde prin licitație. Cumpără inteligent.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-slate-600">
            <Link href="/licitatii">Licitații</Link>
            <Link href="/adauga-produs">Vinde</Link>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </div>
        </div>

        <div className="border-t border-slate-100 py-4 text-sm text-slate-400">
          © 2026 Vendora. Toate drepturile rezervate.
        </div>
      </Container>
    </footer>
  );
}