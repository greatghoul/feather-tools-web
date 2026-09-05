// Tool registry migrated from the old Flask app/tools.py.
// A tool only gets generated pages once its src/tools/<slug>/entries/{en,zh}.tsx exist
// (see vite.entries.mjs scanToolEntries).
export type ToolCategory = 'text' | 'image' | 'video' | 'printable' | 'extension';

export interface ToolDef {
    slug: string;
    category: ToolCategory;
    /** Static logo path (relative to /static/), only set for extension tools. */
    logo?: string;
}

// Display order of categories on the home page and in nav anchors.
export const CATEGORY_ORDER: ToolCategory[] = ['text', 'image', 'video', 'printable', 'extension'];

export const TOOLS: ToolDef[] = [
    { slug: 'simple-qrcode', category: 'image' },
    { slug: 'rich-qrcode', category: 'image' },
    { slug: 'batch-qrcode', category: 'image' },
    { slug: 'number-images', category: 'image' },
    { slug: 'resize-images', category: 'image' },
    { slug: 'image-round-corner', category: 'image' },
    { slug: 'image-shadow', category: 'image' },
    { slug: 'image-torn-edge', category: 'image' },
    { slug: 'shape-image', category: 'image' },
    { slug: 'merge-images', category: 'image' },
    { slug: 'pixelate-images', category: 'image' },
    { slug: 'image-rotation', category: 'image' },
    { slug: 'image-batch-crop', category: 'image' },
    { slug: 'image-split', category: 'image' },
    { slug: 'image-watermark', category: 'image' },
    { slug: 'image-adjust', category: 'image' },
    { slug: 'image-grayscale', category: 'image' },
    { slug: 'image-compress', category: 'image' },
    { slug: 'image-palette', category: 'image' },
    { slug: 'image-placeholder', category: 'image' },
    { slug: 'qrcode-decode', category: 'image' },
    { slug: 'image-convert', category: 'image' },
    { slug: 'image-annotation', category: 'image' },
    { slug: 'gif-cut', category: 'image' },
    { slug: 'gif-frames', category: 'image' },
    { slug: 'gif-maker', category: 'image' },
    { slug: 'blood-pressure-tracker', category: 'printable' },
    { slug: 'weight-tracker', category: 'printable' },
    { slug: 'habit-tracker', category: 'printable' },
    { slug: 'todo-paper', category: 'printable' },
    { slug: 'sleep-chart', category: 'printable' },
    { slug: 'monthly-planner', category: 'printable' },
    { slug: 'meal-planner', category: 'printable' },
    { slug: 'reading-log', category: 'printable' },
    { slug: 'clean-urls', category: 'text' },
    { slug: 'remove-whitespaces', category: 'text' },
    { slug: 'text-dedup', category: 'text' },
    { slug: 'text-sort', category: 'text' },
    { slug: 'text-case-convert', category: 'text' },
    { slug: 'text-to-speech', category: 'text' },
    { slug: 'text-ascii-art', category: 'text' },
    { slug: 'text-line-numbers', category: 'text' },
    { slug: 'text-frequency', category: 'text' },
    { slug: 'text-truncate', category: 'text' },
    { slug: 'text-column-extractor', category: 'text' },
    { slug: 'text-bubble', category: 'text' },
    { slug: 'text-redact', category: 'text' },
    { slug: 'csv-redact', category: 'text' },
    { slug: 'csv-sample', category: 'text' },
    { slug: 'text-extract', category: 'text' },
    { slug: 'line-paper', category: 'printable' },
    { slug: 'hanzi-paper', category: 'printable' },
    { slug: 'sudoku-generator', category: 'printable' },
    { slug: 'video-cut', category: 'video' },
    { slug: 'video-to-mp3', category: 'video' },
    { slug: 'video-flip', category: 'video' },
    { slug: 'video-frames', category: 'video' },
    { slug: 'video-to-gif', category: 'video' },
    { slug: 'video-crop', category: 'video' },
    { slug: 'video-speed', category: 'video' },
    { slug: 'video-volume', category: 'video' },
    { slug: 'emoji-picker', category: 'text' },
    { slug: 'long-post-splitter', category: 'text' },
    { slug: 'habitica-batch-tasks', category: 'extension', logo: 'extensions/habitica/habitica-icon.svg' },
    { slug: 'habitica-egg-hatcher', category: 'extension', logo: 'extensions/habitica/habitica-icon.svg' },
    { slug: 'minecraft-shape-calculator', category: 'extension', logo: 'extensions/minecraft/minecraft-icon.svg' },
];

export const TOOL_MAP: Record<string, ToolDef> = Object.fromEntries(
    TOOLS.map((tool) => [tool.slug, tool])
);
