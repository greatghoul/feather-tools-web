/**
 * TransformDataConverter - Used to recalculate path data based on konva transform
 * 
 * Usage:
 * const service = new TransformDataConverter(path.data, transform)
 * const newData = service.process();
 */
class TransformDataConverter  {
    private pathData: any;
        private transform: any;
        private parsedCommands: any;

    /**
     * Constructor
     * @param {string} pathData - SVG path data
     * @param {Object} transform - Konva transform object
     */
    constructor(pathData, transform) {
        this.pathData = pathData;
        this.transform = transform;
        this.parsedCommands = [];
    }

    /**
     * Process path data and return transformed path
     * @returns {string} Transformed SVG path data
     */
    process() {
        // Parse path data
        this.parsePathData();
        
        // Apply transformations
        this.applyTransform();
        
        // Rebuild path data
        return this.rebuildPathData();
    }

    /**
     * Parse SVG path data
     */
    parsePathData() {
        const commands: any[] = [];
        const pathData = this.pathData;
        let i = 0;
        
        while (i < pathData.length) {
            // Skip whitespace characters
            while (i < pathData.length && /\s/.test(pathData[i])) i++;
            
            if (i >= pathData.length) break;
            
            // Get command character
            const command = pathData[i];
            i++;
            
            // Extract coordinate parameters
            const params = this.extractParameters(pathData, i);
            i += params.consumed;
            
            commands.push({
                type: command,
                params: params.values,
                relative: !/[A-Z]/.test(command)
            });
        }
        
        this.parsedCommands = commands;
    }

    /**
     * Extract parameters from path data
     * @param {string} pathData - SVG path data
     * @param {number} startIndex - Starting index
     * @returns {Object} Object containing parameter values and consumed character count
     */
    extractParameters(pathData, startIndex) {
        const values: any[] = [];
        let i = startIndex;
        let currentNum = '';
        let hasDecimal = false;
        let hasExponent = false;
        
        while (i < pathData.length) {
            const char = pathData[i];
            
            // Check if character is a digit, decimal point, or exponent symbol
            if (/[\d.-]/.test(char)) {
                if (char === '.') {
                    if (hasDecimal || hasExponent) {
                        // Already has decimal point or exponent, end current number
                        values.push(parseFloat(currentNum));
                        currentNum = '.';
                        hasDecimal = true;
                        hasExponent = false;
                    } else {
                        currentNum += char;
                        hasDecimal = true;
                    }
                } else if (/[eE]/.test(char)) {
                    if (hasExponent) {
                        // Already has exponent, end current number
                        values.push(parseFloat(currentNum));
                        currentNum = char;
                        hasExponent = true;
                        hasDecimal = false;
                    } else {
                        currentNum += char;
                        hasExponent = true;
                        hasDecimal = false;
                    }
                } else {
                    currentNum += char;
                }
            } else {
                // Non-numeric character, end current number
                if (currentNum) {
                    values.push(parseFloat(currentNum));
                    currentNum = '';
                    hasDecimal = false;
                    hasExponent = false;
                }
                
                // If it's a new command character, end parameter extraction
                if (/[a-zA-Z]/.test(char)) {
                    break;
                }
            }
            
            i++;
        }
        
        // Add the last number if it exists
        if (currentNum) {
            values.push(parseFloat(currentNum));
        }
        
        return {
            values,
            consumed: i - startIndex
        };
    }

    /**
     * Apply transformations to parsed commands
     */
    applyTransform() {
        const { x, y, scaleX, scaleY, rotation } = this.transform;
        
        // Calculate rotation angle in radians
        const rotationRad = (rotation * Math.PI) / 180;
        const cos = Math.cos(rotationRad);
        const sin = Math.sin(rotationRad);
        
        // Apply transformation to each command's coordinates
        this.parsedCommands = this.parsedCommands.map(command => {
            const { type, params, relative } = command;
            const transformedParams: any[] = [];
            let i = 0;
            
            // Process parameters based on command type
            switch (type.toUpperCase()) {
                case 'M': // Move To
                case 'L': // Line To
                case 'T': // Smooth Quadratic Curve To
                    // These commands use x,y coordinate pairs
                    while (i < params.length) {
                        if (i + 1 <= params.length) {
                            let [tx, ty] = this.applyTransformation(params[i], params[i + 1], cos, sin, scaleX, scaleY, x, y, relative);
                            transformedParams.push(tx, ty);
                            i += 2;
                        } else {
                            break;
                        }
                    }
                    break;
                
                case 'H': // Horizontal Line To
                    // Only x coordinate
                    while (i < params.length) {
                        let [tx] = this.applyTransformationX(params[i], cos, sin, scaleX, scaleY, x, y, relative);
                        transformedParams.push(tx);
                        i++;
                    }
                    break;
                
                case 'V': // Vertical Line To
                    // Only y coordinate
                    while (i < params.length) {
                        let [ty] = this.applyTransformationY(params[i], cos, sin, scaleX, scaleY, x, y, relative);
                        transformedParams.push(ty);
                        i++;
                    }
                    break;
                
                case 'C': // Cubic Bezier Curve
                    // Uses three coordinate sets: control point 1, control point 2, end point
                    while (i < params.length) {
                        if (i + 5 <= params.length) {
                            let [cx1, cy1] = this.applyTransformation(params[i], params[i + 1], cos, sin, scaleX, scaleY, x, y, relative);
                            let [cx2, cy2] = this.applyTransformation(params[i + 2], params[i + 3], cos, sin, scaleX, scaleY, x, y, relative);
                            let [ex, ey] = this.applyTransformation(params[i + 4], params[i + 5], cos, sin, scaleX, scaleY, x, y, relative);
                            transformedParams.push(cx1, cy1, cx2, cy2, ex, ey);
                            i += 6;
                        } else {
                            break;
                        }
                    }
                    break;
                
                case 'S': // Smooth Cubic Bezier Curve
                    // Uses two coordinate sets: control point, end point
                    while (i < params.length) {
                        if (i + 3 <= params.length) {
                            let [cx, cy] = this.applyTransformation(params[i], params[i + 1], cos, sin, scaleX, scaleY, x, y, relative);
                            let [ex, ey] = this.applyTransformation(params[i + 2], params[i + 3], cos, sin, scaleX, scaleY, x, y, relative);
                            transformedParams.push(cx, cy, ex, ey);
                            i += 4;
                        } else {
                            break;
                        }
                    }
                    break;
                
                case 'Q': // Quadratic Bezier Curve
                    // Uses two coordinate sets: control point, end point
                    while (i < params.length) {
                        if (i + 3 <= params.length) {
                            let [cx, cy] = this.applyTransformation(params[i], params[i + 1], cos, sin, scaleX, scaleY, x, y, relative);
                            let [ex, ey] = this.applyTransformation(params[i + 2], params[i + 3], cos, sin, scaleX, scaleY, x, y, relative);
                            transformedParams.push(cx, cy, ex, ey);
                            i += 4;
                        } else {
                            break;
                        }
                    }
                    break;
                
                case 'A': // Elliptical Arc
                    // Parameters: rx, ry, x-axis-rotation, large-arc-flag, sweep-flag, x, y
                    while (i < params.length) {
                        if (i + 6 <= params.length) {
                            // For elliptical arcs, only transform end point coordinates, keep other parameters unchanged
                            let [ex, ey] = this.applyTransformation(params[i + 5], params[i + 6], cos, sin, scaleX, scaleY, x, y, relative);
                            transformedParams.push(
                                params[i] * scaleX, // rx
                                params[i + 1] * scaleY, // ry
                                params[i + 2] + rotation, // x-axis-rotation
                                params[i + 3], // large-arc-flag
                                params[i + 4], // sweep-flag
                                ex, ey
                            );
                            i += 7;
                        } else {
                            break;
                        }
                    }
                    break;
                
                case 'Z': // Close Path
                default:
                    // Commands that don't need transformation
                    transformedParams.push(...params);
                    break;
            }
            
            return {
                ...command,
                params: transformedParams
            };
        });
    }

    /**
     * Apply transformation to coordinate point
     * @param {number} x - x coordinate
     * @param {number} y - y coordinate
     * @param {number} cos - Cosine of rotation angle
     * @param {number} sin - Sine of rotation angle
     * @param {number} scaleX - x-axis scale
     * @param {number} scaleY - y-axis scale
     * @param {number} tx - x-axis translation
     * @param {number} ty - y-axis translation
     * @param {boolean} relative - Whether coordinates are relative
     * @returns {Array} Transformed coordinates [x, y]
     */
    applyTransformation(x, y, cos, sin, scaleX, scaleY, tx, ty, relative) {
        // Apply scaling
        x *= scaleX;
        y *= scaleY;
        
        // Apply rotation
        const rotatedX = x * cos - y * sin;
        const rotatedY = x * sin + y * cos;
        
        // Apply translation
        if (relative) {
            // For relative coordinates, only consider rotation and scaling
            return [rotatedX, rotatedY];
        } else {
            // For absolute coordinates, consider all transformations
            return [rotatedX + tx, rotatedY + ty];
        }
    }

    /**
     * Apply transformation to x coordinate
     * @param {number} x - x coordinate
     * @param {number} cos - Cosine of rotation angle
     * @param {number} sin - Sine of rotation angle
     * @param {number} scaleX - x-axis scale
     * @param {number} scaleY - y-axis scale
     * @param {number} tx - x-axis translation
     * @param {number} ty - y-axis translation
     * @param {boolean} relative - Whether coordinates are relative
     * @returns {Array} Transformed coordinate [x]
     */
    applyTransformationX(x, cos, sin, scaleX, scaleY, tx, ty, relative) {
        // For horizontal lines, we assume y=0
        x *= scaleX;
        const rotatedX = x * cos;
        
        if (relative) {
            return [rotatedX];
        } else {
            return [rotatedX + tx];
        }
    }

    /**
     * Apply transformation to y coordinate
     * @param {number} y - y coordinate
     * @param {number} cos - Cosine of rotation angle
     * @param {number} sin - Sine of rotation angle
     * @param {number} scaleX - x-axis scale
     * @param {number} scaleY - y-axis scale
     * @param {number} tx - x-axis translation
     * @param {number} ty - y-axis translation
     * @param {boolean} relative - Whether coordinates are relative
     * @returns {Array} Transformed coordinate [y]
     */
    applyTransformationY(y, cos, sin, scaleX, scaleY, tx, ty, relative) {
        // For vertical lines, we assume x=0
        y *= scaleY;
        const rotatedY = y * cos;
        
        if (relative) {
            return [rotatedY];
        } else {
            return [rotatedY + ty];
        }
    }

    /**
     * Rebuild SVG path data
     * @returns {string} Transformed SVG path data
     */
    rebuildPathData() {
        let result = '';
        
        this.parsedCommands.forEach(command => {
            const { type, params } = command;
            result += type;
            
            // Add parameters, separated by spaces
            if (params.length > 0) {
                result += ' ' + params.map(param => {
                    // Handle undefined or non-numeric parameters
                    if (param === undefined || param === null) {
                        return '0'; // Default to 0 for undefined/null values
                    }
                    
                    // Optimize number format, remove unnecessary decimal parts
                    if (Number.isInteger(param)) {
                        return param.toString();
                    } else {
                        return Number(param).toFixed(4).replace(/\.?0+$/, '');
                    }
                }).join(' ');
            }
        });
        
        return result;
    }
}

export default TransformDataConverter;
