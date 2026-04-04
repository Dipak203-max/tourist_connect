import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { getMyGuideProfile, updateGuideProfile } from '../api/guideApi';
import { Button, Card, Input } from '../components/ui/BaseComponents';
import { Save, Camera, Plus, X, Globe, DollarSign, Award, Clock, Phone, Mail, Info, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import PageLoader from '../components/common/PageLoader';

const GuideProfileEdit = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        specialization: '',
        experienceYears: 0,
        languages: [],
        price: 0,
        bio: '',
        certifications: [],
        responseTime: 'Within 1 hour',
        phoneNumber: '',
        email: '',
        coverImageUrl: '',
        galleryImages: [],
        city: '',
        country: '',
        available: true
    });

    const [newCert, setNewCert] = useState('');
    const [newLang, setNewLang] = useState('');
    const [newGalleryUrl, setNewGalleryUrl] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getMyGuideProfile();
                setFormData({
                    ...data,
                    languages: data.languages || [],
                    certifications: data.certifications || [],
                    galleryImages: data.galleryImages || []
                });
            } catch (error) {
                console.error("Failed to fetch profile", error);
                toast.error("Failed to load profile data.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value)
        }));
    };

    const handleAddList = (field, value, setValue) => {
        if (!value.trim()) return;
        if (formData[field].includes(value.trim())) {
            toast.error("Already exists in the list.");
            return;
        }
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], value.trim()]
        }));
        setValue('');
    };

    const handleRemoveList = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateGuideProfile(formData);
            toast.success("Profile updated successfully!");
            navigate(`/guide/profile`);
        } catch (error) {
            console.error("Update failed", error);
            toast.error("Failed to update profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <PageLoader />;

    return (
        <div className="min-h-screen app-bg pb-20 pt-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-surface-900 dark:text-white uppercase tracking-tight">Edit Guide Profile</h1>
                        <p className="text-muted font-medium italic">Shape how travelers see your expertise.</p>
                    </div>
                    <Button 
                        onClick={handleSubmit} 
                        isLoading={saving}
                        className="rounded-2xl px-8 h-14 gap-2 shadow-xl shadow-primary-200 dark:shadow-none"
                    >
                        <Save className="w-5 h-5" />
                        Save Changes
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Media Section */}
                    <Card className="p-8">
                        <h3 className="text-lg font-black text-surface-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                            <Camera className="w-5 h-5 text-primary-500" /> Professional Media
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-surface-400 uppercase tracking-widest mb-2">Cover Image URL</label>
                                <div className="flex gap-4">
                                    <Input 
                                        name="coverImageUrl"
                                        value={formData.coverImageUrl}
                                        onChange={handleChange}
                                        placeholder="https://images.unsplash.com/..."
                                        className="flex-1"
                                    />
                                </div>
                                {formData.coverImageUrl && (
                                    <div className="mt-4 h-40 w-full rounded-2xl overflow-hidden border border-surface-100 dark:border-surface-800">
                                        <img src={formData.coverImageUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-black text-surface-400 uppercase tracking-widest mb-2">Portfolio Gallery</label>
                                <div className="flex gap-2 mb-4">
                                    <Input 
                                        value={newGalleryUrl}
                                        onChange={(e) => setNewGalleryUrl(e.target.value)}
                                        placeholder="Add image URL to gallery..."
                                        className="flex-1"
                                    />
                                    <Button type="button" variant="secondary" onClick={() => handleAddList('galleryImages', newGalleryUrl, setNewGalleryUrl)}>
                                        <Plus className="w-5 h-5" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {formData.galleryImages.map((img, i) => (
                                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden border dark:border-surface-800 group">
                                            <img src={img} className="w-full h-full object-cover" alt="Gallery item" />
                                            <button 
                                                type="button"
                                                onClick={() => handleRemoveList('galleryImages', i)}
                                                className="absolute top-2 right-2 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Basic Expertise */}
                    <Card className="p-8">
                        <h3 className="text-lg font-black text-surface-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                            <Award className="w-5 h-5 text-primary-500" /> Expertise & Rates
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black text-surface-400 uppercase tracking-widest mb-2">Primary Specialization</label>
                                <Input 
                                    name="specialization"
                                    value={formData.specialization}
                                    onChange={handleChange}
                                    placeholder="e.g. Mountaineering Expert"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-surface-400 uppercase tracking-widest mb-2">Years of Experience</label>
                                <Input 
                                    type="number"
                                    name="experienceYears"
                                    value={formData.experienceYears}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-surface-400 uppercase tracking-widest mb-2">Base Rate (USD per person)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                                    <Input 
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-surface-400 uppercase tracking-widest mb-2">Average Response Time</label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                                    <select 
                                        name="responseTime"
                                        value={formData.responseTime}
                                        onChange={handleChange}
                                        className="w-full h-[54px] pl-10 pr-4 bg-surface-50 dark:bg-surface-800 border-none rounded-2xl font-bold focus:ring-2 focus:ring-primary-500/20 text-surface-900 dark:text-white appearance-none"
                                    >
                                        <option>Within 1 hour</option>
                                        <option>Within 3 hours</option>
                                        <option>Within 12 hours</option>
                                        <option>Same day</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Bio and Certs */}
                    <Card className="p-8">
                        <h3 className="text-lg font-black text-surface-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                            <Info className="w-5 h-5 text-primary-500" /> About & Credentials
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-surface-400 uppercase tracking-widest mb-2">Professional Bio</label>
                                <textarea 
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-surface-50 dark:bg-surface-800 border-none rounded-2xl font-bold focus:ring-2 focus:ring-primary-500/20 text-surface-900 dark:text-white min-h-[150px] resize-none"
                                    placeholder="Tell potential tourists about your passion and expertise..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-surface-400 uppercase tracking-widest mb-2">Certifications & Licenses</label>
                                <div className="flex gap-2 mb-4">
                                    <Input 
                                        value={newCert}
                                        onChange={(e) => setNewCert(e.target.value)}
                                        placeholder="e.g. First Aid Level 3"
                                        className="flex-1"
                                    />
                                    <Button type="button" variant="secondary" onClick={() => handleAddList('certifications', newCert, setNewCert)}>
                                        <Plus className="w-5 h-5" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.certifications.map((cert, i) => (
                                        <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-bold text-xs rounded-xl border border-primary-100 dark:border-primary-800/50">
                                            {cert}
                                            <X className="w-3 h-3 cursor-pointer" onClick={() => handleRemoveList('certifications', i)} />
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-surface-400 uppercase tracking-widest mb-2">Languages Spoken</label>
                                <div className="flex gap-2 mb-4">
                                    <Input 
                                        value={newLang}
                                        onChange={(e) => setNewLang(e.target.value)}
                                        placeholder="e.g. Spanish"
                                        className="flex-1"
                                    />
                                    <Button type="button" variant="secondary" onClick={() => handleAddList('languages', newLang, setNewLang)}>
                                        <Plus className="w-5 h-5" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.languages.map((lang, i) => (
                                        <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                                            {lang}
                                            <X className="w-3 h-3 cursor-pointer" onClick={() => handleRemoveList('languages', i)} />
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Contact & Location */}
                    <Card className="p-8">
                        <h3 className="text-lg font-black text-surface-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                            <Phone className="w-5 h-5 text-primary-500" /> Contact Info
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black text-surface-400 uppercase tracking-widest mb-2">Public Contact Number</label>
                                <Input 
                                    name="phoneNumber"
                                    value={formData.phoneNumber === 'null' ? '' : formData.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="+977 98..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-surface-400 uppercase tracking-widest mb-2">Business Email</label>
                                <Input 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="your@email.com"
                                    disabled
                                />
                                <p className="mt-1 text-[10px] font-bold text-surface-400 italic">Email can only be changed via security settings.</p>
                            </div>
                        </div>
                    </Card>
                </form>
            </div>
        </div>
    );
};

export default GuideProfileEdit;
