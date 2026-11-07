import { useEffect, useRef, useState } from 'react';
import { t } from '~/helpers/i18n';
import type { LoadedPdf, PageSetting } from '../services/types';
import PdfCanvas from './PdfCanvas';
import styles from './PagesCard.module.css';

interface ThumbProps {
    pdf: LoadedPdf;
    page: PageSetting;
    selected: boolean;
    onSelect: () => void;
}

const PageThumbnail = ({ pdf, page, selected, onSelect }: ThumbProps) => {
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const node = buttonRef.current;
        if (!node || visible) return;
        if (typeof IntersectionObserver === 'undefined') {
            setVisible(true);
            return;
        }
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '300px' }
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, [visible]);

    const percent = `${page.position * 100}%`;

    return (
        <button
            ref={buttonRef}
            type="button"
            className={`${styles.thumb} ${selected ? styles.selected : ''}`}
            onClick={onSelect}
            aria-pressed={selected}
            title={`${t('pdf-page-splitter/editor/page')} ${page.index + 1}`}
        >
            <div className={styles.stage}>
                {visible ? (
                    <PdfCanvas
                        doc={pdf.doc}
                        pageIndex={page.index}
                        rotation={page.rotation}
                        maxWidth={124}
                        maxHeight={156}
                        className={styles.canvas}
                    />
                ) : (
                    <div className={styles.placeholder}>
                        <i className="bi bi-file-earmark-pdf" aria-hidden="true" />
                    </div>
                )}

                {page.mode !== 'none' && (
                    <span
                        className={page.mode === 'horizontal' ? styles.cutHorizontal : styles.cutVertical}
                        style={page.mode === 'horizontal' ? { top: percent } : { left: percent }}
                    />
                )}

                <span className={styles.number}>{page.index + 1}</span>

                {page.rotation !== 0 && (
                    <span className={styles.rotation}>
                        <i className="bi bi-arrow-clockwise" aria-hidden="true" />
                        {page.rotation}°
                    </span>
                )}

                {page.mode !== 'none' && (
                    <span className={styles.mode}>
                        {page.mode === 'horizontal'
                            ? t('pdf-page-splitter/pages/mode_horizontal')
                            : t('pdf-page-splitter/pages/mode_vertical')}
                    </span>
                )}
            </div>
        </button>
    );
};

interface Props {
    pdf: LoadedPdf;
    pages: PageSetting[];
    selected: number;
    onSelect: (index: number) => void;
}

const PagesCard = ({ pdf, pages, selected, onSelect }: Props) => (
    <div className="card mb-3">
        <div className="card-header d-flex align-items-center justify-content-between">
            <h2 className="h6 mb-0">
                <i className="bi bi-grid-3x3-gap me-1" aria-hidden="true" />
                {t('pdf-page-splitter/pages/title')}
            </h2>
            <span className="small text-muted">
                {t('pdf-page-splitter/pages/total')}: {pages.length}
            </span>
        </div>
        <div className={`card-body ${styles.list}`}>
            <div className="row row-cols-3 row-cols-sm-4 row-cols-md-5 row-cols-xl-6 g-2">
                {pages.map((page) => (
                    <div className="col" key={page.index}>
                        <PageThumbnail
                            pdf={pdf}
                            page={page}
                            selected={selected === page.index}
                            onSelect={() => onSelect(page.index)}
                        />
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default PagesCard;
