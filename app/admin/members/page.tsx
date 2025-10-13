'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth/SupabaseAuthProvider';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Mail,
  Calendar,
  Shield,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Member {
  id: string;
  email: string;
  full_name: string;
  role: string;
  permissions: string[];
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

interface CreateMemberData {
  email: string;
  full_name: string;
  role: string;
  permissions: string[];
}

export default function MemberManagement() {
  const { userProfile } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateMemberData>({
    email: '',
    full_name: '',
    role: 'viewer',
    permissions: []
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [currentPage, searchTerm, roleFilter, statusFilter]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter !== 'all' && { role: roleFilter }),
        ...(statusFilter !== 'all' && { active: statusFilter }),
      });

      const response = await fetch(`/api/admin/members?${params}`);
      console.log('🔍 API Response:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 API Data:', data);
        setMembers(data.data || data.members || []);
        setTotalPages(data.pagination?.pages || data.totalPages || 1);
      } else {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const createMember = async () => {
    try {
      setIsCreating(true);
      const response = await fetch('/api/admin/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Reset form and close dialog
        setCreateForm({
          email: '',
          full_name: '',
          role: 'viewer',
          permissions: []
        });
        setCreateDialogOpen(false);
        
        // Refresh members list
        fetchMembers();
        
        // Show success message with additional info
        let message = 'Thành viên đã được tạo thành công!';
        if (result.data.password_generated) {
          message += '\n\n📧 Thông tin tài khoản đã được gửi qua email.';
          message += '\n🔐 Mật khẩu đã được tạo tự động.';
          message += '\n⚠️ Thành viên cần đổi mật khẩu lần đầu đăng nhập.';
        }
        
        alert(message);
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.error || 'Không thể tạo thành viên'}`);
      }
    } catch (error) {
      console.error('Error creating member:', error);
      alert('Có lỗi xảy ra khi tạo thành viên');
    } finally {
      setIsCreating(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'editor':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên';
      case 'editor':
        return 'Biên tập viên';
      case 'viewer':
        return 'Người xem';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách thành viên...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý thành viên</h1>
          <p className="text-gray-600">Quản lý thành viên và phân quyền trong hệ thống</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Thêm thành viên
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Thêm thành viên mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={createForm.email}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_name">Họ và tên</Label>
                <Input
                  id="full_name"
                  placeholder="Nguyễn Văn A"
                  value={createForm.full_name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, full_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Vai trò</Label>
                <select
                  id="role"
                  value={createForm.role}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="viewer">Người xem</option>
                  <option value="editor">Biên tập viên</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>
              
              {/* Password Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <h4 className="font-medium text-blue-900 mb-1">Thông tin mật khẩu</h4>
                    <p className="text-blue-700 mb-2">
                      Mật khẩu sẽ được tạo tự động và gửi qua email cho thành viên.
                    </p>
                    <div className="space-y-1 text-blue-600">
                      <p>• Mật khẩu mạnh 12 ký tự</p>
                      <p>• Bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt</p>
                      <p>• Thành viên cần đổi mật khẩu lần đầu đăng nhập</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                disabled={isCreating}
              >
                Hủy
              </Button>
              <Button
                onClick={createMember}
                disabled={isCreating || !createForm.email || !createForm.full_name}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isCreating ? 'Đang tạo...' : 'Tạo thành viên'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo tên hoặc email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="admin">Quản trị viên</option>
                <option value="editor">Biên tập viên</option>
                <option value="viewer">Người xem</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="true">Hoạt động</option>
                <option value="false">Không hoạt động</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Danh sách thành viên ({members.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không có thành viên nào</h3>
              <p className="text-gray-500">Bắt đầu bằng cách thêm thành viên đầu tiên.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{member.full_name}</h3>
                      <p className="text-sm text-gray-600">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge className={getRoleColor(member.role)}>
                      {getRoleDisplayName(member.role)}
                    </Badge>
                    <Badge className={member.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {member.is_active ? 'Hoạt động' : 'Không hoạt động'}
                    </Badge>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Trước
            </Button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Trang {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}