import { debounce, generateArray, sortArrayByAnother, sortObjectArrayAlphabetical } from "./stepper.utils";

describe('debounce', () => {
    it('should execute the callback once after the delay', () => {
        jest.useFakeTimers();
        const callback = jest.fn();
        const delay = 500;
        const debouncedFunc = debounce(callback, delay);
        debouncedFunc();
        expect(callback).not.toHaveBeenCalled();
        jest.advanceTimersByTime(delay);
        expect(callback).toBeCalledTimes(1);
    });
});

// import { generateArray, sortArrayByAnother, sortObjectArrayAlphabetical } from './array';

describe('Utils Array', () => {
  describe('generateArray', () => {
    it('should generate array of numbers with provided step', () => {
      const actual = generateArray(1, 0.05);
      expect(actual[0]).toEqual(0);
      expect(actual[1]).toEqual(0.05);
      expect(actual[2]).toEqual(0.1);
      expect(actual[actual.length - 2]).toEqual(0.95);
      expect(actual[actual.length - 1]).toEqual(1);
    });
  });

  describe('sortObjectArrayAlphabetical', () => {
    const objectsToSort = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
      { name: 'Charlie', age: 40 },
      { name: 'Dave', age: 20 },
      { name: 'Eve', age: 35 },
    ];

    it('should sort objects alphabetically by name', () => {
      const expected = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
        { name: 'Charlie', age: 40 },
        { name: 'Dave', age: 20 },
        { name: 'Eve', age: 35 },
      ];
      const actual = objectsToSort.slice().sort(sortObjectArrayAlphabetical('name'));
      expect(actual).toEqual(expected);
    });

    it('should sort objects alphabetically by name (reversed)', () => {
      const expected = [
        { name: 'Eve', age: 35 },
        { name: 'Dave', age: 20 },
        { name: 'Charlie', age: 40 },
        { name: 'Bob', age: 25 },
        { name: 'Alice', age: 30 },
      ];
      const actual = objectsToSort.slice().sort(sortObjectArrayAlphabetical('name')).reverse();
      expect(actual).toEqual(expected);
    });

    it('should sort objects alphabetically by age', () => {
      const expected = [
        { name: 'Dave', age: 20 },
        { name: 'Bob', age: 25 },
        { name: 'Alice', age: 30 },
        { name: 'Eve', age: 35 },
        { name: 'Charlie', age: 40 },
      ];
      const actual = objectsToSort.slice().sort(sortObjectArrayAlphabetical('age'));
      expect(actual).toEqual(expected);
    });

    it('should sort objects alphabetically by age (reversed)', () => {
      const expected = [
        { name: 'Charlie', age: 40 },
        { name: 'Eve', age: 35 },
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
        { name: 'Dave', age: 20 },
      ];
      const actual = objectsToSort.slice().sort(sortObjectArrayAlphabetical('age')).reverse();
      expect(actual).toEqual(expected);
    });

    it('should sort an array of objects alphabetically based on a property', () => {
      const people = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
        { name: 'Charlie', age: 20 },
      ];

      const actual = people.sort(sortObjectArrayAlphabetical('name'));

      expect(actual).toEqual(people);
    });
  });

  describe('sortArrayByAnother', () => {
    it('should sort an array according to another array', () => {
      const result = ['a', 'b', 'c', 'd', 'e'];
      const sorter = ['d', 'b', 'e', 'a', 'c'];
      const expected = ['d', 'b', 'e', 'a', 'c'];
      const actual = sortArrayByAnother(result, sorter);
      expect(actual).toEqual(expected);
    });

    it('should handle duplicate values in the result array', () => {
      const result = ['a', 'b', 'c', 'd', 'e', 'a'];
      const sorter = ['d', 'b', 'e', 'a', 'c'];
      const expected = ['d', 'b', 'e', 'a', 'a', 'c'];
      const actual = sortArrayByAnother(result, sorter);
      expect(actual).toEqual(expected);
    });

    it('should handle duplicate values in the sorter array', () => {
      const result = ['a', 'b', 'c', 'd', 'e'];
      const sorter = ['d', 'b', 'e', 'a', 'c', 'd', 'b', 'e', 'a', 'c'];
      const expected = ['d', 'b', 'e', 'a', 'c'];
      const actual = sortArrayByAnother(result, sorter);
      expect(actual).toEqual(expected);
    });

    it('should handle empty arrays', () => {
      const result: string[] = [];
      const sorter: string[] = [];
      const expected: string[] = [];
      const actual = sortArrayByAnother(result, sorter);
      expect(actual).toEqual(expected);
    });
  });
});
