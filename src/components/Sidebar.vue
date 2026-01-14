<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <el-icon class="logo-icon"><Setting /></el-icon>
        <span class="logo-text">设备管理</span>
      </div>
      <el-button 
        class="collapse-btn" 
        type="text" 
        @click="toggleCollapse"
        :title="isCollapsed ? '展开菜单' : '折叠菜单'"
      >
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
    </div>
    
    <nav class="sidebar-nav">
      <ul>
        <!-- 菜单项 -->
        <li 
          v-for="item in filteredMenuItems" 
          :key="item.path"
          class="menu-item"
          :class="{ 'has-children': item.children && item.children.length > 0 }"
        >
          <!-- 菜单项 -->
          <div 
            class="menu-link"
            @click="handleMenuItemClick(item)"
            :class="{ 'active': isActive(item) }"
          >
            <el-icon class="menu-icon">{{ getIconComponent(item.icon) }}</el-icon>
            <span v-if="!isCollapsed" class="menu-text">{{ item.title }}</span>
            <el-icon v-if="item.children && item.children.length > 0" class="menu-arrow">
              <ArrowDown v-if="!item.isOpen" />
              <ArrowUp v-else />
            </el-icon>
          </div>
          
          <!-- 子菜单 -->
          <ul 
            v-if="item.children && item.children.length > 0"
            class="sub-menu"
            :class="{ 'open': item.isOpen }"
          >
            <li 
              v-for="subItem in item.children" 
              :key="subItem.path"
              class="sub-menu-item"
            >
              <router-link 
                :to="subItem.path"
                class="sub-menu-link"
                :class="{ 'active': isActive(subItem) }"
              >
                <el-icon v-if="subItem.icon" class="sub-menu-icon">{{ getIconComponent(subItem.icon) }}</el-icon>
                <span v-if="!isCollapsed" class="sub-menu-text">{{ subItem.title }}</span>
              </router-link>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
    
    <!-- 底部信息 -->
    <div class="sidebar-footer" v-if="!isCollapsed">
      <div class="user-info">
        <el-avatar :size="24" :src="user.avatar">
          {{ user.name?.charAt(0) }}
        </el-avatar>
        <div class="user-details">
          <div class="user-name">{{ user.name }}</div>
          <div class="user-role">{{ getRoleText(user.role) }}</div>
        </div>
      </div>
      <div class="version">v1.0.0</div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  Setting, 
  Odometer, 
  Box, 
  Calendar, 
  DocumentChecked, 
  Tools, 
  User, 
  Money, 
  DataAnalysis, 
  View, 
  Download, 
  QuestionFilled,
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Search,
  Location,
  List,
  CirclePlus,
  Histogram,
  School,
  OfficeBuilding,
  Wallet
} from '@element-plus/icons-vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useStore } from 'vuex';

// 路由
const router = useRouter();
const route = useRoute();

// 状态管理
const store = useStore();
const isCollapsed = ref(false);

// 用户信息
const user = computed(() => store.getters.currentUser || {
  id: 1,
  username: 'admin',
  name: '管理员',
  role: 'director',
  avatar: ''
});

// 过滤后的菜单项
const filteredMenuItems = computed(() => {
  const currentRole = user.value.role;
  return menuItems.value.filter(item => {
    // 检查菜单项是否对当前角色可见
    if (!item.roles || item.roles.includes(currentRole)) {
      // 过滤子菜单
      if (item.children && item.children.length > 0) {
        item.children = item.children.filter(subItem => {
          return !subItem.roles || subItem.roles.includes(currentRole);
        });
      }
      return true;
    }
    return false;
  });
});

// 菜单数据
const menuItems = ref([
  {
    path: '/main/dashboard',
    title: '仪表盘',
    icon: 'Odometer',
    roles: ['student', 'teacher', 'admin', 'director', 'external']
  },
  {
    path: '/main/equipment',
    title: '设备查询',
    icon: 'Box',
    roles: ['student', 'teacher', 'admin', 'director', 'external'],
    children: [
      {
        path: '/main/equipment/list',
        title: '设备列表',
        icon: 'Search'
      },
      {
        path: '/main/equipment/map',
        title: '设备位置',
        icon: 'Location',
        roles: ['admin', 'director']
      }
    ]
  },
  {
    path: '/main/reservation',
    title: '预约管理',
    icon: 'Calendar',
    roles: ['student', 'teacher', 'admin', 'director', 'external'],
    children: [
      {
        path: '/main/reservation/apply',
        title: '预约申请',
        icon: 'DocumentChecked'
      },
      {
        path: '/main/reservation/my',
        title: '我的预约',
        icon: 'List'
      },
      {
        path: '/main/reservation/history',
        title: '预约历史',
        icon: 'Histogram'
      }
    ]
  },
  {
    path: '/main/approval',
    title: '审批管理',
    icon: 'DocumentChecked',
    roles: ['teacher', 'admin', 'director'],
    children: [
      {
        path: '/main/approval/students',
        title: '学生申请',
        icon: 'User'
      },
      {
        path: '/main/approval/teachers',
        title: '教师申请',
        icon: 'School',
        roles: ['admin', 'director']
      },
      {
        path: '/main/approval/external',
        title: '校外人员申请',
        icon: 'OfficeBuilding',
        roles: ['director']
      }
    ]
  },
  {
    path: '/main/equipment-manage',
    title: '设备管理',
    icon: 'Tools',
    roles: ['admin', 'director'],
    children: [
      {
        path: '/main/equipment-manage/list',
        title: '设备台账',
        icon: 'List'
      },
      {
        path: '/main/equipment-manage/maintenance',
        title: '设备维护',
        icon: 'Tools'
      },
      {
        path: '/main/equipment-manage/add',
        title: '新增设备',
        icon: 'CirclePlus'
      },
      {
        path: '/main/equipment-manage/audit',
        title: '设备审批',
        icon: 'DocumentChecked'
      },
      {
        path: '/main/equipment-manage/status',
        title: '设备状态',
        icon: 'DataAnalysis'
      }
    ]
  },
  {
    path: '/main/user-manage',
    title: '用户管理',
    icon: 'User',
    roles: ['teacher', 'admin', 'director'],
    children: [
      {
        path: '/main/user-manage/students',
        title: '学生管理',
        icon: 'User'
      },
      {
        path: '/main/user-manage/teachers',
        title: '教师管理',
        icon: 'School',
        roles: ['admin', 'director']
      },
      {
        path: '/main/user-manage/external',
        title: '校外人员管理',
        icon: 'OfficeBuilding',
        roles: ['director']
      },
      {
        path: '/main/user-manage/admins',
        title: '管理员管理',
        icon: 'Setting',
        roles: ['director']
      }
    ]
  },
  {
    path: '/main/financial',
    title: '财务管理',
    icon: 'Money',
    roles: ['director'],
    children: [
      {
        path: '/main/financial/reports',
        title: '财务报表',
        icon: 'Histogram'
      },
      {
        path: '/main/financial/billing',
        title: '计费管理',
        icon: 'Wallet'
      },
      {
        path: '/main/financial/settings',
        title: '财务设置',
        icon: 'Setting'
      }
    ]
  },
  {
    path: '/main/report',
    title: '报表统计',
    icon: 'DataAnalysis',
    roles: ['admin', 'director'],
    children: [
      {
        path: '/main/report/usage',
        title: '使用率报表',
        icon: 'Histogram'
      }
    ]
  },
  {
    path: '/main/system',
    title: '系统管理',
    icon: 'Setting',
    roles: ['director'],
    children: [
      {
        path: '/main/system/settings',
        title: '系统设置',
        icon: 'Tools'
      },
      {
        path: '/main/system/logs',
        title: '系统日志',
        icon: 'View'
      },
      {
        path: '/main/system/backup',
        title: '系统备份',
        icon: 'Download'
      }
    ]
  },
  {
    path: '/main/profile',
    title: '个人中心',
    icon: 'User',
    roles: ['student', 'teacher', 'admin', 'director', 'external']
  },
  {
    path: '/main/help',
    title: '帮助中心',
    icon: 'QuestionFilled',
    roles: ['student', 'teacher', 'admin', 'director', 'external']
  }
]);

// 处理菜单点击
const handleMenuItemClick = (item) => {
  if (item.children && item.children.length > 0) {
    item.isOpen = !item.isOpen;
  } else {
    router.push(item.path);
  }
};

// 检查菜单项是否激活
const isActive = (item) => {
  return route.path === item.path || route.path.startsWith(item.path + '/');
};

// 获取图标组件
const getIconComponent = (iconName) => {
  const iconMap = {
    Setting,
    Odometer,
    Box,
    Calendar,
    DocumentChecked,
    Tools,
    User,
    Money,
    DataAnalysis,
    View,
    Download,
    QuestionFilled,
    Search,
    Location,
    List,
    CirclePlus,
    Histogram,
    School,
    OfficeBuilding,
    Wallet
  };
  return iconMap[iconName] || Setting;
};

// 获取角色文本
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

// 切换折叠状态
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};
// 初始化
onMounted(() => {
  // 初始化菜单展开状态
  filteredMenuItems.value.forEach(item => {
    if (item.children && item.children.length > 0) {
      item.isOpen = item.children.some(subItem => isActive(subItem));
    }
  });
});</script>

<style scoped>
.sidebar {
  width: 250px;
  background: #304156;
  color: #fff;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  transition: width 0.3s;
  z-index: 999;
  display: flex;
  flex-direction: column;
}

.sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid #2c3e50;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 20px;
  color: #409EFF;
}

.logo-text {
  font-size: 16px;
  font-weight: bold;
  color: #fff;
}

.collapse-btn {
  color: #fff;
  padding: 4px;
}

.collapse-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.menu-item {
  margin-bottom: 4px;
}

.menu-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.3s;
  color: #fff;
  text-decoration: none;
  position: relative;
}

.menu-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.menu-link.active {
  background-color: rgba(64, 158, 255, 0.2);
  border-left: 3px solid #409EFF;
}

.menu-icon {
  font-size: 18px;
  width: 20px;
  text-align: center;
}

.menu-text {
  flex: 1;
}

.menu-arrow {
  font-size: 12px;
  transition: transform 0.3s;
}

.sub-menu {
  background-color: #2c3e50;
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.3s;
}

.sub-menu.open {
  max-height: 500px;
}

.sub-menu-item {
  margin: 0;
}

.sub-menu-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px 10px 44px;
  color: #ccc;
  text-decoration: none;
  transition: all 0.3s;
}

.sub-menu-link:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
}

.sub-menu-link.active {
  color: #409EFF;
  background-color: rgba(64, 158, 255, 0.1);
}

.sub-menu-icon {
  font-size: 16px;
  width: 18px;
  text-align: center;
}

.sub-menu-text {
  flex: 1;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid #2c3e50;
  margin-top: auto;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #fff;
}

.user-role {
  font-size: 12px;
  color: #ccc;
  margin-top: 2px;
}

.version {
  font-size: 12px;
  color: #666;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 200px;
  }
  
  .sidebar.collapsed {
    width: 60px;
  }
  
  .logo-text {
    font-size: 14px;
  }
  
  .menu-link {
    padding: 10px 16px;
  }
  
  .sub-menu-link {
    padding: 8px 16px 8px 36px;
  }
}
</style>