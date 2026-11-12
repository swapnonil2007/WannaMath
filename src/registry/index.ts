import {
  VolumeMetadata,
  ModuleMetadata,
  ChapterMetadata,
  ResolvedChapterContext,
  LabMetadata,
  ContentStatus,
} from "./types";
import { VOL1_SINGLE_VARIABLE } from "./vol1-single-variable";
import { VOL2_LINEAR_ALGEBRA } from "./vol2-linear-algebra";
import { VOL3_MULTIVARIABLE } from "./vol3-multivariable";
import { VOL4_DIFFERENTIAL_EQUATIONS } from "./vol4-differential-equations";
import { VOL5_TRANSFORMS_COMPLEX } from "./vol5-transforms-complex";
import { VOL6_PROBABILITY_NUMERICAL } from "./vol6-probability-numerical";

export type {
  VolumeMetadata,
  ModuleMetadata,
  ChapterMetadata,
  ResolvedChapterContext,
  LabMetadata,
  ContentStatus,
};

export const TEXTBOOK_VOLUMES: VolumeMetadata[] = [
  VOL1_SINGLE_VARIABLE,
  VOL2_LINEAR_ALGEBRA,
  VOL3_MULTIVARIABLE,
  VOL4_DIFFERENTIAL_EQUATIONS,
  VOL5_TRANSFORMS_COMPLEX,
  VOL6_PROBABILITY_NUMERICAL,
];

export function getAllVolumes(): VolumeMetadata[] {
  return TEXTBOOK_VOLUMES;
}

export function getVolumeBySlug(volumeSlug: string): VolumeMetadata | undefined {
  return TEXTBOOK_VOLUMES.find((v) => v.slug === volumeSlug);
}

export function getModuleBySlugs(
  volumeSlug: string,
  moduleSlug: string
): { volume: VolumeMetadata; module: ModuleMetadata } | undefined {
  const volume = getVolumeBySlug(volumeSlug);
  if (!volume) return undefined;
  const mod = volume.modules.find((m) => m.slug === moduleSlug);
  if (!mod) return undefined;
  return { volume, module: mod };
}

export function getChapterRoute(
  volumeSlug: string,
  moduleSlug: string,
  chapterSlug: string
): string {
  return `/${volumeSlug}/${moduleSlug}/${chapterSlug}`;
}

export function getAllResolvedChapters(): ResolvedChapterContext[] {
  const list: ResolvedChapterContext[] = [];
  for (const volume of TEXTBOOK_VOLUMES) {
    for (const mod of volume.modules) {
      for (const chapter of mod.chapters) {
        list.push({
          volume,
          module: mod,
          chapter,
          route: getChapterRoute(volume.slug, mod.slug, chapter.slug),
        });
      }
    }
  }
  return list;
}

export function getChapterBySlugs(
  volumeSlug: string,
  moduleSlug: string,
  chapterSlug: string
): ResolvedChapterContext | undefined {
  const volume = getVolumeBySlug(volumeSlug);
  if (!volume) return undefined;
  const mod = volume.modules.find((m) => m.slug === moduleSlug);
  if (!mod) return undefined;
  const chapter = mod.chapters.find((c) => c.slug === chapterSlug);
  if (!chapter) return undefined;
  return {
    volume,
    module: mod,
    chapter,
    route: getChapterRoute(volume.slug, mod.slug, chapter.slug),
  };
}

export function getChapterById(
  chapterIdOrSlug: string
): ResolvedChapterContext | undefined {
  const all = getAllResolvedChapters();
  return all.find(
    (item) =>
      item.chapter.id === chapterIdOrSlug ||
      item.chapter.slug === chapterIdOrSlug
  );
}

export function getAdjacentChapters(chapterIdOrSlug: string): {
  prev: ResolvedChapterContext | null;
  next: ResolvedChapterContext | null;
} {
  const all = getAllResolvedChapters();
  const idx = all.findIndex(
    (item) =>
      item.chapter.id === chapterIdOrSlug ||
      item.chapter.slug === chapterIdOrSlug
  );
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  };
}

export function getPrerequisiteChapters(
  chapterIdOrSlug: string
): ResolvedChapterContext[] {
  const current = getChapterById(chapterIdOrSlug);
  if (!current) return [];
  const all = getAllResolvedChapters();
  return current.chapter.prerequisites
    .map((prereqId) =>
      all.find(
        (item) =>
          item.chapter.id === prereqId || item.chapter.slug === prereqId
      )
    )
    .filter((item): item is ResolvedChapterContext => Boolean(item));
}
