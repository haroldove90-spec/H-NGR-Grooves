import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { LayoutDashboard, PackagePlus, DollarSign, ShoppingBag, TrendingUp, PlusCircle, LogOut, ClipboardList, UploadCloud, X, Menu, Home, Trash2, Loader2, ExternalLink, Settings, Image as ImageIcon, Type, Grid, User, Upload, AlignLeft, AlignCenter, AlignRight, Monitor, Tablet, Smartphone, Type as TypeIcon, Check, Save, GripVertical } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const mockSalesData = [
  { time: '08:00', sales: 120 },
  { time: '10:00', sales: 300 },
  { time: '12:00', sales: 450 },
  { time: '14:00', sales: 200 },
  { time: '16:00', sales: 600 },
  { time: '18:00', sales: 800 },
  { time: '20:00', sales: 500 },
];

const mockCategoryData = [
  { name: 'Rosas', value: 450 },
  { name: 'Tulipanes', value: 320 },
  { name: 'Orquídeas', value: 580 },
  { name: 'Arreglos Mixtos', value: 410 },
];

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-black shadow-sm p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <img 
            src="https://appdesignproyectos.com/floreriaricardo.jpg" 
            alt="Florería Ricardo" 
            className="h-8 object-contain"
            referrerPolicy="no-referrer"
          />
          <div className="h-6 w-px bg-white/20"></div>
          <span className="text-xs font-bold text-white uppercase tracking-widest">Admin</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)} 
          className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white shadow-sm border border-white/10 active:scale-90 transition-transform"
        >
          <Menu size={20} strokeWidth={2} />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-black z-50 flex flex-col p-6 overflow-hidden md:hidden"
          >
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

            <div className="flex justify-between items-center mb-12 relative z-10">
              <div className="flex items-center space-x-3">
                <img 
                  src="https://appdesignproyectos.com/floreriaricardo.jpg" 
                  alt="Florería Ricardo" 
                  className="h-10 object-contain"
                  referrerPolicy="no-referrer"
                />
                <div className="h-8 w-px bg-white/20"></div>
                <span className="text-sm font-bold text-white uppercase tracking-widest">Admin</span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white shadow-sm border border-white/10 active:scale-90 transition-transform"
              >
                <X size={24} strokeWidth={2} />
              </button>
            </div>
            
            <nav className="flex flex-col space-y-4 relative z-10">
              <Link 
                to="/admin/ventas" 
                className={`group flex items-center space-x-4 p-4 rounded-2xl bg-white/5 shadow-sm border border-white/10 active:scale-95 transition-all ${location.pathname.includes('/ventas') ? 'ring-2 ring-white/20' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${location.pathname.includes('/ventas') ? 'bg-white text-black shadow-md shadow-white/20' : 'bg-white/10 text-white group-hover:bg-white group-hover:text-black'}`}>
                  <LayoutDashboard size={24} strokeWidth={1.5} />
                </div>
                <span className="text-xl font-serif text-white font-medium group-hover:text-gold">Ventas y Métricas</span>
              </Link>
              
              <Link 
                to="/admin/pedidos" 
                className={`group flex items-center space-x-4 p-4 rounded-2xl bg-white/5 shadow-sm border border-white/10 active:scale-95 transition-all ${location.pathname.includes('/pedidos') ? 'ring-2 ring-white/20' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${location.pathname.includes('/pedidos') ? 'bg-white text-black shadow-md shadow-white/20' : 'bg-white/10 text-white group-hover:bg-white group-hover:text-black'}`}>
                  <ClipboardList size={24} strokeWidth={1.5} />
                </div>
                <span className="text-xl font-serif text-white font-medium group-hover:text-gold">Pedidos Recientes</span>
              </Link>
              
              <Link 
                to="/admin/productos" 
                className={`group flex items-center space-x-4 p-4 rounded-2xl bg-white/5 shadow-sm border border-white/10 active:scale-95 transition-all ${location.pathname.includes('/productos') ? 'ring-2 ring-white/20' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${location.pathname.includes('/productos') ? 'bg-white text-black shadow-md shadow-white/20' : 'bg-white/10 text-white group-hover:bg-white group-hover:text-black'}`}>
                  <PackagePlus size={24} strokeWidth={1.5} />
                </div>
                <span className="text-xl font-serif text-white font-medium group-hover:text-gold">Gestión de Productos</span>
              </Link>

              <Link 
                to="/admin/usuarios" 
                className={`group flex items-center space-x-4 p-4 rounded-2xl bg-white/5 shadow-sm border border-white/10 active:scale-95 transition-all ${location.pathname.includes('/usuarios') ? 'ring-2 ring-white/20' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${location.pathname.includes('/usuarios') ? 'bg-white text-black shadow-md shadow-white/20' : 'bg-white/10 text-white group-hover:bg-white group-hover:text-black'}`}>
                  <PlusCircle size={24} strokeWidth={1.5} />
                </div>
                <span className="text-xl font-serif text-white font-medium group-hover:text-gold">Gestión de Usuarios</span>
              </Link>

              <Link 
                to="/admin/perfil" 
                className={`group flex items-center space-x-4 p-4 rounded-2xl bg-white/5 shadow-sm border border-white/10 active:scale-95 transition-all ${location.pathname.includes('/perfil') ? 'ring-2 ring-white/20' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${location.pathname.includes('/perfil') ? 'bg-white text-black shadow-md shadow-white/20' : 'bg-white/10 text-white group-hover:bg-white group-hover:text-black'}`}>
                  <User size={24} strokeWidth={1.5} />
                </div>
                <span className="text-xl font-serif text-white font-medium group-hover:text-gold">Mi Perfil</span>
              </Link>

              <Link 
                to="/admin/galeria" 
                className={`group flex items-center space-x-4 p-4 rounded-2xl bg-white/5 shadow-sm border border-white/10 active:scale-95 transition-all ${location.pathname.includes('/galeria') ? 'ring-2 ring-white/20' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${location.pathname.includes('/galeria') ? 'bg-white text-black shadow-md shadow-white/20' : 'bg-white/10 text-white group-hover:bg-white group-hover:text-black'}`}>
                  <ImageIcon size={24} strokeWidth={1.5} />
                </div>
                <span className="text-xl font-serif text-white font-medium group-hover:text-gold">Galería</span>
              </Link>

              <Link 
                to="/admin/personalizacion" 
                className={`group flex items-center space-x-4 p-4 rounded-2xl bg-white/5 shadow-sm border border-white/10 active:scale-95 transition-all ${location.pathname.includes('/personalizacion') ? 'ring-2 ring-white/20' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${location.pathname.includes('/personalizacion') ? 'bg-white text-black shadow-md shadow-white/20' : 'bg-white/10 text-white group-hover:bg-white group-hover:text-black'}`}>
                  <Settings size={24} strokeWidth={1.5} />
                </div>
                <span className="text-xl font-serif text-white font-medium group-hover:text-gold">Personalización</span>
              </Link>
              
              <div className="h-px bg-white/10 my-4"></div>
              
              <Link 
                to="/" 
                className="group flex items-center space-x-4 p-4 rounded-2xl bg-white/5 shadow-sm border border-white/10 active:scale-95 transition-all" 
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
                  <Home size={24} strokeWidth={1.5} />
                </div>
                <span className="text-xl font-serif text-white/80 font-medium group-hover:text-gold">Volver a la Tienda</span>
              </Link>
            </nav>
            
            <div className="mt-auto text-center pb-8 relative z-10">
              <div className="w-16 h-[1px] bg-white/20 mx-auto rounded-full mb-6"></div>
              <p className="text-white/40 text-sm font-light uppercase tracking-widest">Panel de Administración</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-black text-white flex-col sticky top-0 h-screen z-40">
        <div className="hidden md:block p-6 border-b border-white/10">
          <img 
            src="https://appdesignproyectos.com/floreriaricardo.jpg" 
            alt="Florería Ricardo" 
            className="h-10 object-contain mb-2"
            referrerPolicy="no-referrer"
          />
          <p className="text-xs text-white/50 uppercase tracking-widest">Panel de Control</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link 
            to="/admin/ventas" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${location.pathname.includes('/ventas') ? 'bg-white text-black font-medium' : 'hover:bg-white/10 text-white/80 hover:text-gold'}`}
          >
            <LayoutDashboard size={20} />
            <span>Ventas y Métricas</span>
          </Link>
          <Link 
            to="/admin/pedidos" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${location.pathname.includes('/pedidos') ? 'bg-white text-black font-medium' : 'hover:bg-white/10 text-white/80 hover:text-gold'}`}
          >
            <ClipboardList size={20} />
            <span>Pedidos Recientes</span>
          </Link>
          <Link 
            to="/admin/productos" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${location.pathname.includes('/productos') ? 'bg-white text-black font-medium' : 'hover:bg-white/10 text-white/80 hover:text-gold'}`}
          >
            <PackagePlus size={20} />
            <span>Gestión de Productos</span>
          </Link>
          <Link 
            to="/admin/usuarios" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${location.pathname.includes('/usuarios') ? 'bg-white text-black font-medium' : 'hover:bg-white/10 text-white/80 hover:text-gold'}`}
          >
            <PlusCircle size={20} />
            <span>Gestión de Usuarios</span>
          </Link>
          <Link 
            to="/admin/perfil" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${location.pathname.includes('/perfil') ? 'bg-white text-black font-medium' : 'hover:bg-white/10 text-white/80 hover:text-gold'}`}
          >
            <User size={20} />
            <span>Mi Perfil</span>
          </Link>
          <Link 
            to="/admin/personalizacion" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${location.pathname.includes('/personalizacion') ? 'bg-white text-black font-medium' : 'hover:bg-white/10 text-white/80 hover:text-gold'}`}
          >
            <Settings size={20} />
            <span>Personalización</span>
          </Link>
          <Link 
            to="/admin/galeria" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${location.pathname.includes('/galeria') ? 'bg-white text-black font-medium' : 'hover:bg-white/10 text-white/80 hover:text-gold'}`}
          >
            <ImageIcon size={20} />
            <span>Galería</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-white/10 mt-auto space-y-2">
          <Link to="/" className="flex items-center space-x-3 px-4 py-3 rounded-md hover:bg-white/10 text-white/80 hover:text-gold transition-colors">
            <Home size={20} />
            <span>Volver a la Tienda</span>
          </Link>
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-md hover:bg-red-600/20 text-red-400 hover:text-red-300 transition-colors"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

const AdminSales = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-black mb-2">Resumen de Ventas</h1>
        <p className="text-darkgray/70">Métricas y rendimiento de tu tienda en tiempo real.</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Ventas del Día</p>
            <p className="text-2xl font-bold text-black">$2,970.00</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pedidos Completados</p>
            <p className="text-2xl font-bold text-black">42</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Ticket Promedio</p>
            <p className="text-2xl font-bold text-black">$70.71</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-black mb-6">Ventas por Hora (Hoy)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockSalesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`$${value}`, 'Ventas']}
                />
                <Line type="monotone" dataKey="sales" stroke="black" strokeWidth={3} dot={{r: 4, fill: 'black', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-black mb-6">Ventas por Categoría</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockCategoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{fill: '#f3f4f6'}}
                  formatter={(value) => [`$${value}`, 'Ventas']}
                />
                <Bar dataKey="value" fill="black" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminProducts = () => {
  const { products, addProduct, updateProduct, deleteProducts, categories, addCategory, deleteCategory, loading } = useProducts();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [secondaryImageFiles, setSecondaryImageFiles] = useState<File[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    image: '',
    isSpecial: false,
    secondaryImages: [] as string[]
  });

  useEffect(() => {
    if (categories.length > 0 && !formData.category) {
      setFormData(prev => ({ ...prev, category: categories[0] }));
    }
  }, [categories, formData.category]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      try {
        await addCategory(newCategoryName.trim());
        setFormData(prev => ({ ...prev, category: newCategoryName.trim() }));
        setNewCategoryName('');
        setIsAddingCategory(false);
      } catch (error: any) {
        console.error('Error adding category:', error);
        alert(`No se pudo añadir la categoría: ${error.message || 'Error de conexión o permisos'}`);
      }
    }
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImageFile(file);
      const url = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, image: url }));
    }
  };

  const handleSecondaryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    setSecondaryImageFiles(prev => [...prev, ...files]);
    const urls = files.map(file => URL.createObjectURL(file));
    setFormData(prev => ({ 
      ...prev, 
      secondaryImages: [...prev.secondaryImages, ...urls] 
    }));
  };

  const removeSecondaryImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      secondaryImages: prev.secondaryImages.filter((_, index) => index !== indexToRemove)
    }));
    setSecondaryImageFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.image) return;
    
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateProduct(editingId, {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          price: parseFloat(formData.price),
          image: formData.image,
          isSpecial: formData.isSpecial,
          secondaryImages: formData.secondaryImages
        }, mainImageFile || undefined, secondaryImageFiles);
        alert("¡Producto actualizado con éxito!");
      } else {
        await addProduct({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          price: parseFloat(formData.price),
          image: formData.image,
          isSpecial: formData.isSpecial,
          secondaryImages: formData.secondaryImages
        }, mainImageFile || undefined, secondaryImageFiles);
        alert("¡Producto añadido con éxito!");
      }
      
      setIsAdding(false);
      setEditingId(null);
      setFormData({ name: '', description: '', category: categories[0] || '', price: '', image: '', isSpecial: false, secondaryImages: [] });
      setMainImageFile(null);
      setSecondaryImageFiles([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('Error in product submission:', error);
      alert(editingId 
        ? `Error al actualizar producto: ${error.message || 'Verifica los datos e intenta de nuevo'}` 
        : `Error al añadir producto: ${error.message || 'Verifica los datos e intenta de nuevo'}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: any) => {
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category || categories[0] || '',
      price: product.price.toString(),
      image: product.image,
      isSpecial: product.isSpecial || false,
      secondaryImages: product.secondaryImages || []
    });
    setEditingId(product.id);
    setIsAdding(true);
    // Scroll to the top where the form is located
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', description: '', category: categories[0] || '', price: '', image: '', isSpecial: false, secondaryImages: [] });
    setMainImageFile(null);
    setSecondaryImageFiles([]);
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const toggleSelectProduct = (id: number) => {
    setSelectedProducts(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (window.confirm(`¿Estás seguro de que deseas borrar ${selectedProducts.length} producto(s)?`)) {
      try {
        await deleteProducts(selectedProducts);
        setSelectedProducts([]);
      } catch (error) {
        alert("Error al borrar productos");
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-black mb-2 flex items-center gap-3">
            Gestión de Productos
            <span className="text-sm font-sans bg-black text-white px-3 py-1 rounded-full">
              {products.length} {products.length === 1 ? 'Producto' : 'Productos'}
            </span>
          </h1>
          <p className="text-darkgray/70">Administra el catálogo de tu tienda.</p>
        </div>
        <div className="flex items-center space-x-4">
          {selectedProducts.length > 0 && (
            <button 
              onClick={handleDeleteSelected}
              className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              <Trash2 size={18} />
              <span>Borrar ({selectedProducts.length})</span>
            </button>
          )}
          <button 
            onClick={isAdding ? handleCancel : () => setIsAdding(true)}
            className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            {isAdding ? <X size={18} /> : <PlusCircle size={18} />}
            <span>{isAdding ? 'Cancelar' : 'Nuevo Producto'}</span>
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h3 className="text-lg font-medium text-black mb-6 border-b pb-4">
            {editingId ? 'Editar Producto' : 'Añadir Nuevo Producto'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Producto</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Ej. Ramo de Rosas"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                <div className="flex space-x-2">
                  <select 
                    value={formData.category}
                    onChange={e => {
                      if (e.target.value === 'ADD_NEW') {
                        setIsAddingCategory(true);
                      } else {
                        setFormData({...formData, category: e.target.value});
                        setIsAddingCategory(false);
                      }
                    }}
                    className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="ADD_NEW" className="font-bold text-black border-t">+ Añadir Nueva Categoría</option>
                  </select>
                  <button 
                    type="button"
                    onClick={() => setIsAddingCategory(!isAddingCategory)}
                    className={`p-2 rounded-md transition-colors ${isAddingCategory ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                    title="Añadir nueva categoría"
                  >
                    <PlusCircle size={20} />
                  </button>
                </div>
                {isAddingCategory && (
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-in slide-in-from-top-2 duration-300">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-bold">Nueva Categoría</p>
                    <div className="flex space-x-2">
                      <input 
                        type="text"
                        autoFocus
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        placeholder="Nombre de la categoría..."
                        className="flex-1 text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCategory(e as any);
                          }
                        }}
                      />
                      <button 
                        type="button"
                        onClick={handleAddCategory}
                        disabled={!newCategoryName.trim()}
                        className="bg-black text-white text-xs px-4 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50 transition-all font-bold"
                      >
                        Guardar
                      </button>
                      <button 
                        type="button"
                        onClick={() => setIsAddingCategory(false)}
                        className="text-gray-500 hover:text-black p-2"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Precio ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              <div className="flex items-center space-x-3 pt-8">
                <input 
                  type="checkbox"
                  id="isSpecial"
                  checked={formData.isSpecial}
                  onChange={e => setFormData({...formData, isSpecial: e.target.checked})}
                  className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                />
                <label htmlFor="isSpecial" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Mostrar en "Lo más vendido" (Slider Principal)
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Imagen Principal</label>
                <div className="flex items-center space-x-6">
                  <div className="flex-1">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Haz clic para subir</span> o arrastra y suelta</p>
                        <p className="text-xs text-gray-500">PNG, JPG o WEBP (Max. 2MB)</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleMainImageChange} />
                    </label>
                  </div>
                  {formData.image && (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                        className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100"
                      >
                        <X size={14} className="text-gray-600" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes Secundarias</label>
                <div className="flex flex-col space-y-4">
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-6 h-6 mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">Subir imágenes adicionales</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" multiple onChange={handleSecondaryImagesChange} />
                  </label>
                  
                  {formData.secondaryImages.length > 0 && (
                    <div className="flex flex-wrap gap-4">
                      {formData.secondaryImages.map((url, idx) => (
                        <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                          <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => removeSecondaryImage(idx)}
                            className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100"
                          >
                            <X size={14} className="text-gray-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea 
                  rows={3}
                  required
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                  placeholder="Describe el producto..."
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                type="submit"
                className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors font-medium"
              >
                Guardar Producto
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Product List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Cargando productos...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 w-10">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                    checked={products.length > 0 && selectedProducts.length === products.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(product => (
                <tr key={product.id} className={`hover:bg-gray-50 transition-colors ${selectedProducts.includes(product.id) ? 'bg-gray-50' : ''}`}>
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => toggleSelectProduct(product.id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <img src={product.image} alt={product.name} className="w-10 h-10 rounded-md object-cover" />
                      <div className="flex flex-col">
                        <span className="font-medium text-black">{product.name}</span>
                        {product.isSpecial && (
                          <span className="text-[10px] text-orange-600 font-bold uppercase tracking-tighter">Lo más vendido</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.category || 'Sin categoría'}</td>
                  <td className="px-6 py-4 text-sm font-medium text-black">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm space-x-4">
                    <button 
                      onClick={() => {
                        console.log('Editing product:', product.id);
                        handleEdit(product);
                      }}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${editingId === product.id ? 'bg-black text-white' : 'text-black hover:bg-gray-100 hover:text-gray-900 underline decoration-gray-200 underline-offset-4'}`}
                    >
                      Editar
                    </button>
                    <Link 
                      to={`/producto/${product.id}`} 
                      target="_blank"
                      className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center hover:underline"
                    >
                      Ver <ExternalLink size={14} className="ml-1" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Category Management */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
        <h3 className="text-lg font-medium text-black mb-4 border-b pb-4 flex items-center justify-between">
          <span>Gestión de Categorías</span>
          <span className="text-xs font-normal text-gray-500">{categories.length} categorías activas</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories.map(cat => (
            <div key={cat} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 group hover:border-gray-300 transition-all">
              <span className="text-sm font-medium text-gray-700 truncate mr-2">{cat}</span>
              <button 
                onClick={() => {
                  if (window.confirm(`¿Estás seguro de que deseas eliminar la categoría "${cat}"?`)) {
                    deleteCategory(cat);
                  }
                }}
                className="text-gray-400 hover:text-red-600 transition-colors p-1"
                title="Eliminar categoría"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="col-span-full py-4 text-center text-gray-400 text-sm italic">
              No hay categorías personalizadas creadas.
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
};

const AdminProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      setProfile(data);
      setFullName(data.full_name || '');
      setRole(data.role || 'user');
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          role: role
        })
        .eq('id', user?.id);
      
      if (error) throw error;
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error al actualizar el perfil.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-black" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-black mb-2">Mi Perfil</h1>
        <p className="text-darkgray/70">Personaliza tu información de administrador.</p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          {message && (
            <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
              {message.text}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
              <input 
                type="text" 
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full border border-gray-200 px-4 py-3 rounded-lg outline-none focus:border-black transition-colors"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
              <input 
                type="email" 
                value={user?.email}
                disabled
                className="w-full border border-gray-200 px-4 py-3 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-[10px] text-gray-400 mt-1 italic">El correo electrónico no puede ser cambiado desde aquí.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
              <select 
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full border border-gray-200 px-4 py-3 rounded-lg outline-none focus:border-black transition-colors bg-white"
              >
                <option value="admin">Administrador</option>
                <option value="user">Usuario</option>
              </select>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={saving}
              className="w-full py-4 bg-black text-white rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <span>Guardar Cambios</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminUsers = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('admin');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchUsers = async () => {
    try {
      setFetchingUsers(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setFetchingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: fullName,
            role: role
          }
        }
      });

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        text: 'Usuario registrado con éxito. Se ha enviado un correo de confirmación (si está habilitado).' 
      });
      setFullName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      
      // Refresh list after a short delay to allow trigger to run
      setTimeout(fetchUsers, 2000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error al registrar el usuario.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="max-w-2xl">
        <div>
          <h1 className="text-3xl font-serif text-black mb-2">Gestión de Usuarios</h1>
          <p className="text-darkgray/70">Administra los accesos y roles de la tienda.</p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mt-8">
          <h3 className="text-lg font-medium text-black mb-6 border-b pb-4">Registrar Nuevo Usuario</h3>
          
          <form onSubmit={handleRegister} className="space-y-6">
            {message && (
              <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                {message.text}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                <input 
                  type="text" 
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Juan Pérez"
                  className="w-full border border-gray-200 px-4 py-3 rounded-lg outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ejemplo@floreriaricardo.com"
                  className="w-full border border-gray-200 px-4 py-3 rounded-lg outline-none focus:border-black transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-gray-200 px-4 py-3 rounded-lg outline-none focus:border-black transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña</label>
                  <input 
                    type="password" 
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-gray-200 px-4 py-3 rounded-lg outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rol del Usuario</label>
                <select 
                  value={role}
                  onChange={e => setRole(e.target.value as 'admin' | 'user')}
                  className="w-full border border-gray-200 px-4 py-3 rounded-lg outline-none focus:border-black transition-colors bg-white"
                >
                  <option value="admin">Administrador (Acceso total)</option>
                  <option value="user">Usuario (Solo lectura/limitado)</option>
                </select>
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-black text-white rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <span>Registrar Usuario</span>}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-serif text-black mb-6">Usuarios Registrados</h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha Registro</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fetchingUsers ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400 italic">Cargando usuarios...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400 italic">No hay usuarios registrados o la tabla 'profiles' no existe.</td>
                  </tr>
                ) : (
                  users.map(u => (
                    <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${u.role === 'admin' ? 'bg-gray-50/50' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-black">{u.full_name || 'Sin nombre'}</div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                        <div className="text-[10px] text-gray-400">{u.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          u.role === 'admin' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(u.updated_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <select 
                          value={u.role}
                          onChange={async (e) => {
                            const newRole = e.target.value;
                            try {
                              const { error } = await supabase
                                .from('profiles')
                                .update({ role: newRole })
                                .eq('id', u.id);
                              if (error) throw error;
                              fetchUsers();
                            } catch (err) {
                              console.error('Error updating user role:', err);
                            }
                          }}
                          className="text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-black"
                        >
                          <option value="admin">Admin</option>
                          <option value="user">User</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const mockOrders = [
  {
    id: 'ORD-001',
    customer: 'Carlos Mendoza',
    phone: '+52 55 1234 5678',
    email: 'carlos@example.com',
    date: '2026-03-23 10:30 AM',
    total: 70.00,
    status: 'Completado',
    products: [
      { name: 'Ramo de 24 Rosas Rojas', qty: 1, price: 45.00 },
      { name: 'Ramo de Girasoles Brillantes', qty: 1, price: 25.00 }
    ]
  },
  {
    id: 'ORD-002',
    customer: 'Ana Sofía López',
    phone: '+52 55 8765 4321',
    email: 'ana.sofia@example.com',
    date: '2026-03-23 11:15 AM',
    total: 65.00,
    status: 'Pendiente',
    products: [
      { name: 'Caja de Rosas y Orquídeas', qty: 1, price: 65.00 }
    ]
  },
  {
    id: 'ORD-003',
    customer: 'Roberto Gómez',
    phone: '+52 33 9876 5432',
    email: 'roberto.g@example.com',
    date: '2026-03-23 02:45 PM',
    total: 110.00,
    status: 'Enviado',
    products: [
      { name: 'Arreglo de Orquídeas Exóticas', qty: 1, price: 110.00 }
    ]
  },
];

const AdminOrders = () => {
  const [orders, setOrders] = useState(mockOrders);

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completado':
        return 'bg-green-100 text-green-700';
      case 'En proceso':
        return 'bg-blue-100 text-blue-700';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-700';
      case 'Cancelado':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-black mb-2">Pedidos Recientes</h1>
        <p className="text-darkgray/70">Revisa las últimas ventas y los detalles de tus clientes.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID Pedido</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Productos</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-black">{order.id}</span>
                    <div className="text-xs text-gray-500 mt-1">{order.date}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{order.customer}</div>
                    <div className="text-xs text-gray-500 mt-1">{order.phone}</div>
                    <div className="text-xs text-gray-500">{order.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <ul className="text-sm text-gray-600 space-y-1">
                      {order.products.map((p, idx) => (
                        <li key={idx} className="flex items-center">
                          <span className="w-4 h-4 rounded-full bg-gray-200 text-[10px] flex items-center justify-center mr-2">{p.qty}</span>
                          {p.name}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-black">${order.total.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border-none focus:ring-2 focus:ring-black cursor-pointer ${getStatusColor(order.status)}`}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="En proceso">En proceso</option>
                      <option value="Completado">Completado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const AdminGallery = () => {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('General');
  const [categories, setCategories] = useState<string[]>(['General']);
  const [selectedIds, setSelectedIds] = useState<any[]>([]);
  const [updating, setUpdating] = useState(false);
  const [bulkCategory, setBulkCategory] = useState<string>('General');

  useEffect(() => {
    fetchPhotos();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('home_categories_config').select('name');
      if (error) throw error;
      if (data) {
        const catNames = data.map((c: any) => c.name);
        setCategories(['General', ...catNames]);
      }
    } catch (error) {
      console.error('Error fetching categories for gallery:', error);
    }
  };

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPhotos(data || []);
      setSelectedIds([]);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `gallery/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('gallery')
          .getPublicUrl(filePath);

        return {
          image_url: publicUrl,
          display_order: 0,
          category: selectedCategory
        };
      });

      const newPhotos = await Promise.all(uploadPromises);
      const { error: dbError } = await supabase
        .from('gallery')
        .insert(newPhotos);

      if (dbError) throw dbError;
      
      fetchPhotos();
    } catch (error) {
      console.error('Error uploading to gallery:', error);
      alert('Error al subir imágenes. Por favor intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`¿Estás seguro de que quieres eliminar ${selectedIds.length} imágenes?`)) return;

    setUpdating(true);
    try {
      const photosToDelete = photos.filter(p => selectedIds.includes(p.id));
      
      // Delete from storage
      const storagePromises = photosToDelete.map(async (p) => {
        const fileName = p.image_url.split('/').pop();
        if (fileName) {
          return supabase.storage.from('gallery').remove([`gallery/${fileName}`]);
        }
      });
      await Promise.all(storagePromises);

      // Delete from DB
      const sanitizedIds = selectedIds.map(id => typeof id === 'string' ? parseInt(id, 10) : id);
      const { error } = await supabase
        .from('gallery')
        .delete()
        .in('id', sanitizedIds);

      if (error) throw error;
      setPhotos(photos.filter(p => !selectedIds.includes(p.id)));
      setSelectedIds([]);
    } catch (error: any) {
      console.error('Error deleting photos:', error);
      alert('Error al eliminar imágenes: ' + (error.message || 'Error desconocido'));
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateCategorySelected = async () => {
    if (selectedIds.length === 0) return;
    if (!bulkCategory) {
      alert('Por favor selecciona una categoría válida.');
      return;
    }
    
    setUpdating(true);
    try {
      // Ensure we are working with correct types for the ID column (BIGINT)
      const sanitizedIds = selectedIds.map(id => typeof id === 'string' ? parseInt(id, 10) : id);

      const { error } = await supabase
        .from('gallery')
        .update({ category: bulkCategory })
        .in('id', sanitizedIds);

      if (error) throw error;
      
      await fetchPhotos();
      alert('Categoría actualizada correctamente.');
    } catch (error: any) {
      console.error('Error updating categories:', error);
      alert('Error al actualizar categorías: ' + (error.message || 'Error desconocido'));
    } finally {
      setUpdating(false);
    }
  };

  const toggleSelect = (id: any) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === photos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(photos.map(p => p.id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b pb-8">
          <div>
            <h2 className="text-3xl font-serif text-black mb-2">Gestión de Galería</h2>
            <p className="text-gray-500 text-sm">Sube varias imágenes y asígnalas a una categoría.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
            <div className="w-full sm:w-64">
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-bold text-right sm:text-left">Asignar categoría al subir</label>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-black outline-none transition-all"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <label className={`cursor-pointer flex items-center space-x-2 bg-black text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition-all shadow-md group ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              {uploading ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={18} className="group-hover:scale-110 transition-transform" />}
              <span>{uploading ? 'Subiendo...' : 'Subir Imágenes'}</span>
              <input 
                type="file" 
                multiple 
                className="hidden" 
                accept="image/*"
                onChange={handleUploadImages}
              />
            </label>
          </div>
        </div>

        {photos.length > 0 && (
          <div className="bg-gray-50 p-6 rounded-2xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-gray-100 shadow-inner">
            <div className="flex items-center space-x-6">
              <button 
                onClick={selectAll}
                className="text-sm font-bold uppercase tracking-widest text-black hover:text-gold flex items-center space-x-2"
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${selectedIds.length === photos.length ? 'bg-black border-black' : 'border-gray-300'}`}>
                  {selectedIds.length === photos.length && <Check size={14} className="text-white" />}
                </div>
                <span>{selectedIds.length === photos.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}</span>
              </button>
              <span className="text-gray-400 text-sm font-medium">{selectedIds.length} seleccionadas</span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <select 
                  value={bulkCategory}
                  onChange={(e) => setBulkCategory(e.target.value)}
                  className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-black transition-all"
                >
                  <option value="" disabled>Cambiar a...</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <button 
                  onClick={handleUpdateCategorySelected}
                  disabled={selectedIds.length === 0 || updating}
                  className="bg-black text-white px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-30 transition-all flex items-center space-x-2 whitespace-nowrap"
                >
                  <Save size={14} />
                  <span>{updating ? 'Guardando...' : 'Asignar Selección'}</span>
                </button>
              </div>

              <div className="w-px h-8 bg-gray-200 hidden sm:block mx-2" />

              <button 
                onClick={handleDeleteSelected}
                disabled={selectedIds.length === 0 || updating}
                className="bg-red-50 text-red-600 border border-red-100 px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white disabled:opacity-30 transition-all flex items-center space-x-2 whitespace-nowrap"
              >
                <Trash2 size={14} />
                <span>Eliminar {selectedIds.length > 0 ? selectedIds.length : ''}</span>
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-gold" size={40} />
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-24 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400">No hay fotos en la galería aún.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {photos.map((photo) => (
              <div 
                key={photo.id} 
                onClick={() => toggleSelect(photo.id)}
                className={`group relative aspect-square bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer border-4 ${selectedIds.includes(photo.id) ? 'border-black scale-[0.98]' : 'border-transparent'}`}
              >
                <img 
                  src={photo.image_url} 
                  alt="Gallery" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                {/* Selection indicator & Assigned status */}
                <div className={`absolute top-4 left-4 w-7 h-7 rounded-full shadow-lg border-2 flex items-center justify-center transition-all z-10 ${
                  selectedIds.includes(photo.id) 
                    ? 'bg-black border-white scale-110 shadow-black/40' 
                    : photo.category 
                      ? 'bg-black border-black/10' 
                      : 'bg-white/80 border-white group-hover:bg-white'
                }`}>
                  {(selectedIds.includes(photo.id) || photo.category) && (
                    <Check size={14} className="text-white" />
                  )}
                </div>

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end transition-all">
                  <div className={`backdrop-blur-md text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-full shadow-lg flex items-center space-x-1 ${
                    photo.category ? 'bg-black text-white' : 'bg-white/90 text-gray-500'
                  }`}>
                    {photo.category && <Check size={10} strokeWidth={3} />}
                    <span>{photo.category || 'General'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
const AdminStoreCustomization = () => {
  const [activeTab, setActiveTab] = useState<'slider' | 'categories' | 'titles'>('slider');
  const [responsiveTab, setResponsiveTab] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [slides, setSlides] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [slidesRes, catsRes, settingsRes] = await Promise.all([
        supabase.from('home_slides').select('*').order('display_order', { ascending: true }),
        supabase.from('home_categories_config').select('*').order('display_order', { ascending: true }),
        supabase.from('store_settings').select('*')
      ]);

      if (slidesRes.error) throw slidesRes.error;
      if (catsRes.error) throw catsRes.error;
      if (settingsRes.error) throw settingsRes.error;

      setSlides(slidesRes.data || []);
      setCategories(catsRes.data || []);
      
      const settingsMap = (settingsRes.data || []).reduce((acc: any, curr: any) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
      setSettings(settingsMap);
    } catch (error) {
      console.error('Error fetching store customization data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value: String(value)
      }));

      const { error } = await supabase.from('store_settings').upsert(updates, { onConflict: 'key' });
      if (error) throw error;
      setMessage({ type: 'success', text: 'Configuración guardada correctamente.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error al guardar la configuración.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSlide = () => {
    setSlides([...slides, { 
      image_url: '', 
      title: '', 
      subtitle: '', 
      button_text: 'Descubrir Colección', 
      alignment: 'center', 
      display_order: slides.length,
      title_size_desktop: 48,
      title_size_tablet: 36,
      title_size_mobile: 24,
      subtitle_size_desktop: 18,
      subtitle_size_tablet: 16,
      subtitle_size_mobile: 14,
      button_size_desktop: 12,
      button_size_tablet: 11,
      button_size_mobile: 10
    }]);
  };

  const handleRemoveSlide = (index: number) => {
    setSlides(slides.filter((_, i) => i !== index));
  };

  const handleUpdateSlide = (index: number, field: string, value: string) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setSlides(newSlides);
  };

  const handleImageUpload = async (index: number, file: File) => {
    try {
      setSaving(true);
      setMessage(null);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `slides/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('slider-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('slider-images')
        .getPublicUrl(filePath);

      handleUpdateSlide(index, 'image_url', publicUrl);
      setMessage({ type: 'success', text: 'Imagen subida correctamente.' });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setMessage({ type: 'error', text: 'Error al subir la imagen: ' + error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSlides = async () => {
    setSaving(true);
    setMessage(null);
    try {
      // 1. Identify existing IDs to keep, handle deletions
      const existingIds = slides.filter(s => s.id).map(s => s.id);
      
      if (existingIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('home_slides')
          .delete()
          .not('id', 'in', `(${existingIds.join(',')})`);
        if (deleteError) throw deleteError;
      } else {
        const { error: deleteError } = await supabase
          .from('home_slides')
          .delete()
          .neq('title', 'KEEP_ALL_DUMMY_THAT_DOES_NOT_EXIST');
        if (deleteError) throw deleteError;
      }

      // 2. Process updates (items with ID) and inserts (items without ID) separately
      const toUpdate = slides.filter(s => s.id).map((s, idx) => {
        // Strip any frontend-only fields that might be added later
        const { temp_id, ...data } = s as any;
        return {
          ...data,
          display_order: idx
        };
      });

      const toInsert = slides.filter(s => !s.id).map((s, idx) => {
        const { id, temp_id, ...data } = s as any;
        return {
          ...data,
          display_order: toUpdate.length + idx
        };
      });

      if (toUpdate.length > 0) {
        const { error } = await supabase.from('home_slides').upsert(toUpdate);
        if (error) throw error;
      }

      if (toInsert.length > 0) {
        const { error } = await supabase.from('home_slides').insert(toInsert);
        if (error) throw error;
      }

      setMessage({ type: 'success', text: 'Slider actualizado correctamente.' });
      fetchData(); // Refresh to get IDs for new slides
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error al guardar el slider.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = () => {
    setCategories([...categories, { 
      temp_id: Math.random().toString(36).substring(7),
      name: '', 
      target_link: '', 
      display_order: categories.length 
    }]);
  };

  const handleRemoveCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const handleUpdateCategory = (index: number, field: string, value: string) => {
    const newCats = [...categories];
    newCats[index] = { ...newCats[index], [field]: value };
    setCategories(newCats);
  };

  const handleSaveCategories = async () => {
    setSaving(true);
    setMessage(null);
    try {
      // 1. Handle Deletions: Delete everything from the table that is NOT in our current list
      const existingIds = categories.filter(cat => cat.id).map(cat => cat.id);
      
      if (existingIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('home_categories_config')
          .delete()
          .not('id', 'in', `(${existingIds.join(',')})`);
        if (deleteError) throw deleteError;
      } else {
        const { error: deleteError } = await supabase
          .from('home_categories_config')
          .delete()
          .neq('name', 'KEEP_ALL_DUMMY_THAT_DOES_NOT_EXIST');
        if (deleteError) throw deleteError;
      }

      // 2. Separate into updates and inserts to avoid PostgREST bulk-save id null issues
      const toUpdate = categories.filter(cat => cat.id).map((cat, idx) => {
        const { temp_id, ...data } = cat;
        return {
          ...data,
          display_order: idx
        };
      });

      const toInsert = categories.filter(cat => !cat.id).map((cat, idx) => {
        const { id, temp_id, ...data } = cat;
        return {
          ...data,
          display_order: toUpdate.length + idx
        };
      });

      if (toUpdate.length > 0) {
        const { error: updateError } = await supabase.from('home_categories_config').upsert(toUpdate);
        if (updateError) throw updateError;
      }

      if (toInsert.length > 0) {
        const { error: insertError } = await supabase.from('home_categories_config').insert(toInsert);
        if (insertError) throw insertError;
      }

      // 3. Sync with main categories table to ensure full synchronization
      const allCategoryNames = categories.map(c => c.name.trim()).filter(Boolean);
      
      // Get all current categories from the categories table
      const { data: existingAllCats } = await supabase.from('categories').select('name');
      const existingNamesSet = new Set((existingAllCats || []).map(c => c.name));
      const currentNamesSet = new Set(allCategoryNames);

      // Deletions: Categories in DB but not in our current list
      const namesToDelete = [...existingNamesSet].filter(name => !currentNamesSet.has(name));
      if (namesToDelete.length > 0) {
        await supabase.from('categories').delete().in('name', namesToDelete);
      }

      // Additions: Categories in our list but not in DB
      const namesToInsert = allCategoryNames.filter(name => !existingNamesSet.has(name));
      if (namesToInsert.length > 0) {
        await supabase.from('categories').insert(namesToInsert.map(name => ({ name })));
      }

      setMessage({ type: 'success', text: 'Categorías actualizadas y sincronizadas correctamente.' });
      fetchData();
    } catch (error: any) {
      console.error('Error saving categories:', error);
      setMessage({ type: 'error', text: error.message || 'Error al guardar las categorías.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-black" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-black mb-2">Personalización de Tienda</h1>
        <p className="text-darkgray/70">Configura el aspecto y contenido de tu página de inicio.</p>
      </div>

      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button 
          onClick={() => setActiveTab('slider')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'slider' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}
        >
          <ImageIcon size={16} className="inline mr-2" />
          Slider Principal
        </button>
        <button 
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'categories' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}
        >
          <Grid size={16} className="inline mr-2" />
          Categorías Inicio
        </button>
        <button 
          onClick={() => setActiveTab('titles')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'titles' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}
        >
          <Type size={16} className="inline mr-2" />
          Títulos y Textos
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {message.text}
        </div>
      )}

      {activeTab === 'slider' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-serif text-black">Diapositivas del Slider</h3>
            <button 
              onClick={handleAddSlide}
              className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors"
            >
              <PlusCircle size={16} />
              <span>Añadir Diapositiva</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {slides.map((slide, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4 relative group">
                <button 
                  onClick={() => handleRemoveSlide(idx)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Imagen de la Diapositiva</label>
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center space-x-2">
                          <input 
                            type="text"
                            value={slide.image_url}
                            onChange={(e) => handleUpdateSlide(idx, 'image_url', e.target.value)}
                            className="flex-1 border border-gray-200 px-4 py-2 rounded-lg text-sm outline-none focus:border-black"
                            placeholder="URL de la imagen o sube una..."
                          />
                          <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors" title="Subir imagen">
                            <Upload size={18} className="text-gray-600" />
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(idx, file);
                              }}
                            />
                          </label>
                        </div>
                        <div className="h-40 bg-gray-50 rounded-lg overflow-hidden border border-dashed border-gray-200 flex items-center justify-center relative group/preview">
                          {slide.image_url ? (
                            <img src={slide.image_url} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="text-center">
                              <ImageIcon size={32} className="text-gray-300 mx-auto mb-2" />
                              <p className="text-[10px] text-gray-400">Sin imagen seleccionada</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Título</label>
                      <input 
                        type="text"
                        value={slide.title}
                        onChange={(e) => handleUpdateSlide(idx, 'title', e.target.value)}
                        className="w-full border border-gray-200 px-4 py-2 rounded-lg text-sm outline-none focus:border-black"
                        placeholder="Título de la diapositiva"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Subtítulo</label>
                      <textarea 
                        value={slide.subtitle}
                        onChange={(e) => handleUpdateSlide(idx, 'subtitle', e.target.value)}
                        className="w-full border border-gray-200 px-4 py-2 rounded-lg text-sm outline-none focus:border-black h-20 resize-none"
                        placeholder="Descripción corta"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Texto del Botón</label>
                      <input 
                        type="text"
                        value={slide.button_text}
                        onChange={(e) => handleUpdateSlide(idx, 'button_text', e.target.value)}
                        className="w-full border border-gray-200 px-4 py-2 rounded-lg text-sm outline-none focus:border-black"
                        placeholder="Descubrir Colección"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Alineación del Contenido</label>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleUpdateSlide(idx, 'alignment', 'left')}
                          className={`p-2 rounded-lg border transition-all ${slide.alignment === 'left' ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-200 hover:border-black hover:text-black'}`}
                          title="Izquierda"
                        >
                          <AlignLeft size={18} />
                        </button>
                        <button 
                          onClick={() => handleUpdateSlide(idx, 'alignment', 'center')}
                          className={`p-2 rounded-lg border transition-all ${slide.alignment === 'center' || !slide.alignment ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-200 hover:border-black hover:text-black'}`}
                          title="Centro"
                        >
                          <AlignCenter size={18} />
                        </button>
                        <button 
                          onClick={() => handleUpdateSlide(idx, 'alignment', 'right')}
                          className={`p-2 rounded-lg border transition-all ${slide.alignment === 'right' ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-200 hover:border-black hover:text-black'}`}
                          title="Derecha"
                        >
                          <AlignRight size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 flex items-center">
                      <TypeIcon size={16} className="mr-2" />
                      Tamaños de Fuente Responsivos
                    </h4>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                      <button 
                        onClick={() => setResponsiveTab('desktop')}
                        className={`p-1.5 rounded-md transition-all ${responsiveTab === 'desktop' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-black'}`}
                        title="Escritorio"
                      >
                        <Monitor size={14} />
                      </button>
                      <button 
                        onClick={() => setResponsiveTab('tablet')}
                        className={`p-1.5 rounded-md transition-all ${responsiveTab === 'tablet' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-black'}`}
                        title="Tablet"
                      >
                        <Tablet size={14} />
                      </button>
                      <button 
                        onClick={() => setResponsiveTab('mobile')}
                        className={`p-1.5 rounded-md transition-all ${responsiveTab === 'mobile' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-black'}`}
                        title="Móvil"
                      >
                        <Smartphone size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Título ({responsiveTab})</label>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="range" 
                          min="12" 
                          max="120" 
                          value={slide[`title_size_${responsiveTab}`] || 48}
                          onChange={(e) => handleUpdateSlide(idx, `title_size_${responsiveTab}`, e.target.value)}
                          className="flex-1 accent-black"
                        />
                        <span className="text-xs font-medium w-8">{slide[`title_size_${responsiveTab}`] || 48}px</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Subtítulo ({responsiveTab})</label>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="range" 
                          min="10" 
                          max="60" 
                          value={slide[`subtitle_size_${responsiveTab}`] || 18}
                          onChange={(e) => handleUpdateSlide(idx, `subtitle_size_${responsiveTab}`, e.target.value)}
                          className="flex-1 accent-black"
                        />
                        <span className="text-xs font-medium w-8">{slide[`subtitle_size_${responsiveTab}`] || 18}px</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Botón ({responsiveTab})</label>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="range" 
                          min="8" 
                          max="30" 
                          value={slide[`button_size_${responsiveTab}`] || 12}
                          onChange={(e) => handleUpdateSlide(idx, `button_size_${responsiveTab}`, e.target.value)}
                          className="flex-1 accent-black"
                        />
                        <span className="text-xs font-medium w-8">{slide[`button_size_${responsiveTab}`] || 12}px</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t">
            <button 
              onClick={handleSaveSlides}
              disabled={saving}
              className="bg-black text-white px-8 py-3 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <span>Guardar Cambios del Slider</span>}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-serif text-black">Categorías en Página de Inicio</h3>
            <button 
              onClick={handleAddCategory}
              className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors"
            >
              <PlusCircle size={16} />
              <span>Añadir Categoría</span>
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <Reorder.Group 
              axis="y" 
              values={categories} 
              onReorder={setCategories}
              className="space-y-4"
            >
              {categories.map((cat, idx) => (
                <Reorder.Item 
                  key={cat.id || cat.temp_id || `idx-${idx}`} 
                  value={cat}
                  className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 p-4 bg-gray-50 rounded-xl cursor-grab active:cursor-grabbing border border-transparent hover:border-gray-200 transition-colors"
                >
                  <div className="hidden md:flex items-center text-gray-400">
                    <GripVertical size={20} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Nombre del Botón</label>
                    <input 
                      type="text"
                      value={cat.name}
                      onChange={(e) => handleUpdateCategory(idx, 'name', e.target.value)}
                      className="w-full border border-gray-200 px-4 py-2 rounded-lg text-sm outline-none focus:border-black bg-white"
                      placeholder="Ej: Rosas, Orquídeas..."
                      onPointerDown={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="flex-[1.5]">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Enlace / Destino (Opcional)</label>
                    <input 
                      type="text"
                      value={cat.target_link || ''}
                      onChange={(e) => handleUpdateCategory(idx, 'target_link', e.target.value)}
                      className="w-full border border-gray-200 px-4 py-2 rounded-lg text-sm outline-none focus:border-black bg-white"
                      placeholder="Ej: #galeria o /productos?categoria=Rosas"
                      onPointerDown={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <p className="text-[10px] text-gray-400 mt-1 italic">Si se deja vacío, vinculará automáticamente a la categoría de productos.</p>
                  </div>
                  <div className="flex items-end h-full pt-4 md:pt-0">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveCategory(idx);
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                      onPointerDown={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
            {categories.length === 0 && (
              <p className="text-center text-gray-400 py-4 italic">No hay categorías configuradas para el inicio.</p>
            )}
          </div>

          <div className="pt-6 border-t">
            <button 
              onClick={handleSaveCategories}
              disabled={saving}
              className="bg-black text-white px-8 py-3 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <span>Guardar Categorías</span>}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'titles' && (
        <div className="space-y-6">
          <h3 className="text-xl font-serif text-black">Títulos de Secciones</h3>
          
          <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-widest text-gray-400 border-b pb-2">Sección Edición Especial</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Título Principal</label>
                    <input 
                      type="text"
                      value={settings.special_edition_title || ''}
                      onChange={(e) => setSettings({...settings, special_edition_title: e.target.value})}
                      className="w-full border border-gray-200 px-4 py-3 rounded-lg outline-none focus:border-black transition-colors"
                      placeholder="NUESTROS ARREGLOS"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subtítulo</label>
                    <input 
                      type="text"
                      value={settings.special_edition_subtitle || ''}
                      onChange={(e) => setSettings({...settings, special_edition_subtitle: e.target.value})}
                      className="w-full border border-gray-200 px-4 py-3 rounded-lg outline-none focus:border-black transition-colors"
                      placeholder="Lo más vendido"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-widest text-gray-400 border-b pb-2">Catálogo General</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Título de Sección</label>
                    <input 
                      type="text"
                      value={settings.catalog_title || ''}
                      onChange={(e) => setSettings({...settings, catalog_title: e.target.value})}
                      className="w-full border border-gray-200 px-4 py-3 rounded-lg outline-none focus:border-black transition-colors"
                      placeholder="Catálogo Completo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subtítulo de Sección</label>
                    <input 
                      type="text"
                      value={settings.catalog_subtitle || ''}
                      onChange={(e) => setSettings({...settings, catalog_subtitle: e.target.value})}
                      className="w-full border border-gray-200 px-4 py-3 rounded-lg outline-none focus:border-black transition-colors"
                      placeholder="Todos Nuestros Productos"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-widest text-gray-400 border-b pb-2">Vista Previa (Edición Especial)</h4>
                  <div className="p-6 bg-gray-50 rounded-lg text-center">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-black mb-2 font-semibold">
                      {settings.special_edition_title || 'NUESTROS ARREGLOS'}
                    </p>
                    <h3 className="text-2xl font-serif text-black">
                      {settings.special_edition_subtitle || 'Lo más vendido'}
                    </h3>
                    <div className="w-8 h-[2px] bg-black mx-auto mt-4" />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <button 
                  type="submit"
                  disabled={saving}
                  className="bg-black text-white px-8 py-3 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <span>Guardar Títulos</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-black mx-auto mb-4" />
          <p className="text-gray-500 font-serif">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/ventas" replace />} />
        <Route path="/ventas" element={<AdminSales />} />
        <Route path="/pedidos" element={<AdminOrders />} />
        <Route path="/productos" element={<AdminProducts />} />
        <Route path="/usuarios" element={<AdminUsers />} />
        <Route path="/perfil" element={<AdminProfile />} />
        <Route path="/personalizacion" element={<AdminStoreCustomization />} />
        <Route path="/galeria" element={<AdminGallery />} />
      </Routes>
    </AdminLayout>
  );
};
