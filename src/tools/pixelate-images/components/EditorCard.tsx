import { useRef, useEffect, useState, useCallback } from 'react';
import Konva from 'konva';
import { t } from '~/helpers/i18n';
import Pixelator from '../services/Pixelator';
import InputNumber from '~/components/InputNumber';
import { downloadFile } from '~/helpers/files';
import styles from './EditorCard.module.css';

const EditorCard = ({ image, settings, onDownload }) => {
    const konvaContainerRef = useRef<HTMLDivElement | null>(null);
    const stageRef = useRef<Konva.Stage | null>(null);
    const imageLayerRef = useRef<Konva.Layer | null>(null);
    const pixelationLayerRef = useRef<Konva.Layer | null>(null);
    const previewLayerRef = useRef<Konva.Layer | null>(null);

    const imageRef = useRef<HTMLImageElement | null>(null);
    const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const pixelationCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const scaleRef = useRef(1);

    const [tool, setTool] = useState('square');
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
    const [brushSize, setBrushSize] = useState(20);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [isShiftPressed, setIsShiftPressed] = useState(false);

    const getPointerPos = useCallback((stage) => {
        if (!stage) return { x: 0, y: 0 };
        const pos = stage.getPointerPosition();
        if (!pos) return { x: 0, y: 0 };
        return {
            x: pos.x / scaleRef.current,
            y: pos.y / scaleRef.current,
        };
    }, []);

    const applyPixelation = useCallback((area, type = 'rect') => {
        if (!pixelationCanvasRef.current || !sourceCanvasRef.current) return;
        const destCtx = pixelationCanvasRef.current.getContext('2d')!;
        const sourceCtx = sourceCanvasRef.current.getContext('2d')!;
        
        destCtx.save();
        destCtx.beginPath();
        if (type === 'circle') {
            destCtx.arc(area.x, area.y, area.radius, 0, Math.PI * 2);
        } else if (type === 'ellipse') {
            destCtx.ellipse(area.x, area.y, area.radiusX, area.radiusY, 0, 0, Math.PI * 2);
        } else {
            destCtx.rect(area.x, area.y, area.width, area.height);
        }
        destCtx.clip();
        
        Pixelator.pixelate(destCtx, sourceCtx, settings.blockSize, area);
        destCtx.restore();
        
        pixelationLayerRef.current!.batchDraw();
    }, [settings.blockSize]);

    const handleMouseDown = useCallback((e) => {
        e.evt.preventDefault();
        setIsDrawing(true);
        const pos = getPointerPos(stageRef.current);
        setStartPoint(pos);
        setIsShiftPressed(e.evt.shiftKey);

        if (tool === 'brush') {
            const area = {
                x: pos.x - brushSize / 2,
                y: pos.y - brushSize / 2,
                width: brushSize,
                height: brushSize,
            };
            applyPixelation(area);
        }
    }, [tool, brushSize, getPointerPos, applyPixelation]);

    const handleMouseMove = useCallback((e) => {
        const pos = getPointerPos(stageRef.current);
        if (!pos) return;
        
        previewLayerRef.current!.destroyChildren();
        let previewShape;

        if (tool === 'brush') {
            previewShape = new Konva.Rect({
                x: pos.x - brushSize / 2,
                y: pos.y - brushSize / 2,
                width: brushSize,
                height: brushSize,
                stroke: 'red',
                strokeWidth: 1 / scaleRef.current,
                fill: 'rgba(255, 0, 0, 0.2)'
            });
            
            if (isDrawing) {
                const area = {
                    x: pos.x - brushSize / 2,
                    y: pos.y - brushSize / 2,
                    width: brushSize,
                    height: brushSize,
                };
                applyPixelation(area);
            }
        } else if (tool === 'square') {
            if (!isDrawing) return;
            e.evt.preventDefault();
            const dx = pos.x - startPoint.x;
            const dy = pos.y - startPoint.y;
            
            let width, height;
            if (isShiftPressed) {
                const size = Math.max(Math.abs(dx), Math.abs(dy));
                width = dx >= 0 ? size : -size;
                height = dy >= 0 ? size : -size;
            } else {
                width = dx;
                height = dy;
            }
            
            previewShape = new Konva.Rect({
                x: startPoint.x,
                y: startPoint.y,
                width: width,
                height: height,
                stroke: 'red',
                strokeWidth: 2 / scaleRef.current,
                dash: [4 / scaleRef.current, 4 / scaleRef.current]
            });
        } else if (tool === 'circle') {
            if (!isDrawing) return;
            e.evt.preventDefault();
            const dx = pos.x - startPoint.x;
            const dy = pos.y - startPoint.y;
            
            if (isShiftPressed) {
                const radius = Math.max(Math.abs(dx), Math.abs(dy)) / 2;
                previewShape = new Konva.Circle({
                    x: startPoint.x + dx / 2,
                    y: startPoint.y + dy / 2,
                    radius: radius,
                    stroke: 'red',
                    strokeWidth: 2 / scaleRef.current,
                    dash: [4 / scaleRef.current, 4 / scaleRef.current]
                });
            } else {
                previewShape = new Konva.Ellipse({
                    x: startPoint.x + dx / 2,
                    y: startPoint.y + dy / 2,
                    radiusX: Math.abs(dx) / 2,
                    radiusY: Math.abs(dy) / 2,
                    stroke: 'red',
                    strokeWidth: 2 / scaleRef.current,
                    dash: [4 / scaleRef.current, 4 / scaleRef.current]
                });
            }
        }
        
        if (previewShape) {
            previewLayerRef.current!.add(previewShape);
            previewLayerRef.current!.draw();
        }
    }, [isDrawing, tool, brushSize, startPoint, getPointerPos, applyPixelation, isShiftPressed]);

    const handleMouseUp = useCallback((e) => {
        if (!isDrawing) return;
        setIsDrawing(false);
        const endPoint = getPointerPos(stageRef.current);
        previewLayerRef.current!.destroyChildren();
        previewLayerRef.current!.draw();
        
        let area, type = 'rect';
        if (tool === 'square') {
            const dx = endPoint.x - startPoint.x;
            const dy = endPoint.y - startPoint.y;
            
            let width, height;
            if (isShiftPressed) {
                const size = Math.max(Math.abs(dx), Math.abs(dy));
                width = size;
                height = size;
            } else {
                width = Math.abs(dx);
                height = Math.abs(dy);
            }
            
            if (width < 5 || height < 5) return;
            area = {
                x: Math.min(startPoint.x, endPoint.x),
                y: Math.min(startPoint.y, endPoint.y),
                width: width,
                height: height
            };
        } else if (tool === 'circle') {
            const dx = endPoint.x - startPoint.x;
            const dy = endPoint.y - startPoint.y;
            
            if (isShiftPressed) {
                const radius = Math.max(Math.abs(dx), Math.abs(dy)) / 2;
                if (radius < 3) return;
                area = {
                    x: startPoint.x + dx / 2,
                    y: startPoint.y + dy / 2,
                    radius: radius
                };
                type = 'circle';
            } else {
                const radiusX = Math.abs(dx) / 2;
                const radiusY = Math.abs(dy) / 2;
                if (radiusX < 3 || radiusY < 3) return;
                area = {
                    x: startPoint.x + dx / 2,
                    y: startPoint.y + dy / 2,
                    radiusX: radiusX,
                    radiusY: radiusY
                };
                type = 'ellipse';
            }
        }

        if (area) {
            applyPixelation(area, type);
        }
    }, [isDrawing, tool, startPoint, getPointerPos, applyPixelation, isShiftPressed]);

    useEffect(() => {
        if (!image.url) return;

        const updateStageDimensions = () => {
            if (!konvaContainerRef.current || !imageRef.current) return;
            const containerWidth = konvaContainerRef.current.parentElement!.clientWidth;
            const img = imageRef.current;
            
            let scale = 1;
            if (img.width > containerWidth) {
                scale = containerWidth / img.width;
            }
            scaleRef.current = scale;
    
            const newWidth = img.width * scale;
            const newHeight = img.height * scale;
    
            setDimensions({ width: newWidth, height: newHeight });
    
            if (stageRef.current) {
                stageRef.current.width(newWidth);
                stageRef.current.height(newHeight);
                stageRef.current.scale({ x: scale, y: scale });
                stageRef.current.draw();
            }
        };

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = image.url;

        img.onload = () => {
            imageRef.current = img;

            if (!stageRef.current) {
                stageRef.current = new Konva.Stage({ container: konvaContainerRef.current! });
                imageLayerRef.current = new Konva.Layer();
                pixelationLayerRef.current = new Konva.Layer();
                previewLayerRef.current = new Konva.Layer();
                stageRef.current.add(imageLayerRef.current, pixelationLayerRef.current, previewLayerRef.current);
                
                stageRef.current.on('mousedown', handleMouseDown);
                stageRef.current.on('mousemove', handleMouseMove);
                stageRef.current.on('mouseup', handleMouseUp);
                stageRef.current.on('mouseleave', handleMouseUp);
            }

            updateStageDimensions();

            const konvaImage = new Konva.Image({ image: img, x: 0, y: 0 });
            imageLayerRef.current!.destroyChildren();
            imageLayerRef.current!.add(konvaImage);

            sourceCanvasRef.current = document.createElement('canvas');
            sourceCanvasRef.current.width = img.width;
            sourceCanvasRef.current.height = img.height;
            sourceCanvasRef.current.getContext('2d')!.drawImage(img, 0, 0);

            pixelationCanvasRef.current = document.createElement('canvas');
            pixelationCanvasRef.current.width = img.width;
            pixelationCanvasRef.current.height = img.height;
            const pixelationImage = new Konva.Image({ image: pixelationCanvasRef.current, x: 0, y: 0 });
            pixelationLayerRef.current!.destroyChildren();
            pixelationLayerRef.current!.add(pixelationImage);

            stageRef.current.draw();

            window.addEventListener('resize', updateStageDimensions);
        };

        return () => {
            window.removeEventListener('resize', updateStageDimensions);
        };
    }, [image.url]);

    useEffect(() => {
        const stage = stageRef.current;
        if (!stage) return;
        stage.off('mousedown mousemove mouseup mouseleave');
        stage.on('mousedown', handleMouseDown);
        stage.on('mousemove', handleMouseMove);
        stage.on('mouseup', handleMouseUp);
        stage.on('mouseleave', handleMouseUp);
    }, [handleMouseDown, handleMouseMove, handleMouseUp]);

    useEffect(() => {
        if (!previewLayerRef.current) return;
        previewLayerRef.current.destroyChildren();
        previewLayerRef.current.draw();
    }, [tool]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Shift' && isDrawing && (tool === 'circle' || tool === 'square')) {
                setIsShiftPressed(true);
            }
        };

        const handleKeyUp = (e) => {
            if (e.key === 'Shift' && isDrawing && (tool === 'circle' || tool === 'square')) {
                setIsShiftPressed(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [tool, isDrawing]);
    
    const handleLocalDownload = () => {
        if (stageRef.current) {
            const dataURL = stageRef.current.toDataURL({ mimeType: 'image/png' });
            const parts = dataURL.split(',');
            const byteString = atob(parts[1]);
            const mimeString = parts[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: mimeString });
            const filename = image.name.replace(/\.[^/.]+$/, '') + '-pixelated.png';
            downloadFile(blob, filename);
        }
    };

    const clearPixelations = () => {
        if (!pixelationCanvasRef.current) return;
        const ctx = pixelationCanvasRef.current.getContext('2d')!;
        ctx.clearRect(0, 0, pixelationCanvasRef.current.width, pixelationCanvasRef.current.height);
        pixelationLayerRef.current!.batchDraw();
    };
    
    return (
<>

        <div className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
                <div className="btn-toolbar" role="toolbar" style={{ gap: '0.5rem' }}>
                    <div className="btn-group btn-group-sm">
                        <button type="button" className="btn btn-outline-danger" onClick={clearPixelations} title={t('pixelate-images/button/clear_pixelations')}><i className="bi bi-eraser"></i></button>
                    </div>
                    <div className="btn-group btn-group-sm">
                        <button type="button" className={`btn ${tool === 'square' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setTool('square')} title={t('pixelate-images/button/square')}><i className="bi bi-square"></i></button>
                        <button type="button" className={`btn ${tool === 'circle' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setTool('circle')} title={t('pixelate-images/button/circle')}><i className="bi bi-circle"></i></button>
                        <button type="button" className={`btn ${tool === 'brush' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setTool('brush')} title={t('pixelate-images/button/brush')}><i className="bi bi-brush-fill"></i></button>
                    </div>
                    {tool === 'brush' && (
<>

                        <InputNumber value={brushSize} min={5} max={100} step={1} onChange={setBrushSize} />
                    
</>
)}
                </div>
                <button className="btn btn-outline-success btn-sm" onClick={handleLocalDownload} title={t('pixelate-images/button/download')}><i className="bi bi-download"></i></button>
            </div>
            <div className="card-body p-0 d-flex justify-content-center align-items-center bg-light" style={{
                    minHeight: '200px',
                    position: 'relative',
                    cursor: (tool === 'square' || tool === 'circle') ? 'crosshair' : 'default'
                }}>
                <div ref={konvaContainerRef} className={styles['konvajs-content']} style={{width: `${dimensions.width}px`, height: `${dimensions.height}px`}}></div>
            </div>
        </div>
    
</>
);
};

export default EditorCard;
