export type ContentStatus = "published" | "in-progress" | "planned";

export interface LabMetadata {
  id: string;
  slug: string;
  title: string;
  componentKey: string;
  summary: string;
  formulaLatex?: string;
  dimensionBadge?: "1D" | "2D" | "3D" | "2D + 3D" | "Dual 2D";
}

export interface ChapterPedagogicalRhythm {
  question: string;
  labInteraction: string;
  symbolicFormalizationLatex: string;
  edgeCasesAndBridge: string;
}

export interface ChapterMetadata {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  status: ContentStatus;
  estimatedMinutes: number;
  prerequisites: string[];
  keyEquationsLatex: string[];
  labs: LabMetadata[];
  dimensionBadge?: string;
  accentHex?: string;
  engineeringContext?: string;
  pedagogicalRhythm?: ChapterPedagogicalRhythm;
}

export interface ModuleMetadata {
  id: string;
  slug: string;
  numberLabel: string;
  title: string;
  description: string;
  accentHex?: string;
  chapters: ChapterMetadata[];
}

export interface VolumeMetadata {
  id: string;
  volumeNumber: string;
  slug: string;
  title: string;
  shortTitle?: string;
  accentToken: string;
  accentHex: string;
  description: string;
  engineeringApplications: string[];
  modules: ModuleMetadata[];
}

export interface ResolvedChapterContext {
  volume: VolumeMetadata;
  module: ModuleMetadata;
  chapter: ChapterMetadata;
  route: string;
}
