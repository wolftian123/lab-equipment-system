<template>
  <div class="reservation-history-container">
    <div class="reservation-header">
      <h2>预约历史</h2>
    </div>
    
    <div class="filter-bar">
      <el-select v-model="historyFilter.status" placeholder="状态" clearable style="width: 120px; margin-right: 10px;">
        <el-option label="已通过" value="approved" />
        <el-option label="已拒绝" value="rejected" />
        <el-option label="已完成" value="completed" />
        <el-option label="已取消" value="cancelled" />
      </el-select>
      <el-date-picker 
        v-model="historyFilter.dateRange" 
        type="daterange" 
        range-separator="至" 
        start-placeholder="开始日期" 
        end-placeholder="结束日期" 
        clearable 
        style="width: 250px; margin-right: 10px;"
      />
      <el-input 
        v-model="historyFilter.keyword" 
        placeholder="设备名称/编号" 
        style="width: 200px; margin-right: 10px;"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="refreshHistory">
        <el-icon><Refresh /></el-icon>
        搜索
      </el-button>
    </div>
    
    <el-table 
      :data="historyReservations" 
      style="width: 100%"
      border
      stripe
    >
      <el-table-column prop="id" label="预约编号" width="120" />
      <el-table-column prop="equipmentName" label="设备名称" width="200" />
      <el-table-column prop="date" label="预约日期" width="120" />
      <el-table-column prop="startTime" label="开始时间" width="100" />
      <el-table-column prop="duration" label="时长(小时)" width="100" />
      <el-table-column prop="purpose" label="预约用途" min-width="150" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button 
            type="info" 
            size="small" 
            @click="viewDetails(row)"
          >
            查看
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="historyPage.current"
        v-model:page-size="historyPage.size"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="historyReservationsTotal"
        @size-change="handleHistorySizeChange"
        @current-change="handleHistoryCurrentChange"
      />
    </div>
    
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
          <el-descriptions-item label="设备信息">
            <div>{{ selectedReservation.equipmentName }}</div>
            <div class="text-gray">{{ selectedReservation.equipmentModel }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="预约日期">
            {{ selectedReservation.date }}
          </el-descriptions-item>
          <el-descriptions-item label="预约时间">
            {{ selectedReservation.startTime }} - {{ getEndTime(selectedReservation.startTime, selectedReservation.duration) }}
          </el-descriptions-item>
          <el-descriptions-item label="时长">
            {{ selectedReservation.duration }} 小时
          </el-descriptions-item>
          <el-descriptions-item label="预约用途">
            {{ selectedReservation.purpose }}
          </el-descriptions-item>
          <el-descriptions-item label="备注">
            {{ selectedReservation.remark || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="预约状态">
            <el-tag :type="getStatusType(selectedReservation.status)">
              {{ getStatusText(selectedReservation.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="申请时间">
            {{ selectedReservation.createdAt }}
          </el-descriptions-item>
          <el-descriptions-item v-if="selectedReservation.approvalTime" label="审批时间">
            {{ selectedReservation.approvalTime }}
          </el-descriptions-item>
          <el-descriptions-item v-if="selectedReservation.approvalRemark" label="审批意见">
            {{ selectedReservation.approvalRemark }}
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
import { ref, reactive, computed, onMounted } from 'vue';
import { Refresh, Search } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useStore } from 'vuex';

// 状态管理
const store = useStore();
const userRole = computed(() => store.getters.userRole);

// 历史预约
const historyReservations = ref([]);
const historyReservationsTotal = ref(0);

// 筛选条件
const historyFilter = reactive({
  status: '',
  dateRange: [],
  keyword: ''
});

// 分页
const historyPage = reactive({
  current: 1,
  size: 10
});

// 详情弹窗
const dialogVisible = ref(false);
const selectedReservation = ref(null);

// 根据用户角色生成预约数据
const generateReservationData = () => {
  const role = userRole.value;
  
  // 重置数据
  historyReservations.value = [];
  
  switch (role) {
    case 'student':
      // 学生历史预约数据
      historyReservations.value = [
        {
          id: 'SH' + Date.now(),
          equipmentName: '3D打印机',
          equipmentModel: '3D-4000',
          date: '2023-12-30',
          startTime: '13:00',
          duration: 2,
          purpose: '模型制作',
          status: 'completed',
          createdAt: '2023-12-28 16:45:00',
          approvalTime: '2023-12-29 09:00:00'
        }
      ];
      break;
      
    case 'teacher':
      // 教师历史预约数据
      historyReservations.value = [
        {
          id: 'TH' + Date.now(),
          equipmentName: '示波器',
          equipmentModel: 'Oscilloscope-5000',
          date: '2023-12-28',
          startTime: '15:00',
          duration: 3,
          purpose: '实验课程',
          status: 'completed',
          createdAt: '2023-12-26 14:30:00',
          approvalTime: '2023-12-27 09:30:00'
        }
      ];
      break;
      
    case 'admin':
      // 管理员历史预约数据
      historyReservations.value = [
        {
          id: 'AH' + Date.now(),
          equipmentName: '电子显微镜',
          equipmentModel: 'SEM-1000',
          date: '2023-12-29',
          startTime: '10:00',
          duration: 5,
          purpose: '设备校准',
          status: 'completed',
          createdAt: '2023-12-27 09:00:00',
          approvalTime: '2023-12-27 09:00:00'
        }
      ];
      break;
      
    case 'director':
      // 实验室负责人历史预约数据
      historyReservations.value = [
        {
          id: 'DH' + Date.now(),
          equipmentName: '激光切割机',
          equipmentModel: 'Laser-3000',
          date: '2023-12-31',
          startTime: '10:00',
          duration: 4,
          purpose: '实验室建设',
          status: 'completed',
          createdAt: '2023-12-29 15:00:00',
          approvalTime: '2023-12-29 15:00:00'
        }
      ];
      break;
      
    case 'external':
      // 校外人员历史预约数据
      historyReservations.value = [
        {
          id: 'EH' + Date.now(),
          equipmentName: '光谱分析仪',
          equipmentModel: 'Spectrum-2000',
          date: '2023-12-26',
          startTime: '13:00',
          duration: 4,
          purpose: '样品分析',
          status: 'completed',
          createdAt: '2023-12-24 10:00:00',
          approvalTime: '2023-12-25 09:30:00'
        }
      ];
      break;
      
    default:
      // 默认数据
      historyReservations.value = [];
  }
  
  // 更新总数
  historyReservationsTotal.value = historyReservations.value.length;
};

// 查看详情
const viewDetails = (reservation) => {
  selectedReservation.value = reservation;
  dialogVisible.value = true;
};

// 刷新历史记录
const refreshHistory = () => {
  // 重新生成数据
  generateReservationData();
  ElMessage.success('历史记录已刷新');
};

// 分页处理
const handleHistorySizeChange = (size) => {
  historyPage.size = size;
  refreshHistory();
};

const handleHistoryCurrentChange = (current) => {
  historyPage.current = current;
  refreshHistory();
};

// 辅助函数
const getStatusType = (status) => {
  const statusMap = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    completed: 'info',
    cancelled: 'info'
  };
  return statusMap[status] || '';
};

const getStatusText = (status) => {
  const statusMap = {
    pending: '待审批',
    approved: '已通过',
    rejected: '已拒绝',
    completed: '已完成',
    cancelled: '已取消'
  };
  return statusMap[status] || status;
};

const getEndTime = (startTime, duration) => {
  // 简单计算结束时间
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + duration * 60;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
};

// 初始化
onMounted(() => {
  // 生成预约数据
  generateReservationData();
});
</script>

<style scoped>
.reservation-history-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.reservation-header {
  margin-bottom: 20px;
}

.reservation-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.filter-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 6px;
  flex-wrap: wrap;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.reservation-detail {
  max-height: 400px;
  overflow-y: auto;
}

.text-gray {
  color: #909399;
  font-size: 13px;
  margin-top: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .reservation-history-container {
    padding: 10px;
  }
  
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-bar > * {
    width: 100% !important;
    margin-right: 0 !important;
  }
}
</style>