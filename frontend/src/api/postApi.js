import axiosInstance from './axiosConfig';

export const createPost = async (formData) => {
    const res = await axiosInstance.post('/posts', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return res.data;
};

export const getFeed = async () => {
    const res = await axiosInstance.get('/posts/feed');
    return res.data;
};

export const getUserPosts = async (userId) => {
    const res = await axiosInstance.get(`/posts/user/${userId}`);
    return res.data;
};
export const getUserMediaPosts = async (userId, type) => {
    const res = await axiosInstance.get(`/posts/user/${userId}/media?type=${type}`);
    return res.data;
};

export const toggleLike = async (postId) => {
    const res = await axiosInstance.post(`/posts/${postId}/like`);
    return res.data;
};

export const addComment = async (postId, content) => {
    const res = await axiosInstance.post(`/posts/${postId}/comments`, content, {
        headers: {
            'Content-Type': 'text/plain'
        }
    });
    return res.data;
};

export const deletePost = async (postId) => {
    const res = await axiosInstance.delete(`/posts/${postId}`);
    return res.data;
};
