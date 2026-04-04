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
