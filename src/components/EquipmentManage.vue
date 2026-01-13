<template>
  <div class="equipment-manage">
    <h2>设备管理</h2>
    <p>管理员功能：维护设备信息和管理设备状态</p>
    
    <!-- 设备统计概览 -->
    <el-card shadow="hover" class="stats-card">
      <div class="stats-grid">
        <el-statistic :value="totalEquipment" title="设备总数" prefix-icon="Monitor" />
        <el-statistic :value="availableEquipment" title="可使用" prefix-icon="Check" value-style="{ color: '#67c23a' }" />
        <el-statistic :value="busyEquipment" title="使用中" prefix-icon="Clock" value-style="{ color: '#e6a23c' }" />
        <el-statistic :value="maintenanceEquipment" title="维护中" prefix-icon="Setting" value-style="{ color: '#409eff' }" />
        <el-statistic :value="brokenEquipment" title="故障" prefix-icon="Warning" value-style="{ color: '#f56c6c' }" />
      </div>
    </el-card>
    
    <!-- 操作按钮 -->
    <el-card shadow="hover" class="action-card" style="margin-top: 20px;">
      <div class="action-buttons">
        <el-button type="primary" @click="goToAddEquipment">
          <el-icon><Plus /></el-icon>
          新增设备
        </el-button>
        <el-button type="success" @click="exportEquipmentList">
          <el-icon><Download /></el-icon>
          导出设备列表
        </el-button>
        <el-button type="warning" @click="batchUpdateStatus">
          <el-icon><Edit /></el-icon>
          批量更新状态
        </el-button>
        <el-button @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </el-card>
    
    <!-- 设备列表 -->
    <el-card shadow="hover" class="equipment-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>设备列表管理</span>
          <span class="total-count">共 {{ equipmentList.length }} 台设备</span>
        </div>
      </template>
      
      <!-- 搜索和筛选 -->
      <div class="search-section" style="margin-bottom: 20px;">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input 
              v-model="searchKeyword" 
              placeholder="搜索设备名称、编号或型号"
              prefix-icon="Search"
            />
          </el-col>
          <el-col :span="6">
            <el-select 
              v-model="searchStatus" 
              placeholder="设备状态"
              clearable
            >
              <el-option label="可使用" value="available" />
              <el-option label="使用中" value="busy" />
              <el-option label="维护中" value="maintenance" />
              <el-option label="故障" value="broken" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="searchEquipment">
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
      <div v-else-if="filteredEquipment.length === 0" class="empty-container">
        <el-empty description="暂无设备数据" />
      </div>
      
      <!-- 设备表格 -->
      <el-table 
        v-else 
        :data="currentPageData" 
        style="width: 100%;"
        stripe
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="code" label="设备编号" width="120" />
        <el-table-column prop="name" label="设备名称" min-width="180" />
        <el-table-column prop="model" label="设备型号" min-width="150" />
        <el-table-column prop="laboratory" label="所属实验室" width="120" />
        <el-table-column prop="location" label="存放位置" min-width="120" />
        <el-table-column prop="status" label="设备状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="manager" label="负责人" width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button 
              size="small" 
              @click="viewDetail(scope.row.id)"
            >
              查看详情
            </el-button>
            <el-button 
              size="small" 
              type="primary" 
              @click="editEquipment(scope.row)"
            >
              编辑
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="deleteEquipment(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container" v-if="filteredEquipment.length > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredEquipment.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 批量更新状态对话框 -->
    <el-dialog v-model="batchStatusDialogVisible" title="批量更新设备状态" width="50%">
      <el-form :model="batchStatusForm" :rules="batchStatusRules" ref="batchStatusFormRef">
        <el-form-item label="设备状态" prop="status">
          <el-select v-model="batchStatusForm.status" placeholder="选择设备状态">
            <el-option label="可使用" value="available" />
            <el-option label="使用中" value="busy" />
            <el-option label="维护中" value="maintenance" />
            <el-option label="故障" value="broken" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="batchStatusForm.notes" type="textarea" placeholder="输入更新备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchStatusDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmBatchStatusUpdate">确定更新</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Plus, 
  Download, 
  Edit, 
  Refresh, 
  Search, 
  Monitor, 
  Check, 
  Clock, 
  Setting, 
  Warning 
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();

// 状态管理
const loading = ref(false);
const searchKeyword = ref('');
const searchStatus = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const selectedEquipment = ref([]);
const batchStatusDialogVisible = ref(false);

// 批量更新状态表单
const batchStatusForm = ref({
  status: '',
  notes: ''
});

const batchStatusRules = {
  status: [{ required: true, message: '请选择设备状态', trigger: 'change' }]
};

// 设备数据（模拟）
const equipmentList = ref([
  {
    id: 1,
    code: 'EQ-2024-001',
    name: '高精度电子天平',
    model: 'FA2004B',
    laboratory: '化学实验室',
    location: '实验楼A座301室',
    status: 'available',
    manager: '张三'
  },
  {
    id: 2,
    code: 'EQ-2024-002',
    name: '紫外可见分光光度计',
    model: 'UV-2600',
    laboratory: '化学实验室',
    location: '实验楼A座302室',
    status: 'busy',
    manager: '张三'
  },
  {
    id: 3,
    code: 'EQ-2024-003',
    name: '生物显微镜',
    model: 'BX53',
    laboratory: '生物实验室',
    location: '实验楼B座201室',
    status: 'available',
    manager: '李四'
  },
  {
    id: 4,
    code: 'EQ-2024-004',
    name: '气相色谱仪',
    model: 'GC-2014',
    laboratory: '化学实验室',
    location: '实验楼A座401室',
    status: 'maintenance',
    manager: '张三'
  },
  {
    id: 5,
    code: 'EQ-2024-005',
    name: '示波器',
    model: 'DS1054Z',
    laboratory: '物理实验室',
    location: '实验楼C座101室',
    status: 'available',
    manager: '王五'
  },
  {
    id: 6,
    code: 'EQ-2024-006',
    name: '离心机',
    model: 'TGL-16G',
    laboratory: '生物实验室',
    location: '实验楼B座202室',
    status: 'broken',
    manager: '李四'
  },
  {
    id: 7,
    code: 'EQ-2024-007',
    name: 'PCR仪',
    model: 'T100',
    laboratory: '生物实验室',
    location: '实验楼B座301室',
    status: 'available',
    manager: '李四'
  },
  {
    id: 8,
    code: 'EQ-2024-008',
    name: '电子拉力试验机',
    model: 'WDW-5',
    laboratory: '物理实验室',
    location: '实验楼C座201室',
    status: 'available',
    manager: '王五'
  },
  {
    id: 9,
    code: 'EQ-2024-009',
    name: '原子吸收分光光度计',
    model: 'AA-6300',
    laboratory: '化学实验室',
    location: '实验楼A座402室',
    status: 'busy',
    manager: '张三'
  },
  {
    id: 10,
    code: 'EQ-2024-010',
    name: '超净工作台',
    model: 'SW-CJ-2FD',
    laboratory: '生物实验室',
    location: '实验楼B座101室',
    status: 'available',
    manager: '李四'
  }
]);

// 设备统计
const totalEquipment = computed(() => equipmentList.value.length);
const availableEquipment = computed(() => equipmentList.value.filter(e => e.status === 'available').length);
const busyEquipment = computed(() => equipmentList.value.filter(e => e.status === 'busy').length);
const maintenanceEquipment = computed(() => equipmentList.value.filter(e => e.status === 'maintenance').length);
const brokenEquipment = computed(() => equipmentList.value.filter(e => e.status === 'broken').length);

// 过滤设备数据
const filteredEquipment = computed(() => {
  return equipmentList.value.filter(item => {
    const matchesKeyword = !searchKeyword.value || 
      item.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      item.code.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      item.model.toLowerCase().includes(searchKeyword.value.toLowerCase());
    
    const matchesStatus = !searchStatus.value || item.status === searchStatus.value;
    
    return matchesKeyword && matchesStatus;
  });
});

// 当前页数据
const currentPageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredEquipment.value.slice(start, end);
});

// 状态文本和类型
const getStatusText = (status) => {
  const statusMap = {
    available: '可使用',
    busy: '使用中',
    maintenance: '维护中',
    broken: '故障'
  };
  return statusMap[status] || status;
};

const getStatusType = (status) => {
  const typeMap = {
    available: 'success',
    busy: 'warning',
    maintenance: 'info',
    broken: 'danger'
  };
  return typeMap[status] || '';
};

// 选择设备
const handleSelectionChange = (selection) => {
  selectedEquipment.value = selection;
};

// 前往新增设备页面
const goToAddEquipment = () => {
  router.push('/main/equipment-manage/add');
};

// 查看详情
const viewDetail = (id) => {
  router.push(`/main/equipment/detail/${id}`);
};

// 编辑设备
const editEquipment = (equipment) => {
  // 这里可以跳转到编辑页面或打开编辑对话框
  console.log('编辑设备:', equipment);
};

// 删除设备
const deleteEquipment = (id) => {
  ElMessageBox.confirm('确定要删除这台设备吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    equipmentList.value = equipmentList.value.filter(e => e.id !== id);
    ElMessage.success('删除成功');
  }).catch(() => {});
};

// 导出设备列表
const exportEquipmentList = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('导出成功');
  }, 1000);
};

// 批量更新状态
const batchUpdateStatus = () => {
  if (selectedEquipment.value.length === 0) {
    ElMessage.warning('请先选择要更新状态的设备');
    return;
  }
  batchStatusDialogVisible.value = true;
};

// 确认批量更新状态
const confirmBatchStatusUpdate = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    batchStatusDialogVisible.value = false;
    
    selectedEquipment.value.forEach(equipment => {
      const index = equipmentList.value.findIndex(e => e.id === equipment.id);
      if (index !== -1) {
        equipmentList.value[index].status = batchStatusForm.value.status;
      }
    });
    
    ElMessage.success(`成功更新 ${selectedEquipment.value.length} 台设备的状态`);
    selectedEquipment.value = [];
  }, 1000);
};

// 刷新数据
const refreshData = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('数据刷新成功');
  }, 800);
};

// 搜索设备
const searchEquipment = () => {
  currentPage.value = 1;
};

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
};

const handleCurrentChange = (current) => {
  currentPage.value = current;
};

// 初始化
onMounted(() => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 800);
});
</script>

<style scoped>
.equipment-manage {
  padding: 20px;
}

.stats-card {
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
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
  .equipment-manage {
    padding: 10px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }
}
</style>