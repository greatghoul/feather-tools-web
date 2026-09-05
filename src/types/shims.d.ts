// Libraries shipped without type declarations.
declare module 'upng-js';

// Locale set by each tool entry bundle before mounting (entries/*.tsx).
interface Window {
    LOCALE: string;
    // Global `sudoku` library (robatron/sudoku.js) loaded via <script> tag.
    sudoku: any;
    // Global `GIF` library (gif.js) loaded via <script> tag.
    GIF: any;
    // Global `lamejs` MP3 encoder loaded via <script> tag.
    lamejs: any;
}
