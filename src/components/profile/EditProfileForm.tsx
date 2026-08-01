"use client";

import type {
  ChangeEvent,
  FormEvent,
} from "react";
import {
  useMemo,
  useState,
} from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Save,
  Trash2,
  UploadCloud,
  UserRound,
} from "lucide-react";

import type { Profile } from "@/types/profile";
import {
  deleteOwnAvatar,
  uploadOwnAvatar,
} from "@/services/avatar.service";
import { updateOwnProfile } from "@/services/profile.service";
import { useMessages } from "@/i18n/useMessages";
import { validateEditableProfile } from "@/utils/profileValidation";

type EditableProfile = Profile & {
  full_name?: string | null;
  phone?: string | null;
  city?: string | null;
  avatar_url?: string | null;
};

type EditProfileFormProps = {
  profile: EditableProfile;
  onSaved: () => void;
};

export default function EditProfileForm({
  profile,
  onSaved,
}: EditProfileFormProps) {
  const messages = useMessages();
  const t = messages.accountProfile;

  const [fullName, setFullName] =
    useState(profile.full_name ?? "");

  const [phone, setPhone] =
    useState(profile.phone ?? "");

  const [city, setCity] =
    useState(profile.city ?? "");

  const [avatarUrl, setAvatarUrl] =
    useState(profile.avatar_url ?? "");

  const [saving, setSaving] =
    useState(false);

  const [
    avatarUploading,
    setAvatarUploading,
  ] = useState(false);

  const [
    avatarDeleteConfirmOpen,
    setAvatarDeleteConfirmOpen,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [avatarError, setAvatarError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const initials = useMemo(() => {
    return (
      fullName
        .split(" ")
        .map((word) => word[0] ?? "")
        .join("")
        .slice(0, 2)
        .toUpperCase() || "U"
    );
  }, [fullName]);

  function getAvatarErrorMessage(
    message: string
  ) {
    if (message === "avatar_invalid_type") {
      return t.form.avatarInvalidType;
    }

    if (message === "avatar_oversized") {
      return t.form.avatarTooLarge;
    }

    if (message === "avatar_auth_required") {
      return t.form.authRequired;
    }

    return message || t.form.avatarUploadError;
  }

  async function handleAvatarChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setAvatarUploading(true);
    setAvatarError("");
    setSuccess("");
    setAvatarDeleteConfirmOpen(false);

    try {
      const {
        avatarUrl: newAvatarUrl,
      } = await uploadOwnAvatar(file);

      setAvatarUrl(newAvatarUrl);
      setSuccess(t.form.avatarUpdated);
    } catch (uploadError) {
      setAvatarError(
        uploadError instanceof Error
          ? getAvatarErrorMessage(
              uploadError.message
            )
          : t.form.avatarUploadError
      );
    } finally {
      setAvatarUploading(false);
      event.target.value = "";
    }
  }

  async function handleDeleteAvatar() {
    setAvatarUploading(true);
    setAvatarError("");
    setSuccess("");

    try {
      await deleteOwnAvatar();

      setAvatarUrl("");
      setAvatarDeleteConfirmOpen(false);
      setSuccess(t.form.avatarDeleted);
    } catch (deleteError) {
      setAvatarError(
        deleteError instanceof Error
          ? getAvatarErrorMessage(
              deleteError.message
            )
          : t.form.avatarDeleteError
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

    const validationError =
      validateEditableProfile(
        fullName,
        phone,
        city,
        avatarUrl,
        t.form
      );

    if (validationError) {
      setError(validationError);
      return;
    }

    const cleanFullName =
      fullName.trim();

    const cleanPhone =
      phone.trim();

    const cleanCity =
      city.trim();

    const cleanAvatarUrl =
      avatarUrl.trim();

    setSaving(true);

    const { error: updateError } =
      await updateOwnProfile({
        fullName:
          cleanFullName || null,
        phone:
          cleanPhone || null,
        city:
          cleanCity || null,
        avatarUrl:
          cleanAvatarUrl || null,
      });

    setSaving(false);

    if (updateError) {
      setError(
        updateError.message ||
          t.edit.updateError
      );

      return;
    }

    setSuccess(t.edit.success);
    onSaved();
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 p-6 sm:p-8"
      >
        <div className="rounded-3xl bg-slate-50 p-5">
          <p className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
            {t.form.avatarSection}
          </p>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-50 text-2xl font-black text-indigo-700">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={t.form.avatarAlt}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />
              ) : initials ? (
                <span>{initials}</span>
              ) : (
                <UserRound size={26} />
              )}
            </div>

            <div className="w-full">
              <label
                htmlFor="avatar-file"
                className="font-bold text-slate-900"
              >
                {t.form.uploadAvatar}
              </label>

              <input
                id="avatar-file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  void handleAvatarChange(event);
                }}
                disabled={avatarUploading}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm disabled:opacity-60"
              />

              <p className="mt-2 text-xs text-slate-500">
                {t.form.avatarHelp}
              </p>

              <div className="mt-3 flex flex-wrap gap-3">
                {avatarUploading && (
                  <p className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-600">
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    {t.form.avatarUploading}
                  </p>
                )}

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      setAvatarDeleteConfirmOpen(true)
                    }
                    disabled={avatarUploading}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                  >
                    <Trash2 size={16} />
                    {t.form.deleteAvatar}
                  </button>
                )}

                <span className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-500">
                  <UploadCloud size={16} />
                  {t.form.avatarHelp}
                </span>
              </div>

              {avatarDeleteConfirmOpen && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
                  <p className="font-black text-red-950">
                    {t.form.deleteAvatarConfirm}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-red-700">
                    {t.form.deleteAvatarDescription}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        void handleDeleteAvatar();
                      }}
                      disabled={avatarUploading}
                      className="rounded-xl bg-red-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-800 disabled:opacity-60"
                    >
                      {t.form.confirmDeleteAvatar}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setAvatarDeleteConfirmOpen(false)
                      }
                      disabled={avatarUploading}
                      className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                    >
                      {t.form.cancelDeleteAvatar}
                    </button>
                  </div>
                </div>
              )}

              {avatarError && (
                <div className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
                  <AlertTriangle
                    size={17}
                    className="mt-0.5 shrink-0"
                  />
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
            {t.form.fullNameLabel}
          </label>

          <input
            id="full-name"
            type="text"
            value={fullName}
            onChange={(event) =>
              setFullName(event.target.value)
            }
            maxLength={100}
            placeholder={t.form.fullNamePlaceholder}
            className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
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
            {t.form.phoneLabel}
          </label>

          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(event) =>
              setPhone(event.target.value)
            }
            maxLength={30}
            placeholder={t.form.phonePlaceholder}
            className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
          />

          <p className="mt-2 text-xs text-slate-500">
            {t.form.phoneHelp}
          </p>
        </div>

        <div>
          <label
            htmlFor="city"
            className="font-bold text-slate-900"
          >
            {t.form.cityLabel}
          </label>

          <input
            id="city"
            type="text"
            value={city}
            onChange={(event) =>
              setCity(event.target.value)
            }
            maxLength={100}
            placeholder={t.form.cityPlaceholder}
            className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
          />

          <p className="mt-1 text-right text-xs text-slate-500">
            {city.length}/100
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0"
            />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0"
            />
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={saving || avatarUploading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2
                size={18}
                className="animate-spin"
              />
              {t.edit.saving}
            </>
          ) : (
            <>
              <Save size={18} />
              {t.edit.save}
            </>
          )}
        </button>
      </form>
    </section>
  );
}