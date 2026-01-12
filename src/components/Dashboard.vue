<template>
  <div class="dashboard">
    <!-- 欢迎卡片 -->
    <el-card class="welcome-card">
      <div class="welcome-content">
        <div>
          <h2>欢迎回来，{{ user.name }}！</h2>
          <p class="welcome-text">
            今天是 {{ currentDate }}，
            <span v-if="isStudent">祝您学习愉快！</span>
            <span v-else-if="isTeacher">祝您工作顺利！</span>
            <span v-else-if="isExternal">欢迎使用实验设备！</span>
            <span v-else>祝您工作顺利！</span>
          </p>
        </div>
        <el-avatar :size="64" :src="user.avatar" class="welcome-avatar">
          {{ user.name?.charAt(0) }}
        </el-avatar>
      </div>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div
              class="stat-icon"
              style="background: #409eff20; color: #409eff"
            >
              <el-icon><Monitor /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">156</div>
              <div class="stat-label">可用设备</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div
              class="stat-icon"
              style="background: #67c23a20; color: #67c23a"
            >
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">24</div>
              <div class="stat-label">今日预约</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div
              class="stat-icon"
              style="background: #e6a23c20; color: #e6a23c"
            >
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">8</div>
              <div class="stat-label">待审批</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div
              class="stat-icon"
              style="background: #f56c6c20; color: #f56c6c"
            >
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">3</div>
              <div class="stat-label">维护中</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快速操作 -->
    <el-card class="quick-actions-card">
      <template #header>
        <span>快速操作</span>
      </template>
      <el-row :gutter="20">
        <!-- 查询设备 - 所有人都有 -->
        <el-col :span="6">
          <el-button
            type="primary"
            class="quick-action-btn"
            @click="$router.push('/main/equipment')"
          >
            <el-icon size="24"><Search /></el-icon>
            <span>查询设备</span>
          </el-button>
        </el-col>

        <!-- 预约申请 - 管理员看不到 -->
        <el-col
          :span="6"
          v-if="user.role !== 'admin' && user.role !== 'director'"
        >
          <el-button
            type="success"
            class="quick-action-btn"
            @click="$router.push('/main/reservation')"
          >
            <el-icon size="24"><Calendar /></el-icon>
            <span>预约申请</span>
          </el-button>
        </el-col>

        <!-- 学生管理 - 只有教师能看到 -->
        <el-col :span="6" v-if="user.role === 'teacher'">
          <el-button
            type="warning"
            class="quick-action-btn"
            @click="$router.push('/main/student-manage')"
          >
            <el-icon size="24"><Avatar /></el-icon>
            <span>学生管理</span>
          </el-button>
        </el-col>

        <!-- 审批管理 - 只有管理员能看到 -->
        <el-col
          :span="6"
          v-if="user.role === 'admin' || user.role === 'director'"
        >
          <el-button
            type="warning"
            class="quick-action-btn"
            @click="$router.push('/main/approval')"
          >
            <el-icon size="24"><DocumentChecked /></el-icon>
            <span>审批管理</span>
          </el-button>
        </el-col>

        <!-- 个人中心 -->
        <el-col :span="6">
          <el-button
            type="info"
            class="quick-action-btn"
            @click="$router.push('/main/profile')"
          >
            <el-icon size="24"><User /></el-icon>
            <span>个人中心</span>
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 最近预约 -->
    <el-card class="recent-card">
      <template #header>
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
        >
          <span>最近预约记录</span>
          <el-button
            type="primary"
            link
            @click="$router.push('/main/reservation')"
          >
            查看更多
          </el-button>
        </div>
      </template>
      <el-table :data="recentReservations" style="width: 100%">
        <el-table-column prop="equipment" label="设备名称" />
        <el-table-column prop="date" label="预约日期" width="120" />
        <el-table-column prop="time" label="预约时段" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import dayjs from "dayjs";

const store = useStore();

const user = computed(() => store.state.user || {});
const isAdmin = computed(() => ["admin", "director"].includes(user.value.role));

const currentDate = dayjs().format("YYYY年MM月DD日 dddd");

const recentReservations = ref([
  {
    equipment: "示波器 TDS2024C",
    date: "2026-01-11",
    time: "14:00-16:00",
    status: "已批准",
  },
  {
    equipment: "显微镜 CX43",
    date: "2026-01-12",
    time: "09:00-12:00",
    status: "待审批",
  },
  {
    equipment: "信号发生器 AFG31000",
    date: "2026-01-12",
    time: "13:00-15:00",
    status: "已使用",
  },
  {
    equipment: "万用表 34461A",
    date: "2026-01-13",
    time: "10:00-12:00",
    status: "待审批",
  },
]);

const getStatusType = (status) => {
  const types = {
    已批准: "success",
    待审批: "warning",
    已使用: "info",
    已拒绝: "danger",
  };
  return types[status] || "info";
};
</script>

<style scoped>
.dashboard {
  height: 100%;
}

.welcome-card {
  margin-bottom: 24px;
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-content h2 {
  margin: 0;
  color: #303133;
  font-size: 24px;
}

.welcome-text {
  margin: 8px 0 0;
  color: #909399;
  font-size: 14px;
}

.welcome-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-size: 24px;
  font-weight: bold;
}

.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  .stat-content {
    display: flex;
    align-items: center;
  }

  .stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;

    .el-icon {
      font-size: 28px;
    }
  }

  .stat-value {
    font-size: 28px;
    font-weight: bold;
    color: #303133;
    line-height: 1;
  }

  .stat-label {
    font-size: 14px;
    color: #909399;
    margin-top: 8px;
  }
}

.quick-actions-card {
  margin-bottom: 24px;
}

.quick-action-btn {
  width: 100%;
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 500;
}

.recent-card {
  margin-top: 24px;
}
</style>
