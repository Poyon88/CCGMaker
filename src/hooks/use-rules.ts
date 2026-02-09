import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { useGuestStore, emptyRules, type GuestRules } from "@/stores/guest-store";
import * as svc from "@/services/rules.service";
import {
  mapDbCardType,
  mapDbAttribute,
  mapDbRarity,
  mapDbPower,
  mapDbTribe,
  mapCardTypeToInsert,
  mapAttributeToInsert,
  mapRarityToInsert,
  mapPowerToInsert,
  mapTribeToInsert,
} from "@/lib/mappers";

export function useRules(projectId: string) {
  const isGuest = useAuthStore((s) => s.isGuest);
  const guestRules = useGuestStore((s) => s.rules[projectId] ?? emptyRules);

  const query = useQuery({
    queryKey: ["rules", projectId],
    queryFn: async () => {
      const [cardTypes, attributes, rarities, powers, tribes] = await Promise.all([
        svc.fetchCardTypes(projectId),
        svc.fetchAttributes(projectId),
        svc.fetchRarities(projectId),
        svc.fetchPowers(projectId),
        svc.fetchTribes(projectId),
      ]);
      return {
        cardTypes: cardTypes.map(mapDbCardType),
        attributes: attributes.map(mapDbAttribute),
        rarities: rarities.map(mapDbRarity),
        powers: powers.map(mapDbPower),
        tribes: tribes.map(mapDbTribe),
      } satisfies GuestRules;
    },
    enabled: !isGuest,
  });

  return {
    rules: isGuest ? guestRules : (query.data ?? emptyRules),
    isLoading: isGuest ? false : query.isLoading,
  };
}

export function useUpdateRules() {
  const isGuest = useAuthStore((s) => s.isGuest);
  const updateRules = useGuestStore((s) => s.updateRules);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      key,
      items,
    }: {
      projectId: string;
      key: keyof GuestRules;
      items: GuestRules[keyof GuestRules];
    }) => {
      if (isGuest) {
        updateRules(projectId, { [key]: items });
        return;
      }

      switch (key) {
        case "cardTypes":
          await svc.upsertCardTypes(
            projectId,
            (items as GuestRules["cardTypes"]).map(mapCardTypeToInsert)
          );
          break;
        case "attributes":
          await svc.upsertAttributes(
            projectId,
            (items as GuestRules["attributes"]).map(mapAttributeToInsert)
          );
          break;
        case "rarities":
          await svc.upsertRarities(
            projectId,
            (items as GuestRules["rarities"]).map(mapRarityToInsert)
          );
          break;
        case "powers":
          await svc.upsertPowers(
            projectId,
            (items as GuestRules["powers"]).map(mapPowerToInsert)
          );
          break;
        case "tribes":
          await svc.upsertTribes(
            projectId,
            (items as GuestRules["tribes"]).map(mapTribeToInsert)
          );
          break;
      }
    },
    onSuccess: (_data, { projectId }) => {
      if (!isGuest) {
        qc.invalidateQueries({ queryKey: ["rules", projectId] });
      }
      toast.success("Rules saved");
    },
    onError: (err) => {
      toast.error(`Failed to save rules: ${err.message}`);
    },
  });
}
