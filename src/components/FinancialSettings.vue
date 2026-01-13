<template>
  <div class="financial-settings">
    <h2>财务设置</h2>
    <p>负责人功能：管理财务相关设置</p>
    
    <!-- 操作按钮 -->
    <el-card shadow="hover" class="action-card">
      <div class="action-buttons">
        <el-button type="primary" @click="saveAllSettings">
          <el-icon><Check /></el-icon>
          保存所有设置
        </el-button>
        <el-button type="warning" @click="resetSettings">
          <el-icon><Refresh /></el-icon>
          重置为默认值
        </el-button>
        <el-button type="info" @click="exportSettings">
          <el-icon><Download /></el-icon>
          导出设置
        </el-button>
        <el-button @click="importSettings">
          <el-icon><Upload /></el-icon>
          导入设置
        </el-button>
      </div>
    </el-card>
    
    <!-- 基本财务设置 -->
    <el-card shadow="hover" class="settings-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>基本财务设置</span>
          <el-switch v-model="settings.basic.enableFinanceSystem" inline-prompt active-text="启用" inactive-text="禁用" />
        </div>
      </template>
      
      <el-form :model="settings.basic" label-width="150px">
        <el-form-item label="默认货币符号">
          <el-input v-model="settings.basic.currencySymbol" placeholder="例如：¥" style="width: 200px;" />
        </el-form-item>
        
        <el-form-item label="默认税率(%)">
          <el-input-number v-model="settings.basic.taxRate" :min="0" :max="100" :step="0.1" style="width: 200px;" />
        </el-form-item>
        
        <el-form-item label="小数位数">
          <el-select v-model="settings.basic.decimalPlaces" style="width: 200px;">
            <el-option label="0位" value="0" />
            <el-option label="1位" value="1" />
            <el-option label="2位" value="2" />
            <el-option label="3位" value="3" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="财务年度开始月份">
          <el-select v-model="settings.basic.fiscalYearStartMonth" style="width: 200px;">
            <el-option label="1月" value="1" />
            <el-option label="2月" value="2" />
            <el-option label="3月" value="3" />
            <el-option label="4月" value="4" />
            <el-option label="5月" value="5" />
            <el-option label="6月" value="6" />
            <el-option label="7月" value="7" />
            <el-option label="8月" value="8" />
            <el-option label="9月" value="9" />
            <el-option label="10月" value="10" />
            <el-option label="11月" value="11" />
            <el-option label="12月" value="12" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="启用预算控制">
          <el-switch v-model="settings.basic.enableBudgetControl" />
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 费用类别设置 -->
    <el-card shadow="hover" class="settings-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>费用类别设置</span>
          <el-button size="small" type="primary" @click="addExpenseCategory">
            <el-icon><Plus /></el-icon>
            添加类别
          </el-button>
        </div>
      </template>
      
      <el-table :data="settings.expenseCategories" style="width: 100%;" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="类别名称" min-width="150">
          <template #default="scope">
            <el-input v-model="scope.row.name" placeholder="输入类别名称" />
          </template>
        </el-table-column>
        <el-table-column prop="code" label="类别编码" width="120">
          <template #default="scope">
            <el-input v-model="scope.row.code" placeholder="输入编码" />
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200">
          <template #default="scope">
            <el-input v-model="scope.row.description" placeholder="输入描述" />
          </template>
        </el-table-column>
        <el-table-column prop="isActive" label="状态" width="100">
          <template #default="scope">
            <el-switch v-model="scope.row.isActive" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <el-button size="small" type="danger" @click="deleteExpenseCategory(scope.row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 收入类别设置 -->
    <el-card shadow="hover" class="settings-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>收入类别设置</span>
          <el-button size="small" type="primary" @click="addIncomeCategory">
            <el-icon><Plus /></el-icon>
            添加类别
          </el-button>
        </div>
      </template>
      
      <el-table :data="settings.incomeCategories" style="width: 100%;" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="类别名称" min-width="150">
          <template #default="scope">
            <el-input v-model="scope.row.name" placeholder="输入类别名称" />
          </template>
        </el-table-column>
        <el-table-column prop="code" label="类别编码" width="120">
          <template #default="scope">
            <el-input v-model="scope.row.code" placeholder="输入编码" />
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200">
          <template #default="scope">
            <el-input v-model="scope.row.description" placeholder="输入描述" />
          </template>
        </el-table-column>
        <el-table-column prop="isActive" label="状态" width="100">
          <template #default="scope">
            <el-switch v-model="scope.row.isActive" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <el-button size="small" type="danger" @click="deleteIncomeCategory(scope.row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 支付方式设置 -->
    <el-card shadow="hover" class="settings-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>支付方式设置</span>
          <el-button size="small" type="primary" @click="addPaymentMethod">
            <el-icon><Plus /></el-icon>
            添加支付方式
          </el-button>
        </div>
      </template>
      
      <el-table :data="settings.paymentMethods" style="width: 100%;" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="支付方式名称" min-width="150">
          <template #default="scope">
            <el-input v-model="scope.row.name" placeholder="输入支付方式名称" />
          </template>
        </el-table-column>
        <el-table-column prop="code" label="编码" width="120">
          <template #default="scope">
            <el-input v-model="scope.row.code" placeholder="输入编码" />
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200">
          <template #default="scope">
            <el-input v-model="scope.row.description" placeholder="输入描述" />
          </template>
        </el-table-column>
        <el-table-column prop="isActive" label="状态" width="100">
          <template #default="scope">
            <el-switch v-model="scope.row.isActive" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <el-button size="small" type="danger" @click="deletePaymentMethod(scope.row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 财务审批设置 -->
    <el-card shadow="hover" class="settings-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>财务审批设置</span>
          <el-switch v-model="settings.approval.enableApproval" inline-prompt active-text="启用" inactive-text="禁用" />
        </div>
      </template>
      
      <el-form :model="settings.approval" label-width="150px">
        <el-form-item label="启用多级审批">
          <el-switch v-model="settings.approval.enableMultiLevelApproval" />
        </el-form-item>
        
        <el-form-item label="审批流程级别" v-if="settings.approval.enableMultiLevelApproval">
          <el-input-number v-model="settings.approval.approvalLevels" :min="1" :max="5" style="width: 200px;" />
        </el-form-item>
        
        <el-form-item label="默认审批人">
          <el-select v-model="settings.approval.defaultApprover" placeholder="选择默认审批人" style="width: 300px;">
            <el-option label="管理员" value="admin" />
            <el-option label="财务主管" value="finance_manager" />
            <el-option label="实验室主任" value="lab_director" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="审批超时天数">
          <el-input-number v-model="settings.approval.approvalTimeoutDays" :min="1" :max="30" style="width: 200px;" />
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 预算设置 -->
    <el-card shadow="hover" class="settings-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>预算设置</span>
          <el-switch v-model="settings.budget.enableBudget" inline-prompt active-text="启用" inactive-text="禁用" />
        </div>
      </template>
      
      <el-form :model="settings.budget" label-width="150px">
        <el-form-item label="预算编制周期">
          <el-select v-model="settings.budget.budgetCycle" style="width: 200px;">
            <el-option label="月度" value="monthly" />
            <el-option label="季度" value="quarterly" />
            <el-option label="年度" value="annual" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="预算预警阈值(%)">
          <el-input-number v-model="settings.budget.budgetWarningThreshold" :min="0" :max="100" style="width: 200px;" />
        </el-form-item>
        
        <el-form-item label="预算超支控制">
          <el-select v-model="settings.budget.overBudgetControl" style="width: 300px;">
            <el-option label="允许超支" value="allow" />
            <el-option label="警告但允许" value="warn" />
            <el-option label="严格禁止" value="forbid" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { 
  Check, 
  Refresh, 
  Download, 
  Upload, 
  Plus 
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus';

// 财务设置数据
const settings = reactive({
  basic: {
    enableFinanceSystem: true,
    currencySymbol: '¥',
    taxRate: 13,
    decimalPlaces: 2,
    fiscalYearStartMonth: 1,
    enableBudgetControl: true
  },
  expenseCategories: [
    { id: 1, name: '设备采购', code: 'EQP', description: '实验室设备采购费用', isActive: true },
    { id: 2, name: '设备维修', code: 'MNT', description: '设备维修和保养费用', isActive: true },
    { id: 3, name: '实验耗材', code: 'MAT', description: '实验材料和耗材费用', isActive: true },
    { id: 4, name: '水电费', code: 'UTI', description: '实验室水电费用', isActive: true },
    { id: 5, name: '其他费用', code: 'OTH', description: '其他杂项费用', isActive: true }
  ],
  incomeCategories: [
    { id: 1, name: '设备使用费', code: 'USE_FEE', description: '对外设备使用收费', isActive: true },
    { id: 2, name: '实验服务费', code: 'SVC_FEE', description: '提供实验服务收费', isActive: true },
    { id: 3, name: '合作项目', code: 'COOP', description: '与外部合作项目经费', isActive: true },
    { id: 4, name: '其他收入', code: 'OTH_INC', description: '其他收入来源', isActive: true }
  ],
  paymentMethods: [
    { id: 1, name: '银行转账', code: 'BANK', description: '银行转账支付', isActive: true },
    { id: 2, name: '现金', code: 'CASH', description: '现金支付', isActive: true },
    { id: 3, name: '支票', code: 'CHECK', description: '支票支付', isActive: true },
    { id: 4, name: '在线支付', code: 'ONLINE', description: '在线支付平台', isActive: true }
  ],
  approval: {
    enableApproval: true,
    enableMultiLevelApproval: false,
    approvalLevels: 1,
    defaultApprover: 'finance_manager',
    approvalTimeoutDays: 7
  },
  budget: {
    enableBudget: true,
    budgetCycle: 'annual',
    budgetWarningThreshold: 80,
    overBudgetControl: 'warn'
  }
});

// 保存所有设置
const saveAllSettings = () => {
  ElMessageBox.confirm('确定要保存所有财务设置吗？', '保存确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟保存操作
    setTimeout(() => {
      ElMessage.success('所有设置保存成功');
      ElNotification({
        title: '保存成功',
        message: '财务设置已成功保存',
        type: 'success',
        duration: 3000
      });
    }, 1000);
  }).catch(() => {});
};

// 重置为默认值
const resetSettings = () => {
  ElMessageBox.confirm('确定要将所有设置重置为默认值吗？', '重置确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'danger'
  }).then(() => {
    // 重置为默认值
    Object.assign(settings, {
      basic: {
        enableFinanceSystem: true,
        currencySymbol: '¥',
        taxRate: 13,
        decimalPlaces: 2,
        fiscalYearStartMonth: 1,
        enableBudgetControl: true
      },
      approval: {
        enableApproval: true,
        enableMultiLevelApproval: false,
        approvalLevels: 1,
        defaultApprover: 'finance_manager',
        approvalTimeoutDays: 7
      },
      budget: {
        enableBudget: true,
        budgetCycle: 'annual',
        budgetWarningThreshold: 80,
        overBudgetControl: 'warn'
      }
    });
    ElMessage.success('设置已重置为默认值');
  }).catch(() => {});
};

// 导出设置
const exportSettings = () => {
  setTimeout(() => {
    ElMessage.success('设置导出成功');
  }, 1000);
};

// 导入设置
const importSettings = () => {
  ElMessageBox.confirm('确定要导入设置吗？这将覆盖当前所有设置。', '导入确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    setTimeout(() => {
      ElMessage.success('设置导入成功');
    }, 1000);
  }).catch(() => {});
};

// 添加费用类别
const addExpenseCategory = () => {
  const newCategory = {
    id: settings.expenseCategories.length + 1,
    name: '',
    code: '',
    description: '',
    isActive: true
  };
  settings.expenseCategories.push(newCategory);
};

// 删除费用类别
const deleteExpenseCategory = (id) => {
  const index = settings.expenseCategories.findIndex(cat => cat.id === id);
  if (index !== -1) {
    settings.expenseCategories.splice(index, 1);
    ElMessage.success('费用类别删除成功');
  }
};

// 添加收入类别
const addIncomeCategory = () => {
  const newCategory = {
    id: settings.incomeCategories.length + 1,
    name: '',
    code: '',
    description: '',
    isActive: true
  };
  settings.incomeCategories.push(newCategory);
};

// 删除收入类别
const deleteIncomeCategory = (id) => {
  const index = settings.incomeCategories.findIndex(cat => cat.id === id);
  if (index !== -1) {
    settings.incomeCategories.splice(index, 1);
    ElMessage.success('收入类别删除成功');
  }
};

// 添加支付方式
const addPaymentMethod = () => {
  const newMethod = {
    id: settings.paymentMethods.length + 1,
    name: '',
    code: '',
    description: '',
    isActive: true
  };
  settings.paymentMethods.push(newMethod);
};

// 删除支付方式
const deletePaymentMethod = (id) => {
  const index = settings.paymentMethods.findIndex(method => method.id === id);
  if (index !== -1) {
    settings.paymentMethods.splice(index, 1);
    ElMessage.success('支付方式删除成功');
  }
};

// 初始化
onMounted(() => {
  ElNotification({
    title: '财务设置',
    message: '欢迎使用财务设置管理功能',
    type: 'info',
    duration: 3000
  });
});
</script>

<style scoped>
.financial-settings {
  padding: 20px;
}

.action-card {
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.settings-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-form {
  margin-top: 20px;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-table {
  margin-top: 20px;
}

@media (max-width: 768px) {
  .financial-settings {
    padding: 10px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .el-form {
    margin-top: 10px;
  }
}
</style>