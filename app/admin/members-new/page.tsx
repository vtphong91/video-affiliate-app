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
  XCircle,
  Clock,
  UserCheck,
  UserX,
  AlertCircle
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Member {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
  approved_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
}

interface PendingUser {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  registration_data: any;
  requested_at: string;
  priority: number;
  notes?: string;
}

interface CreateMemberData {
  email: string;
  full_name: string;
  role: string;
  permissions: string[];
}

export default function PendingUserManagement() {
  const { userProfile } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<'members' | 'pending'>('members');
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateMemberData>({
    email: '',
    full_name: '',
    role: 'viewer',
    permissions: []
  });
  const [isCreating, setIsCreating] = useState(false);

  // Approval states
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [approvalRole, setApprovalRole] = useState('viewer');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  // Rejection states
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    if (activeTab === 'members') {
      fetchMembers();
    } else {
      fetchPendingUsers();
    }
  }, [activeTab, currentPage, searchTerm, roleFilter, statusFilter]);

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
      if (response.ok) {
        const data = await response.json();
        setMembers(data.members || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/pending-users');
      if (response.ok) {
        const data = await response.json();
        setPendingUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching pending users:', error);
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

  const approveUser = async () => {
    if (!selectedUser) return;

    try {
      setIsApproving(true);
      const response = await fetch(`/api/admin/users/${selectedUser.user_id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: approvalRole,
          notes: approvalNotes
        }),
      });

      if (response.ok) {
        alert('Duyệt thành viên thành công!');
        setApprovalDialogOpen(false);
        setSelectedUser(null);
        setApprovalNotes('');
        fetchPendingUsers();
        fetchMembers(); // Refresh members list
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.error || 'Không thể duyệt thành viên'}`);
      }
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Có lỗi xảy ra khi duyệt thành viên');
    } finally {
      setIsApproving(false);
    }
  };

  const rejectUser = async () => {
    if (!selectedUser) return;

    try {
      setIsRejecting(true);
      const response = await fetch(`/api/admin/users/${selectedUser.user_id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: rejectionReason
        }),
      });

      if (response.ok) {
        alert('Từ chối thành viên thành công!');
        setRejectionDialogOpen(false);
        setSelectedUser(null);
        setRejectionReason('');
        fetchPendingUsers();
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.error || 'Không thể từ chối thành viên'}`);
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Có lỗi xảy ra khi từ chối thành viên');
    } finally {
      setIsRejecting(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ duyệt';
      case 'approved':
        return 'Đã duyệt';
      case 'rejected':
        return 'Đã từ chối';
      case 'active':
        return 'Hoạt động';
      default:
        return 'Không xác định';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý thành viên</h1>
          <p className="text-gray-600">Quản lý thành viên và phân quyền trong hệ thống</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={activeTab === 'members' ? 'default' : 'outline'}
            onClick={() => setActiveTab('members')}
            className="flex items-center space-x-2"
          >
            <Users className="h-4 w-4" />
            <span>Thành viên ({members.length})</span>
          </Button>
          <Button
            variant={activeTab === 'pending' ? 'default' : 'outline'}
            onClick={() => setActiveTab('pending')}
            className="flex items-center space-x-2"
          >
            <Clock className="h-4 w-4" />
            <span>Chờ duyệt ({pendingUsers.length})</span>
          </Button>
        </div>
      </div>

      {/* Members Tab */}
      {activeTab === 'members' && (
        <>
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative col-span-full md:col-span-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm thành viên..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Role Filter */}
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Lọc theo vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả vai trò</SelectItem>
                    <SelectItem value="admin">Quản trị viên</SelectItem>
                    <SelectItem value="editor">Biên tập viên</SelectItem>
                    <SelectItem value="viewer">Người xem</SelectItem>
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Lọc theo trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="pending">Chờ duyệt</SelectItem>
                    <SelectItem value="approved">Đã duyệt</SelectItem>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="rejected">Đã từ chối</SelectItem>
                  </SelectContent>
                </Select>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setRoleFilter('all');
                    setStatusFilter('all');
                    setCurrentPage(1);
                  }}
                >
                  Xóa bộ lọc
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Members List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-gray-600" />
                <span>Danh sách thành viên</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Đang tải thành viên...</div>
              ) : members.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Không tìm thấy thành viên nào.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Họ và tên
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vai trò
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Đăng nhập cuối
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {members.map((member) => (
                        <tr key={member.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-2 text-gray-400" />
                              {member.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {member.full_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <Badge className={getRoleColor(member.role)}>
                              {member.role === 'admin' ? 'Quản trị viên' : member.role === 'editor' ? 'Biên tập viên' : 'Người xem'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <Badge className={getStatusColor(member.status)}>
                              {getStatusDisplay(member.status)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                              {member.last_login_at ? new Date(member.last_login_at).toLocaleString() : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-900">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-900">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Pending Users Tab */}
      {activeTab === 'pending' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-gray-600" />
              <span>Danh sách chờ duyệt ({pendingUsers.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Đang tải danh sách chờ duyệt...</div>
            ) : pendingUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p>Không có thành viên nào chờ duyệt.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingUsers.map((user) => (
                  <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {user.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{user.full_name}</h3>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <p className="text-xs text-gray-400">
                              Đăng ký: {new Date(user.requested_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setApprovalDialogOpen(true);
                          }}
                          className="text-green-600 hover:text-green-700"
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Duyệt
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setRejectionDialogOpen(true);
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <UserX className="h-4 w-4 mr-1" />
                          Từ chối
                        </Button>
                      </div>
                    </div>
                    {user.notes && (
                      <div className="mt-3 p-2 bg-gray-100 rounded text-sm text-gray-600">
                        <strong>Ghi chú:</strong> {user.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Duyệt thành viên</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedUser && (
              <div className="space-y-2">
                <Label>Thành viên</Label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">{selectedUser.full_name}</p>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="approvalRole">Vai trò</Label>
              <Select value={approvalRole} onValueChange={setApprovalRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Người xem</SelectItem>
                  <SelectItem value="editor">Biên tập viên</SelectItem>
                  <SelectItem value="admin">Quản trị viên</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="approvalNotes">Ghi chú (tùy chọn)</Label>
              <Textarea
                id="approvalNotes"
                placeholder="Ghi chú về việc duyệt..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setApprovalDialogOpen(false)}
              disabled={isApproving}
            >
              Hủy
            </Button>
            <Button
              onClick={approveUser}
              disabled={isApproving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isApproving ? 'Đang duyệt...' : 'Duyệt thành viên'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Từ chối thành viên</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedUser && (
              <div className="space-y-2">
                <Label>Thành viên</Label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">{selectedUser.full_name}</p>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Lý do từ chối *</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Nhập lý do từ chối..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setRejectionDialogOpen(false)}
              disabled={isRejecting}
            >
              Hủy
            </Button>
            <Button
              onClick={rejectUser}
              disabled={isRejecting || !rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRejecting ? 'Đang từ chối...' : 'Từ chối thành viên'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
