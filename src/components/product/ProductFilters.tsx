"use client";

import { Search, RotateCcw } from "lucide-react";
import type { MarketplaceSort } from "@/services/product.service";
import { useMessages } from "@/i18n/useMessages";

type CategoryOption = {
  id: string;
  name_ro: string;
  icon: string | null;
};

type SubcategoryOption = {
  id: string;
  category_id: string;
  name_ro: string;
};

type ProductFiltersProps = {
  search: string;
  selectedCategoryId: string;
  selectedSubcategoryId: string;
  selectedCounty: string;
  selectedCondition: string;
  minPrice: string;
  maxPrice: string;
  sort: MarketplaceSort;

  categories: CategoryOption[];
  subcategories: SubcategoryOption[];
counties: readonly string[];
conditions: readonly string[];

  hasActiveFilters: boolean;

  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSubcategoryChange: (value: string) => void;
  onCountyChange: (value: string) => void;
  onConditionChange: (value: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onSortChange: (value: MarketplaceSort) => void;
  onResetFilters: () => void;
};

export default function ProductFilters({
  search,
  selectedCategoryId,
  selectedSubcategoryId,
  selectedCounty,
  selectedCondition,
  minPrice,
  maxPrice,
  sort,
  categories,
  subcategories,
  counties,
  conditions,
  hasActiveFilters,
  onSearchChange,
  onCategoryChange,
  onSubcategoryChange,
  onCountyChange,
  onConditionChange,
  onMinPriceChange,
  onMaxPriceChange,
  onSortChange,
  onResetFilters,
}: ProductFiltersProps) {
  const messages = useMessages();
  const t = messages.marketplace;

  return (
    <>
      <div className="relative">
        <Search
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          value={search}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          placeholder={t.searchPlaceholder}
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50"
        />
      </div>

      <select
        value={selectedCategoryId}
        onChange={(event) =>
          onCategoryChange(event.target.value)
        }
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50"
      >
        <option value="">
          {t.allCategories}
        </option>

        {categories.map((category) => (
          <option
            key={category.id}
            value={category.id}
          >
            {category.icon
              ? `${category.icon} `
              : ""}
            {category.name_ro}
          </option>
        ))}
      </select>

      <select
        value={selectedSubcategoryId}
        onChange={(event) =>
          onSubcategoryChange(event.target.value)
        }
        disabled={!selectedCategoryId}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 disabled:bg-slate-50 disabled:text-slate-400"
      >
        <option value="">
          {selectedCategoryId
            ? t.allSubcategories
            : t.chooseCategoryFirst}
        </option>

        {subcategories.map((subcategory) => (
          <option
            key={subcategory.id}
            value={subcategory.id}
          >
            {subcategory.name_ro}
          </option>
        ))}
      </select>

      <select
        value={selectedCounty}
        onChange={(event) =>
          onCountyChange(event.target.value)
        }
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50"
      >
        <option value="">
          {t.allCounties}
        </option>

        {counties.map((county) => (
          <option
            key={county}
            value={county}
          >
            {county}
          </option>
        ))}
      </select>

      <select
        value={selectedCondition}
        onChange={(event) =>
          onConditionChange(event.target.value)
        }
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50"
      >
        <option value="">
          {t.allConditions}
        </option>

        {conditions.map((condition) => (
          <option
            key={condition}
            value={condition}
          >
            {condition}
          </option>
        ))}
      </select>

      <div className="grid grid-cols-2 gap-3">
        <input
          type="number"
          min="0"
          value={minPrice}
          onChange={(event) =>
            onMinPriceChange(event.target.value)
          }
          placeholder={t.minPrice}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50"
        />

        <input
          type="number"
          min="0"
          value={maxPrice}
          onChange={(event) =>
            onMaxPriceChange(event.target.value)
          }
          placeholder={t.maxPrice}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50"
        />
      </div>

      <select
        value={sort}
        onChange={(event) =>
          onSortChange(
            event.target.value as MarketplaceSort
          )
        }
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50"
      >
        <option value="newest">
          {t.sortNewest}
        </option>
        <option value="ending">
          {t.sortEnding}
        </option>
        <option value="price_asc">
          {t.sortPriceAsc}
        </option>
        <option value="price_desc">
          {t.sortPriceDesc}
        </option>
        <option value="bids">
          {t.sortBids}
        </option>
      </select>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
        >
          <RotateCcw size={16} />
          {t.resetFilters}
        </button>
      )}
    </>
  );
}