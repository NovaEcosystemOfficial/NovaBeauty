"use client";

import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { SubpageHeader } from "@/components/layout/SubpageHeader";
import { StudioHubCard } from "@/components/studio/StudioHubCard";
import { useAuth } from "@/contexts/AuthContext";
import { magazzinoHubSections } from "@/lib/constants/magazzino-hub";
import { routes } from "@/lib/constants/routes";
import { db } from "@/lib/firebase/client";
import { productsPath } from "@/lib/firebase/paths";
import { isBelowMinimum } from "@/lib/utils/stock-status";
import type { MagazzinoProductDocument } from "@/types/firestore";

export function MagazzinoHome() {
  const { user } = useAuth();
  const [reorderCount, setReorderCount] = useState(0);

  useEffect(() => {
    if (!user) {
      return;
    }

    const productsQuery = query(collection(db, productsPath(user.uid)), orderBy("name", "asc"));
    const unsubscribe = onSnapshot(productsQuery, (snapshot) => {
      const count = snapshot.docs.filter((productDoc) => {
        const product = productDoc.data() as MagazzinoProductDocument;
        return isBelowMinimum(product.quantity ?? 0, product.minimumQuantity ?? 0);
      }).length;

      setReorderCount(count);
    });

    return unsubscribe;
  }, [user]);

  const sections = useMemo(
    () =>
      magazzinoHubSections.map((section) => ({
        ...section,
        badgeCount: section.id === "da-ordinare" ? reorderCount : 0
      })),
    [reorderCount]
  );

  return (
    <div className="space-y-5">
      <SubpageHeader
        title="Magazzino"
        subtitle="Gestisci prodotti, fornitori, scorte e movimenti del centro."
        backHref={routes.studio}
      />

      <div className="grid gap-3">
        {sections.map((section) => (
          <StudioHubCard
            key={section.id}
            title={section.title}
            subtitle={section.description}
            href={section.href}
            icon={section.icon}
            tone={section.tone}
            badgeCount={section.badgeCount}
          />
        ))}
      </div>
    </div>
  );
}
