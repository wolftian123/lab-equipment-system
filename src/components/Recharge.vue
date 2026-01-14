<template>
  <div class="recharge-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>账户充值</span>
        </div>
      </template>
      
      <!-- 充值表单 -->
      <el-form :model="rechargeForm" :rules="rules" ref="rechargeFormRef" label-width="80px">
        <el-form-item label="充值金额" prop="amount">
          <el-input-number 
            v-model="rechargeForm.amount" 
            :min="10" 
            :max="10000" 
            :step="10" 
            :precision="2"
            style="width: 300px"
          >
            <template #append>元</template>
          </el-input-number>
        </el-form-item>
        
        <el-form-item label="支付方式" prop="paymentMethod">
          <el-radio-group v-model="rechargeForm.paymentMethod">
            <el-radio label="wechat">微信支付</el-radio>
            <el-radio label="alipay">支付宝</el-radio>
            <el-radio label="bank">银行转账</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitRecharge" :loading="loading">
            提交充值
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 充值记录 -->
    <el-card class="mt-4">
      <template #header>
        <div class="card-header">
          <span>充值记录</span>
        </div>
      </template>
      
      <!-- 过滤条件 -->
      <div class="filter-section">
        <el-select v-model="statusFilter" placeholder="状态" clearable style="width: 120px; margin-right: 10px;">
          <el-option label="成功" value="success"></el-option>
          <el-option label="处理中" value="processing"></el-option>
          <el-option label="失败" value="failed"></el-option>
        </el-select>
        
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 240px; margin-right: 10px;"
        ></el-date-picker>
        
        <el-button type="primary" @click="loadRechargeRecords">
          查询
        </el-button>
      </div>
      
      <!-- 充值记录表格 -->
      <el-table 
        :data="paginatedRecords" 
        style="width: 100%; margin-top: 20px;"
        border
        stripe
      >
        <el-table-column prop="id" label="充值编号" width="120" />
        <el-table-column prop="amount" label="充值金额(元)" width="120">
          <template #default="scope">
            <span class="amount">{{ scope.row.amount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="paymentMethod" label="支付方式" width="100">
          <template #default="scope">
            <span>{{ getPaymentMethodText(scope.row.paymentMethod) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="充值时间" min-width="180">
          <template #default="scope">
            <span>{{ formatDate(scope.row.createTime) }}</span>
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
    
    <!-- 充值详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="充值详情"
      width="500px"
    >
      <el-form :model="currentRecharge" label-width="100px" class="detail-form">
        <el-form-item label="充值编号">
          <span>{{ currentRecharge.id }}</span>
        </el-form-item>
        <el-form-item label="充值金额">
          <span>{{ currentRecharge.amount?.toFixed(2) }} 元</span>
        </el-form-item>
        <el-form-item label="支付方式">
          <span>{{ getPaymentMethodText(currentRecharge.paymentMethod) }}</span>
        </el-form-item>
        <el-form-item label="充值时间">
          <span>{{ formatDate(currentRecharge.createTime) }}</span>
        </el-form-item>
        <el-form-item label="状态">
          <el-tag :type="getStatusType(currentRecharge.status)">
            {{ getStatusText(currentRecharge.status) }}
          </el-tag>
        </el-form-item>
        <el-form-item label="交易编号" v-if="currentRecharge.transactionId">
          <span>{{ currentRecharge.transactionId }}</span>
        </el-form-item>
        <el-form-item label="备注" v-if="currentRecharge.remark">
          <span>{{ currentRecharge.remark }}</span>
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
import { useStore } from 'vuex';
import { ElMessage } from 'element-plus';

const store = useStore();
const user = computed(() => store.state.user);

// 充值表单
const rechargeForm = ref({
  amount: 100,
  paymentMethod: 'wechat'
});

const rules = ref({
  amount: [
    { required: true, message: '请输入充值金额', trigger: 'blur' },
    { type: 'number', min: 10, message: '充值金额不能小于10元', trigger: 'blur' },
    { type: 'number', max: 10000, message: '充值金额不能大于10000元', trigger: 'blur' }
  ],
  paymentMethod: [
    { required: true, message: '请选择支付方式', trigger: 'change' }
  ]
});

const rechargeFormRef = ref(null);
const loading = ref(false);

// 充值记录
const rechargeRecords = ref([]);
const statusFilter = ref('');
const dateRange = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);

// 详情对话框
const dialogVisible = ref(false);
const currentRecharge = ref({});

// 加载充值记录
const loadRechargeRecords = () => {
  // 模拟充值记录数据
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  
  rechargeRecords.value = [
    {
      id: 'recharge_001',
      amount: 500,
      paymentMethod: 'wechat',
      status: 'success',
      createTime: yesterday.toISOString(),
      transactionId: 'wx' + Date.now(),
      remark: '微信支付成功'
    },
    {
      id: 'recharge_002',
      amount: 200,
      paymentMethod: 'alipay',
      status: 'success',
      createTime: twoDaysAgo.toISOString(),
      transactionId: 'ali' + Date.now(),
      remark: '支付宝支付成功'
    },
    {
      id: 'recharge_003',
      amount: 100,
      paymentMethod: 'bank',
      status: 'processing',
      createTime: now.toISOString(),
      transactionId: null,
      remark: '银行转账处理中'
    }
  ];
};

// 过滤后的记录
const filteredRecords = computed(() => {
  let result = [...rechargeRecords.value];
  
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
      const recordDate = new Date(record.createTime);
      return recordDate >= startDate && recordDate <= endDate;
    });
  }
  
  return result;
});

// 分页记录
const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredRecords.value.slice(start, end);
});

// 提交充值
const submitRecharge = () => {
  rechargeFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true;
      
      // 模拟充值提交
      setTimeout(() => {
        const newRecharge = {
          id: 'recharge_' + Date.now(),
          amount: rechargeForm.value.amount,
          paymentMethod: rechargeForm.value.paymentMethod,
          status: 'success',
          createTime: new Date().toISOString(),
          transactionId: rechargeForm.value.paymentMethod + Date.now(),
          remark: '充值成功'
        };
        
        rechargeRecords.value.unshift(newRecharge);
        
        // 显示成功消息
        ElMessage({
          message: '充值提交成功',
          type: 'success'
        });
        
        // 重置表单
        resetForm();
        loading.value = false;
      }, 1000);
    }
  });
};

// 重置表单
const resetForm = () => {
  rechargeFormRef.value.resetFields();
  rechargeForm.value.amount = 100;
  rechargeForm.value.paymentMethod = 'wechat';
};

// 查看详情
const viewDetails = (record) => {
  currentRecharge.value = { ...record };
  dialogVisible.value = true;
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
    'success': 'success',
    'processing': 'warning',
    'failed': 'danger'
  };
  return types[status] || '';
};

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    'success': '成功',
    'processing': '处理中',
    'failed': '失败'
  };
  return texts[status] || status;
};

// 组件挂载时加载数据
onMounted(() => {
  loadRechargeRecords();
});
</script>

<style scoped>
.recharge-container {
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

.mt-4 {
  margin-top: 20px;
}
</style>
