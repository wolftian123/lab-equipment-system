<template>
  <div class="reservation-container">
    <div class="reservation-header">
      <h2>预约管理</h2>
      <el-button 
        type="primary" 
        :icon="CirclePlus" 
        @click="activeTab = 'apply'"
      >
        新增预约
      </el-button>
    </div>
    
    <!-- 标签页 -->
    <el-tabs v-model="activeTab" type="border-card" class="reservation-tabs">
      <!-- 预约申请 -->
      <el-tab-pane label="预约申请" name="apply">
        <div class="apply-section">
          <el-card class="apply-card">
            <template #header>
              <div class="card-header">
                <span>预约信息</span>
              </div>
            </template>
            
            <el-form :model="applyForm" :rules="formRules" ref="formRef" label-width="120px">
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="设备选择" prop="equipmentId">
                    <el-select 
                      v-model="applyForm.equipmentId" 
                      placeholder="请选择设备" 
                      filterable
                      clearable
                      style="width: 100%"
                    >
                      <el-option 
                        v-for="equipment in equipmentList" 
                        :key="equipment.id"
                        :label="equipment.name"
                        :value="equipment.id"
                      >
                        <div class="option-content">
                          <span class="option-name">{{ equipment.name }}</span>
                          <span class="option-model">{{ equipment.model }}</span>
                          <span class="option-status" :class="equipment.status">
                            {{ equipment.status === 'available' ? '可用' : '使用中' }}
                          </span>
                        </div>
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                
                <el-col :span="12">
                  <el-form-item label="预约日期" prop="date">
                    <el-date-picker 
                      v-model="applyForm.date" 
                      type="date" 
                      placeholder="选择预约日期" 
                      style="width: 100%"
                      :disabled-date="disabledDate"
                    />
                  </el-form-item>
                </el-col>
                
                <el-col :span="12">
                  <el-form-item label="使用时长" prop="duration">
                    <el-input-number 
                      v-model="applyForm.duration" 
                      :min="1" 
                      :max="8" 
                      :step="0.5" 
                      style="width: 100%"
                      placeholder="使用时长(小时)"
                    />
                  </el-form-item>
                </el-col>
                
                <el-col :span="24">
                  <el-form-item label="开始时间" prop="startTime">
                    <el-time-select 
                      v-model="applyForm.startTime" 
                      placeholder="选择开始时间" 
                      style="width: 100%"
                      :picker-options="{
                        start: '09:00',
                        step: '00:30',
                        end: '17:00'
                      }"
                    />
                  </el-form-item>
                </el-col>
                
                <el-col :span="24">
                  <el-form-item label="预约用途" prop="purpose">
                    <el-input 
                      v-model="applyForm.purpose" 
                      type="textarea" 
                      placeholder="请输入预约用途" 
                      rows="3"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                
                <el-col :span="24">
                  <el-form-item label="备注">
                    <el-input 
                      v-model="applyForm.remark" 
                      type="textarea" 
                      placeholder="请输入备注信息" 
                      rows="2"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              
              <div class="form-actions">
                <el-button @click="resetForm">重置</el-button>
                <el-button type="primary" @click="submitApply">提交预约</el-button>
              </div>
            </el-form>
          </el-card>
        </div>
      </el-tab-pane>
      
      <!-- 我的预约 -->
      <el-tab-pane label="我的预约" name="my">
        <div class="my-section">
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
        </div>
      </el-tab-pane>
      
      <!-- 预约历史 -->
      <el-tab-pane label="预约历史" name="history">
        <div class="history-section">
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
        </div>
      </el-tab-pane>
    </el-tabs>
    
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
import { 
  CirclePlus, 
  Refresh, 
  Search,
  Calendar,
  DocumentChecked,
  Clock
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useStore } from 'vuex';

// 状态管理
const store = useStore();
const activeTab = ref('apply');
const userRole = computed(() => store.getters.userRole);

// 预约申请表单
const applyForm = reactive({
  equipmentId: '',
  date: '',
  startTime: '',
  duration: 2,
  purpose: '',
  remark: ''
});

// 表单验证规则
const formRules = {
  equipmentId: [{ required: true, message: '请选择设备', trigger: 'blur' }],
  date: [{ required: true, message: '请选择预约日期', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'blur' }],
  duration: [{ required: true, message: '请输入使用时长', trigger: 'blur' }],
  purpose: [{ required: true, message: '请输入预约用途', trigger: 'blur' }]
};

// 表单引用
const formRef = ref(null);

// 设备列表
const equipmentList = ref([
  { id: 1, name: '电子显微镜', model: 'SEM-1000', status: 'available' },
  { id: 2, name: '光谱分析仪', model: 'Spectrum-2000', status: 'available' },
  { id: 3, name: '激光切割机', model: 'Laser-3000', status: 'in_use' },
  { id: 4, name: '3D打印机', model: '3D-4000', status: 'available' },
  { id: 5, name: '示波器', model: 'Oscilloscope-5000', status: 'available' }
]);

// 我的预约
const myReservations = ref([]);

// 历史预约
const historyReservations = ref([]);

// 根据用户角色生成预约数据
const generateReservationData = () => {
  const role = userRole.value;
  
  // 重置数据
  myReservations.value = [];
  historyReservations.value = [];
  
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
      myReservations.value = [];
      historyReservations.value = [];
  }
  
  // 更新总数
  myReservationsTotal.value = myReservations.value.length;
  historyReservationsTotal.value = historyReservations.value.length;
};

// 筛选条件
const myFilter = reactive({
  status: '',
  date: ''
});

const historyFilter = reactive({
  status: '',
  dateRange: [],
  keyword: ''
});

// 分页
const myPage = reactive({
  current: 1,
  size: 10
});

const historyPage = reactive({
  current: 1,
  size: 10
});

const myReservationsTotal = ref(2);
const historyReservationsTotal = ref(2);

// 详情弹窗
const dialogVisible = ref(false);
const selectedReservation = ref(null);

// 禁用日期
const disabledDate = (time) => {
  return time.getTime() < Date.now() - 8.64e7; // 只能选择今天及以后
};

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields();
};

// 提交预约
const submitApply = async () => {
  try {
    await formRef.value.validate();
    // 模拟提交
    setTimeout(() => {
      ElMessage.success('预约申请提交成功，等待审批');
      resetForm();
      // 切换到我的预约标签
      activeTab.value = 'my';
    }, 1000);
  } catch (error) {
    console.error('表单验证失败:', error);
  }
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

// 刷新历史记录
const refreshHistory = () => {
  // 重新生成数据
  generateReservationData();
  ElMessage.success('历史记录已刷新');
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
  // 加载数据
  console.log('Reservation component mounted');
  // 生成预约数据
  generateReservationData();
});
</script>

<style scoped>
.reservation-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.reservation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.reservation-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.reservation-tabs {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.apply-card {
  margin: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 30px;
  gap: 10px;
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

.option-content {
  display: flex;
  flex-direction: column;
}

.option-name {
  font-weight: 500;
}

.option-model {
  font-size: 12px;
  color: #666;
}

.option-status {
  font-size: 12px;
  margin-top: 4px;
  padding: 2px 8px;
  border-radius: 10px;
  align-self: flex-start;
}

.option-status.available {
  background: #f0f9eb;
  color: #67c23a;
}

.option-status.in_use {
  background: #fef0f0;
  color: #f56c6c;
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
  .reservation-container {
    padding: 10px;
  }
  
  .reservation-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-bar > * {
    width: 100% !important;
    margin-right: 0 !important;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .form-actions .el-button {
    width: 100%;
  }
}
</style>