<template>
  <div class="equipment-status">
    <h2>设备状态</h2>
    <p>实时监控和分析设备运行状态</p>
    
    <!-- 操作按钮 -->
    <el-card shadow="hover" class="action-card">
      <div class="action-buttons">
        <el-button type="primary" @click="refreshStatus">
          <el-icon><Refresh /></el-icon>
          刷新状态
        </el-button>
        <el-button type="success" @click="exportStatusReport">
          <el-icon><Download /></el-icon>
          导出状态报告
        </el-button>
        <el-button @click="viewDetailedAnalysis">
          <el-icon><DataAnalysis /></el-icon>
          详细分析
        </el-button>
      </div>
    </el-card>
    
    <!-- 状态统计卡片 -->
    <el-card shadow="hover" class="stats-card">
      <template #header>
        <div class="card-header">
          <span>设备状态概览</span>
          <span class="update-time">最后更新: {{ lastUpdateTime }}</span>
        </div>
      </template>
      
      <div class="stats-grid">
        <div class="stat-item available">
          <el-icon><Check /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ statusStats.available }}</div>
            <div class="stat-label">可使用</div>
          </div>
          <div class="stat-percentage">{{ getPercentage(statusStats.available) }}%</div>
        </div>
        
        <div class="stat-item busy">
          <el-icon><Clock /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ statusStats.busy }}</div>
            <div class="stat-label">使用中</div>
          </div>
          <div class="stat-percentage">{{ getPercentage(statusStats.busy) }}%</div>
        </div>
        
        <div class="stat-item maintenance">
          <el-icon><Setting /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ statusStats.maintenance }}</div>
            <div class="stat-label">维护中</div>
          </div>
          <div class="stat-percentage">{{ getPercentage(statusStats.maintenance) }}%</div>
        </div>
        
        <div class="stat-item broken">
          <el-icon><Warning /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ statusStats.broken }}</div>
            <div class="stat-label">故障</div>
          </div>
          <div class="stat-percentage">{{ getPercentage(statusStats.broken) }}%</div>
        </div>
        
        <div class="stat-item total">
          <el-icon><Monitor /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ totalEquipment }}</div>
            <div class="stat-label">设备总数</div>
          </div>
          <div class="stat-percentage">100%</div>
        </div>
      </div>
    </el-card>
    
    <!-- 状态分布图表 -->
    <el-card shadow="hover" class="chart-card" style="margin-top: 20px;">
      <template #header>
        <span>状态分布</span>
      </template>
      
      <div class="chart-container">
        <div class="pie-chart">
          <!-- 这里可以集成 ECharts 等图表库 -->
          <div class="simulated-pie-chart">
            <div class="pie-segment available" style="--percentage: 65;"></div>
            <div class="pie-segment busy" style="--percentage: 20;"></div>
            <div class="pie-segment maintenance" style="--percentage: 10;"></div>
            <div class="pie-segment broken" style="--percentage: 5;"></div>
            <div class="pie-center">
              <div class="pie-center-text">设备状态</div>
              <div class="pie-center-value">{{ totalEquipment }}</div>
            </div>
          </div>
        </div>
        
        <div class="chart-legend">
          <div class="legend-item">
            <div class="legend-color available"></div>
            <span>可使用 ({{ statusStats.available }})</span>
          </div>
          <div class="legend-item">
            <div class="legend-color busy"></div>
            <span>使用中 ({{ statusStats.busy }})</span>
          </div>
          <div class="legend-item">
            <div class="legend-color maintenance"></div>
            <span>维护中 ({{ statusStats.maintenance }})</span>
          </div>
          <div class="legend-item">
            <div class="legend-color broken"></div>
            <span>故障 ({{ statusStats.broken }})</span>
          </div>
        </div>
      </div>
    </el-card>
    
    <!-- 状态趋势 -->
    <el-card shadow="hover" class="trend-card" style="margin-top: 20px;">
      <template #header>
        <span>状态变化趋势</span>
      </template>
      
      <div class="trend-container">
        <!-- 模拟趋势图表 -->
        <div class="simulated-trend-chart">
          <div class="trend-axis">
            <div class="trend-labels">
              <span>1月</span>
              <span>2月</span>
              <span>3月</span>
              <span>4月</span>
              <span>5月</span>
              <span>6月</span>
            </div>
            <div class="trend-data">
              <div class="trend-line available">
                <div class="trend-point" style="--x: 0%; --y: 60%;"></div>
                <div class="trend-point" style="--x: 20%; --y: 62%;"></div>
                <div class="trend-point" style="--x: 40%; --y: 58%;"></div>
                <div class="trend-point" style="--x: 60%; --y: 65%;"></div>
                <div class="trend-point" style="--x: 80%; --y: 63%;"></div>
                <div class="trend-point" style="--x: 100%; --y: 65%;"></div>
              </div>
              <div class="trend-line busy">
                <div class="trend-point" style="--x: 0%; --y: 25%;"></div>
                <div class="trend-point" style="--x: 20%; --y: 23%;"></div>
                <div class="trend-point" style="--x: 40%; --y: 26%;"></div>
                <div class="trend-point" style="--x: 60%; --y: 20%;"></div>
                <div class="trend-point" style="--x: 80%; --y: 22%;"></div>
                <div class="trend-point" style="--x: 100%; --y: 20%;"></div>
              </div>
              <div class="trend-line maintenance">
                <div class="trend-point" style="--x: 0%; --y: 10%;"></div>
                <div class="trend-point" style="--x: 20%; --y: 12%;"></div>
                <div class="trend-point" style="--x: 40%; --y: 11%;"></div>
                <div class="trend-point" style="--x: 60%; --y: 10%;"></div>
                <div class="trend-point" style="--x: 80%; --y: 11%;"></div>
                <div class="trend-point" style="--x: 100%; --y: 10%;"></div>
              </div>
              <div class="trend-line broken">
                <div class="trend-point" style="--x: 0%; --y: 5%;"></div>
                <div class="trend-point" style="--x: 20%; --y: 3%;"></div>
                <div class="trend-point" style="--x: 40%; --y: 5%;"></div>
                <div class="trend-point" style="--x: 60%; --y: 5%;"></div>
                <div class="trend-point" style="--x: 80%; --y: 4%;"></div>
                <div class="trend-point" style="--x: 100%; --y: 5%;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
    
    <!-- 详细状态列表 -->
    <el-card shadow="hover" class="detail-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>设备状态详情</span>
          <el-select v-model="statusFilter" placeholder="筛选状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="可使用" value="available" />
            <el-option label="使用中" value="busy" />
            <el-option label="维护中" value="maintenance" />
            <el-option label="故障" value="broken" />
          </el-select>
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
      
      <!-- 设备状态表格 -->
      <el-table 
        v-else 
        :data="filteredEquipment" 
        style="width: 100%;"
        stripe
        border
      >
        <el-table-column prop="code" label="设备编号" width="120" />
        <el-table-column prop="name" label="设备名称" min-width="180" />
        <el-table-column prop="model" label="设备型号" min-width="150" />
        <el-table-column prop="location" label="存放位置" min-width="120" />
        <el-table-column prop="status" label="设备状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastStatusChange" label="状态变更时间" width="180" />
        <el-table-column prop="manager" label="负责人" width="120" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewEquipmentDetail(scope.row.id)">
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
  Refresh, 
  Download, 
  DataAnalysis, 
  Check, 
  Clock, 
  Setting, 
  Warning, 
  Monitor 
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const router = useRouter();

// 状态管理
const loading = ref(false);
const statusFilter = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const lastUpdateTime = ref('');

// 设备状态数据（模拟）
const equipmentList = ref([
  {
    id: 1,
    code: 'EQ-2024-001',
    name: '高精度电子天平',
    model: 'FA2004B',
    location: '实验楼A座301室',
    status: 'available',
    lastStatusChange: '2024-01-10 14:30:00',
    manager: '张三'
  },
  {
    id: 2,
    code: 'EQ-2024-002',
    name: '紫外可见分光光度计',
    model: 'UV-2600',
    location: '实验楼A座302室',
    status: 'busy',
    lastStatusChange: '2024-01-12 09:15:00',
    manager: '张三'
  },
  {
    id: 3,
    code: 'EQ-2024-003',
    name: '生物显微镜',
    model: 'BX53',
    location: '实验楼B座201室',
    status: 'available',
    lastStatusChange: '2024-01-09 16:45:00',
    manager: '李四'
  },
  {
    id: 4,
    code: 'EQ-2024-004',
    name: '气相色谱仪',
    model: 'GC-2014',
    location: '实验楼A座401室',
    status: 'maintenance',
    lastStatusChange: '2024-01-11 10:20:00',
    manager: '张三'
  },
  {
    id: 5,
    code: 'EQ-2024-005',
    name: '示波器',
    model: 'DS1054Z',
    location: '实验楼C座101室',
    status: 'available',
    lastStatusChange: '2024-01-08 11:30:00',
    manager: '王五'
  },
  {
    id: 6,
    code: 'EQ-2024-006',
    name: '离心机',
    model: 'TGL-16G',
    location: '实验楼B座202室',
    status: 'broken',
    lastStatusChange: '2024-01-12 13:45:00',
    manager: '李四'
  },
  {
    id: 7,
    code: 'EQ-2024-007',
    name: 'PCR仪',
    model: 'T100',
    location: '实验楼B座301室',
    status: 'available',
    lastStatusChange: '2024-01-07 15:20:00',
    manager: '李四'
  },
  {
    id: 8,
    code: 'EQ-2024-008',
    name: '电子拉力试验机',
    model: 'WDW-5',
    location: '实验楼C座201室',
    status: 'available',
    lastStatusChange: '2024-01-06 10:10:00',
    manager: '王五'
  },
  {
    id: 9,
    code: 'EQ-2024-009',
    name: '原子吸收分光光度计',
    model: 'AA-6300',
    location: '实验楼A座402室',
    status: 'busy',
    lastStatusChange: '2024-01-12 08:30:00',
    manager: '张三'
  },
  {
    id: 10,
    code: 'EQ-2024-010',
    name: '超净工作台',
    model: 'SW-CJ-2FD',
    location: '实验楼B座101室',
    status: 'available',
    lastStatusChange: '2024-01-05 14:15:00',
    manager: '李四'
  },
  {
    id: 11,
    code: 'EQ-2024-011',
    name: '函数信号发生器',
    model: 'AFG3021B',
    location: '实验楼C座102室',
    status: 'available',
    lastStatusChange: '2024-01-04 09:45:00',
    manager: '王五'
  },
  {
    id: 12,
    code: 'EQ-2024-012',
    name: '高效液相色谱仪',
    model: 'LC-20AT',
    location: '实验楼A座403室',
    status: 'maintenance',
    lastStatusChange: '2024-01-11 16:30:00',
    manager: '张三'
  }
]);

// 状态统计
const statusStats = computed(() => {
  return {
    available: equipmentList.value.filter(e => e.status === 'available').length,
    busy: equipmentList.value.filter(e => e.status === 'busy').length,
    maintenance: equipmentList.value.filter(e => e.status === 'maintenance').length,
    broken: equipmentList.value.filter(e => e.status === 'broken').length
  };
});

const totalEquipment = computed(() => equipmentList.value.length);

// 过滤设备数据
const filteredEquipment = computed(() => {
  return equipmentList.value.filter(item => {
    return !statusFilter.value || item.status === statusFilter.value;
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

// 计算百分比
const getPercentage = (value) => {
  if (totalEquipment.value === 0) return 0;
  return Math.round((value / totalEquipment.value) * 100);
};

// 刷新状态
const refreshStatus = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    updateLastUpdateTime();
    ElMessage.success('设备状态已刷新');
  }, 1000);
};

// 导出状态报告
const exportStatusReport = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('状态报告导出成功');
  }, 1000);
};

// 查看详细分析
const viewDetailedAnalysis = () => {
  ElMessage.info('详细分析功能开发中');
};

// 查看设备详情
const viewEquipmentDetail = (id) => {
  router.push(`/main/equipment/detail/${id}`);
};

// 更新最后更新时间
const updateLastUpdateTime = () => {
  const now = new Date();
  lastUpdateTime.value = now.toLocaleString('zh-CN');
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
  updateLastUpdateTime();
  refreshStatus();
});
</script>

<style scoped>
.equipment-status {
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

.update-time {
  font-size: 12px;
  color: #909399;
}

.stats-card {
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  border-radius: 8px;
  background-color: #f9f9f9;
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-item.available {
  border-left: 4px solid #67c23a;
}

.stat-item.busy {
  border-left: 4px solid #e6a23c;
}

.stat-item.maintenance {
  border-left: 4px solid #409eff;
}

.stat-item.broken {
  border-left: 4px solid #f56c6c;
}

.stat-item.total {
  border-left: 4px solid #909399;
}

.stat-item el-icon {
  font-size: 24px;
}

.stat-item.available el-icon {
  color: #67c23a;
}

.stat-item.busy el-icon {
  color: #e6a23c;
}

.stat-item.maintenance el-icon {
  color: #409eff;
}

.stat-item.broken el-icon {
  color: #f56c6c;
}

.stat-item.total el-icon {
  color: #909399;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-top: 4px;
}

.stat-percentage {
  font-size: 14px;
  font-weight: 500;
}

.chart-card,
.trend-card {
  margin-bottom: 20px;
}

.chart-container {
  display: flex;
  gap: 40px;
  align-items: center;
}

.pie-chart {
  flex: 1;
  min-height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.simulated-pie-chart {
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
}

.pie-segment {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-origin: center;
}

.pie-segment.available {
  background-color: #67c23a;
  transform: rotate(0deg) skewY(0deg);
}

.pie-segment.busy {
  background-color: #e6a23c;
  transform: rotate(234deg) skewY(-234deg);
}

.pie-segment.maintenance {
  background-color: #409eff;
  transform: rotate(306deg) skewY(-306deg);
}

.pie-segment.broken {
  background-color: #f56c6c;
  transform: rotate(342deg) skewY(-342deg);
}

.pie-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.pie-center-text {
  font-size: 12px;
  color: #606266;
}

.pie-center-value {
  font-size: 20px;
  font-weight: bold;
  margin-top: 4px;
}

.chart-legend {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.legend-color.available {
  background-color: #67c23a;
}

.legend-color.busy {
  background-color: #e6a23c;
}

.legend-color.maintenance {
  background-color: #409eff;
}

.legend-color.broken {
  background-color: #f56c6c;
}

.trend-container {
  min-height: 300px;
}

.simulated-trend-chart {
  position: relative;
  height: 300px;
  padding: 20px 0;
}

.trend-axis {
  position: relative;
  height: 100%;
}

.trend-labels {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #606266;
}

.trend-data {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 20px;
  position: relative;
}

.trend-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 5%;
}

.trend-point {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transform: translate(-50%, 50%);
}

.trend-line.available .trend-point {
  background-color: #67c23a;
}

.trend-line.busy .trend-point {
  background-color: #e6a23c;
}

.trend-line.maintenance .trend-point {
  background-color: #409eff;
}

.trend-line.broken .trend-point {
  background-color: #f56c6c;
}

.detail-card {
  margin-bottom: 20px;
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
  .equipment-status {
    padding: 10px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .pie-chart {
    min-height: 200px;
  }
  
  .simulated-pie-chart {
    width: 150px;
    height: 150px;
    margin: 0 auto;
  }
  
  .pie-center {
    width: 80px;
    height: 80px;
  }
}
</style>