export function prng(seed){ let s=seed%2147483647; if(s<=0)s+=2147483646; return()=>s=s*16807%2147483647; }
export function rand01(next){ return next()/2147483647; }
