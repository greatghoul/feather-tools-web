import MaskService from '~/tools/csv-redact/services/MaskService';

export type FieldRole = 'name' | 'phone' | 'email' | 'extra' | 'ignore';

export interface ExtraCell {
    title: string;
    value: string;
}

export interface SignRow {
    name: string;
    phone: string;
    email: string;
    extra: ExtraCell[];
}

export interface ParsedCsv {
    headers: string[];
    rows: string[][];
}

const ROLE_PATTERNS: { role: FieldRole; patterns: RegExp[] }[] = [
    { role: 'name', patterns: [/姓\s*名/, /名\s*字/, /^name$/i, /full\s*name/i] },
    { role: 'email', patterns: [/邮\s*箱/, /电子邮/i, /^e-?mail$/i, /mail/i] },
    { role: 'phone', patterns: [/手机/, /电话/, /联系/, /phone/i, /mobile/i, /^tel/i, /cell/i] },
];

const SheetService = {
    parseCsv(text: string, includeHeader: boolean): ParsedCsv {
        const delimiter = MaskService.detectDelimiter(text);
        const parsed = MaskService.parse(text, delimiter, includeHeader);
        return { headers: parsed.headers, rows: parsed.rows };
    },

    /** Guess the field role of each column from its header; first match wins. */
    guessRoles(headers: string[]): FieldRole[] {
        const roles: FieldRole[] = headers.map(() => 'extra');
        const taken = new Set<FieldRole>();

        headers.forEach((header, i) => {
            const name = String(header || '').trim();
            if (!name) return;
            for (const { role, patterns } of ROLE_PATTERNS) {
                if (taken.has(role)) continue;
                if (patterns.some((p) => p.test(name))) {
                    roles[i] = role;
                    taken.add(role);
                    return;
                }
            }
        });

        return roles;
    },

    buildRows(
        parsed: ParsedCsv,
        roles: FieldRole[],
        options: { maskPhone: boolean; maskEmail: boolean; blankRows: number }
    ): { rows: SignRow[]; hasPhone: boolean; hasEmail: boolean } {
        const { headers, rows } = parsed;
        const nameIdx = roles.indexOf('name');
        const phoneIdx = roles.indexOf('phone');
        const emailIdx = roles.indexOf('email');
        const extraIdxs = roles
            .map((role, i) => (role === 'extra' ? i : -1))
            .filter((i) => i >= 0);

        const get = (row: string[], idx: number) =>
            idx >= 0 ? String(row[idx] ?? '').trim() : '';

        const extraCells = (row: string[] | null): ExtraCell[] =>
            extraIdxs.map((i) => ({
                title: String(headers[i] ?? '').trim(),
                value: row ? get(row, i) : '',
            }));

        const signRows = rows
            .map((row) => {
                const phone = get(row, phoneIdx);
                const email = get(row, emailIdx);
                return {
                    name: get(row, nameIdx),
                    phone: options.maskPhone ? String(MaskService.maskCell(phone, 'phone', '')) : phone,
                    email: options.maskEmail ? String(MaskService.maskCell(email, 'email', '')) : email,
                    extra: extraCells(row),
                };
            })
            .filter((row) =>
                row.name || row.phone || row.email || row.extra.some((cell) => cell.value)
            );

        for (let i = 0; i < options.blankRows; i++) {
            signRows.push({ name: '', phone: '', email: '', extra: extraCells(null) });
        }

        return {
            rows: signRows,
            hasPhone: phoneIdx >= 0,
            hasEmail: emailIdx >= 0,
        };
    },

    /** Column layout for a sheet without imported data. */
    blankSheetRoles(): FieldRole[] {
        return ['name', 'phone'];
    },
};

export default SheetService;
