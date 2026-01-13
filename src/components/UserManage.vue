<template>
  <div class="user-manage">
    <h2>用户管理</h2>
    <p>管理员功能：管理系统用户</p>
    
    <!-- 操作按钮 -->
    <el-card shadow="hover" class="action-card">
      <div class="action-buttons">
        <el-button type="primary" @click="openAddUserDialog">
          <el-icon><Plus /></el-icon>
          新增用户
        </el-button>
        <el-button type="success" @click="exportUsers">
          <el-icon><Download /></el-icon>
          导出用户列表
        </el-button>
        <el-button type="warning" @click="batchUpdateStatus">
          <el-icon><Edit /></el-icon>
          批量更新状态
        </el-button>
        <el-button @click="refreshUsers">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </el-card>
    
    <!-- 搜索和筛选 -->
    <el-card shadow="hover" class="search-card" style="margin-top: 20px;">
      <div class="search-container">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input 
              v-model="searchForm.keyword" 
              placeholder="搜索用户名、姓名或邮箱"
              prefix-icon="Search"
            />
          </el-col>
          <el-col :span="6">
            <el-select 
              v-model="searchForm.role" 
              placeholder="用户角色"
              clearable
            >
              <el-option label="学生" value="student" />
              <el-option label="教师" value="teacher" />
              <el-option label="管理员" value="admin" />
              <el-option label="负责人" value="director" />
              <el-option label="校外人员" value="external" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select 
              v-model="searchForm.status" 
              placeholder="用户状态"
              clearable
            >
              <el-option label="活跃" value="active" />
              <el-option label="禁用" value="inactive" />
              <el-option label="待审核" value="pending" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="searchUsers">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
          </el-col>
        </el-row>
      </div>
    </el-card>
    
    <!-- 用户列表 -->
    <el-card shadow="hover" class="users-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <span class="total-count">共 {{ filteredUsers.length }} 个用户</span>
        </div>
      </template>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-spinner size="large" />
        <p>加载中...</p>
      </div>
      
      <!-- 无数据 -->
      <div v-else-if="filteredUsers.length === 0" class="empty-container">
        <el-empty description="暂无用户数据" />
      </div>
      
      <!-- 用户表格 -->
      <el-table 
        v-else 
        :data="currentPageData" 
        style="width: 100%;"
        stripe
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="name" label="姓名" min-width="100">
          <template #default="scope">
            <div class="user-info">
              <el-avatar :size="32" :src="scope.row.avatar" class="user-avatar">
                {{ scope.row.name.charAt(0) }}
              </el-avatar>
              <span class="user-name">{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="role" label="角色" width="120">
          <template #default="scope">
            <el-tag :type="getRoleType(scope.row.role)">
              {{ getRoleText(scope.row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="lastLogin" label="最后登录" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.lastLogin) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewUserDetail(scope.row)">
              查看详情
            </el-button>
            <el-button size="small" type="primary" @click="editUser(scope.row)">
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="deleteUser(scope.row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container" v-if="filteredUsers.length > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredUsers.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 新增/编辑用户对话框 -->
    <el-dialog 
      v-model="addUserDialogVisible" 
      :title="userDialogTitle" 
      width="70%"
    >
      <el-form :model="userForm" :rules="formRules" ref="formRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="userForm.username" placeholder="输入用户名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="userForm.name" placeholder="输入姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="密码" prop="password" v-if="!userForm.id">
              <el-input v-model="userForm.password" type="password" placeholder="输入密码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="确认密码" prop="confirmPassword" v-if="!userForm.id">
              <el-input v-model="userForm.confirmPassword" type="password" placeholder="确认密码" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户角色" prop="role">
              <el-select v-model="userForm.role" placeholder="选择用户角色">
                <el-option label="学生" value="student" />
                <el-option label="教师" value="teacher" />
                <el-option label="管理员" value="admin" />
                <el-option label="负责人" value="director" />
                <el-option label="校外人员" value="external" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="userForm.email" placeholder="输入邮箱" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系方式" prop="contactPhone">
              <el-input v-model="userForm.contactPhone" placeholder="输入联系方式" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户状态" prop="status">
              <el-select v-model="userForm.status" placeholder="选择用户状态">
                <el-option label="活跃" value="active" />
                <el-option label="禁用" value="inactive" />
                <el-option label="待审核" value="pending" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="userForm.notes" type="textarea" placeholder="输入备注信息" rows="3" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addUserDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveUser">保存</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 批量更新状态对话框 -->
    <el-dialog v-model="batchStatusDialogVisible" title="批量更新用户状态" width="50%">
      <el-form :model="batchStatusForm" :rules="batchStatusRules" ref="batchStatusFormRef">
        <el-form-item label="用户状态" prop="status">
          <el-select v-model="batchStatusForm.status" placeholder="选择用户状态">
            <el-option label="活跃" value="active" />
            <el-option label="禁用" value="inactive" />
            <el-option label="待审核" value="pending" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="batchStatusForm.notes" type="textarea" placeholder="输入更新备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchStatusDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmBatchStatusUpdate">确定更新</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  Plus, 
  Download, 
  Edit, 
  Refresh, 
  Search 
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// 状态管理
const addUserDialogVisible = ref(false);
const batchStatusDialogVisible = ref(false);
const userDialogTitle = ref('新增用户');
const loading = ref(false);
const searchForm = ref({
  keyword: '',
  role: '',
  status: ''
});
const currentPage = ref(1);
const pageSize = ref(10);
const selectedUsers = ref([]);

// 表单数据
const userForm = ref({
  id: '',
  username: '',
  name: '',
  password: '',
  confirmPassword: '',
  role: 'student',
  email: '',
  contactPhone: '',
  status: 'active',
  notes: ''
});

// 批量更新状态表单
const batchStatusForm = ref({
  status: '',
  notes: ''
});

// 表单验证规则
const formRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  confirmPassword: [{ required: true, message: '请确认密码', trigger: 'blur' }],
  role: [{ required: true, message: '请选择用户角色', trigger: 'change' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }, { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }],
  contactPhone: [{ required: true, message: '请输入联系方式', trigger: 'blur' }],
  status: [{ required: true, message: '请选择用户状态', trigger: 'change' }]
};

const batchStatusRules = {
  status: [{ required: true, message: '请选择用户状态', trigger: 'change' }]
};

// 用户数据（模拟）
const usersList = ref([
  {
    id: 1,
    username: 'admin',
    name: '管理员',
    role: 'admin',
    email: 'admin@example.com',
    contactPhone: '13800138001',
    status: 'active',
    lastLogin: '2026-01-13T10:00:00',
    notes: '系统管理员',
    avatar: ''
  },
  {
    id: 2,
    username: 'director',
    name: '实验室负责人',
    role: 'director',
    email: 'director@example.com',
    contactPhone: '13900139001',
    status: 'active',
    lastLogin: '2026-01-13T09:30:00',
    notes: '实验室负责人',
    avatar: ''
  },
  {
    id: 3,
    username: 'teacher1',
    name: '王教授',
    role: 'teacher',
    email: 'teacher1@example.com',
    contactPhone: '13700137001',
    status: 'active',
    lastLogin: '2026-01-12T16:00:00',
    notes: '计算机科学与技术学院',
    avatar: ''
  },
  {
    id: 4,
    username: 'student1',
    name: '张三',
    role: 'student',
    email: 'student1@example.com',
    contactPhone: '13600136001',
    status: 'active',
    lastLogin: '2026-01-13T11:20:00',
    notes: '2024级学生',
    avatar: ''
  },
  {
    id: 5,
    username: 'external1',
    name: '校外用户',
    role: 'external',
    email: 'external1@example.com',
    contactPhone: '13500135001',
    status: 'pending',
    lastLogin: null,
    notes: '校外合作人员',
    avatar: ''
  },
  {
    id: 6,
    username: 'teacher2',
    name: '李教授',
    role: 'teacher',
    email: 'teacher2@example.com',
    contactPhone: '13400134001',
    status: 'inactive',
    lastLogin: '2026-01-10T08:45:00',
    notes: '电子信息工程学院',
    avatar: ''
  }
]);

// 过滤用户数据
const filteredUsers = computed(() => {
  return usersList.value.filter(item => {
    const matchesKeyword = !searchForm.value.keyword || 
      item.name.toLowerCase().includes(searchForm.value.keyword.toLowerCase()) ||
      item.username.toLowerCase().includes(searchForm.value.keyword.toLowerCase()) ||
      item.email.toLowerCase().includes(searchForm.value.keyword.toLowerCase()) ||
      item.contactPhone.includes(searchForm.value.keyword);
    
    const matchesRole = !searchForm.value.role || item.role === searchForm.value.role;
    
    const matchesStatus = !searchForm.value.status || item.status === searchForm.value.status;
    
    return matchesKeyword && matchesRole && matchesStatus;
  });
});

// 当前页数据
const currentPageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredUsers.value.slice(start, end);
});

// 角色文本和类型
const getRoleText = (role) => {
  const roleMap = {
    student: '学生',
    teacher: '教师',
    admin: '管理员',
    director: '负责人',
    external: '校外人员'
  };
  return roleMap[role] || role;
};

const getRoleType = (role) => {
  const typeMap = {
    student: 'info',
    teacher: 'primary',
    admin: 'warning',
    director: 'danger',
    external: 'success'
  };
  return typeMap[role] || '';
};

// 状态文本和类型
const getStatusText = (status) => {
  const statusMap = {
    active: '活跃',
    inactive: '禁用',
    pending: '待审核'
  };
  return statusMap[status] || status;
};

const getStatusType = (status) => {
  const typeMap = {
    active: 'success',
    inactive: 'danger',
    pending: 'warning'
  };
  return typeMap[status] || '';
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未登录';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN');
};

// 选择用户
const handleSelectionChange = (selection) => {
  selectedUsers.value = selection;
};

// 打开新增用户对话框
const openAddUserDialog = () => {
  userDialogTitle.value = '新增用户';
  userForm.value = {
    id: '',
    username: '',
    name: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    email: '',
    contactPhone: '',
    status: 'active',
    notes: ''
  };
  addUserDialogVisible.value = true;
};

// 保存用户
const saveUser = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    addUserDialogVisible.value = false;
    
    if (!userForm.value.id) {
      // 新增用户
      const newUser = {
        ...userForm.value,
        id: usersList.value.length + 1,
        lastLogin: null,
        avatar: ''
      };
      usersList.value.unshift(newUser);
    } else {
      // 编辑用户
      const index = usersList.value.findIndex(u => u.id === userForm.value.id);
      if (index !== -1) {
        usersList.value[index] = { 
          ...usersList.value[index],
          ...userForm.value,
          password: usersList.value[index].password // 保持密码不变
        };
      }
    }
    
    ElMessage.success('保存成功');
  }, 500);
};

// 查看用户详情
const viewUserDetail = (user) => {
  console.log('查看用户详情:', user);
  ElMessage.info('查看用户详情功能开发中');
};

// 编辑用户
const editUser = (user) => {
  userDialogTitle.value = '编辑用户';
  userForm.value = { 
    ...user,
    password: '',
    confirmPassword: ''
  };
  addUserDialogVisible.value = true;
};

// 删除用户
const deleteUser = (id) => {
  ElMessageBox.confirm('确定要删除这个用户吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    usersList.value = usersList.value.filter(u => u.id !== id);
    ElMessage.success('删除成功');
  }).catch(() => {});
};

// 导出用户列表
const exportUsers = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('用户列表导出成功');
  }, 1000);
};

// 批量更新状态
const batchUpdateStatus = () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请先选择要更新状态的用户');
    return;
  }
  batchStatusDialogVisible.value = true;
};

// 确认批量更新状态
const confirmBatchStatusUpdate = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    batchStatusDialogVisible.value = false;
    
    selectedUsers.value.forEach(user => {
      const index = usersList.value.findIndex(u => u.id === user.id);
      if (index !== -1) {
        usersList.value[index].status = batchStatusForm.value.status;
      }
    });
    
    ElMessage.success(`成功更新 ${selectedUsers.value.length} 个用户的状态`);
    selectedUsers.value = [];
  }, 1000);
};

// 刷新用户列表
const refreshUsers = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('用户列表刷新成功');
  }, 800);
};

// 搜索用户
const searchUsers = () => {
  currentPage.value = 1;
};

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
};

const handleCurrentChange = (current) => {
  currentPage.value = current;
};

// 初始化
onMounted(() => {
  refreshUsers();
});
</script>

<style scoped>
.user-manage {
  padding: 20px;
}

.action-card {
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.search-card {
  margin-bottom: 20px;
}

.search-container {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-count {
  font-size: 14px;
  color: #606266;
}

.loading-container {
  text-align: center;
  padding: 60px 0;
}

.empty-container {
  padding: 60px 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  margin-right: 8px;
}

.user-name {
  font-weight: 500;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .user-manage {
    padding: 10px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }
  
  .search-container {
    flex-direction: column;
    gap: 10px;
  }
}
</style>