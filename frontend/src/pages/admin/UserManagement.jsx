import React, { useState, useEffect } from 'react';
import { 
    Users, 
    Search, 
    UserX, 
    UserCheck, 
    Trash2, 
    Shield, 
    MapPin,
    Mail,
    Phone
} from 'lucide-react';
import adminApi from '../../api/adminApi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await adminApi.getUsers();
            setUsers(res.data);
        } catch (e) {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleBlock = async (user) => {
        const action = user.blocked ? 'unblock' : 'block';
        try {
            if (user.blocked) {
                await adminApi.unblockUser(user.id);
            } else {
                await adminApi.blockUser(user.id);
            }
            toast.success(`User ${action}ed successfully`);
            fetchUsers();
        } catch (e) {
            toast.error(`Failed to ${action} user`);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to PERMANENTLY delete this user?')) return;
        try {
            await adminApi.deleteUser(id);
            toast.success('User deleted successfully');
            fetchUsers();
        } catch (e) {
            toast.error('Failed to delete user');
        }
    };

    const filteredUsers = users.filter(user => 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleStyles = (role) => {
        switch (role) {
            case 'ADMIN': return 'bg-purple-50 text-purple-600 border-purple-100';
            case 'GUIDE': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'TOURIST': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            default: return 'bg-surface-100 dark:bg-surface-800 text-gray-500 border-surface-200 dark:border-surface-700';
        }
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-surface-900 dark:text-surface-100 tracking-tight mb-2">
                        User Management
                    </h1>
                    <p className="text-sm font-bold text-muted uppercase tracking-widest">
                        Manage platform access and permissions
                    </p>
                </div>

                <div className="relative group w-full md:w-96">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-indigo-600 transition-colors" />
                    <input 
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-[2rem] text-sm font-bold text-surface-900 dark:text-surface-100 shadow-sm focus:shadow-xl focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
                    />
                </div>
            </div>

            {/* User Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {loading ? (
                    <div className="col-span-full py-40 flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : filteredUsers.map((user) => (
                    <div key={user.id} className="bg-surface-50 dark:bg-surface-900 p-8 rounded-[2.5rem] border border-surface-200 dark:border-surface-700 shadow-sm hover:shadow-xl transition-all duration-500 group flex flex-col md:flex-row gap-8">
                        {/* Avatar & Basic Info */}
                        <div className="flex-shrink-0 flex flex-col items-center gap-4">
                            <div className="w-24 h-24 rounded-[2rem] bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                                {user.profileImageUrl ? (
                                    <img src={user.profileImageUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="font-black text-gray-300">
                                        {(user.fullName || user.email || 'U')[0].toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getRoleStyles(user.role)}`}>
                                {user.role}
                            </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-xl font-black text-surface-900 dark:text-surface-100 tracking-tight mb-1 group-hover:text-indigo-600 transition-colors">
                                        {user.fullName || user.username || 'Unnamed User'}
                                    </h3>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2 text-muted">
                                            <Mail className="w-3 h-3" />
                                            <span className="text-xs font-bold">{user.email}</span>
                                        </div>
                                        {user.phoneNumber && (
                                            <div className="flex items-center gap-2 text-muted">
                                                <Phone className="w-3 h-3" />
                                                <span className="text-xs font-bold">{user.phoneNumber}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${user.blocked ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                    {user.blocked ? 'Blocked' : 'Active'}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-gray-50 mt-auto">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                                    Joined: {user.createdAt ? format(new Date(user.createdAt), 'MMM yyyy') : 'N/A'}
                                </span>
                                <div className="ml-auto flex gap-2">
                                    {user.role !== 'ADMIN' && (
                                        <>
                                            <button 
                                                onClick={() => handleBlock(user)}
                                                className={`p-3 rounded-2xl border transition-all active:scale-90 ${
                                                    user.blocked 
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' 
                                                    : 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100'
                                                }`}
                                                title={user.blocked ? 'Unblock' : 'Block'}
                                            >
                                                {user.blocked ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(user.id)}
                                                className="p-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl hover:bg-rose-100 transition-all active:scale-90"
                                                title="Delete User"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {!loading && filteredUsers.length === 0 && (
                <div className="py-20 text-center opacity-30">
                    <UserX className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-sm font-black uppercase tracking-widest">No users found</p>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
