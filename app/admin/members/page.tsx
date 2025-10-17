'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth/SupabaseAuthProvider';
import { supabase } from '@/lib/db/supabase';
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
  XCircle,
  RotateCcw
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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [createForm, setCreateForm] = useState<CreateMemberData>({
    email: '',
    full_name: '',
    role: 'viewer',
    permissions: []
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [currentPage, searchTerm, roleFilter, statusFilter]);

  const fetchMembers = async () => {
    try {
      setLoading(true);

      // Get session token
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        console.error('No session token found');
        return;
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter !== 'all' && { role: roleFilter }),
        ...(statusFilter !== 'all' && { active: statusFilter }),
      });

      const response = await fetch(`/api/admin/members?${params}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
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

      // Get session token
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        setIsCreating(false);
        return;
      }

      const response = await fetch('/api/admin/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
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

  const openEditDialog = (member: Member) => {
    setSelectedMember(member);
    setEditDialogOpen(true);
  };

  const updateMember = async () => {
    if (!selectedMember) return;

    try {
      setIsUpdating(true);

      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        return;
      }

      const response = await fetch(`/api/admin/members/${selectedMember.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          full_name: selectedMember.full_name,
          role: selectedMember.role,
          is_active: selectedMember.is_active
        }),
      });

      if (response.ok) {
        setEditDialogOpen(false);
        setSelectedMember(null);
        fetchMembers();
        alert('Cập nhật thành viên thành công!');
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.error || 'Không thể cập nhật thành viên'}`);
      }
    } catch (error) {
      console.error('Error updating member:', error);
      alert('Có lỗi xảy ra khi cập nhật thành viên');
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Bạn có chắc muốn vô hiệu hóa thành viên "${memberName}"?\n\nThành viên sẽ không thể đăng nhập nhưng dữ liệu vẫn được giữ lại.\nBạn có thể khôi phục sau này.`)) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        return;
      }

      const response = await fetch(`/api/admin/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        fetchMembers();
        alert(result.message || 'Đã vô hiệu hóa thành viên thành công!');
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.error || 'Không thể vô hiệu hóa thành viên'}`);
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      alert('Có lỗi xảy ra khi vô hiệu hóa thành viên');
    }
  };

  const restoreMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Bạn có chắc muốn khôi phục thành viên "${memberName}"?\n\nThành viên sẽ có thể đăng nhập lại sau khi khôi phục.`)) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        return;
      }

      const response = await fetch(`/api/admin/members/${memberId}/restore`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        fetchMembers();
        alert(result.message || 'Đã khôi phục thành viên thành công!');
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.error || 'Không thể khôi phục thành viên'}`);
      }
    } catch (error) {
      console.error('Error restoring member:', error);
      alert('Có lỗi xảy ra khi khôi phục thành viên');
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
                      {member.is_active ? 'Hoạt động' : 'Đã vô hiệu hóa'}
                    </Badge>
                    <div className="flex space-x-2">
                      {member.is_active ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(member)}
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteMember(member.id, member.full_name)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Vô hiệu hóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => restoreMember(member.id, member.full_name)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          title="Khôi phục"
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Khôi phục
                        </Button>
                      )}
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

      {/* Edit Member Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thành viên</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={selectedMember.email}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500">Email không thể thay đổi</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_full_name">Họ và tên</Label>
                <Input
                  id="edit_full_name"
                  value={selectedMember.full_name}
                  onChange={(e) => setSelectedMember(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_role">Vai trò</Label>
                <select
                  id="edit_role"
                  value={selectedMember.role}
                  onChange={(e) => setSelectedMember(prev => prev ? { ...prev, role: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="viewer">Người xem</option>
                  <option value="editor">Biên tập viên</option>
                  <option value="admin">Quản trị viên</option>
                </select>
                <p className="text-xs text-gray-500">Thay đổi vai trò sẽ cập nhật quyền hạn của thành viên</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_status">Trạng thái</Label>
                <select
                  id="edit_status"
                  value={selectedMember.is_active ? 'true' : 'false'}
                  onChange={(e) => setSelectedMember(prev => prev ? { ...prev, is_active: e.target.value === 'true' } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="true">Hoạt động</option>
                  <option value="false">Không hoạt động</option>
                </select>
                <p className="text-xs text-gray-500">Vô hiệu hóa thành viên sẽ ngăn họ truy cập hệ thống</p>
              </div>

              {/* Role Permissions Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <h4 className="font-medium text-blue-900 mb-1">Quyền hạn vai trò {getRoleDisplayName(selectedMember.role)}</h4>
                    <div className="space-y-1 text-blue-700 text-xs">
                      {selectedMember.role === 'admin' && (
                        <>
                          <p>✓ Toàn quyền quản trị hệ thống</p>
                          <p>✓ Quản lý thành viên và phân quyền</p>
                          <p>✓ Tạo, sửa, xóa tất cả nội dung</p>
                          <p>✓ Xem tất cả thống kê và báo cáo</p>
                        </>
                      )}
                      {selectedMember.role === 'editor' && (
                        <>
                          <p>✓ Tạo và chỉnh sửa reviews</p>
                          <p>✓ Quản lý lịch đăng bài</p>
                          <p>✓ Quản lý danh mục</p>
                          <p>✗ Không thể quản lý thành viên</p>
                        </>
                      )}
                      {selectedMember.role === 'viewer' && (
                        <>
                          <p>✓ Xem reviews và lịch đăng</p>
                          <p>✓ Xem thống kê cơ bản</p>
                          <p>✗ Không thể tạo hoặc chỉnh sửa</p>
                          <p>✗ Không thể quản lý hệ thống</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setSelectedMember(null);
              }}
              disabled={isUpdating}
            >
              Hủy
            </Button>
            <Button
              onClick={updateMember}
              disabled={isUpdating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUpdating ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}