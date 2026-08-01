"use client";

import ReceivedBidProductCard from "@/components/bids/ReceivedBidProductCard";
import ReceivedBidsFilters from "@/components/bids/ReceivedBidsFilters";
import ReceivedBidsPageHeader from "@/components/bids/ReceivedBidsPageHeader";
import ReceivedBidsState from "@/components/bids/ReceivedBidsState";
import ReceivedBidsStats from "@/components/bids/ReceivedBidsStats";
import { useReceivedBids } from "@/hooks/useReceivedBids";

export default function ReceivedBidsPage() {
  const {
    products,
    filteredProducts,
    statistics,
    filter,
    setFilter,
    loading,
    refreshing,
    error,
    actionError,
    finalizingProductId,
    confirmationProductId,
    loadProducts,
    requestFinalizeAuction,
    cancelFinalizeAuction,
    confirmFinalizeAuction,
  } = useReceivedBids();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ReceivedBidsPageHeader
          refreshing={refreshing}
          onRefresh={() => {
            void loadProducts(true);
          }}
        />

        {loading ? (
          <ReceivedBidsState type="loading" />
        ) : error ? (
          <ReceivedBidsState
            type="error"
            message={error}
            onRetry={() => {
              void loadProducts();
            }}
          />
        ) : products.length === 0 ? (
          <ReceivedBidsState type="empty" />
        ) : (
          <>
            <ReceivedBidsStats
              activeFilter={filter}
              statistics={statistics}
              onFilterChange={setFilter}
            />

            <ReceivedBidsFilters
              filter={filter}
              resultCount={
                filteredProducts.length
              }
              onFilterChange={setFilter}
            />

            {actionError && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
                {actionError}
              </div>
            )}

            {filteredProducts.length === 0 ? (
              <ReceivedBidsState
                type="noResults"
                onShowAll={() =>
                  setFilter("all")
                }
              />
            ) : (
              <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map(
                  (product) => (
                    <ReceivedBidProductCard
                      key={product.product_id}
                      product={product}
                      confirmationOpen={
                        confirmationProductId ===
                        product.product_id
                      }
                      finalizing={
                        finalizingProductId ===
                        product.product_id
                      }
                      onRequestFinalize={
                        requestFinalizeAuction
                      }
                      onCancelFinalize={
                        cancelFinalizeAuction
                      }
                      onConfirmFinalize={(
                        productId
                      ) => {
                        void confirmFinalizeAuction(
                          productId
                        );
                      }}
                    />
                  )
                )}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}