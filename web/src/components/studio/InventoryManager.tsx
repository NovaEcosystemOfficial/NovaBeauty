"use client";

import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Search } from "lucide-react";
import { SubpageHeader } from "@/components/layout/SubpageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { db } from "@/lib/firebase/client";
import { inventoryPath } from "@/lib/firebase/paths";
import { routes } from "@/lib/constants/routes";
import type { InventoryProductDocument } from "@/types/firestore";

type InventoryItem = InventoryProductDocument & { id: string };

export function InventoryManager() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    setIsLoading(true);
    setError("");

    const inventoryQuery = query(collection(db, inventoryPath(user.uid)), orderBy("name", "asc"), limit(200));
    const unsubscribe = onSnapshot(
      inventoryQuery,
      (snapshot) => {
        setProducts(snapshot.docs.map((docItem) => ({ id: docItem.id, ...(docItem.data() as InventoryProductDocument) })));
        setIsLoading(false);
      },
      (snapshotError) => {
        console.error("Inventory subscription failed", snapshotError);
        setError("Non siamo riusciti a caricare il magazzino.");
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return products;
    }

    return products.filter((product) => {
      const haystack = [product.name, product.brand ?? "", product.category ?? "", product.notes ?? ""].join(" ").toLowerCase();
      return haystack.includes(term);
    });
  }, [products, search]);

  function showComingSoon() {
    showToast("Funzione disponibile nella prossima versione.");
  }

  function handleSearchAction() {
    if (!products.length) {
      showComingSoon();
      return;
    }

    searchInputRef.current?.focus();
  }

  return (
    <div className="space-y-5">
      <SubpageHeader
        title="Magazzino"
        subtitle="Gestisci prodotti, scorte e materiali utilizzati nello studio."
        backHref={routes.studio}
      />

      <div className="flex flex-wrap gap-2">
        <PrimaryButton type="button" onClick={showComingSoon} className="h-10 px-3">
          <Plus className="size-4" aria-hidden="true" />
          Nuovo prodotto
        </PrimaryButton>
        <SecondaryButton type="button" onClick={handleSearchAction} className="h-10 px-3">
          <Search className="size-4" aria-hidden="true" />
          Cerca prodotto
        </SecondaryButton>
      </div>

      {products.length > 0 ? (
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-beauty-muted" />
          <input
            ref={searchInputRef}
            className="h-11 w-full rounded-beauty border border-beauty-border bg-beauty-card pl-10 pr-3 text-[15px] text-beauty-text outline-none transition focus:border-beauty-primary focus:bg-beauty-surface"
            placeholder="Cerca per nome, marca o categoria"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      ) : null}

      {error ? <ErrorMessage message={error} /> : null}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          title="Nessun prodotto"
          description={
            search
              ? "Nessun prodotto corrisponde alla ricerca."
              : "Aggiungi il primo prodotto per iniziare a organizzare il magazzino."
          }
        />
      ) : (
        <div className="space-y-2">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="p-4">
              <p className="text-[15px] font-semibold text-beauty-text">{product.name}</p>
              <p className="mt-1 text-[13px] text-beauty-muted">
                {[product.brand, product.category].filter(Boolean).join(" · ") || "Prodotto magazzino"}
              </p>
              {product.quantity != null ? (
                <p className="mt-2 text-[12px] text-beauty-subtle">
                  Disponibilità: {product.quantity}
                  {product.unit ? ` ${product.unit}` : ""}
                </p>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
