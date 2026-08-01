import { UserRound } from "lucide-react";
type UserProfileHeaderProps = {
  fullName: string;
  avatarUrl?: string | null;
};

export default function UserProfileHeader({
  fullName,
  avatarUrl,
}: UserProfileHeaderProps) {
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
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <UserRound size={28} />
        </div>
        )}

        <h1 className="mt-5 text-3xl font-bold text-slate-900">
          {fullName}
        </h1>
      </div>
    </div>
  );
}