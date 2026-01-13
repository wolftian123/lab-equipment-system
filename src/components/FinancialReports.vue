<template>
  <div class="financial-reports">
    <h2>财务报表</h2>
    <p>负责人功能：生成和查看财务报表</p>
    
    <!-- 操作按钮 -->
    <el-card shadow="hover" class="action-card">
      <div class="action-buttons">
        <el-button type="primary" @click="generateReport">
          <el-icon><DocumentAdd /></el-icon>
          生成报表
        </el-button>
        <el-button type="success" @click="exportReport">
          <el-icon><Download /></el-icon>
          导出报表
        </el-button>
        <el-button type="warning" @click="printReport">
          <el-icon><Printer /></el-icon>
          打印报表
        </el-button>
        <el-button @click="refreshReports">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </el-card>
    
    <!-- 报表类型和时间筛选 -->
    <el-card shadow="hover" class="filter-card" style="margin-top: 20px;">
      <div class="filter-container">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-select 
              v-model="reportForm.type" 
              placeholder="报表类型"
              @change="loadReportData"
            >
              <el-option label="月度报表" value="monthly" />
              <el-option label="季度报表" value="quarterly" />
              <el-option label="年度报表" value="annual" />
              <el-option label="维修费用报表" value="maintenance" />
              <el-option label="设备采购报表" value="purchase" />
            </el-select>
          </el-col>
          <el-col :span="10">
            <el-date-picker 
              v-model="reportForm.dateRange" 
              type="daterange" 
              range-separator="至" 
              start-placeholder="开始日期" 
              end-placeholder="结束日期"
              @change="loadReportData"
              style="width: 100%;"
            />
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="viewDetailedReport">
              <el-icon><View /></el-icon>
              查看详细报表
            </el-button>
          </el-col>
        </el-row>
      </div>
    </el-card>
    
    <!-- 财务概览卡片 -->
    <el-card shadow="hover" class="overview-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>财务概览</span>
          <span class="period-info">{{ reportPeriodText }}</span>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :xs="12" :sm="12" :md="8" :lg="8">
          <el-statistic :value="financialStats.totalIncome" title="总收入" prefix="¥" />
        </el-col>
        <el-col :xs="12" :sm="12" :md="8" :lg="8">
          <el-statistic :value="financialStats.totalExpense" title="总支出" prefix="¥" />
        </el-col>
        <el-col :xs="12" :sm="12" :md="8" :lg="8">
          <el-statistic :value="financialStats.netProfit" title="净利润" prefix="¥" />
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 财务趋势图表 -->
    <el-card shadow="hover" class="chart-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>财务趋势</span>
          <el-select v-model="chartType" placeholder="图表类型" style="width: 120px;">
            <el-option label="折线图" value="line" />
            <el-option label="柱状图" value="bar" />
          </el-select>
        </div>
      </template>
      
      <div class="chart-container">
        <!-- 这里可以集成真实的图表库，如 ECharts -->
        <div class="chart-placeholder">
          <el-icon class="chart-icon"><TrendCharts /></el-icon>
          <p>{{ chartType === 'line' ? '折线图' : '柱状图' }} - 财务趋势数据</p>
          <div class="chart-data">
            <p>1月: 收入 ¥10,000 | 支出 ¥8,000</p>
            <p>2月: 收入 ¥12,000 | 支出 ¥9,000</p>
            <p>3月: 收入 ¥15,000 | 支出 ¥10,000</p>
            <p>4月: 收入 ¥18,000 | 支出 ¥12,000</p>
            <p>5月: 收入 ¥20,000 | 支出 ¥13,000</p>
            <p>6月: 收入 ¥22,000 | 支出 ¥14,000</p>
          </div>
        </div>
      </div>
    </el-card>
    
    <!-- 详细财务数据表格 -->
    <el-card shadow="hover" class="details-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>详细财务数据</span>
          <span class="record-count">共 {{ financialDetails.length }} 条记录</span>
        </div>
      </template>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-spinner size="large" />
        <p>加载中...</p>
      </div>
      
      <!-- 无数据 -->
      <div v-else-if="financialDetails.length === 0" class="empty-container">
        <el-empty description="暂无财务数据" />
      </div>
      
      <!-- 财务数据表格 -->
      <el-table 
        v-else 
        :data="currentPageData" 
        style="width: 100%;"
        stripe
        border
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="date" label="日期" width="150" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="scope">
            <el-tag :type="getTypeTagType(scope.row.type)">
              {{ getTypeText(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="scope">
            <span :class="scope.row.type === 'income' ? 'income-amount' : 'expense-amount'">
              ¥{{ scope.row.amount }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="paymentMethod" label="支付方式" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row)">
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container" v-if="financialDetails.length > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="financialDetails.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 详细报表对话框 -->
    <el-dialog v-model="detailedReportDialogVisible" title="详细财务报表" width="90%">
      <div class="detailed-report">
        <h3>{{ reportForm.type === 'monthly' ? '月度' : reportForm.type === 'quarterly' ? '季度' : reportForm.type === 'annual' ? '年度' : reportForm.type === 'maintenance' ? '维修费用' : '设备采购' }}财务报表</h3>
        <p class="report-period">{{ reportPeriodText }}</p>
        
        <div class="report-summary">
          <h4>报表摘要</h4>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="summary-item">
                <span class="summary-label">总收入:</span>
                <span class="summary-value income">¥{{ financialStats.totalIncome }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="summary-item">
                <span class="summary-label">总支出:</span>
                <span class="summary-value expense">¥{{ financialStats.totalExpense }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="summary-item">
                <span class="summary-label">净利润:</span>
                <span class="summary-value profit">¥{{ financialStats.netProfit }}</span>
              </div>
            </el-col>
          </el-row>
        </div>
        
        <div class="report-details">
          <h4>详细数据</h4>
          <el-table :data="financialDetails" style="width: 100%;" border>
            <el-table-column prop="date" label="日期" />
            <el-table-column prop="type" label="类型" />
            <el-table-column prop="category" label="分类" />
            <el-table-column prop="description" label="描述" />
            <el-table-column prop="amount" label="金额" />
            <el-table-column prop="paymentMethod" label="支付方式" />
            <el-table-column prop="status" label="状态" />
          </el-table>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailedReportDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="exportDetailedReport">导出详细报表</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  DocumentAdd, 
  Download, 
  Printer, 
  Refresh, 
  View, 
  TrendCharts 
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// 状态管理
const loading = ref(false);
const detailedReportDialogVisible = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const chartType = ref('line');

// 报表表单
const reportForm = ref({
  type: 'monthly',
  dateRange: []
});

// 财务统计数据
const financialStats = ref({
  totalIncome: 102000,
  totalExpense: 76500,
  netProfit: 25500
});

// 财务详细数据（模拟）
const financialDetails = ref([
  {
    id: 1,
    date: '2024-01-05',
    type: 'income',
    category: '设备使用费',
    description: '实验室设备使用费用',
    amount: 15000,
    paymentMethod: '银行转账',
    status: 'completed'
  },
  {
    id: 2,
    date: '2024-01-10',
    type: 'expense',
    category: '设备维修',
    description: '光谱仪维修费用',
    amount: 8000,
    paymentMethod: '银行转账',
    status: 'completed'
  },
  {
    id: 3,
    date: '2024-01-15',
    type: 'income',
    category: '实验服务费',
    description: '第三方实验服务费用',
    amount: 12000,
    paymentMethod: '银行转账',
    status: 'completed'
  },
  {
    id: 4,
    date: '2024-01-20',
    type: 'expense',
    category: '设备采购',
    description: '购买新的实验器材',
    amount: 15000,
    paymentMethod: '银行转账',
    status: 'completed'
  },
  {
    id: 5,
    date: '2024-01-25',
    type: 'income',
    category: '合作项目',
    description: '与企业合作项目经费',
    amount: 20000,
    paymentMethod: '银行转账',
    status: 'completed'
  },
  {
    id: 6,
    date: '2024-01-30',
    type: 'expense',
    category: '实验室耗材',
    description: '购买实验耗材',
    amount: 6000,
    paymentMethod: '银行转账',
    status: 'completed'
  },
  {
    id: 7,
    date: '2024-02-05',
    type: 'income',
    category: '设备使用费',
    description: '实验室设备使用费用',
    amount: 18000,
    paymentMethod: '银行转账',
    status: 'completed'
  },
  {
    id: 8,
    date: '2024-02-10',
    type: 'expense',
    category: '设备维修',
    description: '离心机维修费用',
    amount: 5000,
    paymentMethod: '银行转账',
    status: 'completed'
  },
  {
    id: 9,
    date: '2024-02-15',
    type: 'income',
    category: '实验服务费',
    description: '第三方实验服务费用',
    amount: 14000,
    paymentMethod: '银行转账',
    status: 'completed'
  },
  {
    id: 10,
    date: '2024-02-20',
    type: 'expense',
    category: '实验室耗材',
    description: '购买实验耗材',
    amount: 4500,
    paymentMethod: '银行转账',
    status: 'completed'
  }
]);

// 当前页数据
const currentPageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return financialDetails.value.slice(start, end);
});

// 报表周期文本
const reportPeriodText = computed(() => {
  if (reportForm.value.dateRange && reportForm.value.dateRange.length === 2) {
    return `${reportForm.value.dateRange[0]} 至 ${reportForm.value.dateRange[1]}`;
  }
  return '2024年1月1日 至 2024年2月29日';
});

// 类型文本和标签类型
const getTypeText = (type) => {
  const typeMap = {
    income: '收入',
    expense: '支出'
  };
  return typeMap[type] || type;
};

const getTypeTagType = (type) => {
  const typeMap = {
    income: 'success',
    expense: 'danger'
  };
  return typeMap[type] || '';
};

// 状态文本和类型
const getStatusText = (status) => {
  const statusMap = {
    completed: '已完成',
    pending: '待处理',
    cancelled: '已取消'
  };
  return statusMap[status] || status;
};

const getStatusType = (status) => {
  const typeMap = {
    completed: 'success',
    pending: 'warning',
    cancelled: 'danger'
  };
  return typeMap[status] || '';
};

// 加载报表数据
const loadReportData = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('报表数据加载成功');
  }, 1000);
};

// 生成报表
const generateReport = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('报表生成成功');
  }, 1500);
};

// 导出报表
const exportReport = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('报表导出成功');
  }, 1000);
};

// 打印报表
const printReport = () => {
  ElMessageBox.confirm('确定要打印当前报表吗？', '打印确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    ElMessage.success('报表打印成功');
  }).catch(() => {});
};

// 查看详细报表
const viewDetailedReport = () => {
  detailedReportDialogVisible.value = true;
};

// 导出详细报表
const exportDetailedReport = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('详细报表导出成功');
  }, 1000);
};

// 刷新报表
const refreshReports = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('报表数据刷新成功');
  }, 800);
};

// 查看详情
const viewDetail = (item) => {
  console.log('查看财务详情:', item);
  ElMessage.info('查看财务详情功能开发中');
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
  loadReportData();
});
</script>

<style scoped>
.financial-reports {
  padding: 20px;
}

.action-card {
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-container {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.period-info {
  font-size: 14px;
  color: #606266;
}

.record-count {
  font-size: 14px;
  color: #606266;
}

.overview-card {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-container {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
  padding: 40px;
  background-color: #f5f7fa;
  border-radius: 8px;
  width: 100%;
}

.chart-icon {
  font-size: 48px;
  color: #409eff;
  margin-bottom: 20px;
}

.chart-data {
  margin-top: 20px;
  text-align: left;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.chart-data p {
  margin: 8px 0;
  font-size: 14px;
}

.details-card {
  margin-bottom: 20px;
}

.loading-container {
  text-align: center;
  padding: 60px 0;
}

.empty-container {
  padding: 60px 0;
}

.income-amount {
  color: #67c23a;
  font-weight: 500;
}

.expense-amount {
  color: #f56c6c;
  font-weight: 500;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 详细报表样式 */
.detailed-report {
  padding: 20px;
}

.report-period {
  color: #606266;
  margin-bottom: 30px;
}

.report-summary {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.summary-label {
  font-size: 14px;
  color: #606266;
}

.summary-value {
  font-size: 16px;
  font-weight: 500;
}

.summary-value.income {
  color: #67c23a;
}

.summary-value.expense {
  color: #f56c6c;
}

.summary-value.profit {
  color: #409eff;
}

.report-details {
  margin-top: 30px;
}

@media (max-width: 768px) {
  .financial-reports {
    padding: 10px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }
  
  .filter-container {
    flex-direction: column;
    gap: 10px;
  }
  
  .chart-container {
    height: 300px;
  }
}
</style>