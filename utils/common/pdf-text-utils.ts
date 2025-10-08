/**
 * Clean text for PDF generation - removes problematic characters and emojis
 */
export function cleanTextForPDF(text: string): string {
    if (!text || typeof text !== 'string') {
        return '';
    }

    return text

        .replace(/&b/g, '')
        .replace(/∅=Y/g, 'Diameter=Y')
        .replace(/∅/g, 'Diameter')

        .replace(/[\u2600-\u26FF]/g, '')
        .replace(/[\u2700-\u27BF]/g, '')
        .replace(/[\u1F300-\u1F5FF]/g, '')
        .replace(/[\u1F600-\u1F64F]/g, '')
        .replace(/[\u1F680-\u1F6FF]/g, '')
        .replace(/[\u1F1E0-\u1F1FF]/g, '')

        .replace(/[^\x20-\x7E\u00A0-\u00FF\u0100-\u017F\u0180-\u024F]/g, '')

        .replace(/\s+/g, ' ')

        .trim();
}


export function cleanTableText(text: string, maxLength: number = 50): string {
    const cleaned = cleanTextForPDF(text);

    if (cleaned.length <= maxLength) {
        return cleaned;
    }

    return cleaned.substring(0, maxLength - 3) + '...';
}


export function formatDateForPDF(dateString: string): string {
    try {
        if (!dateString || dateString === 'N/A') {
            return 'N/A';
        }

        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }

        return date.toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch {
        return 'N/A';
    }
}


export function formatNumberForPDF(num: number, decimals: number = 1): string {
    try {
        if (typeof num !== 'number' || isNaN(num)) {
            return '0';
        }

        return num.toFixed(decimals);
    } catch {
        return '0';
    }
}
