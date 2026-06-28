type VerificationCardProps = {
  phoneVerified: boolean;
  identityVerified: boolean;
};

export default function VerificationCard({
  phoneVerified,
  identityVerified,
}: VerificationCardProps) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-xl font-bold">
        Verificări
      </h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Telefon</span>

          <span>
            {phoneVerified ? "✅ Verificat" : "❌ Neverificat"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span>Identitate</span>

          <span>
            {identityVerified ? "✅ Verificată" : "❌ Neverificată"}
          </span>
        </div>
      </div>
    </div>
  );
}