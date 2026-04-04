import axiosInstance from './axiosInstance';

/**
 * API service for management of user favorites.
 */
export const favoriteApi = {
    /**
     * Add an item to favorites.
     * @param {number|string} itemId 
     * @param {string} itemType 
     */
    addFavorite: (itemId, itemType) =>
        axiosInstance.post('/favorites', { itemId, itemType }),

    /**
     * Remove an item from favorites.
     * @param {number|string} itemId 
     * @param {string} itemType 
     */
    removeFavorite: (itemId, itemType) =>
        axiosInstance.delete('/favorites', {
            data: { itemId, itemType }
        }),

    /**
     * Get all favorites for the current user.
     */
    getMyFavorites: () =>
        axiosInstance.get('/favorites/my'),

    /**
     * Check if an item is already a favorite.
     * @param {number|string} itemId 
     * @param {string} itemType 
     */
    checkFavorite: (itemId, itemType) =>
        axiosInstance.get('/favorites/check', {
            params: { itemId, itemType }
        })
};

export default favoriteApi;
