class FrequencyService {
    getStopWords() {
        return new Set([
            'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to',
            'for', 'of', 'by', 'with', 'from', 'as', 'is', 'was', 'are',
            'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do',
            'does', 'did', 'will', 'would', 'could', 'should', 'may',
            'might', 'shall', 'can', 'it', 'its', 'it\'s', 'i', 'me',
            'my', 'we', 'our', 'you', 'your', 'he', 'him', 'his',
            'she', 'her', 'they', 'them', 'their', 'this', 'that',
            'these', 'those', 'what', 'which', 'who', 'whom', 'when',
            'where', 'why', 'how', 'all', 'each', 'every', 'both',
            'few', 'more', 'most', 'other', 'some', 'such', 'no',
            'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
            'very', 'just', 'because', 'if', 'then', 'else', 'up',
            'down', 'out', 'off', 'over', 'under', 'again', 'further',
            'once', 'here', 'there', 'about', 'after', 'also', 'any',
            'into', 'like', 'make', 'new', 'now', 'one', 'part', 'said',
            'two', 'three', 'four', 'five', 'six', 'seven', 'eight',
            'nine', 'ten', 'much', 'many', 'well', 'back', 'even',
            'still', 'way', 'yet', 'upon', 'get', 'got', 'am', 'between',
            'without', 'through', 'during', 'before', 'after',
        ]);
    }

    analyze(text, options = {}) {
        const {
            minLength = 1,
            caseSensitive = false,
            ignoreNumbers = false,
            ignoreStopwords = false,
            sortBy = 'frequency',
            sortOrder = 'descending',
            limit = 0,
        } = options;

        if (!text || !text.trim()) {
            return { frequencies: [], totalWords: 0, uniqueWords: 0 };
        }

        let words = text.toLowerCase().match(/\b\w+\b/g) || [];

        if (!caseSensitive) {
            words = words.map(w => w.toLowerCase());
        }

        if (ignoreNumbers) {
            words = words.filter(w => !/^\d+$/.test(w));
        }

        if (minLength > 1) {
            words = words.filter(w => w.length >= minLength);
        }

        const stopWords = this.getStopWords();
        if (ignoreStopwords) {
            words = words.filter(w => !stopWords.has(w));
        }

        const frequencyMap = new Map();
        for (const word of words) {
            frequencyMap.set(word, (frequencyMap.get(word) || 0) + 1);
        }

        const totalWords = words.length;
        let entries = Array.from(frequencyMap.entries());

        if (sortBy === 'frequency') {
            entries.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
        } else {
            entries.sort((a, b) => a[0].localeCompare(b[0]));
        }

        if (sortOrder === 'ascending' && sortBy === 'frequency') {
            entries.reverse();
        }

        if (limit > 0) {
            entries = entries.slice(0, limit);
        }

        const frequencies = entries.map(([word, count]) => ({
            word,
            count,
            percentage: totalWords > 0 ? ((count / totalWords) * 100).toFixed(2) : '0.00',
        }));

        return {
            frequencies,
            totalWords,
            uniqueWords: frequencyMap.size,
        };
    }

    getExampleText() {
        return `The quick brown fox jumps over the lazy dog
The quick brown fox is quick and brown
A quick brown fox is faster than a lazy dog
The lazy dog sleeps while the quick fox jumps
How quick can a brown fox jump over a lazy dog
The brown fox and the lazy dog are friends
Every morning the quick brown fox visits the lazy dog
The lazy dog waits for the quick brown fox`;
    }

    exportCSV(frequencies) {
        const header = 'Word,Frequency,Percentage';
        const rows = frequencies.map(f => `${f.word},${f.count},${f.percentage}%`);
        return [header, ...rows].join('\n');
    }
}

export default FrequencyService;
