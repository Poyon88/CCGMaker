import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Project, CardType, Attribute, Rarity, Power, Tribe } from "../types/project";
import type { Template } from "../types/template";
import type { Card } from "../types/card";

interface GuestRules {
  cardTypes: CardType[];
  attributes: Attribute[];
  rarities: Rarity[];
  powers: Power[];
  tribes: Tribe[];
}

interface GuestState {
  projects: Project[];
  templates: Template[];
  cards: Card[];
  rules: Record<string, GuestRules>;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addTemplate: (template: Template) => void;
  updateTemplate: (id: string, updates: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  addCard: (card: Card) => void;
  updateCard: (id: string, updates: Partial<Card>) => void;
  deleteCard: (id: string) => void;
  setRules: (projectId: string, rules: GuestRules) => void;
  updateRules: (projectId: string, updates: Partial<GuestRules>) => void;
  clearAll: () => void;
}

const emptyRules: GuestRules = {
  cardTypes: [],
  attributes: [],
  rarities: [],
  powers: [],
  tribes: [],
};

export const useGuestStore = create<GuestState>()(
  persist(
    (set) => ({
      projects: [],
      templates: [],
      cards: [],
      rules: {},
      addProject: (project) =>
        set((s) => ({
          projects: [...s.projects, project],
          rules: { ...s.rules, [project.id]: emptyRules },
        })),
      updateProject: (id, updates) =>
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),
      deleteProject: (id) =>
        set((s) => {
          const { [id]: _removed, ...remainingRules } = s.rules;
          void _removed;
          return {
            projects: s.projects.filter((p) => p.id !== id),
            templates: s.templates.filter((t) => t.projectId !== id),
            cards: s.cards.filter((c) => c.projectId !== id),
            rules: remainingRules,
          };
        }),
      addTemplate: (template) =>
        set((s) => ({ templates: [...s.templates, template] })),
      updateTemplate: (id, updates) =>
        set((s) => ({
          templates: s.templates.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),
      deleteTemplate: (id) =>
        set((s) => ({ templates: s.templates.filter((t) => t.id !== id) })),
      addCard: (card) => set((s) => ({ cards: [...s.cards, card] })),
      updateCard: (id, updates) =>
        set((s) => ({
          cards: s.cards.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),
      deleteCard: (id) =>
        set((s) => ({ cards: s.cards.filter((c) => c.id !== id) })),
      setRules: (projectId, rules) =>
        set((s) => ({ rules: { ...s.rules, [projectId]: rules } })),
      updateRules: (projectId, updates) =>
        set((s) => ({
          rules: {
            ...s.rules,
            [projectId]: { ...(s.rules[projectId] || emptyRules), ...updates },
          },
        })),
      clearAll: () => set({ projects: [], templates: [], cards: [], rules: {} }),
    }),
    { name: "ccgmaker-guest" }
  )
);

export { emptyRules };
export type { GuestRules };
