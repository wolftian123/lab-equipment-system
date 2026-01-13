<template>
  <div class="user-profile">
    <h2>个人中心</h2>
    <p>管理个人信息和账户设置</p>
    
    <!-- 个人信息卡片 -->
    <el-card shadow="hover" class="profile-card">
      <template #header>
        <div class="card-header">
          <span>个人信息</span>
        </div>
      </template>
      
      <div class="profile-content">
        <div class="profile-avatar">
          <el-avatar :size="100" :src="userInfo.avatar" class="avatar-large">
            {{ userInfo.name.charAt(0) }}
          </el-avatar>
          <div class="avatar-actions">
            <el-button size="small" @click="uploadAvatar">上传头像</el-button>
          </div>
        </div>
        
        <div class="profile-info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="用户名">{{ userInfo.username }}</el-descriptions-item>
            <el-descriptions-item label="姓名">{{ userInfo.name }}</el-descriptions-item>
            <el-descriptions-item label="用户角色">
              <el-tag :type="getRoleType(userInfo.role)">
                {{ getRoleText(userInfo.role) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ userInfo.email }}</el-descriptions-item>
            <el-descriptions-item label="联系方式">{{ userInfo.contactPhone }}</el-descriptions-item>
            <el-descriptions-item label="注册时间">{{ formatDate(userInfo.registerTime) }}</el-descriptions-item>
            <el-descriptions-item label="最后登录">{{ formatDate(userInfo.lastLogin) }}</el-descriptions-item>
            <el-descriptions-item label="账户状态">
              <el-tag :type="getStatusType(userInfo.status)">
                {{ getStatusText(userInfo.status) }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>
        
        <div class="profile-actions">
          <el-button type="primary" @click="openEditProfileDialog">
            <el-icon><Edit /></el-icon>
            编辑个人信息
          </el-button>
          <el-button type="warning" @click="openChangePasswordDialog">
            <el-icon><Key /></el-icon>
            修改密码
          </el-button>
        </div>
      </div>
    </el-card>
    
    <!-- 账户安全卡片 -->
    <el-card shadow="hover" class="security-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>账户安全</span>
        </div>
      </template>
      
      <div class="security-content">
        <el-table :data="securityItems" style="width: 100%;">
          <el-table-column prop="item" label="安全项" width="200" />
          <el-table-column prop="status" label="状态" width="150">
            <template #default="scope">
              <el-tag :type="scope.row.statusType">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" />
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="scope">
              <el-button size="small" @click="handleSecurityAction(scope.row.action)">
                {{ scope.row.actionText }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
    
    <!-- 最近活动卡片 -->
    <el-card shadow="hover" class="activity-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>最近活动</span>
          <el-button size="small" @click="loadMoreActivity">加载更多</el-button>
        </div>
      </template>
      
      <div v-if="loading" class="loading-container">
        <el-spinner size="large" />
        <p>加载中...</p>
      </div>
      
      <div v-else-if="recentActivity.length === 0" class="empty-container">
        <el-empty description="暂无活动记录" />
      </div>
      
      <div v-else class="activity-list">
        <el-timeline>
          <el-timeline-item 
            v-for="(item, index) in recentActivity" 
            :key="index"
            :timestamp="formatDate(item.time)"
            :type="item.type"
          >
            <el-card shadow="hover" :body-style="{ padding: '10px' }">
              <div class="activity-item">
                <div class="activity-title">{{ item.title }}</div>
                <div class="activity-description">{{ item.description }}</div>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-card>
    
    <!-- 编辑个人信息对话框 -->
    <el-dialog 
      v-model="editProfileDialogVisible" 
      title="编辑个人信息" 
      width="70%"
    >
      <el-form :model="editForm" :rules="formRules" ref="formRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="editForm.name" placeholder="输入姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系方式" prop="contactPhone">
              <el-input v-model="editForm.contactPhone" placeholder="输入联系方式" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="editForm.email" placeholder="输入邮箱" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="editForm.notes" type="textarea" placeholder="输入备注信息" rows="3" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editProfileDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveProfile">保存</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 修改密码对话框 -->
    <el-dialog 
      v-model="changePasswordDialogVisible" 
      title="修改密码" 
      width="50%"
    >
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="120px">
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input v-model="passwordForm.currentPassword" type="password" placeholder="输入当前密码" />
        </el-form-item>
        
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" placeholder="输入新密码" />
        </el-form-item>
        
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="确认新密码" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="changePasswordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="changePassword">确认修改</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { 
  Edit, 
  Key, 
  Upload 
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// 状态管理
const editProfileDialogVisible = ref(false);
const changePasswordDialogVisible = ref(false);
const loading = ref(false);

// 用户信息（模拟）
const userInfo = ref({
  id: 1,
  username: 'admin',
  name: '管理员',
  role: 'admin',
  email: 'admin@example.com',
  contactPhone: '13800138001',
  status: 'active',
  avatar: '',
  registerTime: '2026-01-01T00:00:00',
  lastLogin: '2026-01-13T10:00:00',
  notes: '系统管理员'
});

// 编辑表单
const editForm = ref({
  name: '',
  email: '',
  contactPhone: '',
  notes: ''
});

// 密码修改表单
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }, { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }],
  contactPhone: [{ required: true, message: '请输入联系方式', trigger: 'blur' }]
};

const passwordRules = {
  currentPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }, { min: 6, message: '密码长度至少为6位', trigger: 'blur' }],
  confirmPassword: [{ required: true, message: '请确认新密码', trigger: 'blur' }]
};

// 安全项
const securityItems = ref([
  {
    item: '登录密码',
    status: '已设置',
    statusType: 'success',
    description: '用于账户登录的密码',
    action: 'changePassword',
    actionText: '修改'
  },
  {
    item: '邮箱验证',
    status: '已验证',
    statusType: 'success',
    description: '用于找回密码和接收通知',
    action: 'verifyEmail',
    actionText: '重新验证'
  },
  {
    item: '手机验证',
    status: '未验证',
    statusType: 'warning',
    description: '用于找回密码和接收通知',
    action: 'verifyPhone',
    actionText: '验证'
  },
  {
    item: '两步验证',
    status: '未开启',
    statusType: 'info',
    description: '提高账户安全性',
    action: 'enable2FA',
    actionText: '开启'
  }
]);

// 最近活动
const recentActivity = ref([
  {
    time: '2026-01-13T10:00:00',
    title: '登录系统',
    description: '使用管理员账号登录了系统',
    type: 'success'
  },
  {
    time: '2026-01-13T09:30:00',
    title: '修改设置',
    description: '更新了系统配置',
    type: 'primary'
  },
  {
    time: '2026-01-12T16:00:00',
    title: '审批申请',
    description: '审批了学生的设备预约申请',
    type: 'info'
  },
  {
    time: '2026-01-12T14:00:00',
    title: '添加用户',
    description: '添加了新的教师用户',
    type: 'success'
  }
]);

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
  if (!dateString) return '无';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN');
};

// 打开编辑个人信息对话框
const openEditProfileDialog = () => {
  editForm.value = {
    name: userInfo.value.name,
    email: userInfo.value.email,
    contactPhone: userInfo.value.contactPhone,
    notes: userInfo.value.notes
  };
  editProfileDialogVisible.value = true;
};

// 保存个人信息
const saveProfile = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    editProfileDialogVisible.value = false;
    
    userInfo.value = {
      ...userInfo.value,
      ...editForm.value
    };
    
    ElMessage.success('个人信息更新成功');
  }, 500);
};

// 打开修改密码对话框
const openChangePasswordDialog = () => {
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  changePasswordDialogVisible.value = true;
};

// 修改密码
const changePassword = () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    ElMessage.error('两次输入的密码不一致');
    return;
  }
  
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    changePasswordDialogVisible.value = false;
    
    ElMessage.success('密码修改成功');
  }, 1000);
};

// 上传头像
const uploadAvatar = () => {
  ElMessage.info('头像上传功能开发中');
};

// 处理安全操作
const handleSecurityAction = (action) => {
  switch (action) {
    case 'changePassword':
      openChangePasswordDialog();
      break;
    case 'verifyEmail':
      ElMessage.info('邮箱验证功能开发中');
      break;
    case 'verifyPhone':
      ElMessage.info('手机验证功能开发中');
      break;
    case 'enable2FA':
      ElMessage.info('两步验证功能开发中');
      break;
    default:
      break;
  }
};

// 加载更多活动
const loadMoreActivity = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('已加载全部活动记录');
  }, 1000);
};

// 初始化
onMounted(() => {
  console.log('个人中心初始化');
});
</script>

<style scoped>
.user-profile {
  padding: 20px;
}

.profile-card {
  margin-bottom: 20px;
}

.profile-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.profile-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.avatar-large {
  margin-bottom: 10px;
}

.profile-info {
  width: 100%;
}

.profile-actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}

.security-card {
  margin-bottom: 20px;
}

.activity-card {
  margin-bottom: 20px;
}

.loading-container {
  text-align: center;
  padding: 60px 0;
}

.empty-container {
  padding: 60px 0;
}

.activity-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.activity-title {
  font-weight: 500;
  font-size: 14px;
}

.activity-description {
  font-size: 12px;
  color: #606266;
}

@media (max-width: 768px) {
  .user-profile {
    padding: 10px;
  }
  
  .profile-content {
    align-items: flex-start;
  }
  
  .profile-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .profile-actions .el-button {
    width: 100%;
  }
}
</style>