import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { t } from '~/helpers/i18n';
import SheetService, { type ParsedCsv, type FieldRole } from './services/SheetService';
import SheetRenderer, { type SignMode } from './services/SheetRenderer';
import PdfExporter from './services/PdfExporter';
import CSVInputCard from '~/components/CSVInputCard';
import FieldMappingCard from './components/FieldMappingCard';
import SettingsCard from './components/SettingsCard';
import PreviewPanel from './components/PreviewPanel';
import CanvasPrinter from '~/services/CanvasPrinter';

const BLANK_PARSED: ParsedCsv = { headers: [], rows: [] };

const App = () => {
    const [csvText, setCsvText] = useState('');
    const [includeHeader, setIncludeHeader] = useState(true);
    const [delimiter, setDelimiter] = useState('auto');
    const [customDelimiter, setCustomDelimiter] = useState('');
    const [roles, setRoles] = useState<FieldRole[]>([]);
    const [title, setTitle] = useState(t('sign-in-sheet/settings/default_title'));
    const [date, setDate] = useState('');
    const [location, setLocation] = useState('');
    const [signMode, setSignMode] = useState<SignMode>('signature');
    const [maskPhone, setMaskPhone] = useState(true);
    const [maskEmail, setMaskEmail] = useState(true);
    const [blankRows, setBlankRows] = useState(0);

    // Settings are drafts: the preview only follows the snapshot committed by 生成.
    const [applied, setApplied] = useState({
        title: t('sign-in-sheet/settings/default_title'),
        date: '',
        location: '',
        signMode: 'signature' as SignMode,
        maskPhone: true,
        maskEmail: true,
        blankRows: 0,
    });
    const [previews, setPreviews] = useState<string[]>([]);
    const [truncated, setTruncated] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const canvasesRef = useRef<HTMLCanvasElement[]>([]);

    const parsed: ParsedCsv = useMemo(() => {
        if (!csvText.trim()) return BLANK_PARSED;
        try {
            const delim = delimiter === 'auto' ? '' : delimiter === 'custom' ? customDelimiter.trim() : delimiter;
            return SheetService.parseCsv(csvText, includeHeader, delim);
        } catch {
            return BLANK_PARSED;
        }
    }, [csvText, includeHeader, delimiter, customDelimiter]);

    const hasCsv = parsed.headers.length > 0 || parsed.rows.length > 0;

    // Re-guess the field mapping whenever a new list is loaded.
    useEffect(() => {
        setRoles(hasCsv ? SheetService.guessRoles(parsed.headers) : SheetService.blankSheetRoles());
    }, [csvText, includeHeader, delimiter, customDelimiter]);

    const handleRoleChange = (index: number, role: FieldRole) => {
        setRoles((prev) => {
            const next = [...prev];
            next[index] = role;
            return next;
        });
    };

    const { rows: signRows, hasPhone, hasEmail } = useMemo(() => (
        SheetService.buildRows(parsed, roles, {
            maskPhone: applied.maskPhone,
            maskEmail: applied.maskEmail,
            blankRows: applied.blankRows,
        })
    ), [parsed, roles, applied]);

    const handleGenerate = () => {
        setApplied({ title, date, location, signMode, maskPhone, maskEmail, blankRows });
    };

    const buildSheets = useCallback(() => {
        const result = SheetRenderer.render({
            title: applied.title,
            date: applied.date,
            location: applied.location,
            signMode: applied.signMode,
            rows: signRows,
            showPhone: hasPhone,
            showEmail: hasEmail,
            labels: {
                no: t('sign-in-sheet/render/column_no'),
                name: t('sign-in-sheet/render/column_name'),
                phone: t('sign-in-sheet/render/column_phone'),
                email: t('sign-in-sheet/render/column_email'),
                sign: t('sign-in-sheet/render/column_sign'),
                date: t('sign-in-sheet/render/date_label'),
                location: t('sign-in-sheet/render/location_label'),
                pageOf: t('sign-in-sheet/render/page_of'),
            },
        });
        canvasesRef.current = result.canvases;
        setTruncated(result.truncated);
        setPreviews(result.canvases.map((canvas) => canvas.toDataURL('image/jpeg', 0.85)));
    }, [applied, signRows, hasPhone, hasEmail]);

    useEffect(() => {
        buildSheets();
    }, [buildSheets]);

    const handlePrint = () => {
        if (canvasesRef.current.length === 0) return;
        const printer = new CanvasPrinter(canvasesRef.current, {
            pageOrientation: 'portrait',
            pageSize: 'A4',
            renderScale: 2,
        });
        printer.print();
    };

    const handleDownloadPdf = async () => {
        if (canvasesRef.current.length === 0) return;
        setIsExporting(true);
        try {
            await PdfExporter.export(canvasesRef.current, 'sign-in-sheet.pdf');
        } finally {
            setIsExporting(false);
        }
    };

    const loadExample = () => {
        const isChinese = window.LOCALE === 'zh';
        const surnames = isChinese
            ? '王李张刘陈杨赵黄周吴'.split('')
            : ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Anderson', 'Taylor', 'Thomas'];
        const givens = isChinese
            ? ['伟', '芳', '娜', '敏', '静', '磊', '军', '洋', '勇', '艳', '杰', '涛']
            : ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'William', 'Susan'];
        const departments = isChinese
            ? ['研发部', '市场部', '人事部', '财务部']
            : ['Engineering', 'Marketing', 'HR', 'Finance'];
        const lines = [isChinese ? '姓名,手机号,邮箱,部门' : 'Name,Phone,Email,Department'];
        for (let i = 0; i < 38; i++) {
            const given = givens[i % givens.length];
            const surname = surnames[Math.floor(i / givens.length) % surnames.length];
            const name = isChinese ? `${surname}${given}` : `${given} ${surname}`;
            const phone = isChinese
                ? `138${String(10000000 + i * 137)}`
                : `555-${String(200 + i).padStart(3, '0')}-${String(1000 + i * 13).padStart(4, '0')}`;
            const email = isChinese
                ? `user${i + 1}@example.com`
                : `${given.toLowerCase()}.${surname.toLowerCase()}${i + 1}@example.com`;
            lines.push(`${name},${phone},${email},${departments[i % departments.length]}`);
        }
        setCsvText(lines.join('\n'));
    };

    return (
<>

        <CSVInputCard
            text={csvText}
            onTextChange={setCsvText}
            parsed={parsed}
            includeHeader={includeHeader}
            onIncludeHeaderChange={setIncludeHeader}
            delimiter={delimiter}
            onDelimiterChange={setDelimiter}
            customDelimiter={customDelimiter}
            onCustomDelimiterChange={setCustomDelimiter}
            onLoadExample={loadExample}
            titleKey="sign-in-sheet/csv/card_title"
        />
        {hasCsv ? (
            <FieldMappingCard
                parsed={parsed}
                roles={roles}
                onRolesChange={handleRoleChange}
            />
        ) : null}
        <div className="row">
            <div className="col-lg-4 mb-4">
                <SettingsCard
                    title={title}
                    onTitleChange={setTitle}
                    date={date}
                    onDateChange={setDate}
                    location={location}
                    onLocationChange={setLocation}
                    signMode={signMode}
                    onSignModeChange={setSignMode}
                    maskPhone={maskPhone}
                    onMaskPhoneChange={setMaskPhone}
                    maskPhoneEnabled={hasCsv && hasPhone}
                    maskEmail={maskEmail}
                    onMaskEmailChange={setMaskEmail}
                    maskEmailEnabled={hasCsv && hasEmail}
                    blankRows={blankRows}
                    onBlankRowsChange={setBlankRows}
                    onGenerate={handleGenerate}
                    onPrint={handlePrint}
                    onDownloadPdf={handleDownloadPdf}
                    isExporting={isExporting}
                />
            </div>
            <div className="col-lg-8">
                <PreviewPanel
                    previews={previews}
                    pageCount={signRows.length > 0 ? previews.length : 0}
                    truncated={truncated}
                    empty={signRows.length === 0}
                />
            </div>
        </div>

</>
    );
};

export default App;
