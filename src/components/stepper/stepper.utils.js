export const debounce = (...args) => (callback, delay) => {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<typeof callback>) => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            callback(...args);
        }, delay);
    };
};

/**
 * High-order function which returns a sort method for arrays, intended to be used for `A-Z`.
 * @param property - Object property to be sorted
 */
export function sortObjectArrayAlphabetical<T>(property) {
    return function sort(first: T, second: T) {
        if (first[property] > second[property]) {
            return 1;
        }
        if (first[property] < second[property]) {
            return -1;
        }
        return 0;
    };
}

/**
 * Sort an array by another array, useful for ensuring dependencies are met, for example with requests and request IDs.
 */
export function sortArrayByAnother(result: string[], sorter: string[]) {
    return result.sort((first, second) => {
        return sorter.indexOf(first) - sorter.indexOf(second);
    });
}

/**
 *
 * @param total number to interate over
 * @param step number step between items in array
 * @returns generated list of numbers e.g. [0, 0.05, 0.1, 0.15, ..., 0.95, 1]
 */
export function generateArray(total: number, step: number) {
    const floats = step.toString().split('.')[1];
    const floats2 = floats ? floats.length : 0;
    return Array.from({ length: Math.ceil(total / step) + 1 }, (_, index) => parseFloat((index * step).toFixed(floats2)));
}
