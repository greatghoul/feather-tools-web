import { useEffect, useRef, useState } from 'react';
import konva from 'konva';
import SquareShape from '../components/SquareShape';
import CircleShape from '../components/CircleShape';
import RoundedSquareShape from '../components/RoundedSquareShape';
import TriangleShape from '../components/TriangleShape';
import TransformDataConverter from '../services/TransformDataConverter';
import { t } from '~/helpers/i18n';
import styles from './ResultCard.module.css';

const shapeComponents = [
  { id: 'circle', component: CircleShape, label: 'shape-image/shape/circle' },
  { id: 'rounded-square', component: RoundedSquareShape, label: 'shape-image/shape/rounded_square' },
  { id: 'square', component: SquareShape, label: 'shape-image/shape/square' },
  { id: 'triangle', component: TriangleShape, label: 'shape-image/shape/triangle' }
];

const ResultCard = ({ image, onClear }) => {
    const canvasRef = useRef<HTMLDivElement | null>(null);
    const [stage, setStage] = useState<konva.Stage | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedShape, setSelectedShape] = useState('circle');
    const [croppedImage, setCroppedImage] = useState<string | null>(null);

    // Handle clear image and cropped result
    const handleClear = () => {
        setCroppedImage(null);
        onClear();
    };

    // Handle download of cropped image
    const handleDownload = () => {
        if (!croppedImage) return;
        
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = croppedImage;
        link.download = 'cropped-image.png';
        
        // Append to document and trigger click
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
    };

    // Initialize konva stage after library is loaded
    useEffect(() => {
        if (!canvasRef.current) return;

        const stage = new konva.Stage({
            container: canvasRef.current,
            width: canvasRef.current.clientWidth,
            height: canvasRef.current.clientHeight,
        });

        // Main layer for image
        const imageLayer = new konva.Layer();
        stage.add(imageLayer);

        // Separate layer for shape paths
        const shapeLayer = new konva.Layer();
        stage.add(shapeLayer);

        setStage(stage);
    }, [canvasRef]);

    // Load and display image when image prop changes
    useEffect(() => {
        if (!stage || !image) return;

        const imageLayer = stage.getLayers()[0];
        imageLayer.destroyChildren();

        const img = new Image();
        img.onload = () => {
            // Calculate scaling to fit image within stage while maintaining aspect ratio
            const stageWidth = stage.width();
            const stageHeight = stage.height();
            const imgRatio = img.width / img.height;
            const stageRatio = stageWidth / stageHeight;
            
            let scale, width, height, x, y;
            
            if (imgRatio > stageRatio) {
                // Image is wider than stage - scale to fit width
                scale = stageWidth / img.width;
                width = stageWidth;
                height = img.height * scale;
                x = 0;
                y = (stageHeight - height) / 2;
            } else {
                // Image is taller than stage - scale to fit height
                scale = stageHeight / img.height;
                width = img.width * scale;
                height = stageHeight;
                x = (stageWidth - width) / 2;
                y = 0;
            }

            const konvaImage = new konva.Image({
                image: img,
                x: x,
                y: y,
                width: width,
                height: height,
            });

            imageLayer.add(konvaImage);
            imageLayer.batchDraw();
            setError(null);
        };

        img.onerror = () => {
            setError(t('shape-image/error/load_failed'));
        };

        img.src = image.url;
    }, [stage, image]);

    // Render selected shape path
    const renderShape = () => {
        if (!stage || !selectedShape) return;

        const shapeLayer = stage.getLayers()[1];
        
        // Clear the entire shape layer
        shapeLayer.destroyChildren();

        // Create shape path based on selected shape
        let shapePath;
        const centerX = stage.width() / 2;
        const centerY = stage.height() / 2;
        const size = Math.min(stage.width(), stage.height()) * 0.3;

        switch (selectedShape) {
            case 'square':
                shapePath = new konva.Path({
                    name: 'shape-path',
                    data: `M${centerX - size / 2},${centerY - size / 2} h${size} v${size} h-${size} z`,
                    stroke: '#007bff',
                    strokeWidth: 3,
                    fill: 'rgba(0, 123, 255, 0.1)',
                    draggable: true
                });
                break;
            case 'circle':
                shapePath = new konva.Path({
                    name: 'shape-path',
                    data: `M${centerX},${centerY} m-${size / 2},0 a${size / 2},${size / 2} 0 1,0 ${size},0 a${size / 2},${size / 2} 0 1,0 -${size},0 z`,
                    stroke: '#007bff',
                    strokeWidth: 3,
                    fill: 'rgba(0, 123, 255, 0.1)',
                    draggable: true
                });
                break;
            case 'rounded-square':
                const cornerRadius = 20;
                shapePath = new konva.Path({
                    name: 'shape-path',
                    data: `M${centerX - size / 2 + cornerRadius},${centerY - size / 2} h${size - 2 * cornerRadius} a${cornerRadius},${cornerRadius} 0 0 1 ${cornerRadius},${cornerRadius} v${size - 2 * cornerRadius} a${cornerRadius},${cornerRadius} 0 0 1 -${cornerRadius},${cornerRadius} h-${size - 2 * cornerRadius} a${cornerRadius},${cornerRadius} 0 0 1 -${cornerRadius},-${cornerRadius} v-${size - 2 * cornerRadius} a${cornerRadius},${cornerRadius} 0 0 1 ${cornerRadius},-${cornerRadius} z`,
                    stroke: '#007bff',
                    strokeWidth: 3,
                    fill: 'rgba(0, 123, 255, 0.1)',
                    draggable: true
                });
                break;
            case 'triangle':
                shapePath = new konva.Path({
                    name: 'shape-path',
                    data: `M${centerX},${centerY - size / 2} L${centerX + size / 2},${centerY + size / 2} L${centerX - size / 2},${centerY + size / 2} Z`,
                    stroke: '#007bff',
                    strokeWidth: 3,
                    fill: 'rgba(0, 123, 255, 0.1)',
                    draggable: true
                });
                break;
        }

        if (shapePath) {
            shapeLayer.add(shapePath);
            
            // Add transformer for scaling with fixed aspect ratio
            const transformer = new konva.Transformer({
                name: 'shape-transformer',
                nodes: [shapePath],
                keepRatio: true, // Maintain fixed aspect ratio
                enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
                rotateEnabled: false,
                boundBoxFunc: (oldBox, newBox) => {
                    // Limit minimum size
                    if (newBox.width < 20 || newBox.height < 20) {
                        return oldBox;
                    }
                    
                    // For circle and triangle, ensure equal scaling in both dimensions
                    if (selectedShape === 'circle' || selectedShape === 'triangle') {
                        // Use the smaller dimension to maintain aspect ratio
                        const minSize = Math.min(newBox.width, newBox.height);
                        return {
                            ...newBox,
                            width: minSize,
                            height: minSize
                        };
                    }
                    
                    return newBox;
                }
            });
            
            shapeLayer.add(transformer);
            shapeLayer.batchDraw();
            
            // Function to capture cropped image with proper coordinate handling
            const captureCroppedImage = (event) => {
                if (stage && shapePath && image) {
                    // Create a new temporary image using the original image for better quality
                    const tempStage = new konva.Stage({
                        width: image.width,
                        height: image.height,
                        container: document.createElement('div') // This won't be added to DOM
                    });
                    const tempImageLayer = new konva.Layer();
                    tempStage.add(tempImageLayer);

                    // Get updated shapePath from shapeLayer
                    const updatedShapePath = shapeLayer.getChildren(x => x.getAttr('name') === 'shape-path')[0];
                    const rect = updatedShapePath.getClientRect();

                    // Get transform data and scale it to match original image size
                    const transform = updatedShapePath.getAbsoluteTransform().decompose();
                    
                    // Get the imageLayer from stage
                    const imageLayer = stage.getLayers()[0];
                    
                    // Get the displayed image from stage
                    const stageImage = imageLayer.getChildren()[0];
                    
                    // Calculate the scale ratio between original image and displayed image
                    const scaleRatioX = image.width / stageImage.width();
                    const scaleRatioY = image.height / stageImage.height();
                    
                    // Get the offset of the displayed image on the stage
                    const imageOffsetX = stageImage.x();
                    const imageOffsetY = stageImage.y();
                    
                    // Adjust transform to match original image coordinates
                    // We need to subtract the image offset first before scaling
                    const originalTransform = {
                        x: (transform.x - imageOffsetX) * scaleRatioX,
                        y: (transform.y - imageOffsetY) * scaleRatioY,
                        scaleX: transform.scaleX * scaleRatioX,
                        scaleY: transform.scaleY * scaleRatioY,
                        rotation: transform.rotation
                    };

                    // Use TransformDataConverter to get updated path data for original image
                    const converter = new TransformDataConverter((updatedShapePath as any).data(), originalTransform);
                    const updatedPathData = converter.process();
                    
                    // Calculate the cropped area in original image coordinates
                    // Again, subtract the image offset first before scaling
                    const originalRect = {
                        x: (rect.x - imageOffsetX) * scaleRatioX,
                        y: (rect.y - imageOffsetY) * scaleRatioY,
                        width: rect.width * scaleRatioX,
                        height: rect.height * scaleRatioY
                    };
                    
                    // Create a new image with original dimensions and ensure it's fully loaded
                    const img = new Image();
                    img.onload = () => {
                        const originalImage = new konva.Image({
                            image: img,
                            x: 0,
                            y: 0,
                            width: image.width,
                            height: image.height,
                        });
                        tempImageLayer.add(originalImage);
                        
                        tempImageLayer.clipFunc((ctx) => {
                            return [new (Path2D as any)(updatedPathData, 'evenodd')]
                        });
                        
                        // Set high quality for the output image
                        setCroppedImage((tempImageLayer as any).toDataURL(originalRect, { quality: 1 }));
                        
                        // Clean up temporary stage to prevent memory leaks
                        tempStage.destroy();
                    };
                    
                    img.src = image.url;
                 }
            };
             
            // Initial capture
            setTimeout(captureCroppedImage, 100);
             
            // Listen for drag and transform events to update cropped image
            shapePath.on('dragend transformend', captureCroppedImage);
            // transformer.on('transform', captureCroppedImage);
        }
    };

    // Render shape when selected shape changes
    useEffect(() => {
        renderShape();
        
        // Cleanup function to remove event listeners
        return () => {
            if (stage) {
                const shapeLayer = stage.getLayers()[1];
                const shapePath = shapeLayer.findOne('[name="shape-path"]');
                const transformer = shapeLayer.findOne('[name="shape-transformer"]');
                
                if (shapePath) {
                    shapePath.off('dragmove transform');
                }
                if (transformer) {
                    transformer.off('transform');
                }
            }
        };
    }, [stage, selectedShape]);

    // Re-render shape when image is loaded
    useEffect(() => {
        if (stage && selectedShape) {
            renderShape();
        }
    }, [stage, image]);

    if (error) {
        return (
<>

            <div className="card">
                <div className="card-body p-3 text-center text-danger">
                    <p>{error}</p>
                </div>
            </div>
        
</>
);
    }

    return (
<>

        <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{t('shape-image/result/title')}</h5>
                <button className="btn btn-sm btn-outline-danger" onClick={handleClear} title={t('shape-image/result/clear_title')}>
                    {t('shape-image/result/clear')}
                </button>
            </div>
            <div className="card-body bg-light">
                <div className={`d-flex justify-content-center gap-2 shape-selector-container ${styles.shapeSelectorContainerStyle}`}>
                    {shapeComponents.map(shape => (
<>

                        <button className={`btn btn-outline-secondary ${selectedShape === shape.id ? 'active' : ''}`} onClick={() => setSelectedShape(shape.id)} title={t(shape.label)}>
                            <shape.component />
                        </button>
                    
</>
))}
                </div>
            </div>
            <div className="card-body p-3 text-center">
                <div ref={canvasRef} className={styles.canvasContainerStyle}></div>
            </div>
            {croppedImage ? (
<>

                <div className="card-footer bg-light text-center">
                    <div className="my-1">
                        <img src={croppedImage} className={`img-fluid image-cropped ${styles.imageCroppedStyle}`} />    
                    </div>
                    <button className="btn btn-primary my-1" onClick={handleDownload}>
                        {t('shape-image/result/download_image')}
                    </button>
                </div>
            
</>
) : null}
        </div>
    
</>
);
};

export default ResultCard;
