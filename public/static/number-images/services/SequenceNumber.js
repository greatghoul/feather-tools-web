class SequenceNumber {
    generateNumber(numberType, number) {
        if (numberType === 'letter') {
            return this.numberToLetter(number);
        } else {
            return this.numberToText(number);
        }
    }
    
    numberToLetter(number) {
        if (number <= 0) return '';
        
        const remainder = number % 26 || 26;
        const letter = String.fromCharCode(64 + remainder);
        const quotient = Math.floor((number - 1) / 26);
        
        return this.numberToLetter(quotient) + letter;
    }
    
    numberToText(number) {
        return number.toString();
    }
}

export default SequenceNumber;