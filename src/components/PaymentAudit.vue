<template>
  <div class="payment-audit-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>缴费审核</span>
        </div>
      </template>
      
      <!-- 过滤条件 -->
      <div class="filter-section">
        <el-select v-model="statusFilter" placeholder="缴费状态" clearable style="width: 120px; margin-right: 10px;">
          <el-option label="待审核" value="pending"></el-option>
          <el-option label="已通过" value="approved"></el-option>
          <el-option label="已拒绝" value="rejected"></el-option>
        </el-select>
        
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 240px; margin-right: 10px;"
        ></el-date-picker>
        
        <el-input
          v-model="keyword"
          placeholder="设备名称/预约编号"
          style="width: 200px; margin-right: 10px;"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-button type="primary" @click="loadPaymentRecords">
          查询
        </el-button>
      </div>
      
      <!-- 缴费记录表格 -->
      <el-table 
        :data="paginatedRecords" 
        style="width: 100%; margin-top: 20px;"
        border
        stripe
      >
        <el-table-column prop="paymentId" label="缴费编号" width="120" />
        <el-table-column prop="reservationId" label="预约编号" width="150" />
        <el-table-column prop="equipmentName" label="设备名称" min-width="180" />
        <el-table-column prop="userName" label="用户姓名" width="100" />
        <el-table-column prop="amount" label="缴费金额" width="100">
          <template #default="scope">
            <span class="amount">{{ scope.row.amount.toFixed(2) }} 元</span>
          </template>
        </el-table-column>
        <el-table-column prop="paymentTime" label="缴费时间" min-width="180">
          <template #default="scope">
            <span>{{ formatDate(scope.row.paymentTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button 
              size="small" 
              type="primary" 
              @click="viewDetails(scope.row)"
              :disabled="scope.row.status !== 'pending'"
            >
              查看详情
            </el-button>
            <el-button 
              size="small" 
              type="success" 
              @click="approvePayment(scope.row)"
              :disabled="scope.row.status !== 'pending'"
            >
              通过
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="rejectPayment(scope.row)"
              :disabled="scope.row.status !== 'pending'"
            >
              拒绝
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-section">
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
    
    <!-- 缴费详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="缴费详情"
      width="500px"
    >
      <el-form :model="currentPayment" label-width="100px" class="detail-form">
        <el-form-item label="缴费编号">
          <span>{{ currentPayment.paymentId }}</span>
        </el-form-item>
        <el-form-item label="预约编号">
          <span>{{ currentPayment.reservationId }}</span>
        </el-form-item>
        <el-form-item label="设备名称">
          <span>{{ currentPayment.equipmentName }}</span>
        </el-form-item>
        <el-form-item label="设备型号">
          <span>{{ currentPayment.equipmentModel }}</span>
        </el-form-item>
        <el-form-item label="用户姓名">
          <span>{{ currentPayment.userName }}</span>
        </el-form-item>
        <el-form-item label="使用时长">
          <span>{{ currentPayment.duration }} 小时</span>
        </el-form-item>
        <el-form-item label="设备单价">
          <span>{{ currentPayment.unitPrice.toFixed(2) }} 元/小时</span>
        </el-form-item>
        <el-form-item label="缴费金额">
          <span class="amount">{{ currentPayment.amount.toFixed(2) }} 元</span>
        </el-form-item>
        <el-form-item label="缴费时间">
          <span>{{ formatDate(currentPayment.paymentTime) }}</span>
        </el-form-item>
        <el-form-item label="支付方式">
          <span>{{ getPaymentMethodText(currentPayment.paymentMethod) }}</span>
        </el-form-item>
        <el-form-item label="交易编号" v-if="currentPayment.transactionId">
          <span>{{ currentPayment.transactionId }}</span>
        </el-form-item>
        <el-form-item label="状态">
          <el-tag :type="getStatusType(currentPayment.status)">
            {{ getStatusText(currentPayment.status) }}
          </el-tag>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// 缴费记录
const paymentRecords = ref([]);
const statusFilter = ref('');
const dateRange = ref([]);
const keyword = ref('');
const currentPage = ref(1);
const pageSize = ref(10);

// 详情对话框
const dialogVisible = ref(false);
const currentPayment = ref({});

// 加载缴费记录
const loadPaymentRecords = () => {
  // 模拟缴费记录数据
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  
  paymentRecords.value = [
    {
      paymentId: 'pay_' + Date.now(),
      reservationId: 'res_' + Date.now(),
      equipmentName: '电子显微镜',
      equipmentModel: 'SEM-1000',
      userName: '张三',
      duration: 2,
      unitPrice: 50,
      amount: 100,
      paymentTime: now.toISOString(),
      paymentMethod: 'wechat',
      transactionId: 'wx' + Date.now(),
      status: 'pending'
    },
    {
      paymentId: 'pay_' + (Date.now() + 1),
      reservationId: 'res_' + (Date.now() + 1),
      equipmentName: '激光切割机',
      equipmentModel: 'Laser-3000',
      userName: '李四',
      duration: 3,
      unitPrice: 60,
      amount: 180,
      paymentTime: yesterday.toISOString(),
      paymentMethod: 'alipay',
      transactionId: 'ali' + Date.now(),
      status: 'pending'
    },
    {
      paymentId: 'pay_' + (Date.now() + 2),
      reservationId: 'res_' + (Date.now() + 2),
      equipmentName: '3D打印机',
      equipmentModel: '3D-2000',
      userName: '王五',
      duration: 4,
      unitPrice: 40,
      amount: 160,
      paymentTime: twoDaysAgo.toISOString(),
      paymentMethod: 'bank',
      transactionId: 'bank' + Date.now(),
      status: 'approved'
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
      const recordDate = new Date(record.paymentTime);
      return recordDate >= startDate && recordDate <= endDate;
    });
  }
  
  // 关键词过滤
  if (keyword.value) {
    const query = keyword.value.toLowerCase();
    result = result.filter(record => 
      record.equipmentName.toLowerCase().includes(query) || 
      record.reservationId.toLowerCase().includes(query) ||
      record.userName.toLowerCase().includes(query)
    );
  }
  
  return result;
});

// 分页记录
const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredRecords.value.slice(start, end);
});

// 查看详情
const viewDetails = (payment) => {
  currentPayment.value = { ...payment };
  dialogVisible.value = true;
};

// 批准缴费
const approvePayment = (payment) => {
  ElMessageBox.confirm('确定要批准此缴费吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 更新状态
    payment.status = 'approved';
    ElMessage.success('缴费已批准');
  }).catch(() => {
    // 取消操作
  });
};

// 拒绝缴费
const rejectPayment = (payment) => {
  ElMessageBox.confirm('确定要拒绝此缴费吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 更新状态
    payment.status = 'rejected';
    ElMessage.success('缴费已拒绝');
  }).catch(() => {
    // 取消操作
  });
};

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
};

const handleCurrentChange = (current) => {
  currentPage.value = current;
};

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

// 获取支付方式文本
const getPaymentMethodText = (method) => {
  const methods = {
    'wechat': '微信支付',
    'alipay': '支付宝',
    'bank': '银行转账'
  };
  return methods[method] || method;
};

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    'pending': 'warning',
    'approved': 'success',
    'rejected': 'danger'
  };
  return types[status] || '';
};

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    'pending': '待审核',
    'approved': '已通过',
    'rejected': '已拒绝'
  };
  return texts[status] || status;
};

// 组件挂载时加载数据
onMounted(() => {
  loadPaymentRecords();
});
</script>

<style scoped>
.payment-audit-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-section {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.pagination-section {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.amount {
  font-weight: bold;
  color: #ff4d4f;
}

.detail-form {
  max-height: 400px;
  overflow-y: auto;
}

.dialog-footer {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}
</style>
