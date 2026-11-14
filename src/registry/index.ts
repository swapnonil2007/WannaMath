import {
  VolumeMetadata,
  ModuleMetadata,
  ChapterMetadata,
  ResolvedChapterContext,
  LabMetadata,
  ContentStatus,
  TocChapterItem,
  TocModuleItem,
  TocVolumeItem,
} from "./types";
import { VOL1_SINGLE_VARIABLE } from "./vol1-single-variable";
import { VOL2_LINEAR_ALGEBRA } from "./vol2-linear-algebra";
import { VOL3_MULTIVARIABLE } from "./vol3-multivariable";
import { VOL4_DIFFERENTIAL_EQUATIONS } from "./vol4-differential-equations";
import { VOL5_TRANSFORMS_COMPLEX } from "./vol5-transforms-complex";
import { VOL6_PROBABILITY_NUMERICAL } from "./vol6-probability-numerical";
import { VOL_STATISTICS } from "./vol-statistics";

export type {
  VolumeMetadata,
  ModuleMetadata,
  ChapterMetadata,
  ResolvedChapterContext,
  LabMetadata,
  ContentStatus,
  TocChapterItem,
  TocModuleItem,
  TocVolumeItem,
};

export const TEXTBOOK_VOLUMES: VolumeMetadata[] = [
  VOL1_SINGLE_VARIABLE,
  VOL2_LINEAR_ALGEBRA,
  VOL3_MULTIVARIABLE,
  VOL4_DIFFERENTIAL_EQUATIONS,
  VOL5_TRANSFORMS_COMPLEX,
  VOL6_PROBABILITY_NUMERICAL,
];

export const ALL_VOLUMES: VolumeMetadata[] = [
  ...TEXTBOOK_VOLUMES,
  VOL_STATISTICS,
];

function mapVolumeToTocItem(vol: VolumeMetadata): TocVolumeItem {
  return {
    id: vol.id,
    volumeNumber: vol.volumeNumber,
    slug: vol.slug,
    title: vol.title,
    accentHex: vol.accentHex,
    modules: vol.modules.map((mod) => ({
      id: mod.id,
      slug: mod.slug,
      numberLabel: mod.numberLabel,
      title: mod.title,
      chapters: mod.chapters.map((ch) => ({
        id: ch.id,
        slug: ch.slug,
        title: ch.title,
        status: ch.status,
        ...(ch.accentHex ? { accentHex: ch.accentHex } : {}),
        ...(ch.subParent
          ? {
              subParent: {
                slug: ch.subParent.slug,
                title: ch.subParent.title,
              },
            }
          : {}),
      })),
    })),
  };
}

function resolveChaptersFromVolumes(
  volumes: VolumeMetadata[]
): ResolvedChapterContext[] {
  const list: ResolvedChapterContext[] = [];
  for (const volume of volumes) {
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

export function getTextbookVolumes(): VolumeMetadata[] {
  return TEXTBOOK_VOLUMES;
}

export function getAllVolumes(): VolumeMetadata[] {
  return ALL_VOLUMES;
}

export function getStatisticsVolume(): VolumeMetadata {
  return VOL_STATISTICS;
}

export function getTocVolumes(): TocVolumeItem[] {
  return TEXTBOOK_VOLUMES.map(mapVolumeToTocItem);
}

export function getStatisticsTocVolume(): TocVolumeItem {
  return mapVolumeToTocItem(VOL_STATISTICS);
}

export function getVolumeBySlug(volumeSlug: string): VolumeMetadata | undefined {
  return ALL_VOLUMES.find((v) => v.slug === volumeSlug);
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
  return resolveChaptersFromVolumes(ALL_VOLUMES);
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
  const statChapters = resolveChaptersFromVolumes([VOL_STATISTICS]);
  const statIdx = statChapters.findIndex(
    (item) =>
      item.chapter.id === chapterIdOrSlug ||
      item.chapter.slug === chapterIdOrSlug
  );
  if (statIdx !== -1) {
    return {
      prev: statIdx > 0 ? statChapters[statIdx - 1] : null,
      next: statIdx < statChapters.length - 1 ? statChapters[statIdx + 1] : null,
    };
  }

  const textbookChapters = resolveChaptersFromVolumes(TEXTBOOK_VOLUMES);
  const idx = textbookChapters.findIndex(
    (item) =>
      item.chapter.id === chapterIdOrSlug ||
      item.chapter.slug === chapterIdOrSlug
  );
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? textbookChapters[idx - 1] : null,
    next: idx < textbookChapters.length - 1 ? textbookChapters[idx + 1] : null,
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
