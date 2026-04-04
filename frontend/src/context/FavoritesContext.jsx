import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import favoriteApi from '../api/favoriteApi';
import AuthContext from './AuthContext';
import { toast } from 'react-hot-toast';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pendingOps, setPendingOps] = useState(new Set()); 
    const isRefreshing = useRef(false);

    const refreshFavorites = useCallback(async () => {
        if (!user) {
            setFavorites([]);
            return;
        }

        if (isRefreshing.current) return;
        isRefreshing.current = true;

        try {
            setLoading(true);
            const response = await favoriteApi.getMyFavorites();
            setFavorites(response.data);
        } catch (error) {
            console.error("Failed to fetch favorites:", error);
        } finally {
            setLoading(false);
            isRefreshing.current = false;
        }
    }, [user?.id]); 

    useEffect(() => {
        refreshFavorites();
    }, [refreshFavorites]);

    const isFavorite = useCallback((itemId, itemType) => {
        return favorites.some(fav => String(fav.itemId) === String(itemId) && fav.itemType === itemType);
    }, [favorites]);

    const toggleFavorite = async (itemId, itemType) => {
        const opKey = `${itemType}:${itemId}`;

        // 1. Prevent duplicate calls if already pending
        if (pendingOps.has(opKey)) {
            console.log(`Operation for ${opKey} is already in progress.`);
            return;
        }

        // 2. Determine current state
        const currentlyFavorite = isFavorite(itemId, itemType);

        // 3. Mark as pending
        setPendingOps(prev => new Set(prev).add(opKey));

        // 4. Optimistic Update
        const previousFavorites = [...favorites];
        if (currentlyFavorite) {
            setFavorites(prev => prev.filter(fav => !(String(fav.itemId) === String(itemId) && fav.itemType === itemType)));
        } else {
           
            setFavorites(prev => [...prev, { itemId, itemType, id: `temp-${Date.now()}` }]);
        }

        try {
            if (currentlyFavorite) {
                await favoriteApi.removeFavorite(itemId, itemType);
                toast.success("Removed from favorites");
            } else {
                await favoriteApi.addFavorite(itemId, itemType);
                toast.success("Added to favorites");
            }
        } catch (error) {
            const status = error.response?.status;

            // 5. Handle 409 Conflict gracefully
            if (status === 409) {
                console.warn(`409 Conflict: ${itemType}:${itemId} state mismatch. Syncing...`);
               
                await refreshFavorites();
            } else {
                // Revert on real errors
                setFavorites(previousFavorites);
                console.error("Favorite toggle failed:", error);
                const msg = error.response?.data?.message || "Something went wrong";
                toast.error(msg);
            }
        } finally {
            // 6. Release lock
            setPendingOps(prev => {
                const next = new Set(prev);
                next.delete(opKey);
                return next;
            });
        }
    };

    return (
        <FavoritesContext.Provider value={{
            favorites,
            loading,
            refreshFavorites,
            toggleFavorite,
            isFavorite,
            isPending: (itemId, itemType) => pendingOps.has(`${itemType}:${itemId}`),
            favoriteCount: favorites.length
        }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};

export default FavoritesContext;
