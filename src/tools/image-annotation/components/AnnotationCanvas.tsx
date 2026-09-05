import { useRef, useEffect, useState, useCallback } from 'react';
import Konva from 'konva';
import { t } from '~/helpers/i18n';
import { downloadFile } from '~/helpers/files';
import {
    createPreviewShape,
    createFinalShape,
    createShape,
    serializeAnnotations,
} from '../services/AnnotationEngine';
import Toolbar from './Toolbar';
import AnnotationList from './AnnotationList';
import Pixelator from '../../pixelate-images/services/Pixelator';
import styles from './AnnotationCanvas.module.css';

const AnnotationCanvas = ({ image }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<Konva.Stage | null>(null);
    const imageLayerRef = useRef<Konva.Layer | null>(null);
    const annotationLayerRef = useRef<Konva.Layer | null>(null);
    const previewLayerRef = useRef<Konva.Layer | null>(null);
    const pixelationLayerRef = useRef<Konva.Layer | null>(null);
    const pixelOverlayRef = useRef<any>(null);
    const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const transformerRef = useRef<Konva.Transformer | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const scaleRef = useRef(1);
    const isDrawingRef = useRef(false);
    const startPosRef = useRef({ x: 0, y: 0 });
    const freehandPointsRef = useRef<number[]>([]);
    const annotationsRef = useRef<any[]>([]);
    const toolRef = useRef('select');

    const [tool, setTool] = useState('select');
    const [strokeColor, setStrokeColor] = useState('#e74c3c');
    const [strokeWidth, setStrokeWidth] = useState(5);
    const [fillEnabled, setFillEnabled] = useState(false);
    const [fillOpacity, setFillOpacity] = useState(100);
    const [cornerRadius, setCornerRadius] = useState(15);
    const [blockSize, setBlockSize] = useState(20);
    const blockSizeRef = useRef(blockSize);
    useEffect(() => { blockSizeRef.current = blockSize; }, [blockSize]);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [annotations, setAnnotations] = useState<any[]>([]);

    useEffect(() => {
        toolRef.current = tool;
    }, [tool]);

    const getImageCoords = useCallback(() => {
        const stage = stageRef.current;
        if (!stage) return null;
        const pos = stage.getPointerPosition();
        if (!pos) return null;
        const s = scaleRef.current;
        return { x: pos.x / s, y: pos.y / s };
    }, []);

    const toHex = useCallback((color) => color, []);

    const getFillColor = useCallback(() => {
        if (!fillEnabled) return 'transparent';
        const hex = toHex(strokeColor);
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${fillOpacity / 100})`;
    }, [fillEnabled, strokeColor, toHex, fillOpacity]);

    const syncAnnotationList = useCallback(() => {
        const data = serializeAnnotations(annotationLayerRef.current);
        annotationsRef.current = data;
        setAnnotations([...data]);
    }, []);

    const applyPixelation = useCallback((area) => {
        const pxLayer = pixelationLayerRef.current;
        const pxOverlay = pixelOverlayRef.current;
        const srcCanvas = sourceCanvasRef.current;
        if (!pxLayer || !pxOverlay || !srcCanvas) return;
        const pxCanvas = pxOverlay.image();
        const ctx = pxCanvas.getContext('2d');
        const srcCtx = srcCanvas.getContext('2d');
        ctx.save();
        ctx.beginPath();
        ctx.rect(area.x, area.y, area.width, area.height);
        ctx.clip();
        Pixelator.pixelate(ctx, srcCtx, blockSize, area);
        ctx.restore();
        pxLayer.batchDraw();
    }, [blockSize]);

    const deselectAll = useCallback(() => {
        if (transformerRef.current) {
            transformerRef.current.nodes([]);
            transformerRef.current.resizeEnabled(true);
            transformerRef.current.rotateEnabled(true);
            transformerRef.current.getLayer()?.batchDraw();
        }
    }, []);

    const selectShape = useCallback((shape) => {
        if (!transformerRef.current || !shape) return;
        const isMosaic = shape.getAttr('annotationType') === 'mosaic';
        transformerRef.current.resizeEnabled(!isMosaic);
        transformerRef.current.rotateEnabled(!isMosaic);
        transformerRef.current.nodes([shape]);
        transformerRef.current.getLayer()!.batchDraw();
    }, []);

    const setupSelectMode = useCallback(() => {
        const annLayer = annotationLayerRef.current;
        if (!annLayer) return;
        (annLayer.children as any[]).forEach((node) => {
            if (node.getAttr('isAnnotation')) {
                node.draggable(true);
            }
        });
        annLayer.draw();
    }, []);

    const setupDrawMode = useCallback(() => {
        const annLayer = annotationLayerRef.current;
        if (!annLayer) return;
        deselectAll();
        (annLayer.children as any[]).forEach((node) => {
            if (node.getAttr('isAnnotation')) {
                node.draggable(false);
            }
        });
        annLayer.draw();
    }, [deselectAll]);

    const addAnnotation = useCallback((shape) => {
        const annId = `ann_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        shape.id(annId);
        shape.setAttr('isAnnotation', true);

        shape.on('click', (e) => {
            if (toolRef.current !== 'select') return;
            e.cancelBubble = true;
            selectShape(shape);
        });

        shape.on('dragstart', () => {
            if (toolRef.current !== 'select') return;
            selectShape(shape);
        });

        shape.on('dragend', () => {
            syncAnnotationList();
        });

        if (shape.getAttr('annotationType') === 'mosaic') {
            const redrawAllMosaics = () => {
                const bs = blockSizeRef.current;
                const pxOverlay = pixelOverlayRef.current;
                const srcCanvas = sourceCanvasRef.current;
                const pxLayer = pixelationLayerRef.current;
                const annLayer = annotationLayerRef.current;
                if (!pxOverlay || !srcCanvas || !pxLayer || !annLayer) return;
                const pxCanvas = pxOverlay.image();
                const ctx = pxCanvas.getContext('2d');
                const srcCtx = srcCanvas.getContext('2d');
                ctx.clearRect(0, 0, pxCanvas.width, pxCanvas.height);
                (annLayer.children as any[]).forEach((child) => {
                    if (child.getAttr('annotationType') === 'mosaic') {
                        const a = child.getAttrs();
                        ctx.save();
                        ctx.beginPath();
                        ctx.rect(a.x, a.y, a.width, a.height);
                        ctx.clip();
                        Pixelator.pixelate(ctx, srcCtx, bs, { x: a.x, y: a.y, width: a.width, height: a.height });
                        ctx.restore();
                    }
                });
                pxLayer.batchDraw();
            };
            shape.on('dragend', redrawAllMosaics);
            shape.on('transformend', redrawAllMosaics);
        }

        shape.on('transformend', () => {
            syncAnnotationList();
        });

        annotationLayerRef.current!.add(shape);
        annotationLayerRef.current!.draw();
        syncAnnotationList();
        return annId;
    }, [selectShape, syncAnnotationList]);

    const handleDrawStart = useCallback((pos) => {
        isDrawingRef.current = true;
        startPosRef.current = { x: pos.x, y: pos.y };
        if (toolRef.current === 'highlighter' || toolRef.current === 'pen') {
            freehandPointsRef.current = [pos.x, pos.y];
        }
    }, []);

    const handleDrawMove = useCallback((pos) => {
        if (!isDrawingRef.current) return;
        const prevLayer = previewLayerRef.current;
        if (!prevLayer) return;
        prevLayer.destroyChildren();

        if (toolRef.current === 'highlighter') {
            freehandPointsRef.current.push(pos.x, pos.y);
            const highlighter = createShape('highlighter', {
                points: [...freehandPointsRef.current],
                stroke: '#f1c40f',
                strokeWidth: strokeWidth * 3,
                opacity: 0.35,
                listening: false,
            });
            prevLayer.add(highlighter);
            prevLayer.draw();
            return;
        }

        if (toolRef.current === 'pen') {
            freehandPointsRef.current.push(pos.x, pos.y);
            const pen = createShape('pen', {
                points: [...freehandPointsRef.current],
                stroke: strokeColor,
                strokeWidth: strokeWidth,
                listening: false,
            });
            prevLayer.add(pen);
            prevLayer.draw();
            return;
        }

        const attrs = {
            stroke: strokeColor,
            strokeWidth: strokeWidth,
            fill: 'transparent',
        };
        const preview = createPreviewShape(
            toolRef.current,
            startPosRef.current.x,
            startPosRef.current.y,
            pos.x,
            pos.y,
            attrs
        );
        if (preview) {
            prevLayer.add(preview);
            prevLayer.draw();
        }
    }, [strokeColor, strokeWidth]);

    const handleDrawEnd = useCallback((pos) => {
        if (!isDrawingRef.current) return;
        isDrawingRef.current = false;
        const prevLayer = previewLayerRef.current;
        if (!prevLayer) return;
        prevLayer.destroyChildren();
        prevLayer.draw();

        const currentTool = toolRef.current;

        if (currentTool === 'highlighter') {
            const pts = freehandPointsRef.current;
            if (pts.length < 4) return;
            const shape = createShape('highlighter', {
                points: [...pts],
                stroke: '#f1c40f',
                strokeWidth: strokeWidth * 3,
                opacity: 0.35,
                draggable: false,
            });
            shape.setAttr('annotationType', 'highlighter');
            addAnnotation(shape);
            freehandPointsRef.current = [];
            return;
        }

        if (currentTool === 'pen') {
            const pts = freehandPointsRef.current;
            if (pts.length < 4) return;
            const shape = createShape('pen', {
                points: [...pts],
                stroke: strokeColor,
                strokeWidth: strokeWidth,
                draggable: false,
            });
            shape.setAttr('annotationType', 'pen');
            addAnnotation(shape);
            freehandPointsRef.current = [];
            return;
        }

        const sx = startPosRef.current.x;
        const sy = startPosRef.current.y;
        const ex = pos.x;
        const ey = pos.y;

        if (Math.abs(ex - sx) < 3 && Math.abs(ey - sy) < 3) return;

        if (currentTool === 'mosaic') {
            const area = {
                x: Math.min(sx, ex),
                y: Math.min(sy, ey),
                width: Math.abs(ex - sx),
                height: Math.abs(ey - sy),
            };
            applyPixelation(area);
            const shape = createShape('mosaic', {
                x: area.x,
                y: area.y,
                width: area.width,
                height: area.height,
                stroke: '#2563eb',
                strokeWidth: 2,
                dash: [4, 3],
                draggable: false,
            });
            shape.setAttr('annotationType', 'mosaic');
            addAnnotation(shape);
            return;
        }

        const fill = getFillColor();
        const shapeAttrs: any = {
            stroke: strokeColor,
            strokeWidth: strokeWidth,
            fill: fill,
            draggable: false,
        };
        if (currentTool === 'roundedRect') {
            shapeAttrs.cornerRadius = cornerRadius;
        }
        const shape = createFinalShape(currentTool, sx, sy, ex, ey, shapeAttrs);
        if (shape) {
            shape.setAttr('annotationType', currentTool);
            addAnnotation(shape);
        }
    }, [strokeColor, strokeWidth, addAnnotation, getFillColor, cornerRadius, applyPixelation]);

    const handleStageClick = useCallback((e) => {
        if (toolRef.current !== 'select') return;
        if (e.target === e.target.getStage()) {
            deselectAll();
        }
    }, [deselectAll]);

    const bindDrawEvents = useCallback(() => {
        const stage = stageRef.current;
        if (!stage) return;
        stage.off('mousedown mousemove mouseup click');

        if (toolRef.current === 'select') {
            stage.on('click', handleStageClick);
            setupSelectMode();
        } else {
            stage.on('mousedown', (e) => {
                e.evt.preventDefault();
                const pos = getImageCoords();
                if (pos) handleDrawStart(pos);
            });
            stage.on('mousemove', (e) => {
                const pos = getImageCoords();
                if (pos) handleDrawMove(pos);
            });
            stage.on('mouseup', (e) => {
                const pos = getImageCoords();
                if (pos) handleDrawEnd(pos);
            });
            stage.on('mouseleave', () => {
                if (isDrawingRef.current) {
                    isDrawingRef.current = false;
                    const prevLayer = previewLayerRef.current;
                    if (prevLayer) {
                        prevLayer.destroyChildren();
                        prevLayer.draw();
                    }
                }
            });
            setupDrawMode();
        }
    }, [getImageCoords, handleDrawStart, handleDrawMove, handleDrawEnd, handleStageClick, setupSelectMode, setupDrawMode, tool]);

    const bindDrawEventsRef = useRef(bindDrawEvents);
    useEffect(() => {
        bindDrawEventsRef.current = bindDrawEvents;
    }, [bindDrawEvents]);

    useEffect(() => {
        bindDrawEvents();
    }, [bindDrawEvents]);

    const handleToolChange = useCallback((newTool) => {
        setTool(newTool);
        if (isDrawingRef.current) {
            isDrawingRef.current = false;
            freehandPointsRef.current = [];
            const prevLayer = previewLayerRef.current;
            if (prevLayer) {
                prevLayer.destroyChildren();
                prevLayer.draw();
            }
        }
        deselectAll();
    }, [deselectAll]);

    const handleDeleteSelected = useCallback(() => {
        const tr = transformerRef.current;
        if (!tr) return;
        const selected = tr.nodes();
        if (selected.length === 0) return;
        const hadMosaic = selected.some((n) => n.getAttr('annotationType') === 'mosaic');
        selected.forEach((node) => {
            node.destroy();
        });
        tr.nodes([]);
        annotationLayerRef.current?.draw();
        syncAnnotationList();
        if (hadMosaic) {
            const pxOverlay = pixelOverlayRef.current;
            const srcCanvas = sourceCanvasRef.current;
            const pxLayer = pixelationLayerRef.current;
            if (pxOverlay && srcCanvas && pxLayer) {
                const pxCanvas = pxOverlay.image();
                const ctx = pxCanvas.getContext('2d');
                const srcCtx = srcCanvas.getContext('2d');
                ctx.clearRect(0, 0, pxCanvas.width, pxCanvas.height);
                (annotationLayerRef.current!.children as any[]).forEach((child) => {
                    if (child.getAttr('annotationType') === 'mosaic') {
                        const a = child.getAttrs();
                        ctx.save();
                        ctx.beginPath();
                        ctx.rect(a.x, a.y, a.width, a.height);
                        ctx.clip();
                        Pixelator.pixelate(ctx, srcCtx, blockSize, { x: a.x, y: a.y, width: a.width, height: a.height });
                        ctx.restore();
                    }
                });
                pxLayer.batchDraw();
            }
        }
    }, [syncAnnotationList, blockSize]);

    const handleClearAll = useCallback(() => {
        const annLayer = annotationLayerRef.current;
        if (!annLayer) return;
        deselectAll();
        const toRemove: any[] = [];
        (annLayer.children as any[]).forEach((child) => {
            if (child.getAttr('isAnnotation')) {
                toRemove.push(child);
            }
        });
        toRemove.forEach((child) => child.destroy());
        annLayer.draw();
        syncAnnotationList();
        const pxOverlay = pixelOverlayRef.current;
        if (pxOverlay) {
            const pxCanvas = pxOverlay.image();
            if (pxCanvas) {
                pxCanvas.getContext('2d').clearRect(0, 0, pxCanvas.width, pxCanvas.height);
            }
            pixelationLayerRef.current?.batchDraw();
        }
    }, [deselectAll, syncAnnotationList]);

    const getImageBlob = useCallback(async () => {
        const stage = stageRef.current;
        if (!stage) return null;
        const dataURL = stage.toDataURL({ mimeType: 'image/png' });
        const parts = dataURL.split(',');
        const byteString = atob(parts[1]);
        const mimeString = parts[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    }, []);

    const handleDownload = useCallback(async () => {
        const blob = await getImageBlob();
        if (!blob) return;
        const filename = image.name.replace(/\.[^/.]+$/, '') + '-annotated.png';
        downloadFile(blob, filename);
    }, [image.name, getImageBlob]);

    const handleCopy = useCallback(async () => {
        const blob = await getImageBlob();
        if (!blob) return;
        try {
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob }),
            ]);
        } catch {
            const item = new ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([item]);
        }
    }, [getImageBlob]);

    const handleDeleteAnnotation = useCallback((annId) => {
        const annLayer = annotationLayerRef.current;
        if (!annLayer) return;
        deselectAll();
        const shape = annLayer.findOne('#' + annId);
        if (!shape) return;
        const isMosaic = shape.getAttr('annotationType') === 'mosaic';
        shape.destroy();
        annLayer.draw();
        syncAnnotationList();
        if (isMosaic) {
            const pxOverlay = pixelOverlayRef.current;
            const srcCanvas = sourceCanvasRef.current;
            const pxLayer = pixelationLayerRef.current;
            if (pxOverlay && srcCanvas && pxLayer) {
                const pxCanvas = pxOverlay.image();
                const ctx = pxCanvas.getContext('2d');
                const srcCtx = srcCanvas.getContext('2d');
                ctx.clearRect(0, 0, pxCanvas.width, pxCanvas.height);
                (annLayer.children as any[]).forEach((child) => {
                    if (child.getAttr('annotationType') === 'mosaic') {
                        const a = child.getAttrs();
                        ctx.save();
                        ctx.beginPath();
                        ctx.rect(a.x, a.y, a.width, a.height);
                        ctx.clip();
                        Pixelator.pixelate(ctx, srcCtx, blockSize, { x: a.x, y: a.y, width: a.width, height: a.height });
                        ctx.restore();
                    }
                });
                pxLayer.batchDraw();
            }
        }
    }, [deselectAll, syncAnnotationList, blockSize]);

    const handleSelectAnnotation = useCallback((annId) => {
        const shape = annotationLayerRef.current?.findOne('#' + annId);
        if (!shape) return;
        if (toolRef.current !== 'select') {
            setTool('select');
        }
        shape.draggable(true);
        deselectAll();
        selectShape(shape);
    }, [deselectAll, selectShape]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && tool === 'select') {
                const activeTag = document.activeElement?.tagName;
                if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;
                e.preventDefault();
                handleDeleteSelected();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [tool, handleDeleteSelected]);

    useEffect(() => {
        if (!image.url) return;

        const updateDimensions = () => {
            if (!containerRef.current || !imageRef.current) return;
            const containerWidth = containerRef.current.parentElement!.clientWidth;
            const img = imageRef.current;
            let scale = 1;
            if (img.width > containerWidth) {
                scale = containerWidth / img.width;
            }
            const maxHeight = window.innerHeight * 0.7;
            if (img.height * scale > maxHeight) {
                scale = maxHeight / img.height;
            }
            scaleRef.current = scale;
            const w = img.width * scale;
            const h = img.height * scale;
            setDimensions({ width: w, height: h });
            if (stageRef.current) {
                stageRef.current.width(w);
                stageRef.current.height(h);
                stageRef.current.scale({ x: scale, y: scale });
                stageRef.current.draw();
            }
        };

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = image.url;

        img.onload = () => {
            imageRef.current = img;

            if (!stageRef.current) {
                const stage = new Konva.Stage({
                    container: containerRef.current!,
                });
                const imgLayer = new Konva.Layer();
                const pxLayer = new Konva.Layer();
                const annLayer = new Konva.Layer();
                const prevLayer = new Konva.Layer();
                const tr = new Konva.Transformer({
                    borderStroke: '#2563eb',
                    borderStrokeWidth: 1,
                    anchorFill: '#fff',
                    anchorStroke: '#2563eb',
                    anchorSize: 8,
                    rotateAnchorOffset: 20,
                    enabledAnchors: [
                        'top-left', 'top-center', 'top-right',
                        'middle-left', 'middle-right',
                        'bottom-left', 'bottom-center', 'bottom-right',
                    ],
                });
                annLayer.add(tr);

                stage.add(imgLayer, pxLayer, annLayer, prevLayer);

                stageRef.current = stage;
                imageLayerRef.current = imgLayer;
                pixelationLayerRef.current = pxLayer;
                annotationLayerRef.current = annLayer;
                previewLayerRef.current = prevLayer;
                transformerRef.current = tr;
            }

            bindDrawEventsRef.current();

            updateDimensions();

            const konvaImg = new Konva.Image({ image: img, x: 0, y: 0 });
            imageLayerRef.current!.destroyChildren();
            imageLayerRef.current!.add(konvaImg);
            imageLayerRef.current!.draw();

            const srcCanvas = document.createElement('canvas');
            srcCanvas.width = img.width;
            srcCanvas.height = img.height;
            const srcCtx = srcCanvas.getContext('2d')!;
            srcCtx.drawImage(img, 0, 0);
            sourceCanvasRef.current = srcCanvas;

            const pxCanvas = document.createElement('canvas');
            pxCanvas.width = img.width;
            pxCanvas.height = img.height;
            const pxImg = new Konva.Image({ image: pxCanvas, x: 0, y: 0 });
            pixelOverlayRef.current = pxImg;
            pixelationLayerRef.current!.destroyChildren();
            pixelationLayerRef.current!.add(pxImg);
            pixelationLayerRef.current!.draw();

            window.addEventListener('resize', updateDimensions);
        };

        return () => {
            window.removeEventListener('resize', updateDimensions);
            if (stageRef.current) {
                stageRef.current.destroy();
                stageRef.current = null;
                imageLayerRef.current = null;
                pixelationLayerRef.current = null;
                annotationLayerRef.current = null;
                previewLayerRef.current = null;
                transformerRef.current = null;
                pixelOverlayRef.current = null;
                sourceCanvasRef.current = null;
            }
        };
    }, [image.url]);

    const isShapeTool = tool !== 'select' && tool !== 'pen' && tool !== 'highlighter' && tool !== 'mosaic';
    const cursorStyle = isShapeTool ? 'crosshair' : 'default';

    const toolKeys = ['select', 'line', 'arrow', 'circle', 'rect', 'roundedRect', 'highlighter', 'pen', 'mosaic'];

    return (
<>

        <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center py-2">
                <span className="text-truncate fw-medium" title={image.name}>
                    <i className="bi bi-image me-1"></i>{image.name}
                </span>
                <div className="d-flex gap-1 flex-shrink-0">
                    <button className="btn btn-sm btn-outline-success" onClick={handleDownload} title={t('image-annotation/toolbar/download')}>
                        <i className="bi bi-download"></i>
                    </button>
                    <button className="btn btn-sm btn-outline-info" onClick={handleCopy} title={t('image-annotation/toolbar/copy')}>
                        <i className="bi bi-clipboard"></i>
                    </button>
                </div>
            </div>
            <div className="card-body p-0 d-flex flex-column" style={{ minHeight: '400px', maxHeight: '600px', overflow: 'hidden' }}>
                <div className="row gx-0 mx-0 flex-grow-1" style={{ minHeight: '0' }}>
                    <Toolbar tool={tool} toolKeys={toolKeys} strokeColor={strokeColor} strokeWidth={strokeWidth} fillEnabled={fillEnabled} fillOpacity={fillOpacity} cornerRadius={cornerRadius} blockSize={blockSize} isShapeTool={isShapeTool} imageId={image.id} onToolChange={handleToolChange} onStrokeColorChange={setStrokeColor} onStrokeWidthChange={setStrokeWidth} onFillEnabledChange={setFillEnabled} onFillOpacityChange={setFillOpacity} onCornerRadiusChange={setCornerRadius} onBlockSizeChange={setBlockSize} />
                    <div className="col-12 col-md-8 d-flex justify-content-center align-items-center rounded" style={{
                            minHeight: '200px',
                            cursor: cursorStyle,
                            position: 'relative',
                        }}>
                        <div ref={containerRef} className={styles.wrapperStyle} style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }}></div>
                    </div>
                    <AnnotationList annotations={annotations} onClearAll={handleClearAll} onDelete={handleDeleteAnnotation} onSelect={handleSelectAnnotation} />
                </div>
            </div>
        </div>
    
</>
);
};

export default AnnotationCanvas;
