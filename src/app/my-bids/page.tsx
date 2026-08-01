"use client";

import MyBidProductCard from "@/components/bids/MyBidProductCard";
import MyBidsFilters from "@/components/bids/MyBidsFilters";
import MyBidsPageHeader from "@/components/bids/MyBidsPageHeader";
import MyBidsState from "@/components/bids/MyBidsState";
import MyBidsStats from "@/components/bids/MyBidsStats";
import { useMyBids } from "@/hooks/useMyBids";

export default function MyBidsPage() {
  const {
    products,
    filteredProducts,
    statistics,
    filter,
    setFilter,
    loading,
    refreshing,
    error,
    loadProducts,
  } = useMyBids();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <MyBidsPageHeader
          refreshing={refreshing}
          onRefresh={() => {
            void loadProducts(true);
          }}
        />

        {loading ? (
          <MyBidsState type="loading" />
        ) : error ? (
          <MyBidsState
            type="error"
            message={error}
            onRetry={() => {
              void loadProducts();
            }}
          />
        ) : products.length === 0 ? (
          <MyBidsState type="empty" />
        ) : (
          <>
            <MyBidsStats
              activeFilter={filter}
              statistics={statistics}
              onFilterChange={setFilter}
            />

            <MyBidsFilters
              filter={filter}
              resultCount={
                filteredProducts.length
              }
              onFilterChange={setFilter}
            />

            {filteredProducts.length === 0 ? (
              <MyBidsState
                type="noResults"
                onShowAll={() =>
                  setFilter("all")
                }
              />
            ) : (
              <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map(
                  (product) => (
                    <MyBidProductCard
                      key={product.product_id}
                      product={product}
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