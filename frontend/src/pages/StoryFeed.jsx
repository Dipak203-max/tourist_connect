import React, { useState, useEffect } from 'react';
import { getPublicFeed } from '../api/storyApi';
import { Link } from 'react-router-dom';

const StoryFeed = () => {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStories();
    }, []);

    const loadStories = async () => {
        try {
            const data = await getPublicFeed();
            setStories(data);
        } catch (err) {
            console.error("Failed to load stories", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center mt-10">Loading stories...</div>;

    return (
        <div className="max-w-4xl mx-auto mt-10 p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Travel Stories</h2>
                <Link to="/stories/create" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Share Your Story
                </Link>
            </div>

            {stories.length === 0 ? (
                <p className="text-gray-600 text-center">No stories shared yet. Be the first!</p>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {stories.map(story => (
                        <div key={story.id} className="bg-surface-50 dark:bg-surface-900 shadow-md rounded-lg overflow-hidden border">
                            {story.mediaUrls && story.mediaUrls.length > 0 && (
                                <img
                                    src={story.mediaUrls[0]}
                                    alt={story.title}
                                    className="w-full h-48 object-cover"
                                />
                            )}
                            <div className="p-4">
                                <h3 className="text-xl font-semibold mb-2">{story.title}</h3>
                                <p className="text-gray-600 text-sm mb-2">By {story.authorName} • {story.location}</p>
                                <p className="text-gray-700 line-clamp-3">{story.content}</p>
                                <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                                    <span>{new Date(story.createdAt).toLocaleDateString()}</span>
                                    <span>{story.likes} Likes</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StoryFeed;
