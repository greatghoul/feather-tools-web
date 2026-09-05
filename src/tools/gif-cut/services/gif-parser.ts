const buildStream = (uint8Data) => ({
    data: uint8Data,
    pos: 0,
});

const readByte = () => (stream) => stream.data[stream.pos++];

const peekByte = (offset = 0) => (stream) => stream.data[stream.pos + offset];

const readBytes = (length) => (stream) => stream.data.subarray(stream.pos, stream.pos += length);

const peekBytes = (length) => (stream) => stream.data.subarray(stream.pos, stream.pos + length);

const readString = (length) => (stream) => {
    return Array.from(readBytes(length)(stream))
        .map((value: any) => String.fromCharCode(value))
        .join('');
};

const readUnsigned = (littleEndian) => (stream) => {
    const bytes = readBytes(2)(stream);
    return littleEndian ? (bytes[1] << 8) + bytes[0] : (bytes[0] << 8) + bytes[1];
};

const readArray = (byteSize, totalOrFunc) => (stream, result, parent) => {
    const total = typeof totalOrFunc === 'function' ? totalOrFunc(stream, result, parent) : totalOrFunc;
    const parser = readBytes(byteSize);
    const arr = new Array(total);
    for (let i = 0; i < total; i++) {
        arr[i] = parser(stream);
    }
    return arr;
};

const subBitsTotal = (bits, startIndex, length) => {
    let result = 0;
    for (let i = 0; i < length; i++) {
        result += bits[startIndex + i] && Math.pow(2, length - i - 1);
    }
    return result;
};

const readBits = (schema) => (stream) => {
    const _byte = readByte()(stream);
    const bits = new Array(8);
    for (let i = 0; i < 8; i++) {
        bits[7 - i] = !!(_byte & 1 << i);
    }
    return Object.keys(schema).reduce((res, key) => {
        const def = schema[key];
        if (def.length !== undefined) {
            res[key] = subBitsTotal(bits, def.index, def.length);
        } else {
            res[key] = bits[def.index];
        }
        return res;
    }, {});
};

const parse = (stream, schema, result = {}, parent = result) => {
    if (Array.isArray(schema)) {
        schema.forEach((partSchema) => parse(stream, partSchema, result, parent));
    } else if (typeof schema === 'function') {
        schema(stream, result, parent, parse);
    } else {
        const key = Object.keys(schema)[0];
        if (Array.isArray(schema[key])) {
            parent[key] = {};
            parse(stream, schema[key], result, parent[key]);
        } else {
            parent[key] = schema[key](stream, result, parent, parse);
        }
    }
    return result;
};

const conditional = (schema, conditionFunc) => (stream, result, parent, parse) => {
    if (conditionFunc(stream, result, parent)) {
        parse(stream, schema, result, parent);
    }
};

const loop = (schema, continueFunc) => (stream, result, parent, parse) => {
    const arr: any[] = [];
    while (continueFunc(stream, result, parent)) {
        const newParent = {};
        parse(stream, schema, result, newParent);
        arr.push(newParent);
    }
    return arr;
};

const subBlocksSchema = {
    blocks: (stream) => {
        const terminator = 0x00;
        const chunks: any[] = [];
        let total = 0;
        for (let size = readByte()(stream); size !== terminator; size = readByte()(stream)) {
            chunks.push(readBytes(size)(stream));
            total += size;
        }
        const result = new Uint8Array(total);
        let offset = 0;
        for (let i = 0; i < chunks.length; i++) {
            result.set(chunks[i], offset);
            offset += chunks[i].length;
        }
        return result;
    },
};

const gceSchema = conditional({
    gce: [
        { codes: readBytes(2) },
        { byteSize: readByte() },
        {
            extras: readBits({
                future: { index: 0, length: 3 },
                disposal: { index: 3, length: 3 },
                userInput: { index: 6 },
                transparentColorGiven: { index: 7 },
            }),
        },
        { delay: readUnsigned(true) },
        { transparentColorIndex: readByte() },
        { terminator: readByte() },
    ],
}, (stream) => {
    const codes = peekBytes(2)(stream);
    return codes[0] === 0x21 && codes[1] === 0xf9;
});

const imageSchema = conditional({
    image: [
        { code: readByte() },
        {
            descriptor: [
                { left: readUnsigned(true) },
                { top: readUnsigned(true) },
                { width: readUnsigned(true) },
                { height: readUnsigned(true) },
                {
                    lct: readBits({
                        exists: { index: 0 },
                        interlaced: { index: 1 },
                        sort: { index: 2 },
                        future: { index: 3, length: 2 },
                        size: { index: 5, length: 3 },
                    }),
                },
            ],
        },
        conditional({
            lct: readArray(3, (stream, result, parent) => {
                return Math.pow(2, parent.descriptor.lct.size + 1);
            }),
        }, (stream, result, parent) => parent.descriptor.lct.exists),
        {
            data: [
                { minCodeSize: readByte() },
                subBlocksSchema,
            ],
        },
    ],
}, (stream) => peekByte()(stream) === 0x2c);

const applicationSchema = conditional({
    application: [
        { codes: readBytes(2) },
        { blockSize: readByte() },
        {
            id: (stream, result, parent) => readString(parent.blockSize)(stream),
        },
        subBlocksSchema,
    ],
}, (stream) => {
    const codes = peekBytes(2)(stream);
    return codes[0] === 0x21 && codes[1] === 0xff;
});

const commentSchema = conditional({
    comment: [
        { codes: readBytes(2) },
        subBlocksSchema,
    ],
}, (stream) => {
    const codes = peekBytes(2)(stream);
    return codes[0] === 0x21 && codes[1] === 0xfe;
});

const textSchema = conditional({
    text: [
        { codes: readBytes(2) },
        { blockSize: readByte() },
        {
            preData: (stream, result, parent) => readBytes(parent.text.blockSize)(stream),
        },
        subBlocksSchema,
    ],
}, (stream) => {
    const codes = peekBytes(2)(stream);
    return codes[0] === 0x21 && codes[1] === 0x01;
});

const gifSchema = [
    {
        header: [
            { signature: readString(3) },
            { version: readString(3) },
        ],
    },
    {
        lsd: [
            { width: readUnsigned(true) },
            { height: readUnsigned(true) },
            {
                gct: readBits({
                    exists: { index: 0 },
                    resolution: { index: 1, length: 3 },
                    sort: { index: 4 },
                    size: { index: 5, length: 3 },
                }),
            },
            { backgroundColorIndex: readByte() },
            { pixelAspectRatio: readByte() },
        ],
    },
    conditional({
        gct: readArray(3, (stream, result) => Math.pow(2, result.lsd.gct.size + 1)),
    }, (stream, result) => result.lsd.gct.exists),
    {
        frames: loop([gceSchema, applicationSchema, commentSchema, imageSchema, textSchema], (stream) => {
            const nextCode = peekByte()(stream);
            return nextCode === 0x21 || nextCode === 0x2c;
        }),
    },
];

const lzw = (minCodeSize, data, pixelCount) => {
    const MAX_STACK_SIZE = 4096;
    const nullCode = -1;
    const npix = pixelCount;
    const dstPixels = new Array(pixelCount);
    const prefix = new Array(MAX_STACK_SIZE);
    const suffix = new Array(MAX_STACK_SIZE);
    const pixelStack = new Array(MAX_STACK_SIZE + 1);

    const dataSize = minCodeSize;
    const clear = 1 << dataSize;
    const endOfInformation = clear + 1;
    let available = clear + 2;
    let oldCode = nullCode;
    let codeSize = dataSize + 1;
    let codeMask = (1 << codeSize) - 1;

    for (let code = 0; code < clear; code++) {
        prefix[code] = 0;
        suffix[code] = code;
    }

    let datum = 0;
    let bits = 0;
    let count = 0;
    let first = 0;
    let top = 0;
    let pi = 0;
    let bi = 0;

    for (let i = 0; i < npix;) {
        if (top === 0) {
            if (bits < codeSize) {
                datum += data[bi] << bits;
                bits += 8;
                bi++;
                continue;
            }
            let code = datum & codeMask;
            datum >>= codeSize;
            bits -= codeSize;

            if (code > available || code === endOfInformation) {
                break;
            }
            if (code === clear) {
                codeSize = dataSize + 1;
                codeMask = (1 << codeSize) - 1;
                available = clear + 2;
                oldCode = nullCode;
                continue;
            }
            if (oldCode === nullCode) {
                pixelStack[top++] = suffix[code];
                oldCode = code;
                first = code;
                continue;
            }
            const inCode = code;
            if (code === available) {
                pixelStack[top++] = first;
                code = oldCode;
            }
            while (code > clear) {
                pixelStack[top++] = suffix[code];
                code = prefix[code];
            }
            first = suffix[code] & 0xff;
            pixelStack[top++] = first;
            if (available < MAX_STACK_SIZE) {
                prefix[available] = oldCode;
                suffix[available] = first;
                available++;
                if ((available & codeMask) === 0 && available < MAX_STACK_SIZE) {
                    codeSize++;
                    codeMask += available;
                }
            }
            oldCode = inCode;
        }
        top--;
        dstPixels[pi++] = pixelStack[top];
        i++;
    }
    for (let i = pi; i < npix; i++) {
        dstPixels[i] = 0;
    }
    return dstPixels;
};

const deinterlace = (pixels, width) => {
    const newPixels = new Array(pixels.length);
    const rows = pixels.length / width;
    const cpRow = (toRow, fromRow) => {
        const fromPixels = pixels.slice(fromRow * width, (fromRow + 1) * width);
        newPixels.splice.apply(newPixels, [toRow * width, width].concat(fromPixels) as any);
    };
    const offsets = [0, 4, 2, 1];
    const steps = [8, 8, 4, 2];
    let fromRow = 0;
    for (let pass = 0; pass < 4; pass++) {
        for (let toRow = offsets[pass]; toRow < rows; toRow += steps[pass]) {
            cpRow(toRow, fromRow);
            fromRow++;
        }
    }
    return newPixels;
};

export const parseGIF = (arrayBuffer): any => {
    const byteData = new Uint8Array(arrayBuffer);
    return parse(buildStream(byteData), gifSchema);
};

const generatePatch = (image) => {
    const totalPixels = image.pixels.length;
    const patchData = new Uint8ClampedArray(totalPixels * 4);
    for (let i = 0; i < totalPixels; i++) {
        const pos = i * 4;
        const colorIndex = image.pixels[i];
        const color = image.colorTable[colorIndex] || [0, 0, 0];
        patchData[pos] = color[0];
        patchData[pos + 1] = color[1];
        patchData[pos + 2] = color[2];
        patchData[pos + 3] = colorIndex !== image.transparentIndex ? 255 : 0;
    }
    return patchData;
};

export const decompressFrame = (frame, gct, buildImagePatch) => {
    if (!frame.image) {
        return null;
    }
    const image = frame.image;
    const totalPixels = image.descriptor.width * image.descriptor.height;
    let pixels = lzw(image.data.minCodeSize, image.data.blocks, totalPixels);
    if (image.descriptor.lct.interlaced) {
        pixels = deinterlace(pixels, image.descriptor.width);
    }
    const resultImage: any = {
        pixels,
        dims: {
            top: frame.image.descriptor.top,
            left: frame.image.descriptor.left,
            width: frame.image.descriptor.width,
            height: frame.image.descriptor.height,
        },
    };
    if (image.descriptor.lct && image.descriptor.lct.exists) {
        resultImage.colorTable = image.lct;
    } else {
        resultImage.colorTable = gct;
    }
    if (frame.gce) {
        resultImage.delay = (frame.gce.delay || 10) * 10;
        resultImage.disposalType = frame.gce.extras.disposal;
        if (frame.gce.extras.transparentColorGiven) {
            resultImage.transparentIndex = frame.gce.transparentColorIndex;
        }
    }
    if (buildImagePatch) {
        resultImage.patch = generatePatch(resultImage);
    }
    return resultImage;
};

export const decompressFrames = (parsedGif, buildImagePatches) => {
    return parsedGif.frames
        .filter((f) => f.image)
        .map((f) => decompressFrame(f, parsedGif.gct, buildImagePatches))
        .filter(Boolean);
};
