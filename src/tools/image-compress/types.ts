import { getFileFormat } from '~/helpers/files';

export interface UploadedImage {
    id: number;
    name: string;
    url: string;
    file: File;
    width: number;
    height: number;
    format: string;
    mimeType: string;
}

export interface CompressSetting {
    quality: number;
    outputFormat: string;
}

export const DEFAULT_COMPRESS_SETTING: CompressSetting = {
    quality: 80,
    outputFormat: 'original',
};

// Re-exported for convenience of consumer components.
export { getFileFormat };
