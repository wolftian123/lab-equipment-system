<template>
  <header class="header">
    <div class="header-container">
      <!-- 左侧：系统标题和logo -->
      <div class="header-left">
        <div class="logo">
          <el-icon class="logo-icon"><Setting /></el-icon>
          <span class="logo-text">江南大学实验设备管理系统</span>
        </div>
      </div>
      
      <!-- 右侧：用户信息和操作 -->
      <div class="header-right">
        <!-- 通知中心 -->
        <div class="header-item" @click="handleNotificationClick">
          <el-badge :value="notificationCount" :hidden="notificationCount === 0">
            <el-icon class="header-icon"><Bell /></el-icon>
          </el-badge>
        </div>
        
        <!-- 消息中心 -->
        <div class="header-item" @click="handleMessageClick">
          <el-badge :value="messageCount" :hidden="messageCount === 0">
            <el-icon class="header-icon"><Message /></el-icon>
          </el-badge>
        </div>
        
        <!-- 用户信息 -->
        <div class="user-info" @click="toggleUserMenu">
          <el-avatar :size="32" :src="user.avatar" class="user-avatar">
            {{ user.name?.charAt(0) }}
          </el-avatar>
          <span class="user-name">{{ user.name }}</span>
          <el-icon class="header-icon"><ArrowDown /></el-icon>
          
          <!-- 用户下拉菜单 -->
          <div v-if="userMenuVisible" class="user-menu">
            <div class="user-menu-item" @click="goToProfile">
              <el-icon><User /></el-icon>
              <span>个人中心</span>
            </div>
            <div class="user-menu-item" @click="goToSettings">
              <el-icon><Setting /></el-icon>
              <span>系统设置</span>
            </div>
            <div class="user-menu-divider"></div>
            <div class="user-menu-item logout" @click="handleLogout">
              <el-icon><Switch /></el-icon>
              <span>退出登录</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { 
  Setting, 
  Bell, 
  Message, 
  ArrowDown, 
  User, 
  Switch 
} from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

// 路由
const router = useRouter();

// 状态管理
const userMenuVisible = ref(false);
const notificationCount = ref(3);
const messageCount = ref(1);

// 用户信息
const user = ref({
  id: 1,
  username: 'admin',
  name: '管理员',
  role: 'director',
  avatar: '',
  email: 'admin@example.com'
});

// 切换用户菜单
const toggleUserMenu = () => {
  userMenuVisible.value = !userMenuVisible.value;
};

// 处理通知点击
const handleNotificationClick = () => {
  ElMessage.info('通知中心开发中');
};

// 处理消息点击
const handleMessageClick = () => {
  ElMessage.info('消息中心开发中');
};

// 前往个人中心
const goToProfile = () => {
  userMenuVisible.value = false;
  router.push('/main/profile');
};

// 前往系统设置
const goToSettings = () => {
  userMenuVisible.value = false;
  router.push('/main/system/settings');
};

// 处理退出登录
const handleLogout = () => {
  userMenuVisible.value = false;
  // 这里应该调用登出API，清除token等
  ElMessage.success('退出登录成功');
  // 跳转到登录页
  router.push('/login');
};

// 点击外部关闭菜单
const handleClickOutside = (event) => {
  const userInfo = document.querySelector('.user-info');
  if (userInfo && !userInfo.contains(event.target)) {
    userMenuVisible.value = false;
  }
};

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.header {
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.logo-icon {
  font-size: 24px;
  color: #409EFF;
  margin-right: 10px;
}

.logo-text {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-item {
  position: relative;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.header-item:hover {
  background-color: #f5f7fa;
}

.header-icon {
  font-size: 20px;
  color: #606266;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
  position: relative;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.user-avatar {
  cursor: pointer;
}

.user-name {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.user-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  min-width: 160px;
  z-index: 1001;
}

.user-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 14px;
}

.user-menu-item:hover {
  background-color: #f5f7fa;
}

.user-menu-item.logout {
  color: #f56c6c;
}

.user-menu-item.logout:hover {
  background-color: #fef0f0;
}

.user-menu-divider {
  height: 1px;
  background-color: #e4e7ed;
  margin: 4px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-container {
    padding: 0 10px;
  }
  
  .logo-text {
    font-size: 16px;
  }
  
  .user-name {
    display: none;
  }
  
  .header-right {
    gap: 10px;
  }
}
</style>