<template>
  <div class="my-payment-container">
    <div class="payment-header">
      <h2>缴费记录</h2>
      <p>查看您的设备使用缴费记录</p>
    </div>
    
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-select v-model="statusFilter" placeholder="缴费状态" clearable style="width: 120px; margin-right: 10px;">
        <el-option label="已支付" value="paid" />
        <el-option label="未支付" value="unpaid" />
        <el-option label="退款" value="refunded" />
      </el-select>
      <el-date-picker 
        v-model="dateRange" 
        type="daterange" 
        range-separator="至" 
        start-placeholder="开始日期" 
        end-placeholder="结束日期" 
        clearable 
        style="width: 250px; margin-right: 10px;"
      />
      <el-input 
        v-model="keyword" 
        placeholder="设备名称/预约编号" 
        style="width: 200px; margin-right: 10px;"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="refreshRecords">
        <el-icon><Refresh /></el-icon>
        搜索
      </el-button>
    </div>
    
    <!-- 缴费记录表格 -->
    <el-table 
      :data="paginatedRecords" 
      style="width: 100%; margin-top: 20px;"
      border
      stripe
    >
      <el-table-column prop="id" label="缴费编号" width="120" />
      <el-table-column prop="reservationId" label="预约编号" width="150" />
      <el-table-column prop="equipmentName" label="设备名称" min-width="180" />
      <el-table-column prop="amount" label="金额(元)" width="100">
        <template #default="scope">
          <span class="amount">{{ scope.row.amount.toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="paymentTime" label="缴费时间" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.paymentTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="scope">
          <el-button 
            size="small" 
            type="primary" 
            @click="viewDetails(scope.row)"
          >
            查看详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页 -->
    <div class="pagination-container">
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
    
    <!-- 缴费详情弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="缴费详情"
      width="600px"
    >
      <div v-if="selectedRecord" class="payment-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="缴费编号">{{ selectedRecord.id }}</el-descriptions-item>
          <el-descriptions-item label="预约编号">{{ selectedRecord.reservationId }}</el-descriptions-item>
          <el-descriptions-item label="设备名称">{{ selectedRecord.equipmentName }}</el-descriptions-item>
          <el-descriptions-item label="设备型号">{{ selectedRecord.equipmentModel }}</el-descriptions-item>
          <el-descriptions-item label="使用时长">{{ selectedRecord.duration }} 小时</el-descriptions-item>
          <el-descriptions-item label="单价">{{ selectedRecord.unitPrice.toFixed(2) }} 元/小时</el-descriptions-item>
          <el-descriptions-item label="总金额">{{ selectedRecord.amount.toFixed(2) }} 元</el-descriptions-item>
          <el-descriptions-item label="缴费状态">{{ getStatusText(selectedRecord.status) }}</el-descriptions-item>
          <el-descriptions-item label="缴费时间" v-if="selectedRecord.paymentTime">{{ formatDate(selectedRecord.paymentTime) }}</el-descriptions-item>
          <el-descriptions-item label="支付方式" v-if="selectedRecord.paymentMethod">{{ selectedRecord.paymentMethod }}</el-descriptions-item>
          <el-descriptions-item label="预约时间" :span="2">
            {{ formatDate(selectedRecord.reservationTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2" v-if="selectedRecord.remark">
            {{ selectedRecord.remark }}
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
import { ElMessage } from 'element-plus';
import { Search, Refresh, Document, Wallet } from '@element-plus/icons-vue';
import { useStore } from 'vuex';

// 状态管理
const store = useStore();

// 响应式数据
const statusFilter = ref('');
const dateRange = ref([]);
const keyword = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const dialogVisible = ref(false);
const selectedRecord = ref(null);
const paymentRecords = ref([]);

// 加载缴费记录数据
const loadPaymentRecords = () => {
  // 模拟数据
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  
  paymentRecords.value = [
    {
      id: 'pay_001',
      reservationId: 'E' + Date.now(),
      equipmentName: '电子显微镜',
      equipmentModel: 'SEM-1000',
      duration: 6,
      unitPrice: 50,
      amount: 300,
      paymentTime: twoDaysAgo.toISOString(),
      status: 'paid',
      paymentMethod: '微信支付',
      reservationTime: '2024-01-20 10:00-16:00',
      remark: '合作项目研究使用'
    },
    {
      id: 'pay_002',
      reservationId: 'EH' + Date.now(),
      equipmentName: '光谱分析仪',
      equipmentModel: 'Spectrum-2000',
      duration: 4,
      unitPrice: 40,
      amount: 160,
      paymentTime: threeDaysAgo.toISOString(),
      status: 'paid',
      paymentMethod: '支付宝',
      reservationTime: '2023-12-26 13:00-17:00',
      remark: '样品分析测试'
    },
    {
      id: 'pay_003',
      reservationId: 'E' + (Date.now() + 1),
      equipmentName: '激光切割机',
      equipmentModel: 'Laser-3000',
      duration: 3,
      unitPrice: 60,
      amount: 180,
      paymentTime: null,
      status: 'unpaid',
      paymentMethod: null,
      reservationTime: '2024-01-25 09:00-12:00',
      remark: '原型制作'
    }
  ];
};

// 过滤后的记录
const filteredRecords = computed(() => {
  let result = [...paymentRecords.value];
  
  // 状态过滤
  if (statusFilter.value) {
    result = result.filter(record => record.status === statusFilter.value);
  }
  
  // 日期范围过滤
  if (dateRange.value && dateRange.value.length === 2) {
    const startDate = new Date(dateRange.value[0]);
    const endDate = new Date(dateRange.value[1]);
    endDate.setHours(23, 59, 59, 999);
    
    result = result.filter(record => {
      if (!record.paymentTime) return false;
      const paymentDate = new Date(record.paymentTime);
      return paymentDate >= startDate && paymentDate <= endDate;
    });
  }
  
  // 关键词过滤
  if (keyword.value) {
    const query = keyword.value.toLowerCase();
    result = result.filter(record => 
      record.equipmentName.toLowerCase().includes(query) || 
      record.reservationId.toLowerCase().includes(query)
    );
  }
  
  return result;
});

// 分页后的记录
const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredRecords.value.slice(start, end);
});

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    paid: 'success',
    unpaid: 'warning',
    refunded: 'info'
  };
  return types[status] || 'info';
};

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    paid: '已支付',
    unpaid: '未支付',
    refunded: '退款'
  };
  return texts[status] || '未知';
};

// 查看详情
const viewDetails = (record) => {
  selectedRecord.value = { ...record };
  dialogVisible.value = true;
};

// 刷新记录
const refreshRecords = () => {
  loadPaymentRecords();
  ElMessage.success('缴费记录已刷新');
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
  loadPaymentRecords();
});
</script>

<style scoped>
.my-payment-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.payment-header {
  margin-bottom: 20px;
}

.payment-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.payment-header p {
  margin: 4px 0 0;
  font-size: 14px;
  color: #606266;
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

.amount {
  font-weight: 500;
  color: #f56c6c;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.payment-detail {
  max-height: 400px;
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .my-payment-container {
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