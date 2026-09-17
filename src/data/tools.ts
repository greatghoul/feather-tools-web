// Tool registry migrated from the old Flask app/tools.py.
// A tool gets generated pages once scripts/gen-tool-pages.mjs has created its
// ToolIsland.tsx (see src/data/migrated-tools.ts).
export type ToolTag = 'text' | 'image' | 'video' | 'printable' | 'extension' | 'qrcode' | 'audio';

export interface ToolDef {
    slug: string;
    /** Ordered tags; a tool shows up under every tag, the first is its primary one. */
    tags: ToolTag[];
    /** Static logo path (relative to /static/), only set for extension tools. */
    logo?: string;
    /** True when the tool talks to server endpoints; hides the local-processing privacy badge. */
    serverSide?: boolean;
}

// Display order of tags on the home page and in nav anchors.
export const TAG_ORDER: ToolTag[] = ['text', 'image', 'video', 'printable', 'extension', 'qrcode', 'audio'];

export const TOOLS: ToolDef[] = [
    { slug: 'simple-qrcode', tags: ['qrcode', 'image'] },
    { slug: 'rich-qrcode', tags: ['qrcode', 'image'], serverSide: true },
    { slug: 'batch-qrcode', tags: ['qrcode', 'image'] },
    { slug: 'number-images', tags: ['image'] },
    { slug: 'resize-images', tags: ['image'] },
    { slug: 'image-round-corner', tags: ['image'] },
    { slug: 'image-shadow', tags: ['image'] },
    { slug: 'image-torn-edge', tags: ['image'] },
    { slug: 'shape-image', tags: ['image'] },
    { slug: 'merge-images', tags: ['image'] },
    { slug: 'pixelate-images', tags: ['image'] },
    { slug: 'image-rotation', tags: ['image'] },
    { slug: 'image-batch-crop', tags: ['image'] },
    { slug: 'image-split', tags: ['image'] },
    { slug: 'image-watermark', tags: ['image'] },
    { slug: 'image-adjust', tags: ['image'] },
    { slug: 'image-grayscale', tags: ['image'] },
    { slug: 'image-compress', tags: ['image'] },
    { slug: 'image-palette', tags: ['image'] },
    { slug: 'image-placeholder', tags: ['image'] },
    { slug: 'qrcode-decode', tags: ['qrcode', 'image'] },
    { slug: 'image-convert', tags: ['image'] },
    { slug: 'image-annotation', tags: ['image'] },
    { slug: 'gif-cut', tags: ['image'] },
    { slug: 'gif-frames', tags: ['image'] },
    { slug: 'gif-maker', tags: ['image'] },
    { slug: 'blood-pressure-tracker', tags: ['printable'] },
    { slug: 'weight-tracker', tags: ['printable'] },
    { slug: 'habit-tracker', tags: ['printable'] },
    { slug: 'todo-paper', tags: ['printable'] },
    { slug: 'sleep-chart', tags: ['printable'] },
    { slug: 'monthly-planner', tags: ['printable'] },
    { slug: 'meal-planner', tags: ['printable'] },
    { slug: 'reading-log', tags: ['printable'] },
    { slug: 'clean-urls', tags: ['text'] },
    { slug: 'remove-whitespaces', tags: ['text'] },
    { slug: 'text-dedup', tags: ['text'] },
    { slug: 'text-sort', tags: ['text'] },
    { slug: 'text-case-convert', tags: ['text'] },
    { slug: 'text-to-speech', tags: ['text', 'audio'] },
    { slug: 'text-ascii-art', tags: ['text'] },
    { slug: 'text-line-numbers', tags: ['text'] },
    { slug: 'text-frequency', tags: ['text'] },
    { slug: 'text-truncate', tags: ['text'] },
    { slug: 'text-column-extractor', tags: ['text'] },
    { slug: 'text-bubble', tags: ['text'] },
    { slug: 'text-redact', tags: ['text'] },
    { slug: 'csv-redact', tags: ['text'] },
    { slug: 'csv-sample', tags: ['text'] },
    { slug: 'text-extract', tags: ['text'] },
    { slug: 'line-paper', tags: ['printable'] },
    { slug: 'hanzi-paper', tags: ['printable'] },
    { slug: 'sudoku-generator', tags: ['printable'] },
    { slug: 'sign-in-sheet', tags: ['printable'] },
    { slug: 'video-cut', tags: ['video'] },
    { slug: 'video-to-mp3', tags: ['video', 'audio'] },
    { slug: 'video-flip', tags: ['video'] },
    { slug: 'video-frames', tags: ['video', 'image'] },
    { slug: 'video-to-gif', tags: ['video', 'image'] },
    { slug: 'video-crop', tags: ['video'] },
    { slug: 'video-speed', tags: ['video'] },
    { slug: 'video-volume', tags: ['video'] },
    { slug: 'emoji-picker', tags: ['text'] },
    { slug: 'long-post-splitter', tags: ['text'] },
    { slug: 'random-wheel', tags: ['text'] },
    { slug: 'habitica-batch-tasks', tags: ['extension'], logo: 'extensions/habitica/habitica-icon.svg' },
    { slug: 'habitica-egg-hatcher', tags: ['extension'], logo: 'extensions/habitica/habitica-icon.svg' },
    { slug: 'minecraft-shape-calculator', tags: ['extension'], logo: 'extensions/minecraft/minecraft-icon.svg' },
];

export const TOOL_MAP: Record<string, ToolDef> = Object.fromEntries(
    TOOLS.map((tool) => [tool.slug, tool])
);
