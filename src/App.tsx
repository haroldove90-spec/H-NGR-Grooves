/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, createContext, useContext, Component } from 'react';
import { ShoppingCart, Menu, X, ChevronRight, ChevronLeft, MessageCircle, Award, HeartHandshake, Snowflake, Home, Store, Phone, Shield, ShoppingBag, Search, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useLocation, Navigate } from 'react-router-dom';
import { Product, ProductProvider, useProducts } from './context/ProductContext';
import { AuthProvider } from './context/AuthContext';
import { AdminRoutes } from './pages/Admin';
import Login from './pages/Login';
import { supabase, isSupabaseConfigured } from './lib/supabase';

class ErrorBoundary extends (Component as any) {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-center">
          <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-red-100">
            <h2 className="text-2xl font-serif text-red-600 mb-4">Algo salió mal</h2>
            <p className="text-gray-600 mb-6">La aplicación encontró un error inesperado.</p>
            <pre className="bg-gray-50 p-4 rounded text-xs text-left overflow-auto mb-6 max-h-40">
              {this.state.error?.message || "Error desconocido"}
            </pre>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Recargar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const ConfigMissingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-center">
    <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-orange-100">
      <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <Shield size={32} />
      </div>
      <h2 className="text-2xl font-serif text-black mb-4">Configuración Faltante</h2>
      <p className="text-gray-600 mb-6">
        Parece que faltan las variables de entorno de Supabase (<code className="bg-gray-100 px-1 rounded">VITE_SUPABASE_URL</code> y <code className="bg-gray-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code>).
      </p>
      <div className="text-sm text-left bg-gray-50 p-4 rounded mb-6 space-y-2">
        <p className="font-bold">Pasos para solucionar:</p>
        <ol className="list-decimal list-inside space-y-1 text-gray-500">
          <li>Ve al dashboard de Vercel.</li>
          <li>Entra en Settings &gt; Environment Variables.</li>
          <li>Añade las dos variables mencionadas arriba.</li>
          <li>Realiza un nuevo despliegue (Redeploy).</li>
        </ol>
      </div>
      <p className="text-xs text-gray-400 italic">Si estás en local, asegúrate de tener un archivo .env configurado.</p>
    </div>
  </div>
);

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pathname, hash]);
  return null;
};

// --- Context ---
type CartItem = {
  product: Product;
  quantity: number;
};

const CartContext = createContext<{
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
} | null>(null);

const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);

  const addToCart = (product: Product, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { product, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      cartCount, 
      cartTotal, 
      isCartOpen, 
      setIsCartOpen,
      checkoutProduct,
      setCheckoutProduct
    }}>
      {children}
    </CartContext.Provider>
  );
};

const WHATSAPP_ORDER_TEMPLATE = `🌸HOJA DE PEDIDO🌸

🌸POR FAVOR COPIE, PEGUE, LLENE Y REENVÍE PARA ELABORAR SU PEDIDO.


🌻Nombre y apellido de quien manda el obsequio. (Este dato es exclusivo para la florería y necesario para elaborar su pedido).
R:

🌻Nombre y apellido de la persona que recibe.
R:

🌻Teléfono de la persona que recibe, no se le llamará a menos que sea necesario.
R:

🌻Dirección de la persona. Calle, Número exterior e interior.
R:

🌻Ubicación en Maps o Waze.
R:

🌻Fecha de entrega.
R:

🌻Hora de entrega, con rango de 4 horas, ejem: entre 12:00 y 4:00 pm, inicio de entregas 9:30am.
R:

🌻Texto de la tarjeta, si es que lleva.
R:

🌻Le confirmaremos su entrega una vez recibida en el domicilio.



🌸EN CASO DE NO ENCONTRARSE LA PERSONA, EL OBSEQUIO SE REGRESARA  A LA FLORERÍA DONDE PODRÁ RECOGERLO O RE AGENDAR UNA SEGUNDA ENTREGA CON COSTO IGUAL AL DEL PRIMER ENVÍO; POR ESTE RAZÓN LE PEDIMOS QUE LOS DATOS SEAN CORRECTOS Y ESTÉN COMPLETOS

🌸ATT: FLORERÍA RICARDO`;

const CheckoutModal = () => {
  const { checkoutProduct, setCheckoutProduct } = useCart();

  const handleConfirm = () => {
    const message = `🌟 *NUEVO PEDIDO - FLORERÍA RICARDO* 🌟\n\n¡Hola! Me gustaría comprar el siguiente producto:\n\n🛍️ *Producto:* ${checkoutProduct?.name}\n💰 *Precio:* $${checkoutProduct?.price.toFixed(2)}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/525559623337?text=${encodedMessage}`, '_blank');
    setCheckoutProduct(null);
  };

  if (!checkoutProduct) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white w-full max-w-md rounded-lg p-8 shadow-2xl"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-serif text-black uppercase tracking-widest">Confirmar Pedido</h2>
            <button onClick={() => setCheckoutProduct(null)} className="text-black/40 hover:text-black transition-colors">
              <X size={24} />
            </button>
          </div>
          
          <div className="mb-8 flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
            <img src={checkoutProduct.image} alt={checkoutProduct.name} className="w-20 h-20 object-cover rounded-md" />
            <div>
              <h3 className="font-serif text-lg text-black">{checkoutProduct.name}</h3>
              <p className="text-black font-bold">${checkoutProduct.price.toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-black/60 italic text-center mb-4">
              Al hacer clic en el botón, se abrirá WhatsApp con una hoja de pedido que deberás completar para finalizar tu compra.
            </p>
            <button 
              onClick={handleConfirm}
              className="w-full py-4 bg-black text-white font-bold uppercase tracking-[0.2em] text-xs hover:bg-gray-800 transition-all flex items-center justify-center space-x-3 rounded-md"
            >
              <MessageCircle size={20} />
              <span>Continuar en WhatsApp</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// --- Components ---
const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartCount, setIsCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-black shadow-sm py-4' : 'bg-black/80 py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        {/* Mobile Menu Button */}
        <button className="md:hidden text-white transition-colors" onClick={() => setMobileMenuOpen(true)}>
          <Menu size={24} />
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center justify-center">
          <img 
            src="https://appdesignproyectos.com/floreriaricardo.jpg" 
            alt="Florería Ricardo" 
            className="h-10 md:h-12 object-contain"
            referrerPolicy="no-referrer"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-10 items-center">
          <Link to="/" className="text-xs uppercase tracking-[0.2em] text-white transition-colors hover:text-gold">Inicio</Link>
          <a href="/#tienda" className="text-xs uppercase tracking-[0.2em] text-white transition-colors hover:text-gold">Tienda</a>
          <a href="/#galeria" className="text-xs uppercase tracking-[0.2em] text-white transition-colors hover:text-gold">Galería</a>
          <a href="#contacto" className="text-xs uppercase tracking-[0.2em] text-white transition-colors hover:text-gold">Contacto</a>
          <Link to="/admin" className="text-xs uppercase tracking-[0.2em] text-white font-bold transition-colors hover:text-gold">Admin</Link>
        </nav>

        {/* Cart */}
        <button onClick={() => setIsCartOpen(true)} className="relative text-white transition-colors hover:text-gold">
          <ShoppingCart size={22} strokeWidth={1.5} />
          <AnimatePresence>
            {cartCount > 0 && (
              <motion.span 
                key={cartCount}
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ duration: 0.3 }}
                exit={{ scale: 0 }}
                className="absolute -top-2 -right-2 bg-white text-black text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-bold shadow-sm z-10"
              >
                {cartCount}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-black z-50 flex flex-col p-6 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-12 relative z-10">
              <img 
                src="https://appdesignproyectos.com/floreriaricardo.jpg" 
                alt="Florería Ricardo" 
                className="h-12 object-contain"
                referrerPolicy="no-referrer"
              />
              <button 
                onClick={() => setMobileMenuOpen(false)} 
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black shadow-sm border border-gray-200 active:scale-90 transition-transform"
              >
                <X size={24} strokeWidth={2} />
              </button>
            </div>
            
            <nav className="flex flex-col space-y-4 relative z-10">
              <Link 
                to="/" 
                className="group flex items-center space-x-4 p-4 rounded-2xl bg-white/5 border border-white/10 active:scale-95 transition-all" 
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center group-hover:bg-white group-hover:text-gold transition-colors">
                  <Home size={24} strokeWidth={1.5} />
                </div>
                <span className="text-xl font-serif text-white font-medium group-hover:text-gold">Inicio</span>
              </Link>
              
              <a 
                href="/#tienda" 
                className="group flex items-center space-x-4 p-4 rounded-2xl bg-black shadow-sm border border-gray-800 active:scale-95 transition-all" 
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center group-hover:bg-white group-hover:text-gold transition-colors">
                  <Store size={24} strokeWidth={1.5} />
                </div>
                <span className="text-xl font-serif text-white font-medium group-hover:text-gold">Tienda</span>
              </a>

              <a 
                href="/#galeria" 
                className="group flex items-center space-x-4 p-4 rounded-2xl bg-black shadow-sm border border-gray-800 active:scale-95 transition-all" 
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center group-hover:bg-white group-hover:text-gold transition-colors">
                  <Store size={24} strokeWidth={1.5} />
                </div>
                <span className="text-xl font-serif text-white font-medium group-hover:text-gold">Galería</span>
              </a>
              
              <a 
                href="#contacto" 
                className="group flex items-center space-x-4 p-4 rounded-2xl bg-black shadow-sm border border-gray-800 active:scale-95 transition-all" 
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center group-hover:bg-white group-hover:text-gold transition-colors">
                  <Phone size={24} strokeWidth={1.5} />
                </div>
                <span className="text-xl font-serif text-white font-medium group-hover:text-gold">Contacto</span>
              </a>
              
              <Link 
                to="/admin" 
                className="group flex items-center space-x-4 p-4 rounded-2xl bg-white shadow-sm border border-gray-100 active:scale-95 transition-all mt-4" 
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center shadow-md group-hover:bg-gold group-hover:text-black transition-colors">
                  <Shield size={24} strokeWidth={1.5} />
                </div>
                <span className="text-xl font-serif text-black font-bold group-hover:text-gold">Admin</span>
              </Link>
            </nav>
            
            <div className="mt-auto text-center pb-8 relative z-10">
              <div className="w-16 h-1 bg-gray-800 mx-auto rounded-full mb-6"></div>
              <p className="text-white/50 text-sm font-light uppercase tracking-widest">La belleza de las flores en</p>
              <p className="text-white font-serif text-lg mt-1">Florería Ricardo</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const HeroSlider = ({ customSlides }: { customSlides?: any[] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const defaultSlides = [
    {
      image: "https://media.istockphoto.com/id/902155732/es/foto/mixto-ramo-de-flores.jpg?b=1&s=612x612&w=0&k=20&c=N-npmQDqTzcnJitpfHhfpJqWE7br9EaN84f78c7eFcg=",
      text: "La belleza de las flores en cada rincón. Descubre nuestros arreglos exclusivos.",
      subtitle: "",
      button: "Descubrir Colección"
    },
    {
      image: "https://media.istockphoto.com/id/1401141400/es/foto/bodeg%C3%B3n-de-oto%C3%B1o-con-flores-de-jard%C3%ADn-hermoso-ramo-oto%C3%B1al-en-jarr%C3%B3n-manzanas-y-bayas-sobre.jpg?s=612x612&w=0&k=20&c=6_dKEjb4b2Tpmm2vT00JwK6DGuU-KBy-sWdyam_6GrM=",
      text: "Arreglos florales diseñados con pasión. Rosas, tulipanes y flores de temporada.",
      subtitle: "",
      button: "Descubrir Colección"
    },
    {
      image: "https://wallpapers.com/images/hd/floral-arrangement-2048-x-1365-wallpaper-vgmffof84qm8o3av.jpg",
      text: "Expresa tus sentimientos con flores. Entregas a domicilio con frescura garantizada.",
      subtitle: "",
      button: "Descubrir Colección"
    }
  ];

  const slides = customSlides && customSlides.length > 0 
    ? customSlides.map(s => ({ 
        image: s.image_url, 
        text: s.title, 
        subtitle: s.subtitle, 
        button: s.button_text,
        alignment: s.alignment || 'center',
        titleSize: {
          desktop: s.title_size_desktop || 48,
          tablet: s.title_size_tablet || 36,
          mobile: s.title_size_mobile || 24
        },
        subtitleSize: {
          desktop: s.subtitle_size_desktop || 18,
          tablet: s.subtitle_size_tablet || 16,
          mobile: s.subtitle_size_mobile || 14
        },
        buttonSize: {
          desktop: s.button_size_desktop || 12,
          tablet: s.button_size_tablet || 11,
          mobile: s.button_size_mobile || 10
        }
      }))
    : defaultSlides.map(s => ({ 
        ...s, 
        alignment: 'center',
        titleSize: { desktop: 48, tablet: 36, mobile: 24 },
        subtitleSize: { desktop: 18, tablet: 16, mobile: 14 },
        buttonSize: { desktop: 12, tablet: 11, mobile: 10 }
      }));

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  if (slides.length === 0) return null;

  const getAlignmentClasses = (alignment: string) => {
    switch (alignment) {
      case 'left': return 'items-center text-center md:items-start md:text-left';
      case 'right': return 'items-center text-center md:items-end md:text-right';
      default: return 'items-center text-center';
    }
  };

  return (
    <div 
      className="relative h-[calc(100vh-88px)] md:h-[calc(100vh-96px)] w-full overflow-hidden bg-black"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-black/40 z-10 mix-blend-multiply" />
          <div className="absolute inset-0 bg-black/20 z-10" />
          <img 
            src={slides[currentSlide].image} 
            alt="Slide" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className={`absolute inset-0 z-20 flex flex-col justify-center px-6 md:px-24 ${getAlignmentClasses(slides[currentSlide].alignment)}`}>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-white font-serif max-w-4xl leading-tight font-light"
              style={{
                fontSize: `var(--title-size-${currentSlide})`
              } as any}
            >
              <style dangerouslySetInnerHTML={{ __html: `
                :root {
                  --title-size-${currentSlide}: ${slides[currentSlide].titleSize.mobile}px;
                  --subtitle-size-${currentSlide}: ${slides[currentSlide].subtitleSize.mobile}px;
                  --button-size-${currentSlide}: ${slides[currentSlide].buttonSize.mobile}px;
                }
                @media (min-width: 768px) {
                  :root {
                    --title-size-${currentSlide}: ${slides[currentSlide].titleSize.tablet}px;
                    --subtitle-size-${currentSlide}: ${slides[currentSlide].subtitleSize.tablet}px;
                    --button-size-${currentSlide}: ${slides[currentSlide].buttonSize.tablet}px;
                  }
                }
                @media (min-width: 1024px) {
                  :root {
                    --title-size-${currentSlide}: ${slides[currentSlide].titleSize.desktop}px;
                    --subtitle-size-${currentSlide}: ${slides[currentSlide].subtitleSize.desktop}px;
                    --button-size-${currentSlide}: ${slides[currentSlide].buttonSize.desktop}px;
                  }
                }
              `}} />
              {slides[currentSlide].text}
            </motion.p>
            {slides[currentSlide].subtitle && (
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-white/80 font-light mt-4 max-w-2xl"
                style={{ fontSize: `var(--subtitle-size-${currentSlide})` }}
              >
                {slides[currentSlide].subtitle}
              </motion.p>
            )}
            <motion.a
              href="#tienda"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className={`mt-12 px-6 md:px-10 py-4 bg-white text-black font-semibold uppercase tracking-[0.2em] hover:bg-black hover:text-gold transition-all duration-500 shadow-lg border border-white whitespace-nowrap ${!slides[currentSlide].button ? 'hidden' : 'block'}`}
              style={{ fontSize: `var(--button-size-${currentSlide})` }}
            >
              {slides[currentSlide].button}
            </motion.a>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="absolute z-30 bottom-12 left-0 right-0 flex justify-center space-x-4">
        {slides.map((_, idx) => (
          <button 
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-[2px] transition-all duration-500 ${idx === currentSlide ? 'bg-white w-12' : 'bg-white/30 w-6'}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
      
      <button onClick={prevSlide} className="absolute z-30 left-4 md:left-12 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-4">
        <ChevronLeft size={32} strokeWidth={1} />
      </button>
      <button onClick={nextSlide} className="absolute z-30 right-4 md:right-12 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-4">
        <ChevronRight size={32} strokeWidth={1} />
      </button>
    </div>
  );
};

const WelcomeSection = () => {
  const phoneNumber = "525559623337";
  const message = `Hola! Me gustaría solicitar informes sobre las promociones del mes y arreglos florales.\n\nAtte: [Tu Nombre]`;
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  return (
    <section className="pt-2 pb-10 px-6 md:px-12 max-w-6xl mx-auto text-center">
      <div className="bg-[#62CAC9] p-8 md:p-10 rounded-sm shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:shadow-md">
        <p className="text-white text-2xl md:text-3xl font-serif leading-relaxed italic font-medium text-left flex-1">
          "Pregunta por nuestras promociones de cada mes"
        </p>
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white text-[#62CAC9] px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black hover:text-white transition-all flex items-center space-x-2 whitespace-nowrap shadow-sm"
        >
          <MessageCircle size={18} />
          <span>Solicitar Informes</span>
        </a>
      </div>
    </section>
  );
};

const createSlug = (text: string) => {
  return text.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, '');
};

const HomeCategories = ({ customCategories }: { customCategories?: any[] }) => {
  const defaultCategories = [
    { name: "Ramos" },
    { name: "Cajas" },
    { name: "Arreglos" },
    { name: "Orquídeas" },
    { name: "Globos" },
    { name: "Eventos" }
  ];

  const categories = customCategories && customCategories.length > 0 
    ? customCategories
    : defaultCategories;

  return (
    <section className="pb-20 px-6 md:px-12 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {categories.map((cat, idx) => {
          const target = cat.target_link || `/${createSlug(cat.name)}`;
          const isScrollAnchor = target.startsWith('#');
          
          if (isScrollAnchor) {
            return (
              <a 
                key={idx}
                href={target}
                className="bg-[#7CA4C7] hover:bg-[#6A8EB0] text-white py-2.5 px-4 text-center rounded-sm transition-colors duration-300 flex items-center justify-center min-h-[50px] shadow-sm group"
              >
                <span className="text-lg md:text-base font-serif tracking-widest uppercase group-hover:scale-105 transition-transform duration-300">{cat.name}</span>
              </a>
            );
          }

          return (
            <Link 
              key={idx}
              to={target}
              className="bg-[#7CA4C7] hover:bg-[#6A8EB0] text-white py-2.5 px-4 text-center rounded-sm transition-colors duration-300 flex items-center justify-center min-h-[50px] shadow-sm group"
            >
              <span className="text-lg md:text-base font-serif tracking-widest uppercase group-hover:scale-105 transition-transform duration-300">{cat.name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

const PhotoGallery = ({ category }: { category?: string | null }) => {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const openPhoto = (photo: any, index: number) => {
    setSelectedPhoto(photo);
    setSelectedIndex(index);
  };

  const nextPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (photos.length === 0) return;
    const nextIdx = (selectedIndex + 1) % photos.length;
    setSelectedIndex(nextIdx);
    setSelectedPhoto(photos[nextIdx]);
  };

  const prevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (photos.length === 0) return;
    const prevIdx = (selectedIndex - 1 + photos.length) % photos.length;
    setSelectedIndex(prevIdx);
    setSelectedPhoto(photos[prevIdx]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPhoto) return;
      if (e.key === 'Escape') setSelectedPhoto(null);
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, selectedIndex, photos]);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        let query = supabase
          .from('gallery')
          .select('*')
          .order('display_order', { ascending: true });
        
        if (category) {
          query = query.eq('category', category);
        }

        const { data, error } = await query;
        
        if (error) throw error;
        setPhotos(data || []);
      } catch (error) {
        console.error('Error fetching gallery:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [category]);

  if (loading) return null;
  
  if (photos.length === 0 && !category) return null;

  return (
    <section id="galeria" className={`${category ? 'py-12' : 'py-24'} bg-white overflow-hidden`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className={`text-center ${category ? 'mb-8' : 'mb-16'}`}>
          <h2 className="text-3xl md:text-4xl font-serif text-black mb-4 uppercase tracking-[0.2em]">
            {category ? `Galería: ${category}` : 'Nuestra Galería'}
          </h2>
          <div className="w-24 h-px bg-gold mx-auto mb-6"></div>
          {!category && (
            <p className="text-gray-500 font-light max-w-2xl mx-auto">
              Descubre la belleza capturada en cada uno de nuestros diseños. Momentos reales, flores frescas y pura pasión.
            </p>
          )}
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-sm border border-dashed border-gray-200">
            <p className="text-gray-400 font-light italic">Aún no hay fotos en esta categoría.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, idx) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx % 4 * 0.1 }}
                className="aspect-square overflow-hidden bg-gray-100 rounded-sm relative group cursor-pointer"
                onClick={() => openPhoto(photo, idx)}
              >
                <img 
                  src={photo.image_url} 
                  alt="Florería Ricardo Gallery" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-500 flex items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Search size={24} />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-black/95 backdrop-blur-md"
            onClick={() => setSelectedPhoto(null)}
          >
            <div className="absolute top-6 left-6 flex items-center space-x-2 text-white/50 text-xs tracking-widest uppercase">
              <span className="font-bold text-white">{selectedIndex + 1}</span>
              <span>/</span>
              <span>{photos.length}</span>
            </div>

            <motion.button
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute top-6 right-6 text-white hover:text-gold transition-colors p-2 z-[110] bg-white/10 rounded-full backdrop-blur-sm"
              onClick={() => setSelectedPhoto(null)}
            >
              <X size={32} strokeWidth={1} />
            </motion.button>

            {photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-all p-4 z-[110] hover:bg-white/5 rounded-full"
                >
                  <ChevronLeft size={48} strokeWidth={1} />
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-all p-4 z-[110] hover:bg-white/5 rounded-full"
                >
                  <ChevronRight size={48} strokeWidth={1} />
                </button>
              </>
            )}
            
            <motion.div
              key={selectedPhoto.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative max-w-full max-h-full flex items-center justify-center p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedPhoto.image_url} 
                alt="Gallery Preview" 
                className="max-w-full max-h-[85vh] object-contain shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-sm"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-10 left-0 right-0 text-center">
                <p className="text-white font-serif text-lg tracking-widest uppercase">Florería Ricardo</p>
                <p className="text-white/40 text-[10px] tracking-[0.3em] mt-2">DISEÑO EXCLUSIVO</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

const ValuesSection = () => {
  const values = [
    {
      title: "Diseño Floral Exclusivo",
      desc: "Cada arreglo es único, diseñado por expertos floristas para capturar la esencia de cada ocasión.",
      icon: Award
    },
    {
      title: "Entrega Personalizada",
      desc: "Nos aseguramos de que tus flores lleguen en el momento perfecto y con el cuidado que merecen.",
      icon: HeartHandshake
    },
    {
      title: "Máxima Frescura",
      desc: "Seleccionamos nuestras flores diariamente para garantizar que duren mucho más tiempo en tu hogar.",
      icon: Snowflake
    }
  ];

  return (
    <section className="py-24 bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12 text-center">
          {values.map((val, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className="w-16 h-16 border-2 border-white/20 rounded-full flex items-center justify-center mb-8 text-white">
                <val.icon size={28} strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-serif mb-4 uppercase tracking-[0.15em] text-white">{val.title}</h3>
              <p className="text-white/80 font-light leading-relaxed text-sm md:text-base max-w-xs">
                {val.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FeaturedCategories = () => {
  const categories = [
    {
      name: "Rosas Rojas",
      desc: "El símbolo clásico del amor y la pasión. Rosas de tallo largo seleccionadas por su color y fragancia.",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzTjXosrNpDic79eqybv-O5EslfXS6wlgpLg&s"
    },
    {
      name: "Tulipanes",
      desc: "Elegancia y frescura en una variedad de colores vibrantes. Perfectos para iluminar cualquier espacio.",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaBkHMX2ZKrElpc1NXO7fNglXzVp-DWrX2wg&s"
    },
    {
      name: "Arreglos Mixtos",
      desc: "Combinaciones artísticas de flores de temporada que crean texturas y aromas únicos.",
      image: "https://floreriamayela.com/wp-content/uploads/2019/12/A314.jpg"
    },
    {
      name: "Ocasiones Especiales",
      desc: "Diseños exclusivos para bodas, aniversarios y momentos que merecen ser celebrados con flores.",
      image: "https://i.pinimg.com/736x/e2/99/05/e2990573cdd3c1d03468a5cb62542990.jpg"
    },
    {
      name: "Lo más vendido",
      desc: "Nuestra colección más exclusiva de arreglos premium y detalles únicos para los gustos más exigentes.",
      image: "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSJ4YWuFqLKrPpSlUgLC5yi-J5IkFKFhF3jcW1h21CkDnUUjVmQi8AvwdNNrrmTzqas2gvXEC4UbP_ZMLVR5SMxHTGP5K7Fm2dcviaHclJjZUorRjH7S1TOpZw"
    }
  ];

  return (
    <section className="py-32 px-4 md:px-12 max-w-7xl mx-auto">
      <div className="text-center mb-12 md:mb-20">
        <h2 className="text-xs uppercase tracking-[0.3em] text-black mb-4 font-semibold">Nuestros Arreglos</h2>
        <h3 className="text-3xl md:text-5xl font-serif text-black mb-6">Categorías Destacadas</h3>
        <div className="w-12 h-[2px] bg-black mx-auto" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-10 lg:gap-16">
        {categories.map((cat, idx) => (
          <motion.div 
            key={idx}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.4 }}
            className="group cursor-pointer flex flex-col"
          >
            <div className="relative h-64 md:h-[450px] overflow-hidden mb-4 md:mb-8">
              <img 
                src={cat.image} 
                alt={cat.name} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
            </div>
            <div className="text-center px-2 md:px-4">
              <h4 className="text-lg md:text-2xl font-serif text-black mb-2 md:mb-4">{cat.name}</h4>
              <p className="text-black/80 font-light text-xs md:text-sm leading-relaxed mb-4 md:mb-6 max-w-md mx-auto line-clamp-3 md:line-clamp-none">
                {cat.desc}
              </p>
              <Link to={`/productos?categoria=${encodeURIComponent(cat.name)}`} className="inline-flex items-center text-[10px] md:text-xs uppercase tracking-[0.2em] text-black font-bold hover:text-gray-600 transition-colors">
                Ver Productos <ChevronRight size={14} className="ml-1 md:ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const PrivacyPolicy = () => (
  <div className="pt-32 pb-24 px-6 md:px-12 max-w-4xl mx-auto">
    <h1 className="text-4xl font-serif text-black mb-8 uppercase tracking-widest">Aviso de Privacidad</h1>
    <div className="space-y-8 text-black/80 leading-relaxed font-light">
      <section>
        <h2 className="text-xl font-serif text-black mb-4 uppercase tracking-wider">Aviso de Privacidad Simplificado</h2>
        <p>
          Florería Ricardo, con domicilio en la zona metropolitana de la Ciudad de México (Tlalnepantla y alrededores), es responsable del tratamiento de sus datos personales.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-bold text-black mb-4 uppercase tracking-widest text-xs">¿Para qué fines utilizaremos sus datos?</h3>
        <p className="mb-4">
          Los datos personales que recopilamos a través de nuestra tienda en línea y WhatsApp serán utilizados para las siguientes finalidades necesarias para el servicio:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Identificación del remitente y confirmación del pedido.</li>
          <li>Logística de entrega en el domicilio indicado.</li>
          <li>Comunicación directa en caso de eventualidades con la entrega.</li>
          <li>Notificación de confirmación de recepción del obsequio.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-bold text-black mb-4 uppercase tracking-widest text-xs">Datos recolectados:</h3>
        <p>
          Recabamos nombre completo (remitente y destinatario), teléfono de contacto, dirección física y ubicación geográfica (Maps/Waze). No compartimos su información con terceros ajenos a la operación de entrega.
        </p>
      </section>
    </div>
  </div>
);

const HowToBuy = () => (
  <div className="pt-32 pb-24 px-6 md:px-12 max-w-4xl mx-auto">
    <h1 className="text-4xl font-serif text-black mb-8 uppercase tracking-widest">¿Cómo Comprar?</h1>
    <div className="space-y-12 text-black/80 leading-relaxed font-light">
      <p className="text-lg italic">
        En esta sección explicamos el proceso para que el cliente sepa que el cierre de la venta es personalizado vía WhatsApp.
      </p>

      <section>
        <h2 className="text-xl font-serif text-black mb-6 uppercase tracking-wider">Pasos para realizar tu pedido:</h2>
        <div className="grid gap-8">
          {[
            {
              step: "01",
              title: "Explora nuestro catálogo",
              desc: "Elige el diseño floral que más te guste de nuestra colección."
            },
            {
              step: "02",
              title: "Haz clic en el botón de WhatsApp",
              desc: "Serás redirigido a nuestro chat oficial para ser atendido por un asesor."
            },
            {
              step: "03",
              title: "Envía tu Hoja de Pedido",
              desc: "Para agilizar el proceso, copia y llena el formato que te aparecerá automáticamente (o solicítalo en el chat)."
            },
            {
              step: "04",
              title: "Realiza tu pago",
              desc: "Te proporcionaremos los métodos de pago disponibles (transferencia, depósito o tarjeta)."
            },
            {
              step: "05",
              title: "Confirmación",
              desc: "Una vez verificado el pago y los datos, tu pedido entrará en ruta de elaboración."
            }
          ].map((item, idx) => (
            <div key={idx} className="flex gap-6 items-start">
              <span className="text-3xl font-serif text-black/20">{item.step}</span>
              <div>
                <h3 className="text-lg font-bold text-black mb-2 uppercase tracking-widest text-xs">{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  </div>
);

const Footer = () => {
  return (
    <footer className="bg-black text-white pt-24 pb-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-20">
        <div className="md:col-span-5 lg:col-span-4">
          <div className="text-3xl font-serif font-semibold tracking-widest uppercase mb-6 text-white">Florería Ricardo</div>
          <p className="text-white/70 font-light text-sm leading-relaxed max-w-sm">
            La belleza de las flores en tu hogar. Arreglos exclusivos y frescura garantizada para cada momento especial.
          </p>
        </div>
        
        <div className="md:col-span-3 lg:col-span-2 lg:col-start-7">
          <h4 className="font-serif text-lg mb-6 uppercase tracking-[0.15em] text-white/60">Enlaces</h4>
          <ul className="space-y-4 text-white/80 font-light text-sm">
            <li><Link to="/" className="hover:text-gold transition-colors">Inicio</Link></li>
            <li><Link to="/productos" className="hover:text-gold transition-colors">Tienda</Link></li>
            <li><Link to="/como-comprar" className="hover:text-gold transition-colors">¿Cómo comprar?</Link></li>
            <li><Link to="/privacidad" className="hover:text-gold transition-colors">Aviso de Privacidad</Link></li>
          </ul>
        </div>
        
        <div className="md:col-span-4 lg:col-span-4">
          <h4 className="font-serif text-lg mb-6 uppercase tracking-[0.15em] text-white/60">Contacto</h4>
          <ul className="space-y-4 text-white/80 font-light text-sm">
            <li>contacto@floreriaricardo.com</li>
            <li>+52 55 4514 4797</li>
            <li className="pt-4">
              <button className="flex items-center justify-center space-x-3 bg-white text-black px-6 py-3 rounded-sm transition-colors w-full sm:w-auto font-bold">
                <MessageCircle size={18} />
                <span className="uppercase tracking-wider text-xs font-medium">Atención por WhatsApp</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-white/50 text-xs font-light">
        <p>&copy; {new Date().getFullYear()} Florería Ricardo. Todos los derechos reservados.</p>
        <div className="mt-4 md:mt-0 flex items-center space-x-6">
          <p>Diseño Minimalista & Premium</p>
          <Link to="/admin" className="hover:text-gold transition-colors">Acceso Admin</Link>
        </div>
      </div>
    </footer>
  );
};

const ProductsSection = ({ customTitles }: { customTitles?: any }) => {
  const { setCheckoutProduct } = useCart();
  const { products, loading } = useProducts();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = React.useState(false);
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
  
  const specialSelection = products.filter(p => p.isSpecial);
  
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  React.useEffect(() => {
    if (loading || specialSelection.length <= 4 || isPaused) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const maxScroll = scrollWidth - clientWidth;
        
        if (scrollLeft >= maxScroll - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scroll('right');
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [loading, specialSelection.length, isPaused]);

  return (
    <section id="tienda" className="py-24 px-4 md:px-6 lg:px-12 max-w-7xl mx-auto overflow-hidden">
      <div className="text-center mb-12 md:mb-16">
        <h2 className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-black mb-4 font-semibold">
          {customTitles?.special_edition_title || 'Nuestros Arreglos'}
        </h2>
        <h3 className="text-3xl md:text-4xl font-serif text-black mb-6">
          {customTitles?.special_edition_subtitle || 'Lo más vendido'}
        </h3>
        <div className="w-12 h-[2px] bg-black mx-auto" />
      </div>
      
      {loading ? (
        <div className="py-20 text-center text-black/50 font-light">Cargando lo más vendido...</div>
      ) : specialSelection.length > 0 ? (
        <div 
          className="relative overflow-visible"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Slider Container */}
          <div 
            ref={scrollRef}
            className={`flex overflow-x-auto snap-x snap-mandatory scrollbar-hide space-x-6 pb-8 ${specialSelection.length <= 4 ? 'lg:justify-center' : ''}`}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {specialSelection.map(product => (
              <div 
                key={product.id} 
                className="flex-none w-[280px] md:w-[300px] lg:w-[calc(25%-18px)] snap-start flex flex-col items-center text-center group bg-white p-4 rounded-sm border border-gray-100 hover:shadow-xl transition-all duration-500"
              >
                <div 
                  className="w-full relative overflow-hidden mb-4 md:mb-6 aspect-[4/5] cursor-zoom-in"
                  onClick={() => setPreviewImage(product.image)}
                >
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 rounded-md" 
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <Search size={24} />
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 bg-black text-white text-[10px] uppercase tracking-widest px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    Especial
                  </div>
                </div>
                <h4 className="text-lg md:text-xl font-serif text-black mb-1 md:mb-2 uppercase tracking-wider">{product.name}</h4>
                <p className="text-black/60 text-xs md:text-sm font-light mb-2 line-clamp-2 h-10">{product.description}</p>
                <p className="text-black font-bold text-lg md:text-base mb-4 md:mb-6">${product.price.toFixed(2)}</p>
                <button 
                  onClick={() => setCheckoutProduct(product)}
                  className="px-3 md:px-6 py-3 bg-[#62CAC9] text-white text-xs md:text-sm hover:bg-[#4FB4B3] transition-colors w-full uppercase tracking-widest font-bold flex items-center justify-center space-x-2 rounded-sm shadow-sm"
                >
                  <MessageCircle size={18} />
                  <span>Comprar Ahora</span>
                </button>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          {specialSelection.length > 4 && (
            <>
              <button 
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 lg:-translate-x-12 bg-white text-black p-3 rounded-full shadow-lg hover:bg-black hover:text-white z-10 hidden md:block transition-all border border-gray-100"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 lg:translate-x-12 bg-white text-black p-3 rounded-full shadow-lg hover:bg-black hover:text-white z-10 hidden md:block transition-all border border-gray-100"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="py-20 text-center text-black/40 font-light italic">
          No hay productos marcados como especiales en este momento.
        </div>
      )}

      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-black/95 backdrop-blur-md"
            onClick={() => setPreviewImage(null)}
          >
            <motion.button
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute top-6 right-6 text-white hover:text-gold transition-colors p-2 z-[110] bg-white/10 rounded-full backdrop-blur-sm"
              onClick={() => setPreviewImage(null)}
            >
              <X size={32} strokeWidth={1} />
            </motion.button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative max-w-full max-h-full flex items-center justify-center p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={previewImage} 
                alt="Product Preview" 
                className="max-w-full max-h-[85vh] object-contain shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-sm"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

const ProductPage = () => {
  const { id } = useParams();
  const { products, categories } = useProducts();
  const product = products.find(p => p.id === Number(id));
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImage(product.image);
    }
  }, [product]);

  if (!product) return <div className="pt-40 text-center text-2xl">Producto no encontrado</div>;

  return (
    <div className="pt-[88px] md:pt-[96px] min-h-screen bg-white">
      {/* Hero Banner */}
      <div className="relative h-64 md:h-80 bg-black overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-40">
          <img src={product.image} alt="Background" className="w-full h-full object-cover blur-sm" />
        </div>
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center px-6">
          <h1 className="text-4xl md:text-5xl font-serif text-white uppercase tracking-widest mb-4">{product.name}</h1>
          <div className="text-white/70 text-sm uppercase tracking-widest flex items-center justify-center space-x-2">
            <Link to="/" className="hover:text-gray-300 transition-colors">Inicio</Link>
            <span>/</span>
            <Link to="/#tienda" className="hover:text-gray-300 transition-colors">Tienda</Link>
            <span>/</span>
            <span className="text-white">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-6">
            <div 
              onClick={() => setIsPopupOpen(true)}
              className="rounded-md overflow-hidden shadow-xl bg-gray-50 flex items-center justify-center min-h-[400px] md:min-h-[500px] cursor-pointer group"
            >
              <img 
                src={activeImage} 
                alt={product.name} 
                className="max-w-full max-h-[600px] w-auto h-auto object-contain transition-all duration-700 group-hover:scale-105" 
              />
            </div>
            
            {/* Secondary Images Thumbnails */}
            {product.secondaryImages && product.secondaryImages.length > 0 && (
              <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                <div 
                  onClick={() => setActiveImage(product.image)}
                  className={`aspect-square rounded-md overflow-hidden cursor-pointer transition-all border-2 ${activeImage === product.image ? 'border-black scale-105 shadow-md' : 'border-transparent hover:border-gray-300'}`}
                >
                  <img src={product.image} alt="Main thumbnail" className="w-full h-full object-cover" />
                </div>
                {product.secondaryImages.map((img, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setActiveImage(img)}
                    className={`aspect-square rounded-md overflow-hidden cursor-pointer transition-all border-2 ${activeImage === img ? 'border-black scale-105 shadow-md' : 'border-transparent hover:border-gray-300'}`}
                  >
                    <img src={img} alt={`Secondary thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Info */}
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-sans text-black mb-4">{product.name}</h2>
            <p className="text-2xl text-black font-light mb-8">${product.price.toFixed(2)}</p>
            <p className="text-black/70 font-light leading-relaxed mb-10">
              {product.description}
            </p>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-gray-300">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 text-black hover:bg-gray-100 transition-colors">-</button>
                <input type="number" value={quantity} readOnly className="w-12 text-center py-3 outline-none text-black font-medium" />
                <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 text-black hover:bg-gray-100 transition-colors">+</button>
              </div>
              <button 
                onClick={() => addToCart(product, quantity)}
                className="px-8 py-3 bg-[#62CAC9] text-white text-sm hover:bg-[#4FB4B3] transition-colors uppercase tracking-widest font-bold"
              >
                Añadir al carrito
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-12">
          <div>
            <h3 className="text-xl font-serif text-black mb-6">Buscar</h3>
            <div className="flex">
              <input type="text" placeholder="Buscar productos..." className="flex-1 border border-gray-300 px-4 py-2 outline-none focus:border-[#62CAC9] transition-colors" />
              <button className="px-6 py-2 bg-[#62CAC9] text-white border border-[#62CAC9] hover:bg-[#4FB4B3] transition-colors">Buscar</button>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-serif text-black mb-6">Categorías de arreglos</h3>
            <ul className="space-y-4 text-black/70 font-light">
              {categories.map(cat => (
                <li key={cat} className="border-b border-gray-100 pb-2 hover:text-black cursor-pointer transition-colors">
                  <Link to={`/productos?categoria=${encodeURIComponent(cat)}`}>{cat}</Link>
                </li>
              ))}
              {categories.length === 0 && (
                <li className="text-gray-400 italic text-sm">No hay categorías disponibles</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isPopupOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm"
            onClick={() => setIsPopupOpen(false)}
          >
            <motion.button
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute top-6 right-6 text-white hover:text-gold transition-colors p-2 z-[110]"
              onClick={() => setIsPopupOpen(false)}
            >
              <X size={40} strokeWidth={1} />
            </motion.button>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={activeImage} 
                alt={product?.name} 
                className="max-w-full max-h-[90vh] object-contain shadow-2xl rounded-sm"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CartModal = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, cartTotal } = useCart();

  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;
    
    let message = "🌟 *NUEVO PEDIDO - FLORERÍA RICARDO* 🌟\n\n¡Hola! Me gustaría comprar los siguientes productos:\n\n";
    cart.forEach(item => {
      message += `- ${item.quantity}x ${item.product.name} ($${(item.product.price * item.quantity).toFixed(2)})\n`;
    });
    message += `\n*Total: $${cartTotal.toFixed(2)}*`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/525559623337?text=${encodedMessage}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 h-[100dvh] w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-serif text-black">Tu Carrito</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-black hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-black/50">
                  <ShoppingCart size={48} className="mb-4 opacity-20" />
                  <p>Tu carrito está vacío</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {cart.map(item => (
                    <div key={item.product.id} className="flex items-center space-x-4">
                      <img src={item.product.image} alt={item.product.name} className="w-20 h-20 object-cover rounded-md" />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-black">{item.product.name}</h4>
                        <p className="text-sm text-black/60">{item.quantity} x ${item.product.price.toFixed(2)}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.product.id)} className="text-black/60 hover:text-black p-2">
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-black font-medium">Total:</span>
                  <span className="text-xl text-black font-serif font-bold">${cartTotal.toFixed(2)}</span>
                </div>
              <button 
                onClick={handleWhatsAppCheckout}
                className="w-full py-4 bg-[#62CAC9] hover:bg-[#4FB4B3] text-white font-medium uppercase tracking-widest text-sm flex items-center justify-center space-x-2 transition-colors rounded-sm shadow-md"
              >
                <MessageCircle size={20} />
                <span>Pedir por WhatsApp</span>
              </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const ContactSection = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <section id="contacto" className="py-24 px-6 md:px-12 max-w-7xl mx-auto bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <h2 className="text-xs uppercase tracking-[0.3em] text-black mb-4 font-semibold">Contacto</h2>
          <h3 className="text-4xl font-serif text-black mb-6">¿Tienes alguna duda o pedido especial?</h3>
          <div className="w-12 h-[2px] bg-black mb-8" />
          <p className="text-black/70 font-light leading-relaxed mb-8">
            Ponte en contacto con nosotros. Estamos aquí para ayudarte a seleccionar las mejores flores para tu hogar o evento. Llena el formulario y te responderemos a la brevedad.
          </p>
          <div className="space-y-4 text-black">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-50 flex items-center justify-center rounded-full text-black">
                <MessageCircle size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-black">WhatsApp / Teléfono</p>
                <p className="text-sm font-light">+52 55 5962 3337</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-50 flex items-center justify-center rounded-full text-black">
                <Award size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-black">Correo Electrónico</p>
                <p className="text-sm font-light">contacto@floreriaricardo.com</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 p-8 rounded-sm overflow-hidden relative">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form 
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6" 
                onSubmit={handleSubmit}
              >
                <div>
                  <label className="block text-xs uppercase tracking-wider text-black mb-2">Nombre Completo</label>
                  <input required type="text" placeholder="Ej. Juan Pérez" className="w-full border border-gray-200 px-4 py-3 outline-none focus:border-black transition-colors bg-white font-light text-sm" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-black mb-2">Correo Electrónico</label>
                    <input required type="email" placeholder="ejemplo@correo.com" className="w-full border border-gray-200 px-4 py-3 outline-none focus:border-black transition-colors bg-white font-light text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-black mb-2">Teléfono</label>
                    <input type="tel" placeholder="Tu número" className="w-full border border-gray-200 px-4 py-3 outline-none focus:border-black transition-colors bg-white font-light text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-black mb-2">Mensaje</label>
                  <textarea required rows={4} placeholder="¿En qué podemos ayudarte?" className="w-full border border-gray-200 px-4 py-3 outline-none focus:border-black transition-colors bg-white resize-none font-light text-sm"></textarea>
                </div>
                <button 
                  disabled={loading}
                  className="w-full py-4 bg-[#62CAC9] text-white text-sm uppercase tracking-widest hover:bg-[#4FB4B3] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 rounded-sm shadow-md"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <span>Enviar Mensaje</span>}
                </button>
              </motion.form>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full min-h-[400px] flex flex-col items-center justify-center text-center space-y-4"
              >
                <div className="w-20 h-20 bg-black text-gold rounded-full flex items-center justify-center shadow-xl mb-4">
                  <Check size={40} strokeWidth={3} />
                </div>
                <h4 className="text-2xl font-serif text-black uppercase tracking-widest">¡Mensaje Enviado!</h4>
                <p className="text-black/60 font-light max-w-xs mx-auto">
                  Gracias por contactarnos. Un especialista de Florería Ricardo se pondrá en contacto contigo muy pronto.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="text-xs uppercase tracking-widest font-bold border-b-2 border-black pb-1 hover:text-gold hover:border-gold transition-colors mt-8"
                >
                  Enviar otro mensaje
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

const ProductsPage = () => {
  const { products, loading, categories: allCategories, homeCategories } = useProducts();
  const { setCheckoutProduct } = useCart();
  const location = useLocation();
  const { categorySlug } = useParams();
  const searchParams = new URLSearchParams(location.search);
  
  const rawCategoryString = categorySlug || searchParams.get('categoria');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Helper to normalize text for comparison (removes accents and spaces)
  const normalize = (text: string) => {
    return text.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, '');
  };

  useEffect(() => {
    if (rawCategoryString && allCategories.length > 0) {
      const normalizedRaw = normalize(rawCategoryString);
      
      // 1. Try to match by target_link in homeCategories
      const homeMatch = homeCategories.find(hc => hc.target_link && normalize(hc.target_link) === normalizedRaw);
      if (homeMatch) {
        setCategoryFilter(homeMatch.name);
        return;
      }

      // 2. Try exact match by normalized name first, then partial match
      let match = allCategories.find(n => normalize(n) === normalizedRaw);
      if (!match) {
        match = allCategories.find(n => {
          const normN = normalize(n);
          return normN.length > 3 && normalizedRaw.length > 3 && (normN.includes(normalizedRaw) || normalizedRaw.includes(normN));
        });
      }
      
      if (match) {
        setCategoryFilter(match);
      } else {
        setCategoryFilter(rawCategoryString);
      }
    } else if (!rawCategoryString) {
      setCategoryFilter(null);
    }
  }, [rawCategoryString, allCategories, homeCategories]);

  const filteredProducts = products.filter(p => {
    if (!categoryFilter) return !searchQuery || (p.name + p.description).toLowerCase().includes(searchQuery.toLowerCase());
    
    const normalizedFilter = normalize(categoryFilter);
    const normalizedProductCat = p.category ? normalize(p.category) : '';
    
    const matchesCategory = normalizedProductCat === normalizedFilter || 
                           (normalizedProductCat.length > 3 && normalizedFilter.length > 3 && 
                            (normalizedProductCat.includes(normalizedFilter) || normalizedFilter.includes(normalizedProductCat)));
                            
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pt-[88px] md:pt-[96px] min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black py-16 px-6 text-center">
        <h1 className="text-3xl md:text-5xl font-serif text-white mb-4 uppercase tracking-[0.2em] animate-in fade-in slide-in-from-top duration-1000">
          {categoryFilter ? categoryFilter : 'Nuestras Flores'}
        </h1>
        <div className="w-12 h-[2px] bg-gold mx-auto mb-6" />
        <p className="text-white/70 font-light max-w-2xl mx-auto">
          {categoryFilter 
            ? `Explora nuestra colección exclusiva de ${categoryFilter}. Arreglos diseñados para cautivar en cada detalle.`
            : 'Explora nuestra selección premium de arreglos florales y ramos, diseñados para cautivar y emocionar.'
          }
        </p>
      </div>

      {/* Search & Filter Bar - Hide if category is 'Eventos' */}
      {normalize(categoryFilter || '') !== 'eventos' && (
        <div className="sticky top-[88px] md:top-[96px] z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 py-4 px-6 md:px-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Buscar ramos, flores, estilos..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-full pl-11 pr-4 py-3 text-sm outline-none focus:border-black focus:bg-white transition-all shadow-inner"
              />
            </div>
            
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide w-full md:w-auto">
              <button 
                onClick={() => setCategoryFilter(null)}
                className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest font-bold whitespace-nowrap transition-all shadow-sm ${
                  !categoryFilter 
                    ? 'bg-[#62CAC9] text-white ring-2 ring-offset-2 ring-[#62CAC9]' 
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black'
                }`}
              >
                Todos
              </button>
              {allCategories.map((cat, idx) => {
                const colors = [
                  'hover:bg-rose-50 text-gray-500 hover:text-rose-600 active:bg-rose-600 active:text-white',
                  'hover:bg-amber-50 text-gray-500 hover:text-amber-600 active:bg-amber-600 active:text-white',
                  'hover:bg-purple-50 text-gray-500 hover:text-purple-600 active:bg-purple-600 active:text-white',
                  'hover:bg-emerald-50 text-gray-500 hover:text-emerald-600 active:bg-emerald-600 active:text-white',
                  'hover:bg-blue-50 text-gray-500 hover:text-blue-600 active:bg-blue-600 active:text-white',
                ];
                const activeColors = [
                  'bg-rose-600 text-white ring-2 ring-offset-2 ring-rose-600',
                  'bg-amber-600 text-white ring-2 ring-offset-2 ring-amber-600',
                  'bg-purple-600 text-white ring-2 ring-offset-2 ring-purple-600',
                  'bg-emerald-600 text-white ring-2 ring-offset-2 ring-emerald-600',
                  'bg-blue-600 text-white ring-2 ring-offset-2 ring-blue-600',
                ];
                const colorIdx = idx % colors.length;
                
                return (
                  <button 
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest font-bold whitespace-nowrap transition-all shadow-sm ${
                      categoryFilter === cat 
                        ? activeColors[colorIdx] 
                        : `bg-gray-50 ${colors[colorIdx]}`
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Product Grid - Hide if category is 'Eventos' */}
      {normalize(categoryFilter || '') !== 'eventos' && (
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-serif text-black mb-2 uppercase tracking-widest">
              {searchQuery ? `Resultados para: "${searchQuery}"` : categoryFilter ? `Colección: ${categoryFilter}` : 'Lo más vendido'}
            </h2>
            <div className="w-12 h-[2px] bg-black mx-auto" />
          </div>
          
          {loading ? (
            <div className="py-20 text-center text-black/50 font-light animate-pulse">Cargando productos...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-10">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, idx) => (
                  <motion.div 
                    key={product.id} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx % 4 * 0.1 }}
                    className="flex flex-col items-center text-center group bg-white p-4 rounded-sm border border-gray-100 hover:border-black transition-all duration-500 hover:shadow-xl"
                  >
                    <div 
                      className="w-full relative overflow-hidden mb-4 md:mb-6 aspect-[4/5] cursor-zoom-in"
                      onClick={() => setPreviewImage(product.image)}
                    >
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 rounded-sm" 
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <Search size={20} />
                        </div>
                      </div>
                    </div>
                    <h4 className="text-sm font-sans font-bold text-black mb-1 md:mb-2 uppercase tracking-widest">{product.name}</h4>
                    <p className="text-black/60 text-xs font-light mb-3 line-clamp-2 h-8">{product.description}</p>
                    <p className="text-black font-bold text-base mb-4 md:mb-6">${product.price.toFixed(2)}</p>
                    <button 
                      onClick={() => setCheckoutProduct(product)}
                      className="px-3 md:px-6 py-3 bg-[#62CAC9] text-white text-[10px] md:text-xs hover:bg-[#4FB4B3] transition-all w-full uppercase tracking-[0.2em] font-bold flex items-center justify-center space-x-2 shadow-sm rounded-sm"
                    >
                      <MessageCircle size={16} />
                      <span>Comprar Ahora</span>
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-24 flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-6 text-gray-300">
                    <ShoppingBag size={40} strokeWidth={1} />
                  </div>
                  <h3 className="text-2xl font-serif text-black mb-3">No encontramos resultados</h3>
                  <p className="text-gray-500 font-light max-w-md mx-auto mb-8 text-center px-4">
                    No hay productos que coincidan con <span className="font-semibold text-black italic">"{searchQuery || categoryFilter}"</span>. 
                    Vuelve pronto o descubre nuestro catálogo completo debajo.
                  </p>
                  {(searchQuery || categoryFilter) && (
                    <button 
                      onClick={() => { setSearchQuery(''); setCategoryFilter(null); }}
                      className="text-xs uppercase tracking-widest font-bold border-b-2 border-black pb-1 hover:text-gold hover:border-gold transition-colors"
                    >
                      Ver Todo el Catálogo
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-black/95 backdrop-blur-md"
            onClick={() => setPreviewImage(null)}
          >
            <motion.button
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute top-6 right-6 text-white hover:text-gold transition-colors p-2 z-[110] bg-white/10 rounded-full backdrop-blur-sm"
              onClick={() => setPreviewImage(null)}
            >
              <X size={32} strokeWidth={1} />
            </motion.button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative max-w-full max-h-full flex items-center justify-center p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={previewImage} 
                alt="Product Preview" 
                className="max-w-full max-h-[85vh] object-contain shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-sm"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery Block */}
      <PhotoGallery category={categoryFilter || undefined} />
    </div>
  );
};

const FloatingWhatsAppButton = () => {
  const phoneNumber = "525559623337";
  const message = `Hola! Me gustaría solicitar informes sobre sus arreglos florales.\n\nAtte: [Tu Nombre]`;
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl flex items-center justify-center hover:bg-[#128C7E] transition-colors group"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle size={32} />
      <span className="absolute right-full mr-4 bg-white text-black text-xs font-bold py-2 px-4 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        ¿Necesitas ayuda? ¡Contáctanos!
      </span>
    </motion.a>
  );
};

const AllProductsGrid = ({ customTitles }: { customTitles?: any }) => {
  const { products, loading } = useProducts();
  const { setCheckoutProduct } = useCart();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = React.useState(false);
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);

  // Get the 10 newest products
  const newestProducts = React.useMemo(() => {
    return [...products]
      .sort((a, b) => {
        // Prefer sorting by ID if numeric (typically higher ID = newer)
        const idA = typeof a.id === 'number' ? a.id : 0;
        const idB = typeof b.id === 'number' ? b.id : 0;
        return idB - idA;
      })
      .slice(0, 10);
  }, [products]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  React.useEffect(() => {
    if (loading || newestProducts.length <= 4 || isPaused) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const maxScroll = scrollWidth - clientWidth;
        
        if (scrollLeft >= maxScroll - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scroll('right');
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [loading, newestProducts.length, isPaused]);

  return (
    <section className="py-24 px-4 md:px-6 lg:px-12 max-w-7xl mx-auto overflow-hidden">
      <div className="text-center mb-12 md:mb-16">
        <h2 className="text-xs uppercase tracking-[0.3em] text-black mb-4 font-semibold italic">
          {customTitles?.catalog_title || 'Catálogo'}
        </h2>
        <h3 className="text-3xl md:text-4xl font-serif text-black mb-6">
          {customTitles?.catalog_subtitle || 'Algunos de nuestros productos'}
        </h3>
        <div className="w-12 h-[2px] bg-black mx-auto" />
      </div>

      {loading ? (
        <div className="py-20 text-center text-black/50 font-light anim-pulse">Cargando catálogo...</div>
      ) : (
        <div 
          className="relative overflow-visible"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Slider Container */}
          <div 
            ref={scrollRef}
            className={`flex overflow-x-auto snap-x snap-mandatory scrollbar-hide space-x-6 pb-8 ${newestProducts.length <= 4 ? 'lg:justify-center' : ''}`}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {newestProducts.map(product => (
              <div 
                key={product.id} 
                className="flex-none w-[280px] md:w-[300px] lg:w-[calc(25%-18px)] snap-start flex flex-col items-center text-center group bg-white p-4 rounded-sm border border-gray-100 hover:shadow-xl transition-all duration-500"
              >
                <div 
                  className="w-full relative overflow-hidden mb-4 md:mb-6 aspect-[4/5] cursor-zoom-in"
                  onClick={() => setPreviewImage(product.image)}
                >
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 rounded-sm" 
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <Search size={16} />
                    </div>
                  </div>
                </div>
                <h4 className="text-sm md:text-base font-serif text-black mb-1 uppercase tracking-wider line-clamp-1">{product.name}</h4>
                <p className="text-black font-bold text-sm mb-4">${product.price.toFixed(2)}</p>
                <button 
                  onClick={() => setCheckoutProduct(product)}
                  className="px-4 py-2 bg-[#62CAC9] text-white text-[10px] md:text-xs hover:bg-[#4FB4B3] transition-colors w-full uppercase tracking-widest font-bold flex items-center justify-center space-x-2"
                >
                  <MessageCircle size={14} />
                  <span>Comprar</span>
                </button>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          {newestProducts.length > 4 && (
            <>
              <button 
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 lg:-translate-x-12 bg-white text-black p-3 rounded-full shadow-lg hover:bg-black hover:text-white z-10 hidden md:block transition-all border border-gray-100"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 lg:translate-x-12 bg-white text-black p-3 rounded-full shadow-lg hover:bg-black hover:text-white z-10 hidden md:block transition-all border border-gray-100"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>
      )}

      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-black/95 backdrop-blur-md"
            onClick={() => setPreviewImage(null)}
          >
            <motion.button
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute top-6 right-6 text-white hover:text-gold transition-colors p-2 z-[110] bg-white/10 rounded-full backdrop-blur-sm"
              onClick={() => setPreviewImage(null)}
            >
              <X size={32} strokeWidth={1} />
            </motion.button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative max-w-full max-h-full flex items-center justify-center p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={previewImage} 
                alt="Product Preview" 
                className="max-w-full max-h-[85vh] object-contain shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-sm"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="mt-16 text-center">
        <Link 
          to="/productos" 
          className="inline-block px-10 py-4 bg-[#62CAC9] text-white text-xs uppercase tracking-[0.2em] font-bold hover:bg-[#4FB4B3] transition-all duration-500 rounded-sm shadow-md"
        >
          Catálogo
        </Link>
      </div>
    </section>
  );
};

const HomePage = () => {
  const [slides, setSlides] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const { homeCategories, loading: productsLoading } = useProducts();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [slidesRes, settingsRes] = await Promise.all([
          supabase.from('home_slides').select('*').order('display_order', { ascending: true }),
          supabase.from('store_settings').select('*')
        ]);

        if (slidesRes.data) setSlides(slidesRes.data);
        if (settingsRes.data) {
          const settingsMap = settingsRes.data.reduce((acc: any, curr: any) => {
            acc[curr.key] = curr.value;
            return acc;
          }, {});
          setSettings(settingsMap);
        }
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const isInitialLoading = loading || productsLoading;

  return (
    <>
      <HeroSlider customSlides={slides} />
      <WelcomeSection />
      {isInitialLoading ? (
        <div className="flex justify-center py-20 px-6">
          <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-14 bg-gray-50 animate-pulse rounded-sm"></div>
            ))}
          </div>
        </div>
      ) : (
        <HomeCategories customCategories={homeCategories} />
      )}
      {/* <ValuesSection /> - Removed per user request */}
      {/* <FeaturedCategories /> - Hidden per user request */}
      <ProductsSection customTitles={settings} />
      <AllProductsGrid customTitles={settings} />
      <PhotoGallery />
      <ContactSection />
    </>
  );
};

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-1000 bg-white">
      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-8">
        <Store size={48} className="text-gray-300" />
      </div>
      <h1 className="text-6xl font-serif text-black mb-4">404</h1>
      <h2 className="text-xl uppercase tracking-[0.3em] text-black mb-6">Página no encontrada</h2>
      <p className="text-gray-500 font-light max-w-md mx-auto mb-10">
        Lo sentimos, la página que buscas no existe o ha sido movida. Explora nuestras hermosas colecciones florales en su lugar.
      </p>
      <Link 
        to="/"
        className="px-10 py-4 bg-[#62CAC9] text-white text-xs uppercase tracking-[0.2em] font-bold hover:bg-[#4FB4B3] transition-all shadow-lg rounded-sm"
      >
        Volver al Inicio
      </Link>
    </div>
  );
};

export default function App() {
  console.log("App rendering, isSupabaseConfigured:", isSupabaseConfigured);

  if (!isSupabaseConfigured) {
    console.log("Rendering ConfigMissingScreen");
    return <ConfigMissingScreen />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <ScrollToTop />
        <AuthProvider>
          <ProductProvider>
            <CartProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/admin/*" element={<AdminRoutes />} />
                <Route path="*" element={
                  <div className="min-h-screen bg-white selection:bg-black/10 selection:text-black flex flex-col">
                    <Header />
                    <main className="flex-1">
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/productos" element={<ProductsPage />} />
                        <Route path="/producto/:id" element={<ProductPage />} />
                        <Route path="/privacidad" element={<PrivacyPolicy />} />
                        <Route path="/como-comprar" element={<HowToBuy />} />
                        {/* Dynamic category route */}
                        <Route path="/:categorySlug" element={<ProductsPage />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                    <Footer />
                    <CartModal />
                    <CheckoutModal />
                    <FloatingWhatsAppButton />
                  </div>
                } />
              </Routes>
            </CartProvider>
          </ProductProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}
