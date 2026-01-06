type cacheEntry<T> = {
    value : T;
    timeStamp : number;
}

const cacheStore: Record<string, cacheEntry<any>> = {};

const cacheValidity = 30000 // 30 sec cache

export function getCache<T>(key:string): T | null {
    const now = Date.now();
    const entry = cacheStore[key]
    if(entry && now - entry.timeStamp > cacheValidity) {
        delete cacheStore[key];
        return null;
    }
    return entry ? entry.value : null
}

export function setCache<T>(key:string,value:T): string {
    cacheStore[key] = {
        value,
        timeStamp: Date.now()
    }
    return `Cache set for key: ${key}`;
}

export function invalidateCache(key:string) {
    if(key){
        delete cacheStore[key];
    }
}