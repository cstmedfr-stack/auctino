import { AccountDashboard } from "@/components/account/AccountDashboard";

export default function AccountPage() {
  return (
    <main className="min-h-[80vh] bg-[#FAFAF8] px-6 py-16">
      <div className="mx-auto flex max-w-7xl justify-center">
        <AccountDashboard />
      </div>
    </main>
  );
}