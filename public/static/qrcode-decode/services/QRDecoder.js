import jsQR from 'jsqr';

const MAX_DIMENSION = 1500;

class QRDecoder {
    async decode(image) {
        let source;
        try {
            if (image.file) {
                source = await createImageBitmap(image.file);
            } else {
                const imgElement = new Image();
                await new Promise((resolve, reject) => {
                    imgElement.onload = resolve;
                    imgElement.onerror = reject;
                    imgElement.src = image.url;
                });
                try { await imgElement.decode(); } catch (_) {}
                source = await createImageBitmap(imgElement);
            }
        } catch (e) {
            return { success: false, data: null, image };
        }

        if (source.width === 0 || source.height === 0) {
            source.close();
            return { success: false, data: null, image };
        }

        let width = source.width;
        let height = source.height;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            const scale = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
            width = Math.round(width * scale);
            height = Math.round(height * scale);
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;

        try {
            ctx.drawImage(source, 0, 0, width, height);
        } catch (e) {
            source.close();
            canvas.width = 0;
            canvas.height = 0;
            return { success: false, data: null, image };
        }
        source.close();

        let imageData;
        try {
            imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        } catch (e) {
            canvas.width = 0;
            canvas.height = 0;
            return { success: false, data: null, image };
        }

        let code;
        try {
            code = jsQR(imageData.data, imageData.width, imageData.height);
        } catch (e) {
            canvas.width = 0;
            canvas.height = 0;
            return { success: false, data: null, image };
        }

        canvas.width = 0;
        canvas.height = 0;

        if (code && code.data) {
            return { success: true, data: code.data, image };
        }

        return { success: false, data: null, image };
    }
}

export default QRDecoder;
