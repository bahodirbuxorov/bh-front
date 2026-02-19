export function formatCurrency(amount: number, currency = 'UZS'): string {
    if (currency === 'UZS') {
        return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('uz-UZ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export function formatNumber(num: number): string {
    return new Intl.NumberFormat('uz-UZ').format(num);
}

export function cn(...classes: (string | undefined | false | null)[]): string {
    return classes.filter(Boolean).join(' ');
}

export function generateId(): string {
    return Math.random().toString(36).substring(2, 9);
}

export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}
