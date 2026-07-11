"use client";

import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { ExternalLink } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SubpageHeader } from "@/components/layout/SubpageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { routes } from "@/lib/constants/routes";
import { db } from "@/lib/firebase/client";
import { productsPath, suppliersPath } from "@/lib/firebase/paths";
import { isBelowMinimum } from "@/lib/utils/stock-status";
import {
  buildEmailUrl,
  buildExternalUrl,
  buildPhoneUrl,
  buildWhatsAppUrl
} from "@/lib/utils/supplier-links";
import type { MagazzinoProductDocument, SupplierDocument } from "@/types/firestore";

type ProductItem = MagazzinoProductDocument & { id: string };
type SupplierItem = SupplierDocument & { id: string };

export function ReorderList() {
  const { user } = useAuth();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    const productsQuery = query(collection(db, productsPath(user.uid)), orderBy("name", "asc"));
    const suppliersQuery = query(collection(db, suppliersPath(user.uid)), orderBy("name", "asc"));

    const unsubscribeProducts = onSnapshot(
      productsQuery,
      (snapshot) => {
        setProducts(snapshot.docs.map((productDoc) => ({ id: productDoc.id, ...(productDoc.data() as MagazzinoProductDocument) })));
        setIsLoading(false);
      },
      (snapshotError) => {
        console.error("Reorder products subscription failed", snapshotError);
        setError("Non siamo riusciti a caricare i prodotti da ordinare.");
        setIsLoading(false);
      }
    );

    const unsubscribeSuppliers = onSnapshot(
      suppliersQuery,
      (snapshot) => {
        setSuppliers(snapshot.docs.map((supplierDoc) => ({ id: supplierDoc.id, ...(supplierDoc.data() as SupplierDocument) })));
      },
      (snapshotError) => {
        console.error("Reorder suppliers subscription failed", snapshotError);
      }
    );

    return () => {
      unsubscribeProducts();
      unsubscribeSuppliers();
    };
  }, [user]);

  const suppliersById = useMemo(() => new Map(suppliers.map((supplier) => [supplier.id, supplier])), [suppliers]);

  const reorderProducts = useMemo(
    () =>
      products.filter((product) => isBelowMinimum(product.quantity ?? 0, product.minimumQuantity ?? 0)),
    [products]
  );

  return (
    <div className="space-y-5">
      <SubpageHeader
        title="Da ordinare"
        subtitle="Prodotti sotto la soglia minima."
        backHref={routes.studioMagazzino}
      />

      {error ? <ErrorMessage message={error} /> : null}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : reorderProducts.length === 0 ? (
        <EmptyState title="Nessun prodotto da ordinare" description="Tutti i prodotti sono sopra la soglia minima impostata." />
      ) : (
        <div className="space-y-3">
          {reorderProducts.map((product) => {
            const supplier = product.supplierId ? suppliersById.get(product.supplierId) : undefined;
            const supplierContactUrl =
              (supplier?.whatsapp && buildWhatsAppUrl(supplier.whatsapp)) ||
              (supplier?.phone && buildPhoneUrl(supplier.phone)) ||
              (supplier?.catalogUrl && buildExternalUrl(supplier.catalogUrl)) ||
              (supplier?.website && buildExternalUrl(supplier.website)) ||
              (supplier?.email && buildEmailUrl(supplier.email));

            return (
              <Card key={product.id} className="space-y-3 p-4">
                <div>
                  <p className="text-[16px] font-bold text-beauty-text">{product.name}</p>
                  <div className="mt-2 grid gap-1 text-[13px] text-beauty-muted">
                    <p>Quantità attuale: {product.quantity ?? 0}</p>
                    <p>Quantità minima: {product.minimumQuantity ?? 0}</p>
                    <p>Fornitore: {product.supplierNameSnapshot || supplier?.name || "Non assegnato"}</p>
                  </div>
                </div>

                {supplierContactUrl ? (
                  <a href={supplierContactUrl} target={supplierContactUrl.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                    <SecondaryButton type="button" className="h-9 px-3 text-[13px]">
                      <ExternalLink className="size-4" aria-hidden="true" />
                      Apri fornitore
                    </SecondaryButton>
                  </a>
                ) : (
                  <SecondaryButton type="button" className="h-9 px-3 text-[13px]" disabled>
                    <ExternalLink className="size-4" aria-hidden="true" />
                    Apri fornitore
                  </SecondaryButton>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
