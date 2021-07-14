import invariant from 'invariant';

export function isValidCallback(handler) {
    invariant(
        typeof handler === 'function',
        'Must provide a valid callback'
    );
}

export function isObjectNonNull(object) {
    return object != null;
}
