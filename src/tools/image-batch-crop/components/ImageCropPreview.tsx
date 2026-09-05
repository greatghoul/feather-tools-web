import { useEffect, useRef, useState } from 'react';
import Konva from 'konva';
import { downloadFile } from '~/helpers/files';
import { t } from '~/helpers/i18n';
import styles from './ImageCropPreview.module.css';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const ImageCropPreview = ({ image, index, cropSize, onRegisterExporter, downloadName }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const stageRef = useRef<Konva.Stage | null>(null);
    const layerRef = useRef<Konva.Layer | null>(null);
    const imageNodeRef = useRef<Konva.Image | null>(null);
    const imageElementRef = useRef<HTMLImageElement | null>(null);
    const sceneRef = useRef<any>(null);
    const [effectiveCrop, setEffectiveCrop] = useState({ width: 0, height: 0 });

    const alignImageNode = (node, scene) => {
        if (!node || !scene) return;

        const scaledWidth = node.width() * node.scaleX();
        const scaledHeight = node.height() * node.scaleY();

        const minX = scene.cropRect.x + scene.cropRect.width - scaledWidth;
        const maxX = scene.cropRect.x;
        const minY = scene.cropRect.y + scene.cropRect.height - scaledHeight;
        const maxY = scene.cropRect.y;

        let nextX = clamp(node.x(), minX, maxX);
        let nextY = clamp(node.y(), minY, maxY);

        if (Math.abs(nextX - minX) <= scene.snapThreshold) nextX = minX;
        if (Math.abs(nextX - maxX) <= scene.snapThreshold) nextX = maxX;
        if (Math.abs(nextY - minY) <= scene.snapThreshold) nextY = minY;
        if (Math.abs(nextY - maxY) <= scene.snapThreshold) nextY = maxY;

        node.position({ x: nextX, y: nextY });
    };

    const buildCropBlob = async () => {
        const img = imageElementRef.current;
        const node = imageNodeRef.current;
        const scene = sceneRef.current;

        if (!img || !node || !scene) return null;

        const scale = node.scaleX();
        const sourceX = clamp((scene.cropRect.x - node.x()) / scale, 0, img.width);
        const sourceY = clamp((scene.cropRect.y - node.y()) / scale, 0, img.height);
        const sourceWidth = clamp(scene.cropRect.width / scale, 1, img.width - sourceX);
        const sourceHeight = clamp(scene.cropRect.height / scale, 1, img.height - sourceY);

        const canvas = document.createElement('canvas');
        canvas.width = scene.output.width;
        canvas.height = scene.output.height;

        const context = canvas.getContext('2d')!;
        context.drawImage(
            img,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            0,
            0,
            scene.output.width,
            scene.output.height
        );

        const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob((resultBlob) => resolve(resultBlob), image.mimeType || 'image/png', 0.95);
        });

        return blob;
    };

    useEffect(() => {
        onRegisterExporter(index, async () => {
            const blob = await buildCropBlob();
            return blob ? { blob } : null;
        });

        return () => onRegisterExporter(index, null);
    }, [index, cropSize.width, cropSize.height, image.url]);

    useEffect(() => {
        if (!containerRef.current) return;

        const loadedImage = new Image();
        loadedImage.crossOrigin = 'anonymous';
        loadedImage.src = image.url;

        loadedImage.onload = () => {
            imageElementRef.current = loadedImage;

            const outputWidth = Math.min(cropSize.width, loadedImage.width);
            const outputHeight = Math.min(cropSize.height, loadedImage.height);
            setEffectiveCrop({ width: outputWidth, height: outputHeight });

            const containerWidth = Math.max(280, Math.min(containerRef.current!.clientWidth || 560, 560));
            const maxPreviewHeight = 380;
            const maxFrameWidth = Math.max(180, containerWidth - 32);
            const frameScale = Math.min(maxFrameWidth / cropSize.width, maxPreviewHeight / cropSize.height, 1);

            const cropRectWidth = outputWidth * frameScale;
            const cropRectHeight = outputHeight * frameScale;

            const framePadding = 40;
            const stageWidth = Math.max(280, Math.ceil(cropRectWidth + framePadding * 2));
            const stageHeight = Math.max(220, Math.ceil(cropRectHeight + framePadding * 2));

            const cropRect = {
                x: (stageWidth - cropRectWidth) / 2,
                y: (stageHeight - cropRectHeight) / 2,
                width: cropRectWidth,
                height: cropRectHeight,
            };

            const stage = new Konva.Stage({
                container: containerRef.current!,
                width: stageWidth,
                height: stageHeight,
            });
            const layer = new Konva.Layer();
            stage.add(layer);

            const imageNode = new Konva.Image({
                image: loadedImage,
                x: cropRect.x,
                y: cropRect.y,
                width: loadedImage.width,
                height: loadedImage.height,
                draggable: true,
            });

            const minScale = Math.max(cropRect.width / loadedImage.width, cropRect.height / loadedImage.height);
            const initialScale = minScale;
            imageNode.scale({ x: initialScale, y: initialScale });
            imageNode.position({
                x: cropRect.x + (cropRect.width - loadedImage.width * initialScale) / 2,
                y: cropRect.y + (cropRect.height - loadedImage.height * initialScale) / 2,
            });

            const scene = {
                cropRect,
                output: { width: outputWidth, height: outputHeight },
                minScale,
                maxScale: 6,
                snapThreshold: 8,
            };
            sceneRef.current = scene;

            alignImageNode(imageNode, scene);

            const overlayColor = 'rgba(0, 0, 0, 0.35)';
            layer.add(imageNode);
            layer.add(new Konva.Rect({ x: 0, y: 0, width: stageWidth, height: cropRect.y, fill: overlayColor, listening: false }));
            layer.add(new Konva.Rect({ x: 0, y: cropRect.y + cropRect.height, width: stageWidth, height: stageHeight - cropRect.y - cropRect.height, fill: overlayColor, listening: false }));
            layer.add(new Konva.Rect({ x: 0, y: cropRect.y, width: cropRect.x, height: cropRect.height, fill: overlayColor, listening: false }));
            layer.add(new Konva.Rect({ x: cropRect.x + cropRect.width, y: cropRect.y, width: stageWidth - cropRect.x - cropRect.width, height: cropRect.height, fill: overlayColor, listening: false }));
            layer.add(new Konva.Rect({
                x: cropRect.x,
                y: cropRect.y,
                width: cropRect.width,
                height: cropRect.height,
                stroke: '#0d6efd',
                strokeWidth: 2,
                listening: false,
            }));

            imageNode.on('dragmove', () => {
                alignImageNode(imageNode, sceneRef.current);
                layer.batchDraw();
            });

            stage.on('wheel', (event) => {
                event.evt.preventDefault();

                const currentScene = sceneRef.current;
                const oldScale = imageNode.scaleX();
                const pointer = stage.getPointerPosition() || { x: stage.width() / 2, y: stage.height() / 2 };

                const scaleFactor = event.evt.deltaY < 0 ? 1.05 : 1 / 1.05;
                const newScale = clamp(oldScale * scaleFactor, currentScene.minScale, currentScene.maxScale);

                const pointerToImage = {
                    x: (pointer.x - imageNode.x()) / oldScale,
                    y: (pointer.y - imageNode.y()) / oldScale,
                };

                imageNode.scale({ x: newScale, y: newScale });
                imageNode.position({
                    x: pointer.x - pointerToImage.x * newScale,
                    y: pointer.y - pointerToImage.y * newScale,
                });

                alignImageNode(imageNode, currentScene);
                layer.batchDraw();
            });

            layerRef.current = layer;
            stageRef.current = stage;
            imageNodeRef.current = imageNode;
            stage.draw();
        };

        return () => {
            stageRef.current?.destroy();
            stageRef.current = null;
            layerRef.current = null;
            imageNodeRef.current = null;
            sceneRef.current = null;
        };
    }, [image.url, cropSize.width, cropSize.height]);

    const handleDownload = async () => {
        const blob = await buildCropBlob();
        if (blob) {
            downloadFile(blob, downloadName);
        }
    };

    return (
<>

        <div className="mb-4 border-bottom pb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                    <span className="badge bg-primary me-2">{effectiveCrop.width}×{effectiveCrop.height}</span>
                    <small className="text-muted">{t('image-batch-crop/result/wheel_hint')}</small>
                </div>
                <button className="btn btn-sm btn-outline-success" onClick={handleDownload}>
                    <i className="bi bi-download me-1"></i>
                    {t('image-batch-crop/result/download')}
                </button>
            </div>
            <div className="bg-light rounded p-2 d-flex justify-content-center">
                <div className={styles['konvajs-content']} ref={containerRef}></div>
            </div>
        </div>
    
</>
);
};

export default ImageCropPreview;
