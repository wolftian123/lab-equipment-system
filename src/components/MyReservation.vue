<template>
  <div class="my-reservation-container">
    <div class="reservation-header">
      <h2>我的预约</h2>
    </div>
    
    <div class="filter-bar">
      <el-select v-model="myFilter.status" placeholder="状态" clearable style="width: 120px; margin-right: 10px;">
        <el-option label="待审批" value="pending" />
        <el-option label="已通过" value="approved" />
        <el-option label="已拒绝" value="rejected" />
        <el-option label="已完成" value="completed" />
      </el-select>
      <el-date-picker 
        v-model="myFilter.date" 
        type="date" 
        placeholder="预约日期" 
        clearable 
        style="width: 150px; margin-right: 10px;"
      />
      <el-button type="primary" @click="refreshMyReservations">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>
    
    <el-table 
      :data="myReservations" 
      style="width: 100%"
      border
      stripe
    >
      <el-table-column prop="id" label="预约编号" width="120" />
      <el-table-column prop="equipmentName" label="设备名称" width="200" />
      <el-table-column prop="date" label="预约日期" width="120" />
      <el-table-column prop="startTime" label="开始时间" width="100" />
      <el-table-column prop="duration" label="时长(小时)" width="100" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button 
            v-if="row.status === 'pending'"
            type="warning" 
            size="small" 
            @click="cancelReservation(row.id)"
          >
            取消
          </el-button>
          <el-button 
            v-if="row.status === 'approved'"
            type="primary" 
            size="small" 
            @click="viewDetails(row)"
          >
            详情
          </el-button>
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
        v-model:current-page="myPage.current"
        v-model:page-size="myPage.size"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="myReservationsTotal"
        @size-change="handleMySizeChange"
        @current-change="handleMyCurrentChange"
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
import { Refresh } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useStore } from 'vuex';

// 状态管理
const store = useStore();
const userRole = computed(() => store.getters.userRole);

// 我的预约
const myReservations = ref([]);
const myReservationsTotal = ref(0);

// 筛选条件
const myFilter = reactive({
  status: '',
  date: ''
});

// 分页
const myPage = reactive({
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
  myReservations.value = [];
  
  switch (role) {
    case 'student':
      // 学生预约数据
      myReservations.value = [
        {
          id: 'S' + Date.now(),
          equipmentName: '电子显微镜',
          equipmentModel: 'SEM-1000',
          date: '2024-01-15',
          startTime: '10:00',
          duration: 2,
          purpose: '实验研究',
          status: 'pending',
          createdAt: '2024-01-10 14:30:00'
        },
        {
          id: 'S' + (Date.now() + 1),
          equipmentName: '光谱分析仪',
          equipmentModel: 'Spectrum-2000',
          date: '2024-01-12',
          startTime: '14:00',
          duration: 3,
          purpose: '材料分析',
          status: 'approved',
          createdAt: '2024-01-09 09:15:00',
          approvalTime: '2024-01-09 10:30:00'
        }
      ];
      break;
      
    case 'teacher':
      // 教师预约数据
      myReservations.value = [
        {
          id: 'T' + Date.now(),
          equipmentName: '激光切割机',
          equipmentModel: 'Laser-3000',
          date: '2024-01-16',
          startTime: '09:00',
          duration: 4,
          purpose: '教学演示',
          status: 'approved',
          createdAt: '2024-01-11 10:20:00',
          approvalTime: '2024-01-11 11:00:00'
        }
      ];
      break;
      
    case 'admin':
      // 管理员预约数据
      myReservations.value = [
        {
          id: 'A' + Date.now(),
          equipmentName: '光谱分析仪',
          equipmentModel: 'Spectrum-2000',
          date: '2024-01-14',
          startTime: '13:00',
          duration: 2,
          purpose: '设备维护测试',
          status: 'approved',
          createdAt: '2024-01-09 16:00:00',
          approvalTime: '2024-01-09 16:00:00'
        }
      ];
      break;
      
    case 'director':
      // 实验室负责人预约数据
      myReservations.value = [
        {
          id: 'D' + Date.now(),
          equipmentName: '3D打印机',
          equipmentModel: '3D-4000',
          date: '2024-01-18',
          startTime: '14:00',
          duration: 3,
          purpose: '项目研究',
          status: 'approved',
          createdAt: '2024-01-12 11:30:00',
          approvalTime: '2024-01-12 11:30:00'
        }
      ];
      break;
      
    case 'external':
      // 校外人员预约数据
      myReservations.value = [
        {
          id: 'E' + Date.now(),
          equipmentName: '电子显微镜',
          equipmentModel: 'SEM-1000',
          date: '2024-01-20',
          startTime: '10:00',
          duration: 6,
          purpose: '合作项目研究',
          status: 'pending',
          createdAt: '2024-01-13 09:00:00'
        }
      ];
      break;
      
    default:
      // 默认数据
      myReservations.value = [];
  }
  
  // 更新总数
  myReservationsTotal.value = myReservations.value.length;
};

// 取消预约
const cancelReservation = (id) => {
  ElMessage.success('预约已取消');
  // 模拟刷新
  setTimeout(() => {
    refreshMyReservations();
  }, 500);
};

// 查看详情
const viewDetails = (reservation) => {
  selectedReservation.value = reservation;
  dialogVisible.value = true;
};

// 刷新我的预约
const refreshMyReservations = () => {
  // 重新生成数据
  generateReservationData();
  ElMessage.success('预约记录已刷新');
};

// 分页处理
const handleMySizeChange = (size) => {
  myPage.size = size;
  refreshMyReservations();
};

const handleMyCurrentChange = (current) => {
  myPage.current = current;
  refreshMyReservations();
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
.my-reservation-container {
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
  .my-reservation-container {
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