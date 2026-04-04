/**
 * Request Manager for Axios Deduplication
 * Prevents identical concurrent GET requests.
 */
class RequestManager {
    constructor() {
        this.pendingRequests = new Map(); // key -> promise
    }

    getCacheKey(config) {
        const { method, url, params, data } = config;
        return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`;
    }

    addRequest(config, requestCreator) {
        // Only deduplicate GET requests to avoid breaking POST/PUT/DELETE side effects
        if (config.method.toLowerCase() !== 'get') {
            return requestCreator();
        }

        const key = this.getCacheKey(config);

        if (this.pendingRequests.has(key)) {
            console.log(`[Deduplicator] Reusing pending request for: ${config.url}`);
            return this.pendingRequests.get(key);
        }

        const promise = requestCreator().finally(() => {
            this.pendingRequests.delete(key);
        });

        this.pendingRequests.set(key, promise);
        return promise;
    }
}

const instance = new RequestManager();
export default instance;
