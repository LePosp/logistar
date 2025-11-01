export function prng(s){s=s%2147483647;if(s<=0)s+=2147483646;return()=>s=s*16807%2147483647;} export const r01=n=>n()/2147483647;
