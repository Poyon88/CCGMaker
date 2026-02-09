import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { useGuestStore } from "@/stores/guest-store";
import * as svc from "@/services/cards.service";
import { mapDbCard, mapCardToInsert } from "@/lib/mappers";
import type { Card } from "@/types/card";

const EMPTY_CARDS: Card[] = [];

export function useCards(projectId?: string) {
  const isGuest = useAuthStore((s) => s.isGuest);
  const guestCards = useGuestStore(
    useShallow((s) =>
      projectId ? s.cards.filter((c) => c.projectId === projectId) : s.cards
    )
  );

  const query = useQuery({
    queryKey: ["cards", projectId ?? "all"],
    queryFn: async () => {
      const rows = await svc.fetchCards(projectId);
      return rows.map(mapDbCard);
    },
    enabled: !isGuest,
  });

  return {
    cards: isGuest ? guestCards : (query.data ?? EMPTY_CARDS),
    isLoading: isGuest ? false : query.isLoading,
  };
}

export function useCard(id: string | undefined) {
  const isGuest = useAuthStore((s) => s.isGuest);
  const guestCard = useGuestStore((s) => s.cards.find((c) => c.id === id));

  const query = useQuery({
    queryKey: ["cards", "detail", id],
    queryFn: async () => {
      const row = await svc.fetchCard(id!);
      return mapDbCard(row);
    },
    enabled: !isGuest && !!id,
  });

  return {
    card: isGuest ? (guestCard ?? null) : (query.data ?? null),
    isLoading: isGuest ? false : query.isLoading,
  };
}

export function useCreateCard() {
  const isGuest = useAuthStore((s) => s.isGuest);
  const userId = useAuthStore((s) => s.user?.id);
  const addCard = useGuestStore((s) => s.addCard);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (card: Card) => {
      if (isGuest) {
        addCard(card);
        return card;
      }
      const row = await svc.createCard(mapCardToInsert(card, userId!));
      return mapDbCard(row);
    },
    onSuccess: (_data, card) => {
      if (!isGuest) {
        qc.invalidateQueries({ queryKey: ["cards"] });
        if (card.projectId) {
          qc.invalidateQueries({ queryKey: ["cards", card.projectId] });
        }
      }
      toast.success("Card created");
    },
    onError: (err) => {
      toast.error(`Failed to create card: ${err.message}`);
    },
  });
}

export function useUpdateCard() {
  const isGuest = useAuthStore((s) => s.isGuest);
  const userId = useAuthStore((s) => s.user?.id);
  const updateCard = useGuestStore((s) => s.updateCard);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (card: Card) => {
      if (isGuest) {
        updateCard(card.id, card);
        return;
      }
      const insert = mapCardToInsert(card, userId!);
      await svc.updateCard(card.id, insert);
    },
    onSuccess: (_data, card) => {
      if (!isGuest) {
        qc.invalidateQueries({ queryKey: ["cards"] });
        qc.invalidateQueries({ queryKey: ["cards", "detail", card.id] });
        if (card.projectId) {
          qc.invalidateQueries({ queryKey: ["cards", card.projectId] });
        }
      }
      toast.success("Card saved");
    },
    onError: (err) => {
      toast.error(`Failed to save card: ${err.message}`);
    },
  });
}

export function useDeleteCard() {
  const isGuest = useAuthStore((s) => s.isGuest);
  const deleteCard = useGuestStore((s) => s.deleteCard);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (args: { id: string; projectId?: string | null }) => {
      if (isGuest) {
        deleteCard(args.id);
        return;
      }
      await svc.deleteCard(args.id);
    },
    onSuccess: (_data, { projectId }) => {
      if (!isGuest) {
        qc.invalidateQueries({ queryKey: ["cards"] });
        if (projectId) {
          qc.invalidateQueries({ queryKey: ["cards", projectId] });
        }
      }
      toast.success("Card deleted");
    },
    onError: (err) => {
      toast.error(`Failed to delete card: ${err.message}`);
    },
  });
}
