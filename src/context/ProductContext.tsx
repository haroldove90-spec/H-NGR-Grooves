import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  secondaryImages?: string[];
  description: string;
  category?: string;
  isSpecial?: boolean;
};

export type CategoryConfig = {
  id: number;
  name: string;
  target_link?: string;
  display_order: number;
};

type ProductContextType = {
  products: Product[];
  categories: string[];
  homeCategories: CategoryConfig[];
  loading: boolean;
  addProduct: (product: Omit<Product, 'id'>, mainImageFile?: File, secondaryImageFiles?: File[]) => Promise<void>;
  updateProduct: (id: number, product: Partial<Product>, mainImageFile?: File, secondaryImageFiles?: File[]) => Promise<void>;
  deleteProducts: (ids: number[]) => Promise<void>;
  addCategory: (category: string) => Promise<void>;
  deleteCategory: (category: string) => Promise<void>;
};

const ProductContext = createContext<ProductContextType | null>(null);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within a ProductProvider');
  return context;
};

export const ProductProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [homeCategories, setHomeCategories] = useState<CategoryConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      const formattedProducts: Product[] = data.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image,
        secondaryImages: p.secondary_images || [],
        description: p.description,
        category: p.category,
        isSpecial: p.is_special || false
      }));
      setProducts(formattedProducts);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('home_categories_config')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      if (!data) {
        setCategories([]);
        setHomeCategories([]);
        return;
      }

      setHomeCategories(data);

      // De-duplicate case-insensitively while preserving the first instance's casing
      const uniqueNames: string[] = [];
      const seen = new Set<string>();
      
      data.forEach((c: any) => {
        const name = c.name.trim();
        if (!name) return;
        const normalized = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '');
        if (!seen.has(normalized)) {
          uniqueNames.push(name);
          seen.add(normalized);
        }
      });

      setCategories(uniqueNames);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchCategories()]);
      setLoading(false);
    };

    initializeData();

    // Set up real-time subscriptions
    const productsSubscription = supabase
      .channel('products-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' } as any, () => {
        fetchProducts();
      })
      .subscribe();

    const categoriesSubscription = supabase
      .channel('categories-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' } as any, () => {
        fetchCategories();
      })
      .subscribe();

    const homeCategoriesSubscription = supabase
      .channel('home-categories-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'home_categories_config' } as any, () => {
        fetchCategories();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(productsSubscription);
      supabase.removeChannel(categoriesSubscription);
      supabase.removeChannel(homeCategoriesSubscription);
    };
  }, []);

  const uploadImage = async (file: File, path: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const syncCategory = async (category: string) => {
    const trimmedCategory = category.trim();
    if (!trimmedCategory) return;
    
    try {
      // 1. Ensure it exists in 'categories' table (case-insensitive check)
      const { data: allCats } = await supabase.from('categories').select('name');
      const normalizedNew = trimmedCategory.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '');
      const existingCat = allCats?.find(c => c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '') === normalizedNew);

      if (!existingCat) {
        await supabase.from('categories').insert([{ name: trimmedCategory }]);
      }

      // 2. Ensure it exists in 'home_categories_config' (case-insensitive check)
      const { data: allHomeCats } = await supabase.from('home_categories_config').select('name');
      const existingHomeCat = allHomeCats?.find(c => c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '') === normalizedNew);

      if (!existingHomeCat) {
        // Get the current max display_order
        const { data: maxOrderData } = await supabase
          .from('home_categories_config')
          .select('display_order')
          .order('display_order', { ascending: false })
          .limit(1);
        
        const nextOrder = maxOrderData && maxOrderData.length > 0 ? (maxOrderData[0].display_order + 1) : 0;

        await supabase.from('home_categories_config').insert([{ 
          name: trimmedCategory,
          display_order: nextOrder
        }]);
      }
    } catch (error) {
      console.error('Error syncing category:', error);
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>, mainImageFile?: File, secondaryImageFiles?: File[]) => {
    let mainImageUrl = product.image;
    let secondaryImageUrls = (product.secondaryImages || []).filter(url => !url.startsWith('blob:'));

    // Synchronize category across all tables
    if (product.category) {
      await syncCategory(product.category);
    }

    // Upload main image if it's a file
    if (mainImageFile) {
      mainImageUrl = await uploadImage(mainImageFile, 'products');
    }

    // Upload secondary images if they are files
    if (secondaryImageFiles && secondaryImageFiles.length > 0) {
      const uploadedUrls = await Promise.all(
        secondaryImageFiles.map(file => uploadImage(file, 'products'))
      );
      secondaryImageUrls = [...secondaryImageUrls, ...uploadedUrls];
    }

    const { error } = await supabase
      .from('products')
      .insert([{
        name: product.name,
        description: product.description,
        price: product.price,
        image: mainImageUrl,
        secondary_images: secondaryImageUrls,
        category: product.category,
        is_special: product.isSpecial || false
      }]);

    if (error) {
      console.error('Error adding product:', error);
      throw error;
    }
    
    await fetchProducts();
  };

  const updateProduct = async (id: number, product: Partial<Product>, mainImageFile?: File, secondaryImageFiles?: File[]) => {
    try {
      // Synchronize category across all tables if it's being updated
      if (product.category) {
        await syncCategory(product.category);
      }

      let mainImageUrl = product.image;
      let secondaryImageUrls = (product.secondaryImages || []).filter(url => !url.startsWith('blob:'));

      // Upload main image if it's a file
      if (mainImageFile) {
        mainImageUrl = await uploadImage(mainImageFile, 'products');
      }

      // Upload secondary images if they are files
      if (secondaryImageFiles && secondaryImageFiles.length > 0) {
        const uploadedUrls = await Promise.all(
          secondaryImageFiles.map(file => uploadImage(file, 'products'))
        );
        secondaryImageUrls = [...secondaryImageUrls, ...uploadedUrls];
      }

      const updateData: any = {};
      if (product.name !== undefined) updateData.name = product.name.trim();
      if (product.description !== undefined) updateData.description = product.description;
      if (product.price !== undefined) updateData.price = product.price;
      if (mainImageUrl !== undefined) updateData.image = mainImageUrl;
      if (secondaryImageUrls !== undefined) updateData.secondary_images = secondaryImageUrls;
      if (product.category !== undefined) updateData.category = product.category;
      if (product.isSpecial !== undefined) updateData.is_special = product.isSpecial;

      // Filter out keys with undefined values just in case
      Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
      
      await fetchProducts();
    } catch (error) {
      console.error('Error in updateProduct:', error);
      throw error;
    }
  };

  const deleteProducts = async (ids: number[]) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .in('id', ids);

    if (error) {
      console.error('Error deleting products:', error);
      throw error;
    }

    await fetchProducts();
  };

  const addCategory = async (category: string) => {
    await syncCategory(category);
    await fetchCategories();
  };

  const deleteCategory = async (category: string) => {
    try {
      // Delete from both tables to maintain synchronization
      const { error: homeError } = await supabase
        .from('home_categories_config')
        .delete()
        .eq('name', category);

      if (homeError) throw homeError;

      const { error: catError } = await supabase
        .from('categories')
        .delete()
        .eq('name', category);

      if (catError) throw catError;

      await fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  return (
    <ProductContext.Provider value={{ 
      products, 
      categories, 
      homeCategories,
      loading,
      addProduct, 
      updateProduct,
      deleteProducts, 
      addCategory, 
      deleteCategory 
    }}>
      {children}
    </ProductContext.Provider>
  );
};
