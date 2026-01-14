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
import { ref, onMounted, computed } from 'vue';
import { 
  Edit, 
  Key, 
  Upload 
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useStore } from 'vuex';

// 状态管理
const store = useStore();
const editProfileDialogVisible = ref(false);
const changePasswordDialogVisible = ref(false);
const loading = ref(false);

// 从store获取用户信息
const userInfo = computed(() => store.getters.currentUser || {
  id: '',
  username: '',
  name: '',
  role: '',
  email: '',
  contactPhone: '',
  status: 'active',
  avatar: '',
  registerTime: '',
  lastLogin: '',
  notes: ''
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
    contactPhone: userInfo.value.contactPhone || userInfo.value.phone,
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
    
    // 更新store中的用户信息
    const updatedUser = {
      ...userInfo.value,
      name: editForm.value.name,
      email: editForm.value.email,
      contactPhone: editForm.value.contactPhone,
      phone: editForm.value.contactPhone,
      notes: editForm.value.notes
    };
    
    store.commit('SET_USER', updatedUser);
    
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