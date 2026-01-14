<template>
  <div class="main-layout">
    <!-- 头部导航栏 -->
    <header class="main-header">
      <div class="header-left">
        <div class="logo">
          <el-icon size="28" color="#409eff"><Monitor /></el-icon>
          <span class="logo-text">江南大学实验室设备管理系统</span>
        </div>
      </div>

      <div class="header-center">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/main/dashboard' }"
            >首页</el-breadcrumb-item
          >
          <el-breadcrumb-item>{{ currentRouteName }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div class="header-right">
        <!-- 用户信息 -->
        <el-dropdown class="user-dropdown" @command="handleUserCommand">
          <div class="user-info">
            <el-avatar :size="36" :src="user.avatar" class="user-avatar">
              {{ user.name?.charAt(0) }}
            </el-avatar>
            <div class="user-details">
              <div class="user-name">{{ user.name || "用户" }}</div>
              <div class="user-role">{{ roleName }}</div>
              <!-- 校外人员余额显示 -->
              <div v-if="user.role === 'external'" class="user-balance">
                <el-icon size="12"><Money /></el-icon>
                <span>余额: ¥{{ user.balance || 0 }}</span>
              </div>
            </div>
            <el-icon><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><User /></el-icon>个人中心
              </el-dropdown-item>
              <!-- 校外人员充值入口 -->
              <el-dropdown-item v-if="user.role === 'external'" command="recharge">
                <el-icon><Wallet /></el-icon>账户充值
              </el-dropdown-item>
              <el-dropdown-item v-if="isAdmin" command="settings">
                <el-icon><Setting /></el-icon>系统设置
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon>退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <!-- 主内容区 -->
    <div class="main-container">
      <!-- 侧边栏 -->
      <aside class="main-sidebar" :class="{ collapsed: sidebarCollapsed }">
        <div class="sidebar-toggle" @click="toggleSidebar">
          <el-icon>
            <component :is="sidebarCollapsed ? 'Expand' : 'Fold'" />
          </el-icon>
        </div>

        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          :collapse="sidebarCollapsed"
          :collapse-transition="false"
          router
          @select="handleMenuSelect"
          :unique-opened="true"
        >
          <!-- 设备查询（所有角色） -->
          <el-menu-item index="/main/equipment/list">
            <el-icon><Search /></el-icon>
            <template #title>设备查询</template>
          </el-menu-item>

          <!-- 预约管理 -->
          <el-sub-menu v-if="user.role !== 'admin' && user.role !== 'director'" index="reservation">
            <template #title>
              <el-icon><Calendar /></el-icon>
              <span>预约管理</span>
              <el-badge v-if="user.role === 'external'" value="付费" type="warning" style="margin-left: 8px;" />
            </template>
            
            <el-menu-item index="/main/reservation/apply">
              <el-icon><CirclePlus /></el-icon>
              <template #title>预约申请</template>
            </el-menu-item>
            
            <el-menu-item index="/main/reservation/my">
              <el-icon><List /></el-icon>
              <template #title>我的预约</template>
            </el-menu-item>
            
            <el-menu-item index="/main/reservation/history">
              <el-icon><Histogram /></el-icon>
              <template #title>预约历史</template>
            </el-menu-item>
          </el-sub-menu>

          <!-- 审批管理（教师、管理员、实验室负责人） -->
          <el-sub-menu v-if="user.role === 'teacher' || isAdmin || user.role === 'director'" index="approval">
            <template #title>
              <el-icon><DocumentChecked /></el-icon>
              <span>审批管理</span>
            </template>
            
            <!-- 教师：审批学生的申请 -->
            <el-menu-item v-if="user.role === 'teacher'" index="/main/approval/students">
              <el-icon><Avatar /></el-icon>
              <template #title>学生申请审批</template>
            </el-menu-item>
            
            <!-- 设备管理员：审批学生申请 -->
            <el-menu-item v-if="user.role === 'admin'" index="/main/approval/students">
              <el-icon><User /></el-icon>
              <template #title>学生申请审批</template>
            </el-menu-item>
            
            <!-- 设备管理员：审批教师申请 -->
            <el-menu-item v-if="user.role === 'admin'" index="/main/approval/teachers">
              <el-icon><School /></el-icon>
              <template #title>教师申请审批</template>
            </el-menu-item>
            
            <!-- 设备管理员：审批校外人员申请 -->
            <el-menu-item v-if="user.role === 'admin'" index="/main/approval/external">
              <el-icon><Key /></el-icon>
              <template #title>校外申请初审</template>
            </el-menu-item>
            
            <!-- 实验室负责人：审批校外人员申请 -->
            <el-menu-item v-if="user.role === 'director'" index="/main/approval/external">
              <el-icon><Key /></el-icon>
              <template #title>校外申请终审</template>
            </el-menu-item>
            
            <!-- 审批历史（所有审批人员） -->
            <el-menu-item index="/main/approval/history">
              <el-icon><Clock /></el-icon>
              <template #title>审批历史</template>
            </el-menu-item>
          </el-sub-menu>

          <!-- 财务管理（排除学生和教师角色） -->
          <el-sub-menu v-if="user.role !== 'student' && user.role !== 'teacher'" index="financial">
            <template #title>
              <el-icon><Money /></el-icon>
              <span>财务管理</span>
            </template>
            
            <el-menu-item v-if="user.role === 'external'" index="/main/financial/payment">
              <el-icon><Money /></el-icon>
              <template #title>在线缴费</template>
            </el-menu-item>
            
            <el-menu-item v-if="user.role === 'external'" index="/main/financial/my-payment">
              <el-icon><Document /></el-icon>
              <template #title>缴费记录</template>
            </el-menu-item>
            
            <el-menu-item v-if="user.role === 'external'" index="/main/financial/recharge">
              <el-icon><Wallet /></el-icon>
              <template #title>账户充值</template>
            </el-menu-item>
            
            <el-menu-item v-if="user.role === 'admin'" index="/main/financial/payment-audit">
              <el-icon><DocumentChecked /></el-icon>
              <template #title>缴费审核</template>
            </el-menu-item>
            
            <el-menu-item v-if="user.role === 'admin'" index="/main/financial/billing">
              <el-icon><Wallet /></el-icon>
              <template #title>计费管理</template>
            </el-menu-item>
            
            <el-menu-item v-if="user.role === 'admin' || user.role === 'director'" index="/main/financial/reports">
              <el-icon><PieChart /></el-icon>
              <template #title>财务报表</template>
            </el-menu-item>
            
            <el-menu-item v-if="user.role === 'director'" index="/main/financial/settings">
              <el-icon><Setting /></el-icon>
              <template #title>财务设置</template>
            </el-menu-item>
          </el-sub-menu>

          <!-- 设备管理（管理员、实验室负责人） -->
          <el-sub-menu v-if="user.role === 'admin' || user.role === 'director'" index="equipment-manage">
            <template #title>
              <el-icon><Tools /></el-icon>
              <span>设备管理</span>
            </template>
            
            <el-menu-item index="/main/equipment-manage/list">
              <el-icon><List /></el-icon>
              <template #title>设备列表</template>
            </el-menu-item>
            
            <el-menu-item index="/main/equipment-manage/maintenance">
              <el-icon><Setting /></el-icon>
              <template #title>设备维护</template>
            </el-menu-item>
            
            <el-menu-item index="/main/equipment-manage/add">
              <el-icon><CirclePlus /></el-icon>
              <template #title>新增设备</template>
            </el-menu-item>
            
            <el-menu-item index="/main/equipment-manage/audit">
              <el-icon><DocumentChecked /></el-icon>
              <template #title>设备审批</template>
            </el-menu-item>
            
            <el-menu-item index="/main/equipment-manage/status">
              <el-icon><Monitor /></el-icon>
              <template #title>设备状态</template>
            </el-menu-item>
          </el-sub-menu>

          <!-- 用户管理（教师、管理员、实验室负责人） -->
          <el-sub-menu v-if="user.role === 'teacher' || isAdmin || user.role === 'director'" index="user-manage">
            <template #title>
              <el-icon><User /></el-icon>
              <span>用户管理</span>
            </template>
            
            <el-menu-item v-if="user.role === 'teacher'" index="/main/user-manage/students">
              <el-icon><Avatar /></el-icon>
              <template #title>学生管理</template>
            </el-menu-item>
            
            <el-menu-item v-if="user.role === 'admin'" index="/main/user-manage/teachers">
              <el-icon><User /></el-icon>
              <template #title>用户管理</template>
            </el-menu-item>
            
            <el-menu-item v-if="user.role === 'director'" index="/main/user-manage/admins">
              <el-icon><UserFilled /></el-icon>
              <template #title>用户管理</template>
            </el-menu-item>
            
            <el-menu-item v-if="user.role === 'admin' || user.role === 'director'" index="/main/user-manage/external">
              <el-icon><Key /></el-icon>
              <template #title>校外人员管理</template>
            </el-menu-item>
          </el-sub-menu>

          <!-- 报表统计（管理员、实验室负责人） -->
          <el-menu-item v-if="user.role === 'admin' || user.role === 'director'" index="/main/report/usage">
            <el-icon><DataAnalysis /></el-icon>
            <template #title>报表统计</template>
          </el-menu-item>

          <!-- 系统管理（实验室负责人） -->
          <el-sub-menu v-if="user.role === 'director'" index="system">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统管理</span>
            </template>
            
            <el-menu-item index="/main/system/settings">
              <el-icon><Tools /></el-icon>
              <template #title>系统设置</template>
            </el-menu-item>
            
            <el-menu-item index="/main/system/logs">
              <el-icon><Document /></el-icon>
              <template #title>系统日志</template>
            </el-menu-item>
            
            <el-menu-item index="/main/system/backup">
              <el-icon><Upload /></el-icon>
              <template #title>系统备份</template>
            </el-menu-item>
          </el-sub-menu>

          <!-- 个人中心（所有用户） -->
          <el-menu-item index="/main/profile">
            <el-icon><UserFilled /></el-icon>
            <template #title>个人中心</template>
          </el-menu-item>

          <!-- 帮助中心（所有用户） -->
          <el-menu-item index="/main/help">
            <el-icon><QuestionFilled /></el-icon>
            <template #title>帮助中心</template>
          </el-menu-item>
        </el-menu>

        <!-- 侧边栏底部 -->
        <div class="sidebar-footer">
          <div class="system-status">
            <el-icon color="#67c23a"><CircleCheck /></el-icon>
            <span>系统正常</span>
          </div>
          <div class="system-time">{{ currentTime }}</div>
          <!-- 校外人员特殊提示 -->
          <div v-if="user.role === 'external'" class="external-notice">
            <el-icon color="#e6a23c"><Money /></el-icon>
            <span style="color: #e6a23c; font-weight: 500;">校外人员需付费使用设备</span>
          </div>
          <!-- 显示余额 -->
          <div v-if="user.role === 'external' && user.balance" class="balance-info">
            <span>账户余额: </span>
            <span class="balance-amount">¥{{ user.balance }}</span>
          </div>
        </div>
      </aside>

      <!-- 页面内容 -->
      <main class="page-content" :class="{ expanded: sidebarCollapsed }">
        <div class="content-wrapper">
          <!-- 页面标题 -->
          <div class="page-header">
            <h2 class="page-title">{{ currentRouteName }}</h2>
            <div class="page-actions">
              <el-button v-if="showBackButton" @click="goBack">
                <el-icon><ArrowLeft /></el-icon>返回
              </el-button>
              <el-button @click="refreshPage">
                <el-icon><Refresh /></el-icon>刷新
              </el-button>
            </div>
          </div>

          <!-- 路由内容 -->
          <div class="router-view-container">
            <router-view v-slot="{ Component }">
              <transition name="fade" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
          </div>
        </div>

        <!-- 页脚 -->
        <footer class="main-footer">
          <div class="footer-content">
            <p>江南大学实验设备管理系统 © 2025-2026</p>
            <p>技术支持：计算机学院 | 当前版本：v1.0.0</p>
            <!-- 校外人员服务条款 -->
            <p v-if="user.role === 'external'" style="color: #e6a23c; margin-top: 4px;">
              ⚠️ 校外人员使用设备需提前缴费，取消预约退还95%费用
            </p>
            <!-- 学生鼓励语 -->
            <p v-if="user.role === 'student'" style="color: #409eff; margin-top: 4px;">
              💪 祝您学习进步，实验顺利！
            </p>
          </div>
        </footer>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";
import { ElMessage, ElMessageBox } from "element-plus";
import dayjs from "dayjs";

// 导入所有图标
import {
  Monitor,
  Bell,
  Message,
  Warning,
  ArrowDown,
  User,
  Setting,
  SwitchButton,
  Odometer,
  Search,
  Calendar,
  Edit,
  DocumentChecked,
  List,
  Clock,
  PieChart,
  DataLine,
  TrendCharts,
  Avatar,
  UserFilled,
  QuestionFilled,
  CircleCheck,
  ArrowLeft,
  Refresh,
  Expand,
  Fold,
  Tools,
  Money,
  Document,
  DataAnalysis,
  Upload,
  Key,
  Wallet
} from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const store = useStore();

// 状态
const sidebarCollapsed = ref(false);
const currentTime = ref("");
const greeting = ref("");

// 计算属性
const user = computed(() => {
  const baseUser = store.state.user || {};
  // 为校外人员添加默认余额
  if (baseUser.role === 'external' && !baseUser.balance) {
    return { ...baseUser, balance: 0 };
  }
  return baseUser;
});
const isAdmin = computed(() => user.value.role === "admin");

const activeMenu = computed(() => route.path);

const currentRouteName = computed(() => {
  const routeNames = {
    "/main/dashboard": "仪表盘",
    "/main/equipment/list": "设备查询",
    "/main/reservation/apply": "预约申请",
    "/main/reservation/my": "我的预约",
    "/main/reservation/payment": "缴费管理",
    "/main/financial/my-payment": "缴费记录",
    "/main/financial/recharge": "账户充值",
    "/main/profile": "个人中心",
    "/main/help": "系统帮助",
  };
  return routeNames[route.path] || "控制面板";
});

const roleName = computed(() => {
  const roleMap = {
    student: "学生",
    teacher: "教师",
    admin: "设备管理员",
    director: "实验室负责人",
    external: "校外人员（付费）",
  };
  return roleMap[user.value.role] || "用户";
});

const showBackButton = computed(() => route.path !== "/main/dashboard");

// 方法
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
};

const handleMenuSelect = (index) => {
  console.log("菜单选择:", index);
};

const handleUserCommand = (command) => {
  switch (command) {
    case "profile":
      router.push("/main/profile");
      break;
    case "recharge":
      if (user.value.role === 'external') {
        router.push("/main/financial/recharge");
      }
      break;
    case "settings":
      if (isAdmin.value || user.value.role === 'director') {
        router.push("/main/system/settings");
      } else {
        ElMessage.info("您没有权限访问系统设置");
      }
      break;
    case "logout":
      handleLogout();
      break;
  }
};

const handleLogout = () => {
  ElMessageBox.confirm("确定要退出登录吗？", "退出确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
    center: true,
  })
    .then(() => {
      store.dispatch("logout");
      ElMessage.success("已安全退出");
      router.push("/login");
    })
    .catch(() => {
      // 取消退出
    });
};

const goBack = () => {
  router.back();
};

const refreshPage = () => {
  window.location.reload();
};

// 获取问候语
const getGreeting = () => {
  const hour = new Date().getHours();
  let greetingText = "欢迎回来";
  
  if (user.value.role === 'student') {
    greetingText = "欢迎回来";
  } else if (user.value.role === 'teacher') {
    greetingText = "欢迎回来，老师";
  } else if (user.value.role === 'admin') {
    greetingText = "欢迎回来，管理员";
  } else if (user.value.role === 'director') {
    greetingText = "欢迎回来，负责人";
  } else if (user.value.role === 'external') {
    greetingText = "欢迎回来，访客";
  }
  
  return greetingText;
};

// 更新时间
const updateTime = () => {
  const now = dayjs();
  currentTime.value = now.format("YYYY-MM-DD HH:mm:ss");
  
  // 更新问候语
  greeting.value = getGreeting();
};

// 生命周期
let timeInterval;
onMounted(() => {
  updateTime();
  // 每秒更新时间
  timeInterval = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval);
});
</script>

<style scoped>
.main-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 头部样式 */
.main-header {
  height: 60px;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.header-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  color: white;
}

.header-center {
  flex: 2;
  display: flex;
  justify-content: center;
}

:deep(.el-breadcrumb) {
  font-size: 14px;
}

:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: #409eff;
  font-weight: 600;
}

.header-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 24px;
}

.notification-dropdown {
  cursor: pointer;
}

.notification-icon {
  padding: 8px;
  border-radius: 8px;
  transition: background 0.3s;
}

.notification-icon:hover {
  background: rgba(255, 255, 255, 0.1);
}

.notification-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  min-width: 200px;
}

.notification-title {
  margin: 0;
  font-size: 14px;
  color: #303133;
}

.notification-time {
  margin: 4px 0 0;
  font-size: 12px;
  color: #909399;
}

.view-all {
  text-align: center;
  color: #409eff;
  font-size: 13px;
  padding: 8px;
}

.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background 0.3s;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.1);
}

.user-avatar {
  background: #409eff;
}

.user-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
}

.user-role {
  font-size: 12px;
  color: #a0a0a0;
  margin-top: 2px;
}

.user-balance {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #e6a23c;
  margin-top: 2px;
}

/* 主容器 */
.main-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 侧边栏 */
.main-sidebar {
  width: 240px;
  background: #fff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: relative;
}

.main-sidebar.collapsed {
  width: 64px;
}

.sidebar-toggle {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #e4e7ed;
  cursor: pointer;
  color: #606266;
  transition: all 0.3s;
}

.sidebar-toggle:hover {
  background: #f5f7fa;
  color: #409eff;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid #e4e7ed;
  background: #fafafa;
  font-size: 12px;
}

.system-status {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #67c23a;
  margin-bottom: 6px;
}

.system-time {
  color: #909399;
  margin-bottom: 6px;
}

.external-notice {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 0;
  border-top: 1px solid #f0f0f0;
  margin-top: 6px;
}

.balance-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  border-top: 1px solid #f0f0f0;
  margin-top: 6px;
}

.balance-amount {
  color: #e6a23c;
  font-weight: bold;
  font-size: 14px;
}

/* 页面内容 */
.page-content {
  flex: 1;
  overflow-y: auto;
  background: #f5f7fa;
  transition: margin-left 0.3s ease;
}

.page-content.expanded {
  margin-left: 0;
}

.content-wrapper {
  min-height: calc(100vh - 120px);
  padding: 20px 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.page-title {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.page-actions {
  display: flex;
  gap: 12px;
}

.router-view-container {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  min-height: 400px;
}

/* 页脚 */
.main-footer {
  padding: 16px;
  background: white;
  border-top: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-content {
  text-align: center;
  color: #909399;
  font-size: 13px;
  line-height: 1.5;
}

.footer-content p {
  margin: 2px 0;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>