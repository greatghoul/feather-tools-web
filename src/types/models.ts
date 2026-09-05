// Shared data models used by common components and tools.
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

export { getFileFormat };
