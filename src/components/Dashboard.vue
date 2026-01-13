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
            <div class="stat-icon" style="background: #409eff20; color: #409eff">
              <el-icon><Monitor /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ availableEquipment }}</div>
              <div class="stat-label">可用设备</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #67c23a20; color: #67c23a">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ todayReservations }}</div>
              <div class="stat-label">今日预约</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #e6a23c20; color: #e6a23c">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ pendingApprovals }}</div>
              <div class="stat-label">待审批</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #f56c6c20; color: #f56c6c">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ maintenanceCount }}</div>
              <div class="stat-label">维护中</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快速操作 -->
    <el-card class="quick-actions-card">
      <template #header>
        <div class="card-header">
          <span>快速操作</span>
        </div>
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
            @click="$router.push('/main/user-manage/students')"
          >
            <el-icon size="24"><User /></el-icon>
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

        <!-- 设备管理 - 只有管理员能看到 -->
        <el-col :span="6" v-if="user.role === 'admin' || user.role === 'director'">
          <el-button
            type="danger"
            class="quick-action-btn"
            @click="$router.push('/main/equipment-manage')"
          >
            <el-icon size="24"><Tools /></el-icon>
            <span>设备管理</span>
          </el-button>
        </el-col>

        <!-- 报表统计 - 只有管理员能看到 -->
        <el-col :span="6" v-if="user.role === 'admin' || user.role === 'director'">
          <el-button
            type="info"
            class="quick-action-btn"
            @click="$router.push('/main/report')"
          >
            <el-icon size="24"><DataAnalysis /></el-icon>
            <span>报表统计</span>
          </el-button>
        </el-col>

        <!-- 个人中心 -->
        <el-col :span="6">
          <el-button
            type="info"
            class="quick-action-btn"
            @click="$router.push('/main/profile')"
          >
            <el-icon size="24"><UserFilled /></el-icon>
            <span>个人中心</span>
          </el-button>
        </el-col>

        <!-- 帮助中心 -->
        <el-col :span="6">
          <el-button
            type="default"
            class="quick-action-btn"
            @click="$router.push('/main/help')"
          >
            <el-icon size="24"><QuestionFilled /></el-icon>
            <span>帮助中心</span>
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 最近预约 -->
    <el-card class="recent-card">
      <template #header>
        <div class="card-header">
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
      <el-table
        :data="recentReservations"
        style="width: 100%"
        border
        stripe
      >
        <el-table-column prop="id" label="预约编号" width="120" />
        <el-table-column prop="equipment" label="设备名称" width="200" />
        <el-table-column prop="date" label="预约日期" width="120" />
        <el-table-column prop="time" label="预约时段" width="150" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button
              type="info"
              size="small"
              @click="viewReservationDetail(row)"
            >
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 预约详情弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="预约详情"
      width="500px"
    >
      <div v-if="selectedReservation" class="reservation-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="预约编号">
            {{ selectedReservation.id }}
          </el-descriptions-item>
          <el-descriptions-item label="设备名称">
            {{ selectedReservation.equipment }}
          </el-descriptions-item>
          <el-descriptions-item label="预约日期">
            {{ selectedReservation.date }}
          </el-descriptions-item>
          <el-descriptions-item label="预约时段">
            {{ selectedReservation.time }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(selectedReservation.status)">
              {{ selectedReservation.status }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import dayjs from "dayjs";
import {
  Monitor,
  Calendar,
  Clock,
  Warning,
  Search,
  DocumentChecked,
  Tools,
  User,
  UserFilled,
  DataAnalysis,
  QuestionFilled
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const store = useStore();

const user = computed(() => store.state.user || {
  id: 1,
  username: "admin",
  name: "管理员",
  role: "director",
  avatar: "",
  email: "admin@example.com"
});
const isStudent = computed(() => user.value.role === "student");
const isTeacher = computed(() => user.value.role === "teacher");
const isExternal = computed(() => user.value.role === "external");

const currentDate = dayjs().format("YYYY年MM月DD日 dddd");

// 统计数据
const availableEquipment = ref(156);
const todayReservations = ref(24);
const pendingApprovals = ref(8);
const maintenanceCount = ref(3);

// 最近预约
const recentReservations = ref([
  {
    id: "R20260111",
    equipment: "示波器 TDS2024C",
    date: "2026-01-11",
    time: "14:00-16:00",
    status: "已批准",
  },
  {
    id: "R20260112",
    equipment: "显微镜 CX43",
    date: "2026-01-12",
    time: "09:00-12:00",
    status: "待审批",
  },
  {
    id: "R20260112-2",
    equipment: "信号发生器 AFG31000",
    date: "2026-01-12",
    time: "13:00-15:00",
    status: "已使用",
  },
  {
    id: "R20260113",
    equipment: "万用表 34461A",
    date: "2026-01-13",
    time: "10:00-12:00",
    status: "待审批",
  },
]);

// 弹窗状态
const dialogVisible = ref(false);
const selectedReservation = ref(null);

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    已批准: "success",
    待审批: "warning",
    已使用: "info",
    已拒绝: "danger",
  };
  return types[status] || "info";
};

// 查看预约详情
const viewReservationDetail = (reservation) => {
  selectedReservation.value = reservation;
  dialogVisible.value = true;
};
</script>

<style scoped>
.dashboard {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.welcome-card {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
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
  transition: transform 0.3s;
  border-radius: 8px;
}

.stat-card:hover {
  transform: translateY(-5px);
}

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
}

.stat-icon .el-icon {
  font-size: 28px;
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

.quick-actions-card {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  border-radius: 8px;
  transition: all 0.3s;
}

.quick-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.recent-card {
  margin-top: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.reservation-detail {
  max-height: 400px;
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard {
    padding: 10px;
  }

  .welcome-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .stats-row .el-col {
    width: 100%;
    margin-bottom: 15px;
  }

  .quick-action-btn {
    height: 80px;
    font-size: 14px;
  }

  .quick-action-btn .el-icon {
    size: 20px;
  }
}
</style>
