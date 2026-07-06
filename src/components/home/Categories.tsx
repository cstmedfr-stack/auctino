"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Container } from "../layout/Container";
import { Card } from "../ui/Card";

type Category = {
  id: string;
  name_ro: string;
  slug: string;
  icon: string | null;
};

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name_ro, slug, icon")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (!error) {
        setCategories(data || []);
      }
    };

    loadCategories();
  }, []);

  return (
    <section className="bg-white py-20">
      <Container>
        <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-orange-500">
              Categorii
            </p>

            <h2 className="max-w-2xl text-4xl font-extrabold text-slate-900">
              Explorează rapid cele mai populare categorii.
            </h2>
          </div>

          <Link
            href="/dashboard"
            className="font-semibold text-slate-700 hover:text-orange-500"
          >
            Vezi toate licitațiile →
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/dashboard?category=${category.id}`}
            >
              <Card className="group h-full cursor-pointer p-7 transition hover:-translate-y-1 hover:shadow-md">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-3xl">
                  {category.icon || "📦"}
                </div>

                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-xl font-bold text-slate-900">
                    {category.name_ro}
                  </h3>

                  <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-orange-500" />
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Vezi licitațiile active din această categorie.
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}