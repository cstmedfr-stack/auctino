"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {  deleteOwnAvatar,  uploadOwnAvatar,} from "@/services/avatar.service";
import { supabase } from "@/lib/supabase";

import {
  getProfile,
  updateOwnProfile,
} from "@/services/profile.service";

type OwnProfile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  avatar_url: string | null;
};

export default function EditProfilePage() {
  const router = useRouter();

  const [fullName, setFullName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [city, setCity] =
    useState("");

  const [avatarUrl, setAvatarUrl] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      const {
        data,
        error: profileError,
      } = await getProfile(user.id);

      if (!isMounted) {
        return;
      }

      if (profileError || !data) {
        setError(
          profileError?.message ||
            "Profilul nu a putut fi încărcat."
        );

        setLoading(false);
        return;
      }

      const profile =
        data as OwnProfile;

      setFullName(
        profile.full_name ?? ""
      );

      setPhone(
        profile.phone ?? ""
      );

      setCity(
        profile.city ?? ""
      );

      setAvatarUrl(
        profile.avatar_url ?? ""
      );

      setLoading(false);
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const [
  avatarUploading,
  setAvatarUploading,
] = useState(false);

const [
  avatarError,
  setAvatarError,
] = useState("");


async function handleAvatarChange(
  event: React.ChangeEvent<HTMLInputElement>
) {
  const file =
    event.target.files?.[0];

  if (!file) {
    return;
  }

  setAvatarUploading(true);
  setAvatarError("");
  setSuccess("");

  try {
    const { avatarUrl: newAvatarUrl } =
      await uploadOwnAvatar(file);

    setAvatarUrl(newAvatarUrl);

    setSuccess(
      "Poza de profil a fost actualizată."
    );
  } catch (uploadError) {
    setAvatarError(
      uploadError instanceof Error
        ? uploadError.message
        : "Poza nu a putut fi încărcată."
    );
  } finally {
    setAvatarUploading(false);
    event.target.value = "";
  }
}

async function handleDeleteAvatar() {
  const confirmed = window.confirm(
    "Ștergi poza de profil?"
  );

  if (!confirmed) {
    return;
  }

  setAvatarUploading(true);
  setAvatarError("");
  setSuccess("");

  try {
    await deleteOwnAvatar();

    setAvatarUrl("");

    setSuccess(
      "Poza de profil a fost eliminată."
    );
  } catch (deleteError) {
    setAvatarError(
      deleteError instanceof Error
        ? deleteError.message
        : "Poza nu a putut fi eliminată."
    );
  } finally {
    setAvatarUploading(false);
  }
}
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanFullName =
      fullName.trim();

    const cleanPhone =
      phone.trim();

    const cleanCity =
      city.trim();

    const cleanAvatarUrl =
      avatarUrl.trim();

    if (
      cleanFullName.length > 100
    ) {
      setError(
        "Numele nu poate depăși 100 de caractere."
      );

      return;
    }

    if (cleanPhone.length > 30) {
      setError(
        "Numărul de telefon nu poate depăși 30 de caractere."
      );

      return;
    }

    if (cleanCity.length > 100) {
      setError(
        "Orașul nu poate depăși 100 de caractere."
      );

      return;
    }

    if (
      cleanAvatarUrl.length > 2000
    ) {
      setError(
        "Adresa imaginii este prea lungă."
      );

      return;
    }

    setSaving(true);

    const {
      data,
      error: updateError,
    } = await updateOwnProfile({
      fullName:
        cleanFullName || null,

      phone:
        cleanPhone || null,

      city:
        cleanCity || null,

      avatarUrl:
        cleanAvatarUrl || null,
    });

    if (updateError) {
      setError(
        updateError.message ||
          "Profilul nu a putut fi actualizat."
      );

      setSaving(false);
      return;
    }

    if (!data) {
      setError(
        "Profilul nu a putut fi actualizat."
      );

      setSaving(false);
      return;
    }

    setSuccess(
      "Profilul a fost actualizat cu succes."
    );

    setSaving(false);
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-black" />

            <p className="font-semibold text-slate-600">
              Se încarcă profilul...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-slate-600 hover:text-slate-950"
        >
          ← Înapoi la dashboard
        </Link>

        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-slate-950 px-6 py-8 text-white sm:px-8">
            <p className="text-sm font-bold uppercase tracking-wide text-orange-400">
              Contul meu
            </p>

            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              Editează profilul
            </h1>

            <p className="mt-3 text-slate-300">
              Actualizează informațiile afișate pe profilul tău Vendora.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 p-6 sm:p-8"
          >
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
                Imagine de profil
              </p>

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-100 text-2xl font-black text-orange-700">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Imagine profil"
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />
                  ) : (
                    fullName
                      .split(" ")
                      .map(
                        (word) =>
                          word[0] ?? ""
                      )
                      .join("")
                      .slice(0, 2)
                      .toUpperCase() || "U"
                  )}
                </div>

                <div className="w-full">
  <label
    htmlFor="avatar-file"
    className="font-bold text-slate-900"
  >
    Încarcă o poză
  </label>

  <input
    id="avatar-file"
    type="file"
    accept="image/jpeg,image/png,image/webp"
    onChange={(event) =>
      void handleAvatarChange(event)
    }
    disabled={avatarUploading}
    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 disabled:opacity-60"
  />

  <p className="mt-2 text-xs text-slate-500">
    JPEG, PNG sau WebP, maximum 3 MB.
  </p>

  {avatarUrl && (
    <button
      type="button"
      onClick={() =>
        void handleDeleteAvatar()
      }
      disabled={avatarUploading}
      className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 disabled:opacity-60"
    >
      Șterge poza
    </button>
  )}

  {avatarUploading && (
    <p className="mt-3 text-sm font-semibold text-slate-600">
      Se încarcă poza...
    </p>
  )}

  {avatarError && (
    <div className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
      {avatarError}
    </div>
  )}
</div>
              </div>
            </div>

            <div>
              <label
                htmlFor="full-name"
                className="font-bold text-slate-900"
              >
                Nume complet
              </label>

              <input
                id="full-name"
                type="text"
                value={fullName}
                onChange={(event) =>
                  setFullName(
                    event.target.value
                  )
                }
                maxLength={100}
                placeholder="Numele tău"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
              />

              <p className="mt-1 text-right text-xs text-slate-500">
                {fullName.length}/100
              </p>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="font-bold text-slate-900"
              >
                Număr de telefon
              </label>

              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(
                    event.target.value
                  )
                }
                maxLength={30}
                placeholder="+40..."
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
              />

              <p className="mt-2 text-xs text-slate-500">
                Numărul de telefon nu este afișat pe profilul public.
              </p>
            </div>

            <div>
              <label
                htmlFor="city"
                className="font-bold text-slate-900"
              >
                Oraș
              </label>

              <input
                id="city"
                type="text"
                value={city}
                onChange={(event) =>
                  setCity(
                    event.target.value
                  )
                }
                maxLength={100}
                placeholder="Timișoara"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
              />

              <p className="mt-1 text-right text-xs text-slate-500">
                {city.length}/100
              </p>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-2xl bg-black px-6 py-4 font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Se salvează..."
                : "Salvează modificările"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}