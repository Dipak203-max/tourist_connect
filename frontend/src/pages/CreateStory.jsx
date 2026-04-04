import React, { useState } from 'react';
import { createStory } from '../api/storyApi';
import { useNavigate } from 'react-router-dom';

const CreateStory = () => {
    const [story, setStory] = useState({
        title: '',
        content: '',
        location: '',
        visibility: 'PUBLIC',
        mediaUrls: []
    });
    const [imageUrl, setImageUrl] = useState(''); // Temp state for adding adding one URL
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setStory({ ...story, [e.target.name]: e.target.value });
    };

    const handleAddImage = () => {
        if (imageUrl.trim()) {
            setStory({ ...story, mediaUrls: [...story.mediaUrls, imageUrl] });
            setImageUrl('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await createStory(story);
            navigate('/stories');
        } catch (err) {
            setError('Failed to create story.');
            console.error(err);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-surface-50 dark:bg-surface-900 shadow-md rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Share a Travel Story</h2>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 mb-1">Title</label>
                    <input
                        type="text"
                        name="title"
                        value={story.title}
                        onChange={handleChange}
                        required
                        className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="My Trip to Paris"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 mb-1">Location</label>
                    <input
                        type="text"
                        name="location"
                        value={story.location}
                        onChange={handleChange}
                        className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Paris, France"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 mb-1">Story Content</label>
                    <textarea
                        name="content"
                        value={story.content}
                        onChange={handleChange}
                        required
                        className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="5"
                        placeholder="Tell us about your experience..."
                    />
                </div>

                <div>
                    <label className="block text-gray-700 mb-1">Add Image URL</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="flex-1 border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://example.com/image.jpg"
                        />
                        <button
                            type="button"
                            onClick={handleAddImage}
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                        >
                            Add
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {story.mediaUrls.map((url, index) => (
                            <div key={index} className="relative w-20 h-20">
                                <img src={url} alt="Preview" className="w-full h-full object-cover rounded" />
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-gray-700 mb-1">Visibility</label>
                    <select
                        name="visibility"
                        value={story.visibility}
                        onChange={handleChange}
                        className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="PUBLIC">Public</option>
                        <option value="FRIENDS_ONLY">Friends Only</option>
                        <option value="PRIVATE">Private</option>
                    </select>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/stories')}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                    >
                        Post Story
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateStory;
