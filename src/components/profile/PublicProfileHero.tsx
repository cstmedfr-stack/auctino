import { Profile } from "@/types/profile";

type PublicProfileHeroProps = {
  profile: Profile;
  trustScore: number;
  rating: number;
};

export default function PublicProfileHero({
  profile,
  trustScore,
  rating,
}: PublicProfileHeroProps) {
  const displayName =
    profile.full_name?.trim() ||
    "Utilizator Vendora";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="mb-8 overflow-hidden rounded-3xl bg-slate-950 p-8 text-white shadow-sm">
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-100 text-2xl font-extrabold text-orange-600 ring-4 ring-white/10">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-orange-300">
              Profil vânzător
            </p>

            <h1 className="text-4xl font-extrabold">
              {displayName}
            </h1>

            <p className="mt-2 text-slate-300">
              Membru Vendora • vânzător activ
            </p>

            {profile.city && (
              <p className="mt-2 text-sm text-slate-400">
                📍 {profile.city}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-white/10 px-5 py-4">
            <p className="text-sm text-slate-300">
              Trust Score
            </p>

            <p className="mt-1 text-3xl font-bold text-orange-300">
              {trustScore}/100
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 px-5 py-4">
            <p className="text-sm text-slate-300">
              Rating
            </p>

            <p className="mt-1 text-3xl font-bold text-yellow-300">
              ⭐ {rating.toFixed(1)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}