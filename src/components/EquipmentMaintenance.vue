<template>
  <div class="equipment-maintenance">
    <h2>设备维护</h2>
    <p>管理设备维护记录和维护计划</p>
    
    <!-- 操作按钮 -->
    <el-card shadow="hover" class="action-card">
      <div class="action-buttons">
        <el-button type="primary" @click="openAddRecordDialog">
          <el-icon><Plus /></el-icon>
          新增维护记录
        </el-button>
        <el-button type="success" @click="exportRecords">
          <el-icon><Download /></el-icon>
          导出记录
        </el-button>
        <el-button @click="refreshRecords">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </el-card>
    
    <!-- 维护记录列表 -->
    <el-card shadow="hover" class="records-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>维护记录列表</span>
          <span class="total-count">共 {{ maintenanceRecords.length }} 条记录</span>
        </div>
      </template>
      
      <!-- 搜索和筛选 -->
      <div class="search-section" style="margin-bottom: 20px;">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input 
              v-model="searchKeyword" 
              placeholder="搜索设备名称或维护内容"
              prefix-icon="Search"
            />
          </el-col>
          <el-col :span="6">
            <el-select 
              v-model="searchStatus" 
              placeholder="维护状态"
              clearable
            >
              <el-option label="待处理" value="pending" />
              <el-option label="处理中" value="processing" />
              <el-option label="已完成" value="completed" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="searchRecords">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
          </el-col>
        </el-row>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-spinner size="large" />
        <p>加载中...</p>
      </div>
      
      <!-- 无数据 -->
      <div v-else-if="filteredRecords.length === 0" class="empty-container">
        <el-empty description="暂无维护记录" />
      </div>
      
      <!-- 记录表格 -->
      <el-table 
        v-else 
        :data="currentPageData" 
        style="width: 100%;"
        stripe
        border
      >
        <el-table-column prop="id" label="记录ID" width="80" />
        <el-table-column prop="equipmentName" label="设备名称" min-width="180" />
        <el-table-column prop="equipmentCode" label="设备编号" width="120" />
        <el-table-column prop="maintenanceType" label="维护类型" width="120">
          <template #default="scope">
            <el-tag :type="getTypeTagType(scope.row.maintenanceType)">
              {{ scope.row.maintenanceType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="maintenanceDate" label="维护日期" width="150" />
        <el-table-column prop="maintenancePerson" label="维护人员" width="120" />
        <el-table-column prop="cost" label="维护费用" width="100">
          <template #default="scope">
            ¥{{ scope.row.cost }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button 
              size="small" 
              @click="viewRecordDetail(scope.row)"
            >
              查看详情
            </el-button>
            <el-button 
              size="small" 
              type="primary" 
              @click="editRecord(scope.row)"
              :disabled="scope.row.status === 'completed'"
            >
              编辑
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="deleteRecord(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container" v-if="filteredRecords.length > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredRecords.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 新增/编辑维护记录对话框 -->
    <el-dialog 
      v-model="addRecordDialogVisible" 
      :title="recordDialogTitle" 
      width="70%"
    >
      <el-form :model="maintenanceForm" :rules="formRules" ref="formRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备名称" prop="equipmentName">
              <el-select v-model="maintenanceForm.equipmentName" placeholder="选择设备">
                <el-option label="高精度电子天平" value="高精度电子天平" />
                <el-option label="紫外可见分光光度计" value="紫外可见分光光度计" />
                <el-option label="生物显微镜" value="生物显微镜" />
                <el-option label="气相色谱仪" value="气相色谱仪" />
                <el-option label="示波器" value="示波器" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备编号" prop="equipmentCode">
              <el-input v-model="maintenanceForm.equipmentCode" placeholder="输入设备编号" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="维护类型" prop="maintenanceType">
              <el-select v-model="maintenanceForm.maintenanceType" placeholder="选择维护类型">
                <el-option label="定期维护" value="定期维护" />
                <el-option label="故障维修" value="故障维修" />
                <el-option label="校准" value="校准" />
                <el-option label="升级" value="升级" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="维护日期" prop="maintenanceDate">
              <el-date-picker v-model="maintenanceForm.maintenanceDate" type="date" placeholder="选择日期" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="维护人员" prop="maintenancePerson">
              <el-input v-model="maintenanceForm.maintenancePerson" placeholder="输入维护人员" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="维护费用" prop="cost">
              <el-input v-model="maintenanceForm.cost" type="number" placeholder="输入维护费用" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="维护内容" prop="maintenanceContent">
          <el-input 
            v-model="maintenanceForm.maintenanceContent" 
            type="textarea" 
            :rows="4" 
            placeholder="输入维护内容"
          />
        </el-form-item>
        
        <el-form-item label="维护状态" prop="status">
          <el-select v-model="maintenanceForm.status" placeholder="选择维护状态">
            <el-option label="待处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input 
            v-model="maintenanceForm.notes" 
            type="textarea" 
            :rows="2" 
            placeholder="输入备注信息"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addRecordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveRecord">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  Plus, 
  Download, 
  Refresh, 
  Search 
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// 状态管理
const addRecordDialogVisible = ref(false);
const recordDialogTitle = ref('新增维护记录');
const loading = ref(false);
const searchKeyword = ref('');
const searchStatus = ref('');
const currentPage = ref(1);
const pageSize = ref(10);

// 表单数据
const maintenanceForm = ref({
  id: '',
  equipmentName: '',
  equipmentCode: '',
  maintenanceType: '',
  maintenanceDate: '',
  maintenancePerson: '',
  cost: 0,
  maintenanceContent: '',
  status: 'pending',
  notes: ''
});

// 表单验证规则
const formRules = {
  equipmentName: [{ required: true, message: '请选择设备名称', trigger: 'change' }],
  equipmentCode: [{ required: true, message: '请输入设备编号', trigger: 'blur' }],
  maintenanceType: [{ required: true, message: '请选择维护类型', trigger: 'change' }],
  maintenanceDate: [{ required: true, message: '请选择维护日期', trigger: 'change' }],
  maintenancePerson: [{ required: true, message: '请输入维护人员', trigger: 'blur' }],
  maintenanceContent: [{ required: true, message: '请输入维护内容', trigger: 'blur' }],
  status: [{ required: true, message: '请选择维护状态', trigger: 'change' }]
};

// 维护记录数据（模拟）
const maintenanceRecords = ref([
  {
    id: 1,
    equipmentName: '高精度电子天平',
    equipmentCode: 'EQ-2024-001',
    maintenanceType: '定期维护',
    maintenanceDate: '2024-01-10',
    maintenancePerson: '张三',
    cost: 200,
    maintenanceContent: '校准天平精度，清洁内部组件',
    status: 'completed',
    notes: '维护后精度符合要求'
  },
  {
    id: 2,
    equipmentName: '紫外可见分光光度计',
    equipmentCode: 'EQ-2024-002',
    maintenanceType: '故障维修',
    maintenanceDate: '2024-01-08',
    maintenancePerson: '李四',
    cost: 800,
    maintenanceContent: '更换光源灯泡，修复光路系统',
    status: 'completed',
    notes: '故障已完全修复'
  },
  {
    id: 3,
    equipmentName: '气相色谱仪',
    equipmentCode: 'EQ-2024-004',
    maintenanceType: '定期维护',
    maintenanceDate: '2024-01-05',
    maintenancePerson: '王五',
    cost: 500,
    maintenanceContent: '清洁色谱柱，校准检测器',
    status: 'completed',
    notes: '设备运行正常'
  },
  {
    id: 4,
    equipmentName: '离心机',
    equipmentCode: 'EQ-2024-006',
    maintenanceType: '故障维修',
    maintenanceDate: '2024-01-12',
    maintenancePerson: '赵六',
    cost: 1200,
    maintenanceContent: '更换转子，修复控制系统',
    status: 'processing',
    notes: '正在维修中'
  },
  {
    id: 5,
    equipmentName: '示波器',
    equipmentCode: 'EQ-2024-005',
    maintenanceType: '校准',
    maintenanceDate: '2024-01-03',
    maintenancePerson: '孙七',
    cost: 300,
    maintenanceContent: '校准电压和时间基准',
    status: 'completed',
    notes: '校准完成，精度达标'
  },
  {
    id: 6,
    equipmentName: '生物显微镜',
    equipmentCode: 'EQ-2024-003',
    maintenanceType: '定期维护',
    maintenanceDate: '2024-01-09',
    maintenancePerson: '周八',
    cost: 150,
    maintenanceContent: '清洁镜头，润滑机械部分',
    status: 'completed',
    notes: '维护后使用正常'
  },
  {
    id: 7,
    equipmentName: 'PCR仪',
    equipmentCode: 'EQ-2024-007',
    maintenanceType: '升级',
    maintenanceDate: '2024-01-15',
    maintenancePerson: '吴九',
    cost: 2000,
    maintenanceContent: '升级控制软件，更换热敏元件',
    status: 'pending',
    notes: '计划维护'
  }
]);

// 过滤记录
const filteredRecords = computed(() => {
  return maintenanceRecords.value.filter(record => {
    const matchesKeyword = !searchKeyword.value || 
      record.equipmentName.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      record.maintenanceContent.toLowerCase().includes(searchKeyword.value.toLowerCase());
    
    const matchesStatus = !searchStatus.value || record.status === searchStatus.value;
    
    return matchesKeyword && matchesStatus;
  });
});

// 当前页数据
const currentPageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredRecords.value.slice(start, end);
});

// 状态文本和类型
const getStatusText = (status) => {
  const statusMap = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成'
  };
  return statusMap[status] || status;
};

const getStatusTagType = (status) => {
  const typeMap = {
    pending: 'warning',
    processing: 'info',
    completed: 'success'
  };
  return typeMap[status] || '';
};

const getTypeTagType = (type) => {
  const typeMap = {
    '定期维护': 'success',
    '故障维修': 'danger',
    '校准': 'info',
    '升级': 'warning'
  };
  return typeMap[type] || '';
};

// 打开新增记录对话框
const openAddRecordDialog = () => {
  recordDialogTitle.value = '新增维护记录';
  maintenanceForm.value = {
    id: '',
    equipmentName: '',
    equipmentCode: '',
    maintenanceType: '',
    maintenanceDate: '',
    maintenancePerson: '',
    cost: 0,
    maintenanceContent: '',
    status: 'pending',
    notes: ''
  };
  addRecordDialogVisible.value = true;
};

// 保存记录
const saveRecord = () => {
  // 模拟保存
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    addRecordDialogVisible.value = false;
    
    if (!maintenanceForm.value.id) {
      // 新增记录
      const newRecord = {
        ...maintenanceForm.value,
        id: maintenanceRecords.value.length + 1
      };
      maintenanceRecords.value.unshift(newRecord);
    } else {
      // 编辑记录
      const index = maintenanceRecords.value.findIndex(r => r.id === maintenanceForm.value.id);
      if (index !== -1) {
        maintenanceRecords.value[index] = { ...maintenanceForm.value };
      }
    }
    
    ElMessage.success('保存成功');
  }, 500);
};

// 查看记录详情
const viewRecordDetail = (record) => {
  // 这里可以打开详情对话框
  console.log('查看记录详情:', record);
};

// 编辑记录
const editRecord = (record) => {
  recordDialogTitle.value = '编辑维护记录';
  maintenanceForm.value = { ...record };
  addRecordDialogVisible.value = true;
};

// 删除记录
const deleteRecord = (id) => {
  ElMessageBox.confirm('确定要删除这条维护记录吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    maintenanceRecords.value = maintenanceRecords.value.filter(r => r.id !== id);
    ElMessage.success('删除成功');
  }).catch(() => {});
};

// 导出记录
const exportRecords = () => {
  // 模拟导出
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('导出成功');
  }, 1000);
};

// 刷新记录
const refreshRecords = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('刷新成功');
  }, 500);
};

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
};

const handleCurrentChange = (current) => {
  currentPage.value = current;
};

// 搜索记录
const searchRecords = () => {
  currentPage.value = 1;
};

// 初始化
onMounted(() => {
  // 可以在这里加载真实数据
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 800);
});
</script>

<style scoped>
.equipment-maintenance {
  padding: 20px;
}

.action-card {
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-count {
  font-size: 14px;
  color: #606266;
}

.loading-container {
  text-align: center;
  padding: 60px 0;
}

.empty-container {
  padding: 60px 0;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .equipment-maintenance {
    padding: 10px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }
  
  .search-section {
    flex-direction: column;
    gap: 10px;
  }
}
</style>