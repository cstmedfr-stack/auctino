import Link from "next/link";
import { Button } from "../ui/Button";
import { Container } from "./Container";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <Container>
        <div className="flex h-20 items-center justify-between">

          <Link
            href="/"
            className="text-3xl font-bold text-slate-900"
          >
            Vendora
          </Link>

          <nav className="hidden items-center gap-8 md:flex">

            <Link href="/licitatii">
              Licitații
            </Link>

            <Link href="#">
              Categorii
            </Link>

            <Link href="#">
              Cum funcționează
            </Link>

          </nav>

          <div className="flex gap-3">

            <Button variant="outline">
              Login
            </Button>

            <Button variant="secondary">
              Vinde acum
            </Button>

          </div>

        </div>
      </Container>
    </header>
  );
}