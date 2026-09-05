const TruncateService = {
    truncateLines(lines, maxLength, ellipsis) {
        return lines.map((line) => {
            const effectiveMax = maxLength - ellipsis.length;
            const text = line.length > maxLength
                ? line.slice(0, Math.max(0, effectiveMax)) + ellipsis
                : line;
            return { text, truncated: line.length > maxLength };
        });
    }
};

export default TruncateService;
