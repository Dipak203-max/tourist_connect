import React, { useState } from 'react';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';

export default function StarRating({ rating = 0, setRating, readOnly = false, size = "h-5 w-5" }) {
    const [hoverRating, setHoverRating] = useState(0);

    const handleMouseEnter = (index) => {
        if (!readOnly) {
            setHoverRating(index);
        }
    };

    const handleMouseLeave = () => {
        if (!readOnly) {
            setHoverRating(0);
        }
    };

    const handleClick = (index) => {
        if (!readOnly && setRating) {
            setRating(index);
        }
    };

    return (
        <div className="flex">
            {[1, 2, 3, 4, 5].map((index) => {
                const filled = index <= (hoverRating || rating);
                const Icon = filled ? StarIconSolid : StarIconOutline;

                return (
                    <Icon
                        key={index}
                        className={`${size} transition-all duration-200 transform ${filled ? 'text-yellow-400 scale-110' : 'text-gray-300'} ${!readOnly ? 'cursor-pointer hover:scale-125' : ''}`}
                        onMouseEnter={() => handleMouseEnter(index)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => handleClick(index)}
                    />
                );
            })}
        </div>
    );
}
