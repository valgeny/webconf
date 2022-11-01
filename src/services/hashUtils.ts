import { murmur3 } from 'murmurhash-js';

const SEED = 1234

/**
 * Best approach: Use a hash function
 */
export const hashEncode = (input: string): string => {
    const key = input.toLowerCase();
    const hash = murmur3(key, SEED);
    console.log("Generated Hash", hash)
    return String(hash).padStart(10, '0');
}


/**
 * Non Optimal: Code the hash function yourself
 * Note: 
 * This one is very unbalanced, characters will be distributed inequally
 * and response will be dependent of the input length
 */
export const encode_1 = (input: string): string => {
    const key = input.toLowerCase();
    let sum = 0
    for(let i = 0; i < key.length; i++){
        let code = key.charCodeAt(i);
        sum+=code;
    }
    return String(sum).padStart(10, '0');
}

/**
 * Non Optimal: Code the hash function yourself
 * Note: 
 * Still not optinal
 */
 export const encode_2 = (input: string): string => {
    const key = input.toLowerCase();
    let sum = SEED
    for(let i = 0; i < key.length; i++){
        let code = key.charCodeAt(i);
        sum=(sum*code)%(10**11);
    }
    return String(sum).padStart(10, '0');
}
