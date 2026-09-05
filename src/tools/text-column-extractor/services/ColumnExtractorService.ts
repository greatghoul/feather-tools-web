const ColumnExtractorService = {
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
        return best.delimiter === '\t' ? '\t' : best.delimiter;
    },

    previewAll(text, delimiter) {
        const lines = text.split('\n').filter((line) => line.trim() !== '');
        if (lines.length === 0) {
            return { headers: [], rows: [] };
        }

        const allRows = lines.map((line) => this.splitLine(line, delimiter));
        const maxCols = allRows.reduce((max, row) => Math.max(max, row.length), 0);
        const rows = allRows.map((row) => {
            const padded = [...row];
            while (padded.length < maxCols) padded.push('');
            return padded;
        });

        return { rows, columns: maxCols };
    },

    parseColumns(columnInput) {
        const parts = columnInput.split(',');
        const columns: number[] = [];
        for (const part of parts) {
            const trimmed = part.trim();
            if (trimmed === '') continue;
            const num = parseInt(trimmed, 10);
            if (!isNaN(num) && num > 0) {
                columns.push(num - 1);
            }
        }
        return columns;
    },

    extract(text, delimiter, columnInput, includeHeader) {
        const lines = text.split('\n').filter((line) => line.trim() !== '');
        if (lines.length === 0) {
            return { headers: [], rows: [] };
        }

        const columns = this.parseColumns(columnInput);
        if (columns.length === 0) {
            return { headers: [], rows: [] };
        }

        let startIndex = 0;
        let headers: string[] = [];

        if (includeHeader) {
            const headerRow = this.splitLine(lines[0], delimiter);
            headers = columns.map((col) => (col < headerRow.length ? headerRow[col] : ''));
            startIndex = 1;
        }

        const rows: string[][] = [];
        for (let i = startIndex; i < lines.length; i++) {
            const parts = this.splitLine(lines[i], delimiter);
            const row = columns.map((col) => (col < parts.length ? parts[col] : ''));
            if (row.some((cell) => cell !== '')) {
                rows.push(row);
            }
        }

        return { headers, rows };
    },

    splitLine(line, delimiter) {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === delimiter && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());

        return result;
    }
};

export default ColumnExtractorService;
