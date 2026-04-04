import { openDB } from 'idb';

const DB_NAME = 'tourist-connect-offline';
const STORE_NAME_ITINERARIES = 'itineraries';
const STORE_NAME_DESTINATIONS = 'destinations';

const initDB = async () => {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME_ITINERARIES)) {
                db.createObjectStore(STORE_NAME_ITINERARIES, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(STORE_NAME_DESTINATIONS)) {
                db.createObjectStore(STORE_NAME_DESTINATIONS, { keyPath: 'id' });
            }
        },
    });
};

export const offlineDb = {
    // Save or update an itinerary
    saveItinerary: async (itinerary) => {
        const db = await initDB();
        return db.put(STORE_NAME_ITINERARIES, itinerary);
    },

    // Get an itinerary by ID
    getItinerary: async (id) => {
        const db = await initDB();
        return db.get(STORE_NAME_ITINERARIES, Number(id));
    },

    // Get all saved itineraries
    getAllItineraries: async () => {
        const db = await initDB();
        return db.getAll(STORE_NAME_ITINERARIES);
    },

    // Delete an itinerary
    deleteItinerary: async (id) => {
        const db = await initDB();
        return db.delete(STORE_NAME_ITINERARIES, Number(id));
    },

    // Save or update a destination
    saveDestination: async (destination) => {
        const db = await initDB();
        return db.put(STORE_NAME_DESTINATIONS, destination);
    },

    // Get a destination by ID
    getDestination: async (id) => {
        const db = await initDB();
        return db.get(STORE_NAME_DESTINATIONS, Number(id));
    },

    // Get all cached destinations
    getAllDestinations: async () => {
        const db = await initDB();
        return db.getAll(STORE_NAME_DESTINATIONS);
    }
};
