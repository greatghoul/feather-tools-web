import UPNG from 'upng-js';
import type { UploadedImage, CompressSetting } from '../types';

const colorsForQuality = (quality: number): number => {
    if (quality >= 60) return 256;
    if (quality >= 40) return 128;
    if (quality >= 20) return 64;
    return 16;
};

export interface CompressResult {
    image: UploadedImage;
    setting: CompressSetting;
    width: number;
    height: number;
    name: string;
    originalWidth: number;
    originalHeight: number;
    format: string;
    mimeType: string;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    url: string;
}

class ImageCompress {
    private image: UploadedImage;
    private setting: CompressSetting;

    constructor(image: UploadedImage, setting: CompressSetting) {
        this.image = image;
        this.setting = setting;
    }

    async process(): Promise<CompressResult> {
        const { quality, outputFormat } = this.setting;
        const mimeType = outputFormat === 'original'
            ? this.image.mimeType || 'image/jpeg'
            : `image/${outputFormat}`;

        const originalSize = this.image.file ? this.image.file.size : 0;
        const img = new Image();

        await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = reject;
            img.src = this.image.url;
        });

        const width = img.naturalWidth;
        const height = img.naturalHeight;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;

        ctx.drawImage(img, 0, 0);

        let blob: Blob;

        if (mimeType === 'image/png') {
            const imageData = ctx.getImageData(0, 0, width, height);
            const colors = colorsForQuality(quality);

            if (colors > 0) {
                const pngBuffer = UPNG.encode([imageData.data], width, height, colors);
                blob = new Blob([pngBuffer as ArrayBuffer], { type: 'image/png' });
            } else {
                blob = await new Promise<Blob>((resolve) => {
                    canvas.toBlob((b) => resolve(b!), 'image/png');
                });
            }
        } else {
            blob = await new Promise<Blob>((resolve) => {
                canvas.toBlob((b) => resolve(b!), mimeType, quality / 100);
            });
        }

        canvas.width = 0;
        canvas.height = 0;

        const useOriginal = blob.size >= originalSize;
        const resultBlob: Blob = useOriginal ? this.image.file : blob;
        const ext = useOriginal
            ? this.image.name.split('.').pop()!
            : mimeType.split('/')[1];
        const baseName = this.image.name.replace(/\.[^/.]+$/, '');
        const resultUrl = useOriginal ? this.image.url : URL.createObjectURL(blob);

        return {
            image: this.image,
            setting: this.setting,
            width,
            height,
            name: `${baseName}-compressed.${ext}`,
            originalWidth: width,
            originalHeight: height,
            format: ext,
            mimeType,
            originalSize,
            compressedSize: resultBlob.size,
            compressionRatio: originalSize > 0
                ? Math.round((1 - resultBlob.size / originalSize) * 100)
                : 0,
            url: resultUrl,
        };
    }
}

export default ImageCompress;
