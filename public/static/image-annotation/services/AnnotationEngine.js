import Konva from 'konva';

let idCounter = 0;

export function generateId() {
    return `ann_${Date.now()}_${idCounter++}`;
}

export const TOOL_LABELS = {
    line: { icon: 'bi-slash-lg', key: 'image-annotation/toolbar/line' },
    arrow: { icon: 'bi-arrow-up-right', key: 'image-annotation/toolbar/arrow' },
    circle: { icon: 'bi-circle', key: 'image-annotation/toolbar/circle' },
    rect: { icon: 'bi-square', key: 'image-annotation/toolbar/rect' },
    roundedRect: { icon: 'bi-bounding-box-circles', key: 'image-annotation/toolbar/rounded_rect' },
    highlighter: { icon: 'bi-highlighter', key: 'image-annotation/toolbar/highlighter' },
    pen: { icon: 'bi-pencil', key: 'image-annotation/toolbar/pen' },
    mosaic: { icon: 'bi-grid-3x3-gap-fill', key: 'image-annotation/toolbar/mosaic' },
};

export function createShape(type, attrs) {
    switch (type) {
        case 'line':
            return new Konva.Line({
                lineCap: 'round',
                lineJoin: 'round',
                hitStrokeWidth: 10,
                ...attrs,
            });
        case 'arrow':
            return new Konva.Arrow({
                pointerLength: 10,
                pointerWidth: 8,
                hitStrokeWidth: 10,
                ...attrs,
            });
        case 'circle':
            return new Konva.Ellipse({
                hitStrokeWidth: 10,
                ...attrs,
            });
        case 'mosaic':
        case 'rect':
            return new Konva.Rect({
                hitStrokeWidth: 10,
                ...attrs,
            });
        case 'roundedRect':
            return new Konva.Rect({
                cornerRadius: 15,
                hitStrokeWidth: 10,
                ...attrs,
            });
        case 'highlighter':
            return new Konva.Line({
                lineCap: 'round',
                lineJoin: 'round',
                globalCompositeOperation: 'source-over',
                tension: 0.3,
                hitStrokeWidth: 10,
                ...attrs,
            });
        case 'pen':
            return new Konva.Line({
                lineCap: 'round',
                lineJoin: 'round',
                tension: 0.3,
                hitStrokeWidth: 10,
                ...attrs,
            });
        default:
            throw new Error(`Unknown shape type: ${type}`);
    }
}

export function createPreviewShape(type, x1, y1, x2, y2, attrs) {
    let shape;
    const dx = x2 - x1;
    const dy = y2 - y1;

    switch (type) {
        case 'line':
            shape = new Konva.Line({
                points: [x1, y1, x2, y2],
                lineCap: 'round',
                lineJoin: 'round',
                dash: [6, 3],
                ...attrs,
            });
            break;
        case 'arrow':
            shape = new Konva.Arrow({
                points: [x1, y1, x2, y2],
                pointerLength: 10,
                pointerWidth: 8,
                dash: [6, 3],
                ...attrs,
            });
            break;
        case 'circle':
            shape = new Konva.Ellipse({
                x: x1 + dx / 2,
                y: y1 + dy / 2,
                radiusX: Math.abs(dx) / 2,
                radiusY: Math.abs(dy) / 2,
                dash: [6, 3],
                ...attrs,
            });
            break;
        case 'mosaic':
        case 'rect':
            shape = new Konva.Rect({
                x: dx >= 0 ? x1 : x2,
                y: dy >= 0 ? y1 : y2,
                width: Math.abs(dx),
                height: Math.abs(dy),
                dash: [6, 3],
                ...attrs,
            });
            break;
        case 'roundedRect':
            shape = new Konva.Rect({
                x: dx >= 0 ? x1 : x2,
                y: dy >= 0 ? y1 : y2,
                width: Math.abs(dx),
                height: Math.abs(dy),
                cornerRadius: 15,
                dash: [6, 3],
                ...attrs,
            });
            break;
        default:
            return null;
    }
    return shape;
}

export function createFinalShape(type, x1, y1, x2, y2, attrs) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const shapeAttrs = { ...attrs };
    delete shapeAttrs.dash;

    switch (type) {
        case 'line':
            return createShape(type, {
                points: [x1, y1, x2, y2],
                ...shapeAttrs,
            });
        case 'arrow':
            return createShape(type, {
                points: [x1, y1, x2, y2],
                ...shapeAttrs,
            });
        case 'circle':
            return createShape(type, {
                x: x1 + dx / 2,
                y: y1 + dy / 2,
                radiusX: Math.abs(dx) / 2,
                radiusY: Math.abs(dy) / 2,
                ...shapeAttrs,
            });
        case 'mosaic':
        case 'rect':
            return createShape(type, {
                x: dx >= 0 ? x1 : x2,
                y: dy >= 0 ? y1 : y2,
                width: Math.abs(dx),
                height: Math.abs(dy),
                ...shapeAttrs,
            });
        case 'roundedRect':
            return createShape(type, {
                x: dx >= 0 ? x1 : x2,
                y: dy >= 0 ? y1 : y2,
                width: Math.abs(dx),
                height: Math.abs(dy),
                ...shapeAttrs,
            });
        default:
            return null;
    }
}

export function serializeAnnotations(layer) {
    if (!layer) return [];
    const shapes = layer.find('Shape');
    const annotations = [];
    shapes.forEach((shape) => {
        if (shape.getAttr('isAnnotation')) {
            annotations.push({
                id: shape.id(),
                type: shape.getAttr('annotationType'),
                attrs: shape.getAttrs(),
            });
        }
    });
    return annotations;
}

export function getAnnotationKey(type) {
    const keys = {
        select: 'image-annotation/toolbar/select',
        line: 'image-annotation/toolbar/line',
        arrow: 'image-annotation/toolbar/arrow',
        circle: 'image-annotation/toolbar/circle',
        rect: 'image-annotation/toolbar/rect',
        roundedRect: 'image-annotation/toolbar/rounded_rect',
        highlighter: 'image-annotation/toolbar/highlighter',
        pen: 'image-annotation/toolbar/pen',
        mosaic: 'image-annotation/toolbar/mosaic',
    };
    return keys[type] || type;
}
