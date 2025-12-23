import { useState, useEffect, useContext, useRef } from 'react';
import axios from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import {
  Package, Plus, Edit, Trash2, Search, X, Loader2, CloudUpload, Camera
} from 'lucide-react';

const ProductManagement = () => {
  const { logout } = useContext(AuthContext);
  
  // --- STATE ---
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dynamic Options State (With defaults)
  const [categories, setCategories] = useState(['Rings', 'Necklaces', 'Earrings', 'Bracelets']);
  const [materials, setMaterials] = useState(['Gold', 'Silver', 'Platinum']);

  // Modal States
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAttributeModal, setShowAttributeModal] = useState(false);
  const [attributeType, setAttributeType] = useState(''); // 'category' or 'material'
  const [newAttributeName, setNewAttributeName] = useState('');

  // Form State
  const [newProduct, setNewProduct] = useState({
    title: '', description: '', price: '', category: '', material: '',
    stock: '', weight: '', discount: '', featured: false, imageFile: null, image: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    fetchProducts();
    fetchAttributes();
  }, []);

  // Filter logic
  useEffect(() => {
    if(searchQuery) {
        setFilteredProducts(products.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())));
    } else {
        setFilteredProducts(products);
    }
  }, [products, searchQuery]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/products');
      setProducts(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchAttributes = async () => {
    try {
      const res = await axios.get('/attributes');
      const allAttrs = res.data;
      
      const dbCategories = allAttrs.filter(a => a.type === 'category').map(a => a.name);
      const dbMaterials = allAttrs.filter(a => a.type === 'material').map(a => a.name);

      // Merge defaults with DB values (remove duplicates)
      setCategories(prev => [...new Set([...prev, ...dbCategories])]);
      setMaterials(prev => [...new Set([...prev, ...dbMaterials])]);
    } catch (err) {
      console.error("Error fetching attributes", err);
    }
  };

  // --- ATTRIBUTE HANDLERS ---
  const handleAddAttribute = async (e) => {
    e.preventDefault();
    if (!newAttributeName.trim()) return;

    try {
      await axios.post('/attributes', {
        name: newAttributeName,
        type: attributeType
      });
      
      alert(`${attributeType === 'category' ? 'Category' : 'Material'} Added!`);
      
      // Update Local State immediately
      if (attributeType === 'category') setCategories(prev => [...prev, newAttributeName]);
      if (attributeType === 'material') setMaterials(prev => [...prev, newAttributeName]);
      
      // Auto-select the new option in the main form
      setNewProduct(prev => ({ ...prev, [attributeType]: newAttributeName }));

      closeAttributeModal();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add.");
    }
  };

  const openAttributeModal = (type) => {
    setAttributeType(type);
    setNewAttributeName('');
    setShowAttributeModal(true);
  };

  const closeAttributeModal = () => {
    setShowAttributeModal(false);
  };

  // --- PRODUCT FORM HANDLERS ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProduct({ ...newProduct, imageFile: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        const formData = new FormData();
        formData.append('title', newProduct.title);
        formData.append('description', newProduct.description || '');
        formData.append('category', newProduct.category);
        formData.append('material', newProduct.material || '');
        
        // Ensure numbers
        formData.append('price', Number(newProduct.price) || 0); 
        formData.append('stock', Number(newProduct.stock) || 0);
        formData.append('weight', Number(newProduct.weight) || 0);
        formData.append('discount', Number(newProduct.discount) || 0);
        formData.append('featured', newProduct.featured);

        // Handle Image
        if (newProduct.imageFile) {
            formData.append('image', newProduct.imageFile);
        } else if (newProduct.image) {
            formData.append('image', newProduct.image);
        }

        let res;
        if(editingProduct) {
            res = await axios.put(`/products/${editingProduct._id}`, formData);
            setProducts(products.map(p => p._id === editingProduct._id ? res.data : p));
            alert("Product Updated Successfully!");
        } else {
            res = await axios.post('/products', formData);
            setProducts([res.data, ...products]);
            alert("Product Created Successfully!");
        }
        
        closeModal();
    } catch(err) {
        console.error(err);
        alert("Error saving product. Check server logs.");
    } finally {
        setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setNewProduct({
        title: product.title,
        description: product.description,
        price: product.price,
        category: product.category,
        material: product.material,
        stock: product.stock,
        weight: product.weight,
        discount: product.discount,
        featured: product.featured,
        image: product.images?.[0] || '',
        imageFile: null
    });
    setImagePreview(product.images?.[0] || '');
    setIsAddingProduct(true);
  };

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure?")) {
        try {
            await axios.delete(`/products/${id}`);
            setProducts(products.filter(p => p._id !== id));
        } catch(err) { alert("Delete failed"); }
    }
  };

  const closeModal = () => {
    setIsAddingProduct(false);
    setEditingProduct(null);
    setNewProduct({
        title: '', description: '', price: '', category: '', material: '',
        stock: '', weight: '', discount: '', featured: false, imageFile: null, image: ''
    });
    setImagePreview(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Product Inventory</h1>
        <button onClick={() => setIsAddingProduct(true)} className="bg-black text-white px-5 py-2.5 rounded-lg flex gap-2 items-center hover:bg-gray-800 transition-colors">
          <Plus size={20} /> Add Product
        </button>
      </div>

      {/* SEARCH */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
            type="text" placeholder="Search products..." 
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* PRODUCTS GRID */}
      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map(p => (
            <div key={p._id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                <div className="h-48 bg-gray-100 relative">
                    <img src={p.images?.[0]} alt={p.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(p)} className="p-2 bg-white rounded-full shadow hover:bg-gray-50"><Edit size={16}/></button>
                        <button onClick={() => handleDelete(p._id)} className="p-2 bg-white rounded-full shadow hover:text-red-500"><Trash2 size={16}/></button>
                    </div>
                </div>
                <div className="p-4">
                    <h3 className="font-bold text-gray-800 truncate">{p.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{p.category} • {p.material}</p>
                    <div className="flex justify-between items-center">
                        <span className="font-bold">₹{p.price}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                        </span>
                    </div>
                </div>
            </div>
            ))}
        </div>
      )}

      {/* --- ADD/EDIT PRODUCT MODAL --- */}
      {isAddingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* LEFT: IMAGE */}
              <div className="space-y-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all relative overflow-hidden"
                >
                    {imagePreview ? (
                        <img src={imagePreview} className="w-full h-full object-contain" />
                    ) : (
                        <div className="text-center text-gray-400">
                            <CloudUpload size={40} className="mx-auto mb-2" />
                            <p>Upload Product Image</p>
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
                </div>
              </div>

              {/* RIGHT: DETAILS */}
              <div className="space-y-4">
                <input placeholder="Product Title *" className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={newProduct.title} onChange={e => setNewProduct({...newProduct, title: e.target.value})} required />
                
                <div className="grid grid-cols-2 gap-4">
                    <input type="number" placeholder="Price (₹) *" className="border p-2.5 rounded-lg w-full" 
                        value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required />
                    <input type="number" placeholder="Stock Qty *" className="border p-2.5 rounded-lg w-full" 
                        value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} required />
                </div>

                {/* CATEGORY + ADD BUTTON */}
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Category *</label>
                    <div className="flex gap-2">
                        <select 
                            className="w-full border p-2.5 rounded-lg bg-white"
                            value={newProduct.category} 
                            onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                            required
                        >
                            <option value="">Select Category...</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <button type="button" onClick={() => openAttributeModal('category')} className="bg-gray-100 px-3 rounded-lg hover:bg-blue-50 hover:text-blue-600 border" title="Add New Category">
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                {/* MATERIAL + ADD BUTTON */}
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Material</label>
                    <div className="flex gap-2">
                        <select 
                            className="w-full border p-2.5 rounded-lg bg-white"
                            value={newProduct.material} 
                            onChange={e => setNewProduct({...newProduct, material: e.target.value})}
                        >
                            <option value="">Select Material...</option>
                            {materials.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <button type="button" onClick={() => openAttributeModal('material')} className="bg-gray-100 px-3 rounded-lg hover:bg-blue-50 hover:text-blue-600 border" title="Add New Material">
                            <Plus size={20} />
                        </button>
                    </div>
                </div>
                
                <textarea rows="3" placeholder="Description" className="w-full border p-2.5 rounded-lg" 
                    value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />

                <div className="grid grid-cols-2 gap-4">
                    <input type="number" placeholder="Weight (g)" className="border p-2.5 rounded-lg" 
                        value={newProduct.weight} onChange={e => setNewProduct({...newProduct, weight: e.target.value})} />
                    <input type="number" placeholder="Discount (%)" className="border p-2.5 rounded-lg" 
                        value={newProduct.discount} onChange={e => setNewProduct({...newProduct, discount: e.target.value})} />
                </div>

                <div className="flex gap-3 pt-4">
                    <button type="button" onClick={closeModal} className="flex-1 py-2.5 border rounded-lg hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow">Save Product</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MINI MODAL: ADD ATTRIBUTE --- */}
      {showAttributeModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold mb-1 capitalize">Add New {attributeType}</h3>
            <p className="text-sm text-gray-500 mb-4">This will be available for future products.</p>
            <form onSubmit={handleAddAttribute}>
              <input 
                autoFocus
                type="text" 
                placeholder={`Enter new ${attributeType} name...`}
                className="w-full border border-gray-300 p-2.5 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                value={newAttributeName}
                onChange={(e) => setNewAttributeName(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={closeAttributeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Add Option</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;