class LineNumberService {
  /**
   * 生成带行号的文本
   * @param {string} text - 原始文本
   * @param {Object} options - 配置选项
   * @returns {string} 带行号的文本
   */
  generateLineNumbers(text, options) {
    if (!text || !text.trim()) {
      return '';
    }

    const lines = text.split('\n');
    const result = [];
    let lineNumber = options.start;

    for (let i = 0; i < lines.length; i++) {
      // 如果跳过空行且当前行为空，则不处理
      if (options.skipEmpty && lines[i].trim() === '') {
        result.push('');
        continue;
      }

      const formattedNumber = this.formatLineNumber(lineNumber, options);
      result.push(`${formattedNumber}${lines[i]}`);
      lineNumber += options.step;
    }

    if (options.reverse) {
      result.reverse();
    }

    return result.join('\n');
  }

  /**
   * 格式化行号
   * @param {number} num - 行号
   * @param {Object} options - 配置选项
   * @returns {string} 格式化后的行号
   */
  formatLineNumber(num, options) {
    let displayNumber;

    switch (options.type) {
      case 'letter':
        displayNumber = this.convertNumberToAlphabet(num, options.uppercase);
        break;
      case 'roman':
        displayNumber = this.convertNumberToRoman(num, options.uppercase);
        break;
      case 'number':
      default:
        displayNumber = num.toString();
        if (options.padding > 0) {
          displayNumber = displayNumber.padStart(options.padding, '0');
        }
    }

    return `${options.prefix || ''}${displayNumber}${options.suffix || ''}`;
  }

  /**
   * 数字转字母 (a-z, aa-zz, aaa-zzz, ...)
   * @param {number} num - 数字
   * @param {boolean} uppercase - 是否大写
   * @returns {string} 字母表示
   */
  convertNumberToAlphabet(num, uppercase = true) {
    if (num <= 0) return uppercase ? 'A' : 'a';
    
    let result = '';
    let n = num - 1;
    
    do {
      const remainder = n % 26;
      result = String.fromCharCode((uppercase ? 65 : 97) + remainder) + result;
      n = Math.floor(n / 26) - 1;
    } while (n >= 0);
    
    return result || (uppercase ? 'A' : 'a');
  }

  /**
   * 数字转罗马数字
   * @param {number} num - 数字
   * @param {boolean} uppercase - 是否大写
   * @returns {string} 罗马数字表示
   */
  convertNumberToRoman(num, uppercase = true) {
    if (num <= 0) return uppercase ? 'I' : 'i';
    
    const romanNumerals = [
      { value: 1000, numeral: 'M' },
      { value: 900, numeral: 'CM' },
      { value: 500, numeral: 'D' },
      { value: 400, numeral: 'CD' },
      { value: 100, numeral: 'C' },
      { value: 90, numeral: 'XC' },
      { value: 50, numeral: 'L' },
      { value: 40, numeral: 'XL' },
      { value: 10, numeral: 'X' },
      { value: 9, numeral: 'IX' },
      { value: 5, numeral: 'V' },
      { value: 4, numeral: 'IV' },
      { value: 1, numeral: 'I' }
    ];
    
    let result = '';
    let remaining = num;
    
    for (const { value, numeral } of romanNumerals) {
      while (remaining >= value) {
        result += numeral;
        remaining -= value;
      }
    }
    
    return uppercase ? result : result.toLowerCase();
  }

  /**
   * 获取示例文本
   * @param {Object} options - 当前配置选项
   * @returns {string} 示例文本
   */
  getExampleText(options) {
    if (options.type === 'number') {
      return `This is the first line of text
Here is the second line with more content
Third line for demonstration purposes
Fourth line shows how line numbers work
Fifth and final example line`;
    } else if (options.type === 'letter') {
      return `First item in a list
Second item with some details
Third item for this example
Fourth item continues the pattern
Fifth item completes the set`;
    } else if (options.type === 'roman') {
      return `Introduction to the topic
Main argument development
Supporting evidence
Counterargument discussion
Conclusion and summary`;
    }
    return '';
  }
}

export default LineNumberService;