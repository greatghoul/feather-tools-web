/**
 * ShapeCalculator service.
 *
 * Simulates how a circle or rounded rectangle is built out of 1x1 blocks in
 * Minecraft, and reports the total block count plus the number of rows
 * (groups) required to build it.
 *
 * The geometry matches the well-known "pixel circle" approach: every cell
 * whose center falls inside (or, for outline mode, inside the outer ring of)
 * the shape is filled with a block.
 */

/**
 * Builds the block grid for a shape.
 *
 * @param {string} shape - 'circle' or 'rounded_rectangle'.
 * @param {Object} params - { diameter } for a circle, or
 *                          { width, height, cornerRadius } for a rounded rectangle.
 * @param {string} mode - 'solid' or 'outline'.
 * @param {number} thickness - Outline ring thickness in blocks (outline mode only).
 * @returns {Object} { grid, rowCounts, totalBlocks, groups, error }
 */
export function calculateShape(shape, params, mode, thickness = 1) {
    let width;
    let height;
    let cornerRadius = 0;

    if (shape === 'circle') {
        const diameter = Number(params.diameter);
        if (!Number.isInteger(diameter) || diameter < 3) {
            return { error: 'too_small' };
        }
        width = diameter;
        height = diameter;
    } else {
        const w = Number(params.width);
        const h = Number(params.height);
        const r = Number(params.cornerRadius);
        if (!Number.isInteger(w) || !Number.isInteger(h) || w < 3 || h < 3) {
            return { error: 'too_small' };
        }
        if (!Number.isInteger(r) || r < 1) {
            return { error: 'radius_too_large' };
        }
        if (2 * r + 1 > w || 2 * r + 1 > h) {
            return { error: 'radius_too_large' };
        }
        width = w;
        height = h;
        cornerRadius = r;
    }

    const cx = (width - 1) / 2;
    const cy = (height - 1) / 2;
    const halfW = (width - 1) / 2;
    const halfH = (height - 1) / 2;

    // Distance from the center to the outer boundary of the shape:
    // the circle radius for circles, the corner radius for rounded rectangles.
    const boundary = shape === 'circle' ? width / 2 : cornerRadius;

    let ringThickness = 1;
    if (mode === 'outline') {
        ringThickness = Number(thickness);
        if (!Number.isInteger(ringThickness) || ringThickness < 1) {
            return { error: 'thickness_invalid' };
        }
        if (ringThickness > Math.floor(boundary)) {
            return { error: 'thickness_invalid' };
        }
    }

    const grid = [];
    const rowCounts = [];
    let totalBlocks = 0;

    for (let y = 0; y < height; y++) {
        const row = [];
        let count = 0;
        const dy = y - cy;

        for (let x = 0; x < width; x++) {
            const dx = x - cx;
            const filled = isCellFilled(shape, dx, dy, boundary, cornerRadius, halfW, halfH, mode, ringThickness);
            row.push(filled);
            if (filled) {
                count++;
            }
        }

        grid.push(row);
        rowCounts.push(count);
        totalBlocks += count;
    }

    // Every row that contains at least one block is one group (layer) to place.
    const groups = rowCounts.filter((count) => count > 0).length;

    return { grid, rowCounts, totalBlocks, groups };
}

/**
 * Decides whether a single cell is filled for the given shape and mode.
 *
 * @param {string} shape - 'circle' or 'rounded_rectangle'.
 * @param {number} dx - X distance from the shape center.
 * @param {number} dy - Y distance from the shape center.
 * @param {number} boundary - Circle radius, or rounded-rectangle corner radius.
 * @param {number} cornerRadius - Corner radius for rounded rectangles.
 * @param {number} halfW - Half the width of the shape.
 * @param {number} halfH - Half the height of the shape.
 * @param {string} mode - 'solid' or 'outline'.
 * @param {number} thickness - Outline ring thickness in blocks.
 * @returns {boolean}
 */
function isCellFilled(shape, dx, dy, boundary, cornerRadius, halfW, halfH, mode, thickness) {
    let distance;

    if (shape === 'circle') {
        distance = Math.sqrt(dx * dx + dy * dy);
    } else {
        // Signed distance to the inner rectangle that the corner arcs round.
        const qx = Math.max(Math.abs(dx) - (halfW - cornerRadius), 0);
        const qy = Math.max(Math.abs(dy) - (halfH - cornerRadius), 0);
        distance = Math.sqrt(qx * qx + qy * qy);
    }

    if (mode === 'solid') {
        return distance <= boundary;
    }

    // Outline: keep only the outer ring, `thickness` blocks deep.
    return distance <= boundary && distance > boundary - thickness;
}
