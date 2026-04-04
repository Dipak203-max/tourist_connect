import React from 'react';

const Avatar = ({ src, alt, size = "md", className = "" }) => {
    const [error, setError] = React.useState(false);

    const sizeClasses = {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-16 h-16 text-lg",
        xl: "w-24 h-24 text-xl"
    };

    const initials = alt ? alt.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?';

    if (error || !src) {
        return (
            <div className={`${sizeClasses[size]} ${className} rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold border border-blue-200`}>
                {initials}
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={`${sizeClasses[size]} ${className} rounded-full object-cover border border-gray-200`}
            onError={() => setError(true)}
        />
    );
};

export default Avatar;
