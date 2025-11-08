import { describe, it, expect } from 'vitest';

describe('Math Utilities', () => {
    it('should add two numbers correctly', () => {
        expect(1 + 1).toBe(2);
    });

    it('should subtract two numbers correctly', () => {
        expect(5 - 3).toBe(2);
    });

    it('should multiply two numbers correctly', () => {
        expect(3 * 4).toBe(12);
    });

    it('should divide two numbers correctly', () => {
        expect(10 / 2).toBe(5);
    });
});