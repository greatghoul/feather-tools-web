import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { t } from '~/helpers/i18n';
import SheetService, { type ParsedCsv, type FieldRole } from './services/SheetService';
import SheetRenderer, { type SignMode } from './services/SheetRenderer';
import PdfExporter from './services/PdfExporter';
import SettingsCard from './components/SettingsCard';
import CsvImportCard from './components/CsvImportCard';
import PreviewPanel from './components/PreviewPanel';
import CanvasPrinter from '~/services/CanvasPrinter';

const BLANK_PARSED: ParsedCsv = { headers: [], rows: [] };

const App = () => {
    const [csvText, setCsvText] = useState('');
    const [includeHeader, setIncludeHeader] = useState(true);
    const [roles, setRoles] = useState<FieldRole[]>([]);
    const [title, setTitle] = useState(t('sign-in-sheet/settings/default_title'));
    const [date, setDate] = useState('');
    const [location, setLocation] = useState('');
    const [signMode, setSignMode] = useState<SignMode>('signature');
    const [maskPhone, setMaskPhone] = useState(true);
    const [maskEmail, setMaskEmail] = useState(true);
    const [blankRows, setBlankRows] = useState(0);
    const [previews, setPreviews] = useState<string[]>([]);
    const [truncated, setTruncated] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const canvasesRef = useRef<HTMLCanvasElement[]>([]);

    const parsed: ParsedCsv = useMemo(() => {
        if (!csvText.trim()) return BLANK_PARSED;
        try {
            return SheetService.parseCsv(csvText, includeHeader);
        } catch {
            return BLANK_PARSED;
        }
    }, [csvText, includeHeader]);

    const hasCsv = parsed.headers.length > 0 || parsed.rows.length > 0;

    // Re-guess the field mapping whenever a new list is loaded.
    useEffect(() => {
        setRoles(hasCsv ? SheetService.guessRoles(parsed.headers) : SheetService.blankSheetRoles());
    }, [csvText, includeHeader]);

    const handleRoleChange = (index: number, role: FieldRole) => {
        setRoles((prev) => {
            const next = [...prev];
            next[index] = role;
            return next;
        });
    };

    const { rows: signRows, hasPhone, hasEmail } = useMemo(() => (
        SheetService.buildRows(parsed, roles, { maskPhone, maskEmail, blankRows })
    ), [parsed, roles, maskPhone, maskEmail, blankRows]);

    const buildSheets = useCallback(() => {
        const result = SheetRenderer.render({
            title,
            date,
            location,
            signMode,
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
    }, [title, date, location, signMode, signRows, hasPhone, hasEmail]);

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
        const surnames = '王李张刘陈杨赵黄周吴'.split('');
        const givens = ['伟', '芳', '娜', '敏', '静', '磊', '军', '洋', '勇', '艳', '杰', '涛'];
        const departments = ['研发部', '市场部', '人事部', '财务部'];
        const lines = ['姓名,手机号,邮箱,部门'];
        for (let i = 0; i < 38; i++) {
            const name = `${surnames[i % surnames.length]}${givens[i % givens.length]}`;
            const phone = `138${String(10000000 + i * 137)}`;
            const email = `user${i + 1}@example.com`;
            lines.push(`${name},${phone},${email},${departments[i % departments.length]}`);
        }
        setCsvText(lines.join('\n'));
    };

    return (
<>

        <div className="row">
            <div className="col-lg-4 mb-4">
                <CsvImportCard
                    csvText={csvText}
                    onTextChange={setCsvText}
                    includeHeader={includeHeader}
                    onIncludeHeaderChange={setIncludeHeader}
                    parsed={parsed}
                    roles={roles}
                    onRolesChange={handleRoleChange}
                    onLoadExample={loadExample}
                />
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
