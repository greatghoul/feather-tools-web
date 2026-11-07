import { useCallback, useEffect, useRef, useState } from 'react';
import { t } from '~/helpers/i18n';
import FileInputCard from './components/FileInputCard';
import SettingsCard from './components/SettingsCard';
import PageEditorCard from './components/PageEditorCard';
import PagesCard from './components/PagesCard';
import ExportCard from './components/ExportCard';
import { openPdf } from './services/pdfjs';
import type { LoadedPdf, PageSetting, Rotation, SplitMode } from './services/types';

const DEFAULT_POSITION = 0.5;

const App = () => {
    const [pdf, setPdf] = useState<LoadedPdf | null>(null);
    const [pages, setPages] = useState<PageSetting[]>([]);
    const [selected, setSelected] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const pdfRef = useRef<LoadedPdf | null>(null);
    const loadIdRef = useRef(0);

    useEffect(() => {
        return () => {
            void pdfRef.current?.doc.destroy();
        };
    }, []);

    const handleSelectFile = useCallback(async (file: File) => {
        const loadId = ++loadIdRef.current;
        setLoading(true);
        setError('');

        try {
            const bytes = new Uint8Array(await file.arrayBuffer());
            const doc = await openPdf(bytes);
            if (loadId !== loadIdRef.current) {
                void doc.destroy();
                return;
            }

            const loaded: LoadedPdf = {
                name: file.name,
                size: file.size,
                bytes,
                doc,
                pageCount: doc.numPages,
            };

            void pdfRef.current?.doc.destroy();
            pdfRef.current = loaded;

            setPdf(loaded);
            setPages(
                Array.from({ length: doc.numPages }, (_, index) => ({
                    index,
                    mode: 'none' as SplitMode,
                    position: DEFAULT_POSITION,
                    rotation: 0 as Rotation,
                }))
            );
            setSelected(0);
        } catch (err: any) {
            if (loadId !== loadIdRef.current) return;
            console.error('[pdf-page-splitter] failed to load PDF', err);
            setError(
                err?.name === 'PasswordException'
                    ? t('pdf-page-splitter/error/encrypted')
                    : err?.name === 'InvalidPDFException'
                      ? t('pdf-page-splitter/error/invalid')
                      : t('pdf-page-splitter/error/load_failed')
            );
            setPdf(null);
            setPages([]);
            pdfRef.current = null;
        } finally {
            if (loadId === loadIdRef.current) setLoading(false);
        }
    }, []);

    const handleRemove = useCallback(() => {
        loadIdRef.current += 1;
        void pdfRef.current?.doc.destroy();
        pdfRef.current = null;
        setPdf(null);
        setPages([]);
        setSelected(0);
        setError('');
    }, []);

    const updateSelectedPage = (patch: Partial<PageSetting>) => {
        setPages((prev) =>
            prev.map((page) => (page.index === selected ? { ...page, ...patch } : page))
        );
    };

    const applyModeToAll = (mode: SplitMode) => {
        setPages((prev) => prev.map((page) => ({ ...page, mode })));
    };

    const applyPositionToAll = (position: number) => {
        setPages((prev) => prev.map((page) => ({ ...page, position })));
    };

    const rotateAll = (delta: number) => {
        setPages((prev) =>
            prev.map((page) => ({
                ...page,
                rotation: ((((page.rotation + delta) % 360) + 360) % 360) as Rotation,
            }))
        );
    };

    const resetRotationAll = () => {
        setPages((prev) => prev.map((page) => ({ ...page, rotation: 0 as Rotation })));
    };

    const resetAll = () => {
        setPages((prev) =>
            prev.map((page) => ({
                ...page,
                mode: 'none' as SplitMode,
                position: DEFAULT_POSITION,
                rotation: 0 as Rotation,
            }))
        );
    };

    const cutPageCount = pages.filter((page) => page.mode !== 'none').length;
    const selectedPage = pages[selected];

    return (
        <div>
            <FileInputCard
                pdf={pdf}
                loading={loading}
                error={error}
                onSelectFile={handleSelectFile}
                onRemove={handleRemove}
            />

            {pdf && selectedPage ? (
                <div className="row">
                    <div className="col-lg-4">
                        <SettingsCard
                            onApplyMode={applyModeToAll}
                            onApplyPosition={applyPositionToAll}
                            onRotateAll={rotateAll}
                            onResetRotationAll={resetRotationAll}
                            onResetAll={resetAll}
                            cutPageCount={cutPageCount}
                        />
                    </div>
                    <div className="col-lg-8">
                        <PageEditorCard
                            pdf={pdf}
                            page={selectedPage}
                            onChange={updateSelectedPage}
                            onSelectPage={(index) =>
                                setSelected(Math.min(pages.length - 1, Math.max(0, index)))
                            }
                        />
                        <PagesCard
                            pdf={pdf}
                            pages={pages}
                            selected={selected}
                            onSelect={setSelected}
                        />
                        <ExportCard pdf={pdf} pages={pages} />
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div className="card-body text-center text-muted py-5">
                        <i className="bi bi-file-earmark-pdf fs-1 d-block mb-3" aria-hidden="true" />
                        <p className="mb-1">{t('pdf-page-splitter/empty/hint')}</p>
                        <small>{t('pdf-page-splitter/empty/detail')}</small>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
