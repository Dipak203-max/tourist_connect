import React, { useState } from 'react';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useFavorites } from '../../context/FavoritesContext';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { useContext } from 'react';

/**
 * Reusable Favorite Button with global state synchronization.
 */
const FavoriteButton = ({ itemId, itemType, className = "", size = "w-6 h-6", onToggle }) => {
    const { isFavorite, toggleFavorite, isPending } = useFavorites();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const favorite = isFavorite(itemId, itemType);
    const loading = isPending(itemId, itemType);

    const handleToggle = async (e) => {
        e.stopPropagation();
        e.preventDefault();

        if (loading) return;

        if (!user) {
            navigate('/login');
            return;
        }

        try {
            await toggleFavorite(itemId, itemType);
            if (onToggle) onToggle(!favorite);
        } catch (error) {
            // Errors are handled in context
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`transition-all duration-300 transform active:scale-90 hover:scale-110 p-1.5 rounded-full ${favorite
                ? 'bg-red-50 text-red-500'
                : 'bg-surface-100 dark:bg-surface-800 text-muted hover:text-red-400'
                } ${className} ${loading ? 'opacity-50 pointer-events-none' : ''}`}
            title={favorite ? "Remove from favorites" : "Add to favorites"}
        >
            {favorite ? (
                <HeartSolid className={`${size} animate-heartPop`} />
            ) : (
                <HeartOutline className={`${size}`} />
            )}
        </button>
    );
};

export default FavoriteButton;
