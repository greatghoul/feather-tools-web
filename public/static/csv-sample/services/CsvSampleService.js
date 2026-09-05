export const LOCALES = [
    { value: 'auto', key: 'csv-sample/options/locale_auto' },
    { value: 'en', key: 'csv-sample/options/locale_en' },
    { value: 'zh', key: 'csv-sample/options/locale_zh' },
];

export const DELIMITERS = [
    { value: ',', key: 'csv-sample/options/comma' },
    { value: '\t', key: 'csv-sample/options/tab' },
    { value: ';', key: 'csv-sample/options/semicolon' },
    { value: '|', key: 'csv-sample/options/pipe' },
    { value: 'custom', key: 'csv-sample/options/custom' },
];

export const COLUMN_TYPES = [
    { value: 'fullName', key: 'csv-sample/type/full_name', rules: [] },
    { value: 'firstName', key: 'csv-sample/type/first_name', rules: [] },
    { value: 'lastName', key: 'csv-sample/type/last_name', rules: [] },
    { value: 'email', key: 'csv-sample/type/email', rules: [] },
    { value: 'username', key: 'csv-sample/type/username', rules: [] },
    { value: 'phone', key: 'csv-sample/type/phone', rules: [] },
    { value: 'integer', key: 'csv-sample/type/integer', rules: ['min', 'max'] },
    { value: 'float', key: 'csv-sample/type/float', rules: ['min', 'max', 'decimals'] },
    { value: 'date', key: 'csv-sample/type/date', rules: ['dateFrom', 'dateTo', 'dateFormat'] },
    { value: 'boolean', key: 'csv-sample/type/boolean', rules: [] },
    { value: 'uuid', key: 'csv-sample/type/uuid', rules: [] },
    { value: 'word', key: 'csv-sample/type/word', rules: [] },
    { value: 'sentence', key: 'csv-sample/type/sentence', rules: [] },
    { value: 'paragraph', key: 'csv-sample/type/paragraph', rules: [] },
    { value: 'city', key: 'csv-sample/type/city', rules: [] },
    { value: 'address', key: 'csv-sample/type/address', rules: [] },
    { value: 'country', key: 'csv-sample/type/country', rules: [] },
    { value: 'company', key: 'csv-sample/type/company', rules: [] },
    { value: 'jobTitle', key: 'csv-sample/type/job_title', rules: [] },
    { value: 'url', key: 'csv-sample/type/url', rules: [] },
    { value: 'ipv4', key: 'csv-sample/type/ipv4', rules: [] },
    { value: 'color', key: 'csv-sample/type/color', rules: [] },
    { value: 'sequence', key: 'csv-sample/type/sequence', rules: ['start', 'step'] },
    { value: 'constant', key: 'csv-sample/type/constant', rules: ['value'] },
    { value: 'customList', key: 'csv-sample/type/custom_list', rules: ['values'] },
];

export const RULE_FIELDS = {
    min: { type: 'number', key: 'csv-sample/rules/min', placeholder: '0' },
    max: { type: 'number', key: 'csv-sample/rules/max', placeholder: '100' },
    decimals: { type: 'number', key: 'csv-sample/rules/decimals', placeholder: '2', min: 0, max: 10, step: 1 },
    dateFrom: { type: 'date', key: 'csv-sample/rules/date_from' },
    dateTo: { type: 'date', key: 'csv-sample/rules/date_to' },
    dateFormat: {
        type: 'select',
        key: 'csv-sample/rules/date_format',
        options: [
            { value: 'YYYY-MM-DD' },
            { value: 'YYYY/MM/DD' },
            { value: 'MM/DD/YYYY' },
            { value: 'DD/MM/YYYY' },
            { value: 'YYYY-MM-DD HH:mm:ss' },
            { value: 'YYYY年MM月DD日' },
        ],
    },
    start: { type: 'number', key: 'csv-sample/rules/start', placeholder: '1' },
    step: { type: 'number', key: 'csv-sample/rules/step', placeholder: '1' },
    value: { type: 'text', key: 'csv-sample/rules/value', placeholderKey: 'csv-sample/rules/value_placeholder' },
    values: { type: 'text', key: 'csv-sample/rules/values', placeholderKey: 'csv-sample/rules/values_placeholder' },
};

const TYPE_DEFAULTS = {
    integer: { min: 0, max: 100 },
    float: { min: 0, max: 100, decimals: 2 },
    date: { dateFrom: '2020-01-01', dateTo: '2024-12-31', dateFormat: 'YYYY-MM-DD', dateFormatMode: 'preset' },
    sequence: { start: 1, step: 1 },
    constant: { value: '' },
    customList: { values: '' },
};

const TYPE_MAP = Object.fromEntries(COLUMN_TYPES.map((t) => [t.value, t]));

let idCounter = 0;
const nextId = () => ++idCounter;

export function getTypeDef(typeValue) {
    return TYPE_MAP[typeValue] || COLUMN_TYPES[0];
}

export function createColumn(name, type) {
    const typeDef = getTypeDef(type);
    const defaults = TYPE_DEFAULTS[type] || {};
    const column = {
        id: nextId(),
        name,
        type,
        ...Object.fromEntries(typeDef.rules.map((rule) => [rule, ''])),
        ...defaults,
    };
    if (PERSON_TYPES.includes(type)) {
        column.personGroup = 1;
    }
    return column;
}

export function createDefaultColumns() {
    return [
        createColumn('name', 'fullName'),
        createColumn('email', 'email'),
        createColumn('age', 'integer'),
    ];
}

export function createEmptyColumns() {
    return [];
}

function pad(n) {
    return String(n).padStart(2, '0');
}

export function formatDate(date, format) {
    const map = {
        'YYYY': date.getFullYear().toString(),
        'MM': pad(date.getMonth() + 1),
        'DD': pad(date.getDate()),
        'HH': pad(date.getHours()),
        'mm': pad(date.getMinutes()),
        'ss': pad(date.getSeconds()),
    };
    return format.replace(/YYYY|MM|DD|HH|mm|ss/g, (m) => map[m]);
}

const PERSON_TYPES = ['firstName', 'lastName', 'fullName', 'username', 'email'];
export { PERSON_TYPES };

function createPerson(faker) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    return {
        firstName,
        lastName,
        fullName: faker.person.fullName({ firstName, lastName }),
        username: faker.internet.username({ firstName, lastName }),
        email: faker.internet.email({ firstName, lastName }),
    };
}

function getPerson(column, personBundles) {
    if (!column.personGroup || !personBundles) return null;
    return personBundles[column.personGroup] || null;
}

function generateValue(faker, column, counters, personBundles) {
    switch (column.type) {
        case 'fullName': {
            const person = getPerson(column, personBundles);
            return person ? person.fullName : faker.person.fullName();
        }
        case 'firstName': {
            const person = getPerson(column, personBundles);
            return person ? person.firstName : faker.person.firstName();
        }
        case 'lastName': {
            const person = getPerson(column, personBundles);
            return person ? person.lastName : faker.person.lastName();
        }
        case 'email': {
            const person = getPerson(column, personBundles);
            return person ? person.email : faker.internet.email();
        }
        case 'username': {
            const person = getPerson(column, personBundles);
            return person ? person.username : faker.internet.username();
        }
        case 'phone':
            return faker.phone.number();
        case 'integer':
            return faker.number.int({
                min: Number(column.min ?? 0),
                max: Number(column.max ?? 100),
            }).toString();
        case 'float':
            return faker.number.float({
                min: Number(column.min ?? 0),
                max: Number(column.max ?? 100),
                fractionDigits: Number(column.decimals ?? 2),
            }).toString();
        case 'date':
            return formatDate(
                faker.date.between({
                    from: column.dateFrom || '2000-01-01',
                    to: column.dateTo || '2030-12-31',
                }),
                column.dateFormat || 'YYYY-MM-DD'
            );
        case 'boolean':
            return faker.datatype.boolean().toString();
        case 'uuid':
            return faker.string.uuid();
        case 'word':
            return faker.lorem.word();
        case 'sentence':
            return faker.lorem.sentence();
        case 'paragraph':
            return faker.lorem.paragraph();
        case 'city':
            return faker.location.city();
        case 'address':
            return faker.location.streetAddress();
        case 'country':
            return faker.location.country();
        case 'company':
            return faker.company.name();
        case 'jobTitle':
            return faker.person.jobTitle();
        case 'url':
            return faker.internet.url();
        case 'ipv4':
            return faker.internet.ipv4();
        case 'color':
            return faker.color.human();
        case 'sequence': {
            const current = counters[column.id] ?? Number(column.start ?? 1);
            counters[column.id] = current + Number(column.step ?? 1);
            return current.toString();
        }
        case 'constant':
            return column.value ?? '';
        case 'customList': {
            const items = (column.values ?? '')
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
            return items.length > 0 ? faker.helpers.arrayElement(items) : '';
        }
        default:
            return '';
    }
}

async function createFaker(locale) {
    const resolved = locale === 'auto'
        ? (window.LOCALE === 'zh' ? 'zh' : 'en')
        : locale;
    if (resolved === 'zh') {
        const mod = await import('@faker-js/faker/locale/zh_CN');
        return mod.faker;
    }
    const mod = await import('@faker-js/faker/locale/en');
    return mod.faker;
}

export async function generateCsv(columns, rowCount, options) {
    const faker = await createFaker(options.locale);
    const headers = columns.map((c) => c.name);
    const counters = {};
    columns.forEach((col) => {
        if (col.type === 'sequence') {
            counters[col.id] = Number(col.start ?? 1);
        }
    });

    const rows = [];
    const personGroups = new Set(
        columns
            .filter((col) => PERSON_TYPES.includes(col.type) && col.personGroup)
            .map((col) => col.personGroup)
    );
    for (let i = 0; i < rowCount; i++) {
        const personBundles = {};
        personGroups.forEach((group) => {
            personBundles[group] = createPerson(faker);
        });
        rows.push(columns.map((col) => generateValue(faker, col, counters, personBundles)));
    }
    return { headers, rows };
}

export function toCsv(headers, rows, delimiter) {
    const escapeCell = (cell) => {
        const s = String(cell ?? '');
        if (s.includes(delimiter) || s.includes('"') || s.includes('\n') || s.includes('\r')) {
            return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
    };

    const lines = [];
    if (headers.length > 0) {
        lines.push(headers.map(escapeCell).join(delimiter));
    }
    rows.forEach((row) => {
        lines.push(row.map(escapeCell).join(delimiter));
    });
    return lines.join('\n');
}

const CsvSampleService = {
    LOCALES,
    DELIMITERS,
    COLUMN_TYPES,
    RULE_FIELDS,
    PERSON_TYPES,
    getTypeDef,
    createColumn,
    createDefaultColumns,
    createEmptyColumns,
    formatDate,
    generateCsv,
    toCsv,
};

export default CsvSampleService;
