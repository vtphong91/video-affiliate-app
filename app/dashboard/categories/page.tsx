'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth/SupabaseAuthProvider';

export default function CategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    color: '#3b82f6',
  });

  useEffect(() => {
    // Only fetch categories if user is authenticated
    if (user) {
      console.log('🔍 CategoriesPage: User authenticated, fetching categories...');
      fetchCategories();
    } else {
      console.log('🔍 CategoriesPage: No user, skipping fetch');
      setLoading(false);
    }
  }, [user]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching categories...');
      const response = await fetch('/api/categories');
      const data = await response.json();
      console.log('📊 Categories API response:', data);

      if (data.success) {
        const categoriesData = data.data?.topics || data.topics || [];
        console.log('✅ Categories loaded:', categoriesData);
        setCategories(categoriesData);
      } else {
        console.error('❌ Categories API failed:', data);
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      if (editingId) {
        // Update existing category
        const response = await fetch(`/api/categories/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const data = await response.json();
          setCategories(categories.map(c =>
            c.id === editingId ? data.category : c
          ));
        }
      } else {
        // Create new category
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const data = await response.json();
          setCategories([...categories, data.category]);
        }
      }

      // Reset form
      setFormData({
        name: '',
        slug: '',
        description: '',
        icon: '',
        color: '#3b82f6',
      });
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category: any) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
      color: category.color,
    });
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa danh mục này? Các reviews thuộc danh mục này sẽ không có danh mục.')) {
      return;
    }

    try {
      setDeleting(id);
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCategories(categories.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    } finally {
      setDeleting(null);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: '',
      color: '#3b82f6',
    });
    setShowForm(false);
    setEditingId(null);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: editingId ? formData.slug : generateSlug(name),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản lý danh mục</h1>
          <p className="text-muted-foreground mt-1">
            Tạo và quản lý danh mục cho reviews
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <span className="mr-2">+</span>
          Tạo danh mục
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Tên danh mục *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Xe máy"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Slug *
                  </label>
                  <Input
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    placeholder="xe-may"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Mô tả
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Mô tả về danh mục..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Icon (emoji hoặc text)
                  </label>
                  <Input
                    value={formData.icon}
                    onChange={(e) =>
                      setFormData({ ...formData, icon: e.target.value })
                    }
                    placeholder="🏍️"
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Màu
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      className="w-16 h-10"
                    />
                    <Input
                      type="text"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang lưu...
                    </>
                  ) : (
                    <>{editingId ? 'Cập nhật' : 'Tạo mới'}</>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Categories List */}
      {!categories || categories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🏷️</span>
            </div>
            <p className="text-muted-foreground text-center">
              Chưa có danh mục nào. Tạo danh mục đầu tiên của bạn!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories?.map((category) => (
            <Card key={category.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {category.icon && (
                      <span className="text-2xl">{category.icon}</span>
                    )}
                    <div>
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {category.slug}
                      </p>
                    </div>
                  </div>
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: category.color }}
                  />
                </div>

                {category.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {category.description}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(category)}
                    className="flex-1"
                  >
                    <span className="mr-1">✏️</span>
                    Sửa
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(category.id)}
                    disabled={deleting === category.id}
                  >
                    {deleting === category.id ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    ) : (
                      <span>🗑️</span>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}