const DEFAULT_PARAMS = {
    keep_first: 1,
    keep_last: 1,
    middle: 2,
};

const MaskService = {
    detectDelimiter(text) {
        const line = text.split('\n').find((l) => l.trim() !== '');
        if (!line) return ',';

        const candidates = ['\t', ',', ';', '|'];
        let best = { delimiter: ',', count: 0 };

        for (const delim of candidates) {
            const count = this.splitLine(line, delim).length;
            if (count > best.count) {
                best = { delimiter: delim, count };
            }
        }

        if (best.count <= 1) return ',';
        return best.delimiter;
    },

    splitLine(line, delimiter) {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === delimiter && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);

        return result;
    },

    parse(text, delimiter, includeHeader) {
        const allRows = this.parseRows(text, delimiter);
        if (allRows.length === 0) {
            return { headers: [], rows: [], columns: 0 };
        }

        const maxCols = allRows.reduce((max, row) => Math.max(max, row.length), 0);
        const padded = allRows.map((row) => {
            const next = [...row];
            while (next.length < maxCols) next.push('');
            return next;
        });

        let headers: string[] = [];
        let rows = padded;

        if (includeHeader) {
            headers = padded[0];
            rows = padded.slice(1);
        }

        return { headers, rows, columns: maxCols };
    },

    parseRows(text, delimiter) {
        const rows: string[][] = [];
        let row: string[] = [];
        let field = '';
        let inQuotes = false;
        let i = 0;
        let fieldHasContent = false;

        while (i < text.length) {
            const ch = text[i];

            if (inQuotes) {
                if (ch === '"') {
                    if (text[i + 1] === '"') {
                        field += '"';
                        fieldHasContent = true;
                        i += 2;
                    } else {
                        inQuotes = false;
                        i++;
                    }
                } else {
                    field += ch;
                    fieldHasContent = true;
                    i++;
                }
            } else {
                if (ch === '"') {
                    inQuotes = true;
                    fieldHasContent = true;
                    i++;
                } else if (ch === delimiter) {
                    row.push(field);
                    field = '';
                    fieldHasContent = true;
                    i++;
                } else if (ch === '\r') {
                    i++;
                } else if (ch === '\n') {
                    row.push(field);
                    rows.push(row);
                    row = [];
                    field = '';
                    fieldHasContent = false;
                    i++;
                } else {
                    field += ch;
                    fieldHasContent = true;
                    i++;
                }
            }
        }

        if (fieldHasContent || row.length > 0 || field !== '') {
            row.push(field);
            rows.push(row);
        }

        return rows;
    },

    maskCell(value, scheme, param) {
        if (value === '' || value === null || value === undefined) return value;
        const s = String(value);

        switch (scheme) {
            case 'full':
                return '****';
            case 'keep_first': {
                const n = Math.max(0, Number(param) || DEFAULT_PARAMS.keep_first);
                if (s.length <= n) return s;
                return s.slice(0, n) + '****';
            }
            case 'keep_last': {
                const n = Math.max(0, Number(param) || DEFAULT_PARAMS.keep_last);
                if (s.length <= n) return s;
                return '****' + s.slice(-n);
            }
            case 'middle': {
                const n = Math.max(0, Number(param) || DEFAULT_PARAMS.middle);
                if (s.length <= n * 2) return '****';
                return s.slice(0, n) + '****' + s.slice(-n);
            }
            case 'email': {
                const at = s.indexOf('@');
                if (at <= 0) return '****';
                const local = s.slice(0, at);
                const domain = s.slice(at);
                if (local.length <= 4) {
                    return '****' + domain;
                }
                return local.slice(0, 2) + '****' + local.slice(-2) + domain;
            }
            case 'phone': {
                const re = /\([^)]*\)\s*/g;
                const parenGroups = s.match(re) || [];
                const prefix = parenGroups.join('');
                const rest = s.replace(re, '');
                if (rest.length <= 7) {
                    return prefix + '****';
                }
                return prefix + rest.slice(0, 3) + '****' + rest.slice(-4);
            }
            case 'id_card': {
                if (s.length < 10) return '****';
                return s.slice(0, 6) + '****' + s.slice(-4);
            }
            default:
                return s;
        }
    },

    mask(parsedData, rules) {
        const { headers, rows } = parsedData;

        const ruleMap = new Map();
        for (const rule of rules) {
            ruleMap.set(rule.column - 1, rule);
        }

        const maskedRows = rows.map((row) => {
            const newRow = [...row];
            for (const [colIdx, rule] of ruleMap) {
                if (colIdx >= 0 && colIdx < newRow.length) {
                    newRow[colIdx] = this.maskCell(newRow[colIdx], rule.scheme, rule.param);
                }
            }
            return newRow;
        });

        return { headers: [...headers], rows: maskedRows };
    },

    toCsv(headers, rows, delimiter) {
        const escapeCell = (cell) => {
            const s = String(cell);
            if (s.includes(delimiter) || s.includes('"') || s.includes('\n') || s.includes('\r')) {
                return '"' + s.replace(/"/g, '""') + '"';
            }
            return s;
        };

        const lines: string[] = [];
        if (headers && headers.length > 0) {
            lines.push(headers.map(escapeCell).join(delimiter));
        }
        for (const row of rows) {
            lines.push(row.map(escapeCell).join(delimiter));
        }
        return lines.join('\n');
    },
};

export default MaskService;
