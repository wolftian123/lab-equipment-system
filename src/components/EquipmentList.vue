<template>
  <div class="equipment-list">
    <h2>设备查询</h2>
    <p>搜索和查看实验室设备信息</p>
    
    <!-- 搜索和筛选区域 -->
    <el-card shadow="hover" class="search-card">
      <div class="search-container">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input 
              v-model="searchForm.keyword" 
              placeholder="搜索设备名称、编号或型号"
              prefix-icon="Search"
            />
          </el-col>
          <el-col :span="6">
            <el-select 
              v-model="searchForm.status" 
              placeholder="设备状态"
              clearable
            >
              <el-option label="可使用" value="available" />
              <el-option label="使用中" value="busy" />
              <el-option label="维护中" value="maintenance" />
              <el-option label="故障" value="broken" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select 
              v-model="searchForm.laboratory" 
              placeholder="所属实验室"
              clearable
            >
              <el-option label="物理实验室" value="physics" />
              <el-option label="化学实验室" value="chemistry" />
              <el-option label="生物实验室" value="biology" />
              <el-option label="计算机实验室" value="computer" />
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
    </el-card>
    
    <!-- 设备列表 -->
    <el-card shadow="hover" class="list-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>设备列表</span>
          <span class="total-count">共 {{ filteredEquipment.length }} 台设备</span>
        </div>
      </template>
      
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
      >
        <el-table-column prop="code" label="设备编号" width="120" />
        <el-table-column prop="name" label="设备名称" min-width="180">
          <template #default="scope">
            <el-link type="primary" @click="viewDetail(scope.row.id)">
              {{ scope.row.name }}
            </el-link>
          </template>
        </el-table-column>
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
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              size="small" 
              @click="viewDetail(scope.row.id)"
              :disabled="scope.row.status !== 'available'"
            >
              查看详情
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Search, 
  ArrowLeft 
} from '@element-plus/icons-vue';

const router = useRouter();

// 状态管理
const loading = ref(false);
const searchForm = ref({
  keyword: '',
  status: '',
  laboratory: ''
});
const currentPage = ref(1);
const pageSize = ref(10);

// 设备数据（模拟）
const equipmentList = ref([
  {
    id: 1,
    code: 'EQ-2024-001',
    name: '高精度电子天平',
    model: 'FA2004B',
    laboratory: '化学实验室',
    location: '实验楼A座301室',
    status: 'available'
  },
  {
    id: 2,
    code: 'EQ-2024-002',
    name: '紫外可见分光光度计',
    model: 'UV-2600',
    laboratory: '化学实验室',
    location: '实验楼A座302室',
    status: 'busy'
  },
  {
    id: 3,
    code: 'EQ-2024-003',
    name: '生物显微镜',
    model: 'BX53',
    laboratory: '生物实验室',
    location: '实验楼B座201室',
    status: 'available'
  },
  {
    id: 4,
    code: 'EQ-2024-004',
    name: '气相色谱仪',
    model: 'GC-2014',
    laboratory: '化学实验室',
    location: '实验楼A座401室',
    status: 'maintenance'
  },
  {
    id: 5,
    code: 'EQ-2024-005',
    name: '示波器',
    model: 'DS1054Z',
    laboratory: '物理实验室',
    location: '实验楼C座101室',
    status: 'available'
  },
  {
    id: 6,
    code: 'EQ-2024-006',
    name: '离心机',
    model: 'TGL-16G',
    laboratory: '生物实验室',
    location: '实验楼B座202室',
    status: 'broken'
  },
  {
    id: 7,
    code: 'EQ-2024-007',
    name: 'PCR仪',
    model: 'T100',
    laboratory: '生物实验室',
    location: '实验楼B座301室',
    status: 'available'
  },
  {
    id: 8,
    code: 'EQ-2024-008',
    name: '电子拉力试验机',
    model: 'WDW-5',
    laboratory: '物理实验室',
    location: '实验楼C座201室',
    status: 'available'
  },
  {
    id: 9,
    code: 'EQ-2024-009',
    name: '原子吸收分光光度计',
    model: 'AA-6300',
    laboratory: '化学实验室',
    location: '实验楼A座402室',
    status: 'busy'
  },
  {
    id: 10,
    code: 'EQ-2024-010',
    name: '超净工作台',
    model: 'SW-CJ-2FD',
    laboratory: '生物实验室',
    location: '实验楼B座101室',
    status: 'available'
  },
  {
    id: 11,
    code: 'EQ-2024-011',
    name: '函数信号发生器',
    model: 'AFG3021B',
    laboratory: '物理实验室',
    location: '实验楼C座102室',
    status: 'available'
  },
  {
    id: 12,
    code: 'EQ-2024-012',
    name: '高效液相色谱仪',
    model: 'LC-20AT',
    laboratory: '化学实验室',
    location: '实验楼A座403室',
    status: 'maintenance'
  }
]);

// 过滤设备数据
const filteredEquipment = computed(() => {
  return equipmentList.value.filter(item => {
    const matchesKeyword = !searchForm.value.keyword || 
      item.name.toLowerCase().includes(searchForm.value.keyword.toLowerCase()) ||
      item.code.toLowerCase().includes(searchForm.value.keyword.toLowerCase()) ||
      item.model.toLowerCase().includes(searchForm.value.keyword.toLowerCase());
    
    const matchesStatus = !searchForm.value.status || item.status === searchForm.value.status;
    
    const matchesLaboratory = !searchForm.value.laboratory || 
      item.laboratory.toLowerCase().includes(searchForm.value.laboratory.toLowerCase());
    
    return matchesKeyword && matchesStatus && matchesLaboratory;
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

// 搜索设备
const searchEquipment = () => {
  loading.value = true;
  // 模拟搜索延迟
  setTimeout(() => {
    loading.value = false;
    currentPage.value = 1; // 重置到第一页
  }, 500);
};

// 查看详情
const viewDetail = (id) => {
  router.push(`/main/equipment/detail/${id}`);
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
  // 可以在这里加载真实数据
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 800);
});
</script>

<style scoped>
.equipment-list {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.search-container {
  margin-bottom: 0;
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
  .equipment-list {
    padding: 10px;
  }
  
  .search-container {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
