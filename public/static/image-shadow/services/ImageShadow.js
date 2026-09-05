import konva from 'konva';

class ImageShadow {
    constructor(image, setting) {
        this.image = image;
        this.setting = setting;
    }

    async process() {
        const { offsetX, offsetY, blurRadius, spreadRadius, shadowColor, padding } = this.setting;
        
        const img = new Image();
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = this.image.url;
        });

        const imgWidth = img.width;
        const imgHeight = img.height;
        const extraPadding = padding + Math.abs(offsetX) + Math.abs(offsetY) + spreadRadius + blurRadius * 2;

        const stageWidth = imgWidth + extraPadding * 2;
        const stageHeight = imgHeight + extraPadding * 2;

        const container = document.createElement('div');
        const stage = new konva.Stage({
            container,
            width: stageWidth,
            height: stageHeight,
        });

        const layer = new konva.Layer();
        stage.add(layer);

        const imageX = extraPadding;
        const imageY = extraPadding;

        const shadowImage = new konva.Image({
            image: img,
            x: imageX - spreadRadius,
            y: imageY - spreadRadius,
            width: imgWidth + spreadRadius * 2,
            height: imgHeight + spreadRadius * 2,
            shadowColor: shadowColor,
            shadowBlur: blurRadius,
            shadowOffsetX: offsetX,
            shadowOffsetY: offsetY,
            shadowEnabled: true,
        });
        layer.add(shadowImage);

        const baseImage = new konva.Image({
            image: img,
            x: imageX,
            y: imageY,
            width: imgWidth,
            height: imgHeight,
        });
        layer.add(baseImage);

        layer.batchDraw();

        const dataUrl = stage.toDataURL({
            mimeType: 'image/png',
            quality: 1,
            pixelRatio: 1,
        });

        stage.destroy();

        return {
            image: this.image,
            setting: this.setting,
            width: stageWidth,
            height: stageHeight,
            offsetX,
            offsetY,
            blurRadius,
            spreadRadius,
            shadowColor,
            padding,
            name: this.getFilename(),
            format: 'png',
            mimeType: 'image/png',
            url: dataUrl,
        };
    }

    getFilename() {
        const baseName = this.image.name.split('.').slice(0, -1).join('.');
        return `${baseName}-shadow.png`;
    }
}

export default ImageShadow;
