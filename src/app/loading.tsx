export default function LoadingPage() {
  return (
    <main className="min-h-[70vh] bg-slate-50 px-4 py-16">
      <section className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />

        <p className="text-sm font-semibold text-slate-600">
          Loading Vandivo...
        </p>
      </section>
    </main>
  );
}