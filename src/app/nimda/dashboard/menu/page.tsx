"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useMenuItems } from "@/hooks/useMenuItems";
import { MenuItem } from "@/hooks/useMenuItems";
import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import { MinimalToggle } from '@/components/ui/toggle';
import { supabase } from '@/integrations/supabase/client';
import './menu-toggle-override.css';
import { useQueryClient } from '@tanstack/react-query';

export default function MenuPage() {
  const queryClient = useQueryClient();
  const { menuItems, loading, error, categories } = useMenuItems();
  const router = useRouter();
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [rows, setRows] = useState<MenuItem[]>([]);
  const [changedRows, setChangedRows] = useState<Record<number, Partial<MenuItem>>>({});
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: '', description: '', price: '', isvegetarian: false,
    isspicy: false, category: categories[0] || '', menu_img: '', square_variation_id: '', sold_out: false
  });
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [modalItemId, setModalItemId] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  useEffect(() => {
    const sortedRows = [...menuItems].sort((a, b) => a.id - b.id);
    setRows(sortedRows);
    setChangedRows({});
  }, [menuItems]);

  const handleFieldChange = useCallback((id: number, field: keyof MenuItem, value: any) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    setChangedRows(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: value }
    }));
  }, []);

  async function saveChanges() {
    const updates = Object.entries(changedRows).map(async ([id, changes]) => {
      await fetch('/api/menu', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: Number(id), ...changes })
      });
    });
    await Promise.all(updates);
    setModalOpen(false);
    setChangedRows({});
    queryClient.invalidateQueries({ queryKey: ['menuItems'] });
  }

  return (
    <div className="mt-10">
      <div className="relative mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2">
        <div className="sm:absolute sm:left-4 flex items-center">
          <button
            className="flex items-center gap-2 text-black text-lg px-4 py-2 rounded transition-colors duration-200 hover:text-desi-orange active:text-desi-orange"
            onClick={() => router.push('/nimda/dashboard')}
          >
            <FiArrowLeft className="inline-block w-6 h-6" />
            <span className="font-semibold">Back</span>
          </button>
        </div>
        <h1 className="text-5xl font-bold font-display text-center w-full">Menu Management</h1>
      </div>
      {error && <div className="text-red-500 mb-2">Error: {error}</div>}
      {loading && <div className="mb-2">Loading...</div>}

      <div className="relative mb-4 h-10 px-6">
        {Object.entries(changedRows).some(([id, changes]) => {
          const original = menuItems.find(item => item.id === Number(id));
          if (!original) return false;
          return Object.entries(changes).some(([field, value]) => original[field as keyof MenuItem] !== value);
        }) && (
          <button
            className="absolute left-1/2 top-0 transform -translate-x-1/2 px-4 py-2 bg-gray-200 text-black rounded"
            onClick={() => setModalOpen(true)}
          >
            Save Changes
          </button>
        )}
        {selectedRows.length === 0 ? (
          <button
            className="absolute right-0 px-4 py-2 bg-desi-orange text-white rounded transition-colors duration-200"
            onClick={() => setAddModalOpen(true)}
          >
            Add New Item
          </button>
        ) : (
          <button
            className="absolute right-0 px-4 py-2 bg-red-500 text-white rounded transition-colors duration-200"
            onClick={() => setDeleteModalOpen(true)}
          >
            Delete
          </button>
        )}
      </div>

      <div className="overflow-x-auto w-full pb-7">
        <table className="min-w-[900px] w-full bg-white rounded-xl shadow border-2 border-desi-orange overflow-hidden text-sm md:text-base">
          <thead>
            <tr className="bg-gray-50 text-gray-700">
              <th className="px-2 py-3 text-center"></th>
              <th className="px-2 py-3 text-left">ID</th>
              <th className="px-2 py-3 w-40 text-left">Name</th>
                <th className="px-2 py-3 w-96 text-left">Description</th>
              <th className="px-2 py-3 w-20 text-left">Price</th>
              <th className="px-1 py-3 w-20 text-center">Veg</th>
              <th className="px-1 py-3 w-20 text-center">Spicy</th>
              <th className="px-1 py-4 w-40 text-left">Category</th>
              <th className="px-2 py-3 text-left">Images</th>
              <th className="px-2 py-3 w-24 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(item => (
              <tr key={item.id} className={`border-b last:border-0 transition-colors ${selectedRows.includes(item.id) ? 'bg-orange-100' : 'hover:bg-gray-50'}`}>
                <td className="px-2 py-3 text-center">
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    checked={selectedRows.includes(item.id)}
                    onChange={e => {
                      if (e.target.checked) setSelectedRows(prev => [...prev, item.id]);
                      else setSelectedRows(prev => prev.filter(id => id !== item.id));
                    }}
                  />
                </td>
                <td className="px-2 py-3">{item.id}</td>
                <td className="px-2 py-3 w-40">
                  <input
                    className="w-full border-none bg-transparent focus:ring-2 focus:ring-desi-orange px-1 text-gray-900 placeholder-gray-400"
                    value={item.name ?? ''}
                    onChange={e => handleFieldChange(item.id, 'name', e.target.value)}
                  />
                </td>
                <td className="px-2 py-3 w-96">
                  <input
                    className="w-full border-none bg-transparent focus:ring-2 focus:ring-desi-orange px-1 text-gray-900 placeholder-gray-400"
                    value={item.description ?? ''}
                    onChange={e => handleFieldChange(item.id, 'description', e.target.value)}
                  />
                </td>
                <td className="px-2 py-3">
                  <input
                    className="w-full border-none bg-transparent focus:ring-2 focus:ring-desi-orange px-1 text-gray-900 placeholder-gray-400"
                    value={item.price ?? ''}
                    onChange={e => handleFieldChange(item.id, 'price', e.target.value)}
                  />
                </td>
                <td className="px-1 py-3 w-16 text-center align-middle">
                  <span className="inline-block scale-55">
                    <MinimalToggle
                      checked={item.isvegetarian}
                      onChange={e => handleFieldChange(item.id, 'isvegetarian', e.target.checked)}
                    />
                  </span>
                </td>
                <td className="px-1 py-3 w-16 text-center align-middle">
                  <span className="inline-block scale-55 spicy-toggle">
                    <MinimalToggle
                      checked={item.isspicy}
                      onChange={e => handleFieldChange(item.id, 'isspicy', e.target.checked)}
                    />
                  </span>
                </td>
                <td className="px-2 py-3 w-56">
                  <select
                    className="w-full border-none bg-transparent focus:ring-2 focus:ring-desi-orange px-1 text-gray-900"
                    value={item.category}
                    onChange={e => handleFieldChange(item.id, 'category', e.target.value)}
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </td>
                <td className="px-2 py-3">
                  <div className="flex gap-1">
                    {(item.images || []).slice(0, 3).map((img, idx) => (
                      <button key={img} onClick={e => { e.stopPropagation(); setModalImages(item.images || []); setModalItemId(item.id); setImageModalOpen(true); }}>
                        <img
                          src={img}
                          alt={item.name}
                          width={32}
                          height={32}
                          className="rounded object-cover border border-gray-200"
                          style={{ width: 32, height: 32 }}
                        />
                      </button>
                    ))}
                    {(!item.images || item.images.length === 0) && (
                      <button
                        className="text-xs text-gray-400 underline"
                        onClick={e => {
                          e.stopPropagation();
                          setModalImages(item.menu_img ? [item.menu_img] : []);
                          setModalItemId(item.id);
                          setImageModalOpen(true);
                        }}
                      >
                        No images
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-2 py-3 text-center">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors duration-200 shadow-sm ${item.sold_out ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                    onClick={() => handleFieldChange(item.id, 'sold_out', !item.sold_out)}
                  >
                    {item.sold_out ? 'Sold Out' : 'Active'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Confirm Changes</h2>
            <div className="max-h-60 overflow-auto mb-4">
              {Object.entries(changedRows).map(([id, changes]) => {
                const item = rows.find(r => r.id === Number(id));
                const name = item?.name || `Item ${id}`;
                const texts = Object.entries(changes).map(([field, value]) => {
                  switch (field) {
                    case 'sold_out':
                      return value ? 'Sold Out' : 'Active';
                    case 'isvegetarian':
                      return value ? 'Vegetarian' : 'Non-Vegetarian';
                    case 'isspicy':
                      return value ? 'Spicy' : 'Not Spicy';
                    case 'name':
                    case 'description':
                    case 'price':
                    case 'category':
                    case 'menu_img':
                    case 'square_variation_id':
                      return String(value);
                    default:
                      return `${field}: ${JSON.stringify(value)}`;
                  }
                }).join(', ');
                return (
                  <div key={id} className="mb-2">
                    <strong>{name}:</strong> {texts}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end space-x-2">
              <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="px-4 py-2 bg-gray-200 text-desi-orange rounded" onClick={saveChanges}>Save</button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Delete Items</h2>
            <div className="max-h-60 overflow-auto mb-4">
              {rows.filter(r => selectedRows.includes(r.id)).map(item => (
                <div key={item.id} className="mb-2">
                  <strong>{item.name}</strong> (ID: {item.id})
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-2">
              <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
              <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={async () => {
                await Promise.all(selectedRows.map(id => fetch('/api/menu', {
                  method: 'DELETE',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id })
                })));
                setRows(prev => prev.filter(r => !selectedRows.includes(r.id)));
                setSelectedRows([]);
                setDeleteModalOpen(false);
                queryClient.invalidateQueries({ queryKey: ['menuItems'] });
              }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-2 md:p-6 rounded shadow-lg w-full max-w-md max-h-[90vh] overflow-auto">
            <h2 className="text-lg font-semibold mb-4">Add New Menu Item</h2>
            <div className="space-y-3">
              <input type="text" placeholder="Name" value={newItem.name} onChange={e => setNewItem(prev => ({ ...prev, name: e.target.value }))} className="w-full p-2 border rounded" />
              <textarea placeholder="Description" value={newItem.description} onChange={e => setNewItem(prev => ({ ...prev, description: e.target.value }))} className="w-full p-2 border rounded" rows={2} />
              <input type="text" placeholder="Price" value={newItem.price} onChange={e => setNewItem(prev => ({ ...prev, price: e.target.value }))} className="w-full p-2 border rounded" />
              <div className="flex items-center space-x-4">
                <label className="flex items-center"><input type="checkbox" checked={newItem.isvegetarian} onChange={e => setNewItem(prev => ({ ...prev, isvegetarian: e.target.checked }))} className="mr-2" /> Vegetarian</label>
                <label className="flex items-center"><input type="checkbox" checked={newItem.isspicy} onChange={e => setNewItem(prev => ({ ...prev, isspicy: e.target.checked }))} className="mr-2" /> Spicy</label>
              </div>
              <select value={newItem.category} onChange={e => setNewItem(prev => ({ ...prev, category: e.target.value }))} className="w-full p-2 border rounded">
                <option value="">Select category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="file" multiple accept="image/*" onChange={e => setNewImageFiles(Array.from(e.target.files || []))} className="w-full p-2 border rounded" />
              <input type="text" placeholder="Square Variation ID" value={newItem.square_variation_id} onChange={e => setNewItem(prev => ({ ...prev, square_variation_id: e.target.value }))} className="w-full p-2 border rounded" />
            </div>
            <div className="flex flex-col md:flex-row md:justify-between gap-2 mt-4">
              <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setAddModalOpen(false)}>Cancel</button>
              <button className="px-4 py-2 bg-desi-orange text-white rounded" onClick={async () => {
                const urls: string[] = [];
                for (const file of newImageFiles) {
                  const filePath = `${Date.now()}-${file.name}`;
                  const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('menu-images')
                    .upload(filePath, file);
                  if (uploadError) {
                    console.error('Upload error:', uploadError.message);
                    throw uploadError;
                  }
                  const { data: urlData } = supabase.storage.from('menu-images').getPublicUrl(uploadData.path);
                  urls.push(urlData.publicUrl);
                }
                const payload = { ...newItem, images: urls, menu_img: urls[0] || '' };
                const res = await fetch('/api/menu', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                if (!res.ok) {
                  const err = await res.json();
                  console.error('Create error:', err);
                  return;
                }
                const created = await res.json();
                setRows(prev => [...prev, created]);
                setNewImageFiles([]);
                setAddModalOpen(false);
                queryClient.invalidateQueries({ queryKey: ['menuItems'] });
              }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {imageModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 p-4 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg h-auto max-h-[90vh] overflow-y-auto p-4 md:p-6">
            <h2 className="text-xl font-semibold mb-6 text-center">Manage Images</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
              {modalImages.length > 0 ? modalImages.map((img, idx) => (
                <div key={img} className="relative" onClick={() => {
                  if (deleteIndex === idx) {
                    const newImages = modalImages.filter((_, i) => i !== idx);
                    setModalImages(newImages);
                    setDeleteIndex(null);
                    if (modalItemId) {
                      fetch('/api/menu', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: modalItemId, images: newImages, menu_img: newImages[0] || '' })
                      });
                      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
                    }
                  } else {
                    setDeleteIndex(idx);
                  }
                }}>
                  <img
                    src={img}
                    alt="Food image"
                    width={160}
                    height={160}
                    className={`w-full h-32 sm:h-40 md:h-48 object-cover rounded-lg border border-gray-200 transition-all duration-200 ${deleteIndex === idx ? 'ring-2 ring-red-500 opacity-70' : ''}`}
                    style={{ width: 160, height: 160 }}
                  />
                  {deleteIndex === idx && (
                    <div className="absolute inset-0 bg-red-500/60 rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                </div>
              )) : (
                <div className="col-span-full text-center text-gray-500">No images available</div>
              )}
            </div>
            <div className="border-t border-gray-200 pt-4 flex flex-col sm:flex-row sm:justify-between gap-2">
              <button
                className="w-full sm:w-auto px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                onClick={() => { setImageModalOpen(false); setDeleteIndex(null); }}
              >
                Close
              </button>
              <label className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-desi-orange text-white rounded-lg cursor-pointer hover:bg-orange-600">
                Add Image
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={async e => {
                    if (!e.target.files || !modalItemId) return;
                    const file = e.target.files[0];
                    const filePath = `${Date.now()}-${file.name}`;
                    const { data: uploadData, error: uploadError } = await supabase.storage.from('menu-images').upload(filePath, file);
                    if (uploadError) {
                      alert('Upload error: ' + uploadError.message);
                      return;
                    }
                    const { data: urlData } = supabase.storage.from('menu-images').getPublicUrl(uploadData.path);
                    const newImages = [...modalImages, urlData.publicUrl];
                    await fetch('/api/menu', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id: modalItemId, images: newImages, menu_img: newImages[0] || '' })
                    });
                    setModalImages(newImages);
                    setDeleteIndex(null);
                    queryClient.invalidateQueries({ queryKey: ['menuItems'] });
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 