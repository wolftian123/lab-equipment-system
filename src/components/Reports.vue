<template>
  <div class="reports-container">
    <div class="reports-header">
      <h2>报表统计</h2>
      <el-button type="primary" @click="exportReport">
        <el-icon><Download /></el-icon>
        导出报表
      </el-button>
    </div>
    
    <!-- 快速统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card" shadow="hover">
        <template #header>
          <div class="card-title">
            <el-icon><Histogram /></el-icon>
            <span>设备总数</span>
          </div>
        </template>
        <div class="stat-value">{{ totalEquipment }}</div>
        <div class="stat-desc">所有类型设备</div>
      </el-card>
      
      <el-card class="stat-card" shadow="hover">
        <template #header>
          <div class="card-title">
            <el-icon><Check /></el-icon>
            <span>可用设备</span>
          </div>
        </template>
        <div class="stat-value">{{ availableEquipment }}</div>
        <div class="stat-desc">当前可预约</div>
      </el-card>
      
      <el-card class="stat-card" shadow="hover">
        <template #header>
          <div class="card-title">
            <el-icon><Clock /></el-icon>
            <span>今日预约</span>
          </div>
        </template>
        <div class="stat-value">{{ todayReservations }}</div>
        <div class="stat-desc">已确认预约</div>
      </el-card>
      
      <el-card class="stat-card" shadow="hover">
        <template #header>
          <div class="card-title">
            <el-icon><TrendCharts /></el-icon>
            <span>使用率</span>
          </div>
        </template>
        <div class="stat-value">{{ usageRate }}%</div>
        <div class="stat-desc">本月平均</div>
      </el-card>
    </div>
    
    <!-- 报表选项卡 -->
    <el-tabs type="border-card" class="reports-tabs" style="margin-top: 30px;">
      <!-- 使用率报表 -->
      <el-tab-pane label="使用率报表" name="usage">
        <div class="report-section">
          <div class="filter-bar">
            <el-select v-model="usageFilter.type" placeholder="设备类型" clearable style="width: 150px; margin-right: 10px;">
              <el-option label="所有类型" value="all" />
              <el-option label="电子设备" value="electronic" />
              <el-option label="机械设备" value="mechanical" />
              <el-option label="光学设备" value="optical" />
              <el-option label="其他设备" value="other" />
            </el-select>
            <el-date-picker 
              v-model="usageFilter.dateRange" 
              type="daterange" 
              range-separator="至" 
              start-placeholder="开始日期" 
              end-placeholder="结束日期" 
              clearable 
              style="width: 250px; margin-right: 10px;"
            />
            <el-button type="primary" @click="refreshUsageReport">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
          
          <!-- 使用率图表 -->
          <div class="chart-container">
            <el-card shadow="hover">
              <template #header>
                <div class="chart-header">
                  <span>设备使用率趋势</span>
                  <el-select v-model="chartType" style="width: 120px;">
                    <el-option label="柱状图" value="bar" />
                    <el-option label="折线图" value="line" />
                  </el-select>
                </div>
              </template>
              <div ref="usageChartRef" class="chart" style="height: 400px;"></div>
            </el-card>
            
            <el-card shadow="hover" style="margin-top: 20px;">
              <template #header>
                <div class="chart-header">
                  <span>设备使用率排名</span>
                </div>
              </template>
              <div ref="rankChartRef" class="chart" style="height: 400px;"></div>
            </el-card>
          </div>
          
          <!-- 使用率数据表格 -->
          <el-card shadow="hover" style="margin-top: 20px;">
            <template #header>
              <div class="chart-header">
                <span>使用率详情</span>
              </div>
            </template>
            <el-table 
              :data="usageData" 
              style="width: 100%"
              border
              stripe
            >
              <el-table-column prop="name" label="设备名称" width="200" />
              <el-table-column prop="model" label="型号" width="150" />
              <el-table-column prop="type" label="类型" width="100" />
              <el-table-column prop="totalHours" label="总使用时长(小时)" width="150" />
              <el-table-column prop="availableHours" label="可用时长(小时)" width="150" />
              <el-table-column label="使用率" width="120">
                <template #default="{ row }">
                  <div class="usage-rate">
                    <el-progress 
                      :percentage="row.usageRate" 
                      :format="() => `${row.usageRate}%`"
                      :stroke-width="8"
                      :color="getProgressColor(row.usageRate)"
                    />
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" fixed="right">
                <template #default="{ row }">
                  <el-button type="info" size="small" @click="viewDeviceDetails(row)">
                    详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </el-tab-pane>
      
      <!-- 预约统计 -->
      <el-tab-pane label="预约统计" name="reservation">
        <div class="report-section">
          <div class="filter-bar">
            <el-select v-model="reservationFilter.status" placeholder="预约状态" clearable style="width: 120px; margin-right: 10px;">
              <el-option label="全部" value="all" />
              <el-option label="待审批" value="pending" />
              <el-option label="已通过" value="approved" />
              <el-option label="已拒绝" value="rejected" />
              <el-option label="已完成" value="completed" />
            </el-select>
            <el-date-picker 
              v-model="reservationFilter.dateRange" 
              type="daterange" 
              range-separator="至" 
              start-placeholder="开始日期" 
              end-placeholder="结束日期" 
              clearable 
              style="width: 250px; margin-right: 10px;"
            />
            <el-button type="primary" @click="refreshReservationReport">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
          
          <!-- 预约统计图表 -->
          <div class="chart-container">
            <el-card shadow="hover" style="width: 48%; float: left; margin-right: 2%;">
              <template #header>
                <div class="chart-header">
                  <span>预约状态分布</span>
                </div>
              </template>
              <div ref="statusChartRef" class="chart" style="height: 300px;"></div>
            </el-card>
            
            <el-card shadow="hover" style="width: 48%; float: right;">
              <template #header>
                <div class="chart-header">
                  <span>预约类型分布</span>
                </div>
              </template>
              <div ref="typeChartRef" class="chart" style="height: 300px;"></div>
            </el-card>
            
            <div style="clear: both;"></div>
            
            <el-card shadow="hover" style="margin-top: 20px;">
              <template #header>
                <div class="chart-header">
                  <span>月度预约趋势</span>
                </div>
              </template>
              <div ref="trendChartRef" class="chart" style="height: 400px;"></div>
            </el-card>
          </div>
          
          <!-- 预约数据表格 -->
          <el-card shadow="hover" style="margin-top: 20px;">
            <template #header>
              <div class="chart-header">
                <span>预约数据详情</span>
              </div>
            </template>
            <el-table 
              :data="reservationData" 
              style="width: 100%"
              border
              stripe
            >
              <el-table-column prop="month" label="月份" width="100" />
              <el-table-column prop="total" label="总预约数" width="100" />
              <el-table-column prop="approved" label="已通过" width="100" />
              <el-table-column prop="rejected" label="已拒绝" width="100" />
              <el-table-column prop="completed" label="已完成" width="100" />
              <el-table-column label="通过率" width="120">
                <template #default="{ row }">
                  <el-tag :type="row.approvalRate >= 80 ? 'success' : 'warning'">
                    {{ row.approvalRate }}%
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" fixed="right">
                <template #default="{ row }">
                  <el-button type="info" size="small" @click="viewMonthDetails(row)">
                    详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 设备详情弹窗 -->
    <el-dialog
      v-model="deviceDialogVisible"
      title="设备详情"
      width="500px"
    >
      <div v-if="selectedDevice" class="device-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="设备名称">
            {{ selectedDevice.name }}
          </el-descriptions-item>
          <el-descriptions-item label="型号">
            {{ selectedDevice.model }}
          </el-descriptions-item>
          <el-descriptions-item label="类型">
            {{ selectedDevice.type }}
          </el-descriptions-item>
          <el-descriptions-item label="位置">
            {{ selectedDevice.location }}
          </el-descriptions-item>
          <el-descriptions-item label="购买日期">
            {{ selectedDevice.purchaseDate }}
          </el-descriptions-item>
          <el-descriptions-item label="使用年限">
            {{ selectedDevice.usageYears }} 年
          </el-descriptions-item>
          <el-descriptions-item label="总使用时长">
            {{ selectedDevice.totalHours }} 小时
          </el-descriptions-item>
          <el-descriptions-item label="本月使用时长">
            {{ selectedDevice.monthlyHours }} 小时
          </el-descriptions-item>
          <el-descriptions-item label="使用率">
            <el-tag type="primary">{{ selectedDevice.usageRate }}%</el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deviceDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { 
  Download, 
  Histogram, 
  Check, 
  Clock, 
  TrendCharts, 
  Refresh,
  DataAnalysis
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

// 统计数据
const totalEquipment = ref(128);
const availableEquipment = ref(96);
const todayReservations = ref(15);
const usageRate = ref(68);

// 筛选条件
const usageFilter = reactive({
  type: '',
  dateRange: []
});

const reservationFilter = reactive({
  status: '',
  dateRange: []
});

// 图表类型
const chartType = ref('bar');

// 图表引用
const usageChartRef = ref(null);
const rankChartRef = ref(null);
const statusChartRef = ref(null);
const typeChartRef = ref(null);
const trendChartRef = ref(null);

// 使用率数据
const usageData = ref([
  {
    id: 1,
    name: '电子显微镜',
    model: 'SEM-1000',
    type: '光学设备',
    totalHours: 120,
    availableHours: 168,
    usageRate: 71.4
  },
  {
    id: 2,
    name: '光谱分析仪',
    model: 'Spectrum-2000',
    type: '电子设备',
    totalHours: 98,
    availableHours: 168,
    usageRate: 58.3
  },
  {
    id: 3,
    name: '激光切割机',
    model: 'Laser-3000',
    type: '机械设备',
    totalHours: 145,
    availableHours: 168,
    usageRate: 86.3
  },
  {
    id: 4,
    name: '3D打印机',
    model: '3D-4000',
    type: '机械设备',
    totalHours: 87,
    availableHours: 168,
    usageRate: 51.8
  },
  {
    id: 5,
    name: '示波器',
    model: 'Oscilloscope-5000',
    type: '电子设备',
    totalHours: 112,
    availableHours: 168,
    usageRate: 66.7
  }
]);

// 预约数据
const reservationData = ref([
  {
    month: '1月',
    total: 120,
    approved: 98,
    rejected: 12,
    completed: 85,
    approvalRate: 81.7
  },
  {
    month: '2月',
    total: 105,
    approved: 87,
    rejected: 18,
    completed: 75,
    approvalRate: 82.9
  },
  {
    month: '3月',
    total: 132,
    approved: 115,
    rejected: 17,
    completed: 102,
    approvalRate: 87.1
  },
  {
    month: '4月',
    total: 145,
    approved: 130,
    rejected: 15,
    completed: 118,
    approvalRate: 89.7
  },
  {
    month: '5月',
    total: 128,
    approved: 112,
    rejected: 16,
    completed: 98,
    approvalRate: 87.5
  },
  {
    month: '6月',
    total: 115,
    approved: 100,
    rejected: 15,
    completed: 88,
    approvalRate: 87.0
  }
]);

// 弹窗状态
const deviceDialogVisible = ref(false);
const selectedDevice = ref(null);

// 导出报表
const exportReport = () => {
  ElMessage.success('报表导出成功');
};

// 刷新使用率报表
const refreshUsageReport = () => {
  ElMessage.info('使用率报表已刷新');
};

// 刷新预约报表
const refreshReservationReport = () => {
  ElMessage.info('预约报表已刷新');
};

// 查看设备详情
const viewDeviceDetails = (device) => {
  selectedDevice.value = {
    ...device,
    location: 'A楼302实验室',
    purchaseDate: '2022-05-15',
    usageYears: 2,
    monthlyHours: 45
  };
  deviceDialogVisible.value = true;
};

// 查看月度详情
const viewMonthDetails = (monthData) => {
  ElMessage.info(`查看 ${monthData.month} 详情`);
};

// 获取进度条颜色
const getProgressColor = (rate) => {
  if (rate >= 80) return '#f56c6c';
  if (rate >= 60) return '#e6a23c';
  return '#67c23a';
};

// 初始化图表
const initCharts = () => {
  // 这里可以集成 ECharts 或其他图表库
  console.log('初始化图表');
};

// 监听图表类型变化
watch(chartType, () => {
  initCharts();
});

// 初始化
onMounted(() => {
  initCharts();
  console.log('Reports component mounted');
});
</script>

<style scoped>
.reports-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.reports-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.reports-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  margin: 20px 0 10px 0;
}

.stat-desc {
  font-size: 14px;
  color: #909399;
}

.reports-tabs {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.report-section {
  padding: 20px;
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

.chart-container {
  margin-top: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart {
  width: 100%;
}

.usage-rate {
  padding: 10px 0;
}

.device-detail {
  max-height: 400px;
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .reports-container {
    padding: 10px;
  }
  
  .reports-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-bar > * {
    width: 100% !important;
    margin-right: 0 !important;
  }
  
  .chart-container {
    margin-top: 10px;
  }
}
</style>