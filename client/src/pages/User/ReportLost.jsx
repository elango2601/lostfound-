import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Camera, MapPin, Calendar, Tag, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import imageCompression from 'browser-image-compression';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon missing in Leaflet when bundled
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const ReportLost = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: '', category: 'Electronics', description: '', brand: '', color: '', location: '', dateLost: '', imageUrl: '', lat: null, lng: null
  });

  const LocationPicker = () => {
    useMapEvents({
      click(e) {
        setFormData(prev => ({ ...prev, lat: e.latlng.lat, lng: e.latlng.lng }));
      },
    });
    return formData.lat && formData.lng ? (
      <Marker position={[formData.lat, formData.lng]} />
    ) : null;
  };

  const categories = ['Electronics', 'Documents', 'Wallets', 'Keys', 'Bags', 'Clothing', 'Books', 'Jewellery', 'Others'];

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true
      };
      const compressedFile = await imageCompression(file, options);

      const data = new FormData();
      data.append('image', compressedFile);

      const res = await api.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData({ ...formData, imageUrl: res.data.imageUrl });
      toast.success('Image compressed & uploaded');
    } catch (error) {
      console.error(error);
      toast.error('Failed to process image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/lost', formData);
      toast.success('Lost item reported successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to report item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <Activity className="text-rose-500" size={32} /> Report Lost Item
        </h1>
        <p className="mt-2 text-gray-500">Provide as many details as possible to help our AI matching engine find your item.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Item Title <span className="text-rose-500">*</span></label>
              <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Blue iPhone 13 Pro with clear case" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category <span className="text-rose-500">*</span></label>
              <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><Calendar size={16} className="text-gray-400"/> Date Lost <span className="text-rose-500">*</span></label>
              <input type="date" required value={formData.dateLost} onChange={e => setFormData({...formData, dateLost: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition" />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><MapPin size={16} className="text-gray-400"/> Location Lost <span className="text-rose-500">*</span></label>
              <input type="text" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Main Library, 2nd Floor near computers" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition mb-4" />
              
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><MapPin size={16} className="text-gray-400"/> Pinpoint Location on Map (Optional)</label>
              <div className="h-64 w-full rounded-xl overflow-hidden border border-gray-200 relative z-0">
                <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationPicker />
                </MapContainer>
              </div>
              <p className="text-xs text-gray-500 mt-2">Click on the map to set a precise location to help the AI find nearby matches.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand (Optional)</label>
              <input type="text" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} placeholder="e.g. Apple, Northface" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color (Optional)</label>
              <input type="text" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} placeholder="e.g. Black, Silver" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition" />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Description <span className="text-rose-500">*</span></label>
              <textarea required rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe any unique features, scratches, stickers, or contents..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition resize-none"></textarea>
            </div>

            <div className="col-span-1 md:col-span-2">
               <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><Camera size={16} className="text-gray-400"/> Upload Image (Optional)</label>
               
               <input type="file" accept="image/*" id="imageUpload" className="hidden" onChange={handleImageUpload} />
               
               <label htmlFor="imageUpload" className={`border-2 border-dashed ${formData.imageUrl ? 'border-indigo-300 bg-indigo-50/50' : 'border-gray-300'} rounded-xl p-8 text-center hover:bg-gray-50 transition cursor-pointer flex flex-col items-center justify-center relative overflow-hidden`}>
                 {uploadingImage ? (
                   <span className="animate-pulse text-indigo-600 font-bold">Uploading to Cloudinary...</span>
                 ) : formData.imageUrl ? (
                   <div className="relative group w-full flex flex-col items-center">
                     <img src={formData.imageUrl} alt="Uploaded" className="h-32 object-contain rounded-lg shadow-sm mb-2" />
                     <p className="text-indigo-600 text-sm font-medium">Click to replace image</p>
                   </div>
                 ) : (
                   <>
                     <p className="text-gray-500 text-sm font-medium">Click to upload an image of the item</p>
                     <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                   </>
                 )}
               </label>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
            <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" disabled={loading} className="px-8 py-3 bg-rose-600 text-white rounded-xl font-bold shadow-md hover:bg-rose-700 hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2">
              {loading ? <span className="animate-pulse">Submitting...</span> : 'Submit Report'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ReportLost;
