type ProfileHeaderProps = {
  fullName: string;
  avatarUrl?: string | null;
};

export default function ProfileHeader({
  fullName,
  avatarUrl,
}: ProfileHeaderProps) {
  return (
    <div className="rounded-3xl bg-white p-8 shadow-sm">
      <div className="flex flex-col items-center">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={fullName}
            className="h-28 w-28 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-slate-200 text-4xl">
            👤
          </div>
        )}

        <h1 className="mt-5 text-3xl font-bold text-slate-900">
          {fullName}
        </h1>
      </div>
    </div>
  );
}