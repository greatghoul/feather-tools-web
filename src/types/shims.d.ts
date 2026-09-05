// Libraries shipped without type declarations.
declare module 'upng-js';

// Locale set by the tool island before mounting (see createToolIsland).
interface Window {
    LOCALE: string;
    // Global `sudoku` library (robatron/sudoku.js) loaded via <script> tag.
    sudoku: any;
    // Global `GIF` library (gif.js) loaded via <script> tag.
    GIF: any;
    // Global `lamejs` MP3 encoder loaded via <script> tag.
    lamejs: any;
}
