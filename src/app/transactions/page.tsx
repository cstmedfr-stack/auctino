"use client";

import TransactionCard from "@/components/transactions/TransactionCard";
import TransactionListHeader from "@/components/transactions/TransactionListHeader";
import TransactionListState from "@/components/transactions/TransactionListState";
import TransactionListStats from "@/components/transactions/TransactionListStats";
import TransactionListFilters from "@/components/transactions/TransactionListFilters";

import { useTransactionList } from "@/hooks/useTransactionList";

export default function TransactionsPage() {
  const {
    currentUserId,
    transactions,
    filteredTransactions,
    productsById,
    filter,
    setFilter,
    loading,
    error,
    loadTransactions,
    statusCounts,
    needsActionCount,
    filterOptions,
    getOtherPartyId,
    getOtherPartyName,
  } = useTransactionList();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <TransactionListHeader
          count={transactions.length}
        />

        <TransactionListStats
          total={transactions.length}
          needsAction={needsActionCount}
          completed={statusCounts.completed}
          disputed={statusCounts.disputed}
        />

        <TransactionListFilters
          filter={filter}
          options={filterOptions}
          onChange={setFilter}
        />

        {loading ? (
          <TransactionListState type="loading" />
        ) : error ? (
          <TransactionListState
            type="error"
            message={error}
            onRetry={() => {
              void loadTransactions();
            }}
          />
        ) : filteredTransactions.length ===
          0 ? (
          <TransactionListState type="empty" />
        ) : (
          <section className="space-y-5">
            {filteredTransactions.map(
              (transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  product={
                    productsById[
                      transaction.product_id
                    ]
                  }
                  currentUserId={
                    currentUserId
                  }
                  otherPartyId={getOtherPartyId(
                    transaction
                  )}
                  otherPartyName={getOtherPartyName(
                    transaction
                  )}
                />
              )
            )}
          </section>
        )}
      </div>
    </main>
  );
}