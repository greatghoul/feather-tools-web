import { useState, useEffect } from 'react';
import { useStore } from '~/contexts/StoreContext';
import { downloadFile } from '~/helpers/files';
import { notify } from '~/helpers/messages';
import { t } from '~/helpers/i18n';
import JSZip from 'jszip';
import ImageSplitter from '../services/ImageSplitter';

const ResultCard = ({ images, settings }) => {
    const [splitResults, setSplitResults] = useState<any[]>([]);
    const { isProcessing, setIsProcessing, hasChanges, setHasChanges } = useStore() as any;



    const processImages = async () => {
        if (images.length === 0) {
            setSplitResults([]);
            return;
        }

        setIsProcessing(true);
        try {
            // 清除旧的分割结果
            setSplitResults([]);
            
            const allResults: any[] = [];
            
            for (const image of images) {
                const splitter = new ImageSplitter(image, settings);
                try {
                    const parts = await splitter.split();
                    
                    // 为每个部分创建结果对象
                    parts.forEach(part => {
                        allResults.push({
                            originalName: image.name,
                            partIndex: part.index,
                            position: part.position,
                            dataUrl: part.image,
                            fileName: generateFileName(image.name, part.index, part.position, settings)
                        });
                    });
                } finally {
                    splitter.destroy();
                }
            }
            
            setSplitResults(allResults);
            setHasChanges(false);
            notify(t('image-split/result/split_success'), '', 'success');
        } catch (error: any) {
            console.error('Failed to split images:', error);
            notify(t('image-split/result/split_error'), error.message, 'error');
            setSplitResults([]);
        } finally {
            setIsProcessing(false);
        }
    };

    const generateFileName = (originalName, index, position, settings) => {
        const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
        const ext = '.png';
        
        if (settings.splitMode === 'grid') {
            return `${nameWithoutExt}_r${position.row}c${position.col}${ext}`;
        } else if (settings.splitMode === 'vertical') {
            return `${nameWithoutExt}_col${position.col}${ext}`;
        } else if (settings.splitMode === 'horizontal') {
            return `${nameWithoutExt}_row${position.row}${ext}`;
        }
        
        return `${nameWithoutExt}_part${index + 1}${ext}`;
    };

    const handleDownloadAll = async () => {
        if (splitResults.length === 0) return;

        try {
            if (splitResults.length === 1) {
                // 只有一个结果，直接下载
                const result = splitResults[0];
                // 直接从 dataUrl 创建 blob
                const blob = dataUrlToBlob(result.dataUrl);
                downloadFile(blob, result.fileName);
            } else {
                // 多个结果，打包成ZIP下载
                const zip = new JSZip();
                
                for (const result of splitResults) {
                    // 直接从 dataUrl 创建 blob
                    const blob = dataUrlToBlob(result.dataUrl);
                    zip.file(result.fileName, blob);
                }

                const zipBlob = await zip.generateAsync({ type: 'blob' });
                downloadFile(zipBlob, 'split-images.zip');
            }
        } catch (error: any) {
            console.error('Download failed:', error);
            notify('Download failed', error.message, 'error');
        }
    };

    // 辅助函数：将 dataUrl 转换为 Blob
    const dataUrlToBlob = (dataUrl) => {
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        
        return new Blob([u8arr], { type: mime });
    };

    const renderProcessButton = () => {
        return (
<>

            <button className="btn btn-outline-primary btn-sm" disabled={isProcessing || !hasChanges || images.length === 0} onClick={processImages}>
                <i className="bi bi-caret-right-fill me-1"></i>
                {isProcessing ? t('image-split/result/processing') : t('image-split/result/process_images')}
            </button>
        
</>
);
    };

    const renderSplitResults = () => {
        if (splitResults.length === 0) return null;

        // 根据分割模式组织结果
        if (settings.splitMode === 'grid') {
            // 网格分割：按行分组
            const rows = settings.rows;
            const cols = settings.columns;
            const gridResults: any[] = [];
            
            for (let i = 0; i < splitResults.length; i += cols) {
                gridResults.push(splitResults.slice(i, i + cols));
            }

            return (
<>

                <div className="mt-3">
                    {gridResults.map((row, rowIndex) => (
                        <div key={rowIndex} className="row g-2 mb-2">
                            {row.map((result, colIndex) => (
                                <div key={colIndex} className="col" style={{ flex: `1 0 ${100 / cols}%`, maxWidth: `${100 / cols}%` }}>
                                    <div className="border rounded p-1 text-center" style={{ height: '120px', overflow: 'hidden' }}>
                                        <img src={result.dataUrl} className="img-fluid h-100" style={{ objectFit: 'contain' }} />
                                    </div>
                                </div>
))}
                        </div>
))}
                </div>
            
</>
);
        } else if (settings.splitMode === 'vertical') {
            // 垂直分割：一行显示
            return (
<>

                <div className="mt-3">
                    <div className="row g-2">
                        {splitResults.map((result, index) => (
                            <div key={index} className="col" style={{ flex: `1 0 ${100 / settings.columns}%`, maxWidth: `${100 / settings.columns}%` }}>
                                <div className="border rounded p-1 text-center" style={{ height: '120px', overflow: 'hidden' }}>
                                    <img src={result.dataUrl} className="img-fluid h-100" style={{ objectFit: 'contain' }} />
                                </div>
                            </div>
))}
                    </div>
                </div>
            
</>
);
        } else if (settings.splitMode === 'horizontal') {
            // 水平分割：多行显示，每行一个
            return (
<>

                <div className="mt-3">
                    {splitResults.map((result, index) => (
                        <div key={index} className="row g-2 mb-2">
                            <div className="col-12">
                                <div className="border rounded p-1 text-center" style={{ height: '120px', overflow: 'hidden' }}>
                                    <img src={result.dataUrl} className="img-fluid h-100" style={{ objectFit: 'contain' }} />
                                </div>
                            </div>
                        </div>
))}
                </div>
            
</>
);
        }

        return null;
    };

    return (
<>

        <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
                {renderProcessButton()}
                
                <button className="btn btn-outline-success btn-sm" disabled={isProcessing || splitResults.length === 0} onClick={handleDownloadAll}>
                    <i className="bi bi-download me-1"></i>
                    {t('image-split/result/download')}
                </button>
            </div>
            <div className="card-body">
                {images.length === 0 ? (
<>

                    <div className="text-center py-5">
                        <i className="bi bi-images fs-1 text-muted mb-3"></i>
                        <p className="text-muted">{t('image-split/result/no_images')}</p>
                    </div>
                
</>
) : splitResults.length === 0 ? (
<>

                    <div className="text-center py-5">
                        <i className="bi bi-scissors fs-1 text-muted mb-3"></i>
                        <p className="text-muted">{t('image-split/result/click_to_start')}</p>
                    </div>
                
</>
) : (
<>

                    {renderSplitResults()}
                
</>
)}
            </div>
        </div>
    
</>
);
};

export default ResultCard;
