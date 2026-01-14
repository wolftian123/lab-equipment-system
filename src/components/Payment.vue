<template>
  <div class="payment-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>在线缴费</span>
        </div>
      </template>
      
      <!-- 待缴费订单列表 -->
      <div class="order-section">
        <h3 class="section-title">待缴费订单</h3>
        
        <el-table 
          :data="pendingOrders" 
          style="width: 100%; margin-top: 20px;"
          border
          stripe
        >
          <el-table-column prop="orderId" label="订单编号" width="150" />
          <el-table-column prop="reservationId" label="预约编号" width="150" />
          <el-table-column prop="equipmentName" label="设备名称" min-width="180" />
          <el-table-column prop="reservationTime" label="使用时间" min-width="180" />
          <el-table-column prop="duration" label="使用时长" width="100">
            <template #default="scope">
              <span>{{ scope.row.duration }} 小时</span>
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="应付金额" width="120">
            <template #default="scope">
              <span class="amount">{{ scope.row.amount.toFixed(2) }} 元</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="scope">
              <el-button 
                size="small" 
                type="primary" 
                @click="payOrder(scope.row)"
              >
                立即缴费
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 无订单提示 -->
        <div v-if="pendingOrders.length === 0" class="empty-state">
          <el-empty 
            description="暂无待缴费订单" 
            image-size="120"
          >
            <el-button type="primary" @click="goToReservation">去预约设备</el-button>
          </el-empty>
        </div>
      </div>
    </el-card>
    
    <!-- 缴费确认对话框 -->
    <el-dialog
      v-model="payDialogVisible"
      title="缴费确认"
      width="500px"
    >
      <el-form :model="currentOrder" label-width="100px" class="pay-form">
        <el-form-item label="订单编号">
          <span>{{ currentOrder.orderId }}</span>
        </el-form-item>
        <el-form-item label="预约编号">
          <span>{{ currentOrder.reservationId }}</span>
        </el-form-item>
        <el-form-item label="设备名称">
          <span>{{ currentOrder.equipmentName }}</span>
        </el-form-item>
        <el-form-item label="使用时间">
          <span>{{ currentOrder.reservationTime }}</span>
        </el-form-item>
        <el-form-item label="使用时长">
          <span>{{ currentOrder.duration }} 小时</span>
        </el-form-item>
        <el-form-item label="设备单价">
          <span>{{ currentOrder.unitPrice.toFixed(2) }} 元/小时</span>
        </el-form-item>
        <el-form-item label="应付金额">
          <span class="amount">{{ currentOrder.amount.toFixed(2) }} 元</span>
        </el-form-item>
        <el-form-item label="支付方式">
          <el-radio-group v-model="paymentMethod">
            <el-radio label="wechat">微信支付</el-radio>
            <el-radio label="alipay">支付宝</el-radio>
            <el-radio label="balance">余额支付</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="payDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmPayment" :loading="payLoading">
            确认缴费
          </el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 支付成功对话框 -->
    <el-dialog
      v-model="successDialogVisible"
      title="支付成功"
      width="400px"
      :close-on-click-modal="false"
    >
      <div class="success-content">
        <el-icon class="success-icon"><CircleCheck /></el-icon>
        <h3>支付成功</h3>
        <p>订单编号：{{ currentOrder.orderId }}</p>
        <p>支付金额：{{ currentOrder.amount.toFixed(2) }} 元</p>
        <p>支付方式：{{ getPaymentMethodText(paymentMethod) }}</p>
        <p>支付时间：{{ formatDate(new Date()) }}</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="successDialogVisible = false; loadPendingOrders()">
            查看缴费记录
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const router = useRouter();

// 待缴费订单
const pendingOrders = ref([]);
const payDialogVisible = ref(false);
const successDialogVisible = ref(false);
const currentOrder = ref({});
const paymentMethod = ref('wechat');
const payLoading = ref(false);

// 加载待缴费订单
const loadPendingOrders = () => {
  // 模拟待缴费订单数据
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  pendingOrders.value = [
    {
      orderId: 'order_' + Date.now(),
      reservationId: 'res_' + Date.now(),
      equipmentName: '电子显微镜',
      equipmentModel: 'SEM-1000',
      duration: 2,
      unitPrice: 50,
      amount: 100,
      reservationTime: tomorrow.toLocaleDateString('zh-CN') + ' 10:00-12:00',
      status: 'unpaid',
      createTime: now.toISOString()
    },
    {
      orderId: 'order_' + (Date.now() + 1),
      reservationId: 'res_' + (Date.now() + 1),
      equipmentName: '激光切割机',
      equipmentModel: 'Laser-3000',
      duration: 3,
      unitPrice: 60,
      amount: 180,
      reservationTime: tomorrow.toLocaleDateString('zh-CN') + ' 14:00-17:00',
      status: 'unpaid',
      createTime: now.toISOString()
    }
  ];
};

// 打开缴费对话框
const payOrder = (order) => {
  currentOrder.value = { ...order };
  paymentMethod.value = 'wechat';
  payDialogVisible.value = true;
};

// 确认支付
const confirmPayment = () => {
  payLoading.value = true;
  
  // 模拟支付过程
  setTimeout(() => {
    // 检查余额支付
    if (paymentMethod.value === 'balance') {
      // 模拟余额不足
      const mockBalance = 50;
      if (mockBalance < currentOrder.value.amount) {
        ElMessage.error('余额不足，请选择其他支付方式');
        payLoading.value = false;
        return;
      }
    }
    
    // 支付成功
    payLoading.value = false;
    payDialogVisible.value = false;
    successDialogVisible.value = true;
    
    // 从待缴费列表中移除
    pendingOrders.value = pendingOrders.value.filter(
      order => order.orderId !== currentOrder.value.orderId
    );
  }, 1500);
};

// 跳转到预约页面
const goToReservation = () => {
  router.push('/main/reservation/apply');
};

// 获取支付方式文本
const getPaymentMethodText = (method) => {
  const methods = {
    'wechat': '微信支付',
    'alipay': '支付宝',
    'balance': '余额支付'
  };
  return methods[method] || method;
};

// 格式化日期
const formatDate = (date) => {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// 组件挂载时加载数据
onMounted(() => {
  loadPendingOrders();
});
</script>

<style scoped>
.payment-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #333;
}

.amount {
  font-weight: bold;
  color: #ff4d4f;
}

.empty-state {
  margin-top: 40px;
  margin-bottom: 40px;
}

.pay-form {
  max-height: 400px;
  overflow-y: auto;
}

.success-content {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  font-size: 64px;
  color: #67c23a;
  margin-bottom: 20px;
}

.success-content h3 {
  margin-bottom: 20px;
  color: #333;
}

.success-content p {
  margin-bottom: 10px;
  color: #666;
}

.dialog-footer {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}
</style>
