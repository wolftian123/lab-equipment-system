<template>
  <div class="billing">
    <h2>计费管理</h2>
    <p>管理员功能：管理设备使用计费规则和费用记录</p>
    
    <!-- 标签页切换 -->
    <el-tabs v-model="activeTab" class="billing-tabs">
      <!-- 计费规则 -->
      <el-tab-pane label="计费规则" name="rules">
        <div class="rules-section">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>计费规则管理</span>
                <el-button type="primary" @click="openRuleDialog">
                  <el-icon><Plus /></el-icon>
                  添加规则
                </el-button>
              </div>
            </template>
            
            <!-- 规则列表 -->
            <el-table :data="billingRules" style="width: 100%;" stripe>
              <el-table-column prop="id" label="规则ID" width="100" />
              <el-table-column prop="equipmentType" label="设备类型" width="150" />
              <el-table-column prop="rate" label="费率(元/小时)" width="120" />
              <el-table-column prop="minHours" label="最低计费小时" width="120" />
              <el-table-column prop="discountRate" label="折扣率" width="100" v-if="false">
                <template #default="scope">
                  {{ (scope.row.discountRate * 100).toFixed(0) }}%
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
                    {{ scope.row.status === 'active' ? '启用' : '禁用' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createdAt" label="创建时间" width="180" />
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="scope">
                  <el-button size="small" @click="editRule(scope.row)">编辑</el-button>
                  <el-button 
                    size="small" 
                    :type="scope.row.status === 'active' ? 'warning' : 'success'"
                    @click="toggleRuleStatus(scope.row)"
                  >
                    {{ scope.row.status === 'active' ? '禁用' : '启用' }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </el-tab-pane>
      
      <!-- 费用记录 -->
      <el-tab-pane label="费用记录" name="records">
        <div class="records-section">
          <!-- 操作栏 -->
          <div class="action-bar">
            <el-input
              v-model="searchQuery"
              placeholder="搜索设备名称、用户"
              clearable
              style="width: 300px; margin-right: 10px;"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            
            <el-select v-model="statusFilter" placeholder="状态筛选" clearable style="width: 150px; margin-right: 10px;">
              <el-option label="未支付" value="unpaid" />
              <el-option label="已支付" value="paid" />
              <el-option label="已退款" value="refunded" />
            </el-select>
            
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 250px;"
            />
          </div>
          
          <!-- 记录列表 -->
          <el-table :data="filteredRecords" style="width: 100%; margin-top: 20px;" stripe>
            <el-table-column prop="id" label="记录ID" width="120" />
            <el-table-column prop="equipmentName" label="设备名称" min-width="180" />
            <el-table-column prop="userName" label="使用人" width="120" />
            <el-table-column prop="usageHours" label="使用时长(小时)" width="120" />
            <el-table-column prop="rate" label="费率(元/小时)" width="120" />
            <el-table-column prop="totalAmount" label="总金额(元)" width="120">
              <template #default="scope">
                ¥{{ scope.row.totalAmount.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusTagType(scope.row.status)">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="usageDate" label="使用日期" width="180" />
            <el-table-column prop="paymentDate" label="支付日期" width="180" v-if="false" />
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="scope">
                <el-button size="small" @click="viewRecordDetail(scope.row)">查看</el-button>
                <el-button 
                  size="small" 
                  type="primary" 
                  @click="processPayment(scope.row)"
                  v-if="scope.row.status === 'unpaid'"
                >
                  处理支付
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 分页 -->
          <div class="pagination" style="margin-top: 20px;">
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
        </div>
      </el-tab-pane>
      
      <!-- 统计分析 -->
      <el-tab-pane label="统计分析" name="analysis">
        <div class="analysis-section">
          <el-card shadow="hover">
            <template #header>
              <span>费用统计分析</span>
            </template>
            
            <!-- 统计卡片 -->
            <div class="stats-cards">
              <el-card shadow="hover" class="stat-card">
                <div class="stat-info">
                  <div class="stat-value">¥{{ totalRevenue.toFixed(2) }}</div>
                  <div class="stat-label">总收入</div>
                </div>
              </el-card>
              <el-card shadow="hover" class="stat-card">
                <div class="stat-info">
                  <div class="stat-value">{{ totalRecords }}</div>
                  <div class="stat-label">总记录数</div>
                </div>
              </el-card>
              <el-card shadow="hover" class="stat-card">
                <div class="stat-info">
                  <div class="stat-value">{{ pendingPayments }}</div>
                  <div class="stat-label">待支付</div>
                </div>
              </el-card>
              <el-card shadow="hover" class="stat-card">
                <div class="stat-info">
                  <div class="stat-value">¥{{ averageAmount.toFixed(2) }}</div>
                  <div class="stat-label">平均金额</div>
                </div>
              </el-card>
            </div>
            
            <!-- 图表 -->
            <div class="charts-container">
              <el-card shadow="hover" class="chart-card">
                <template #header>
                  <span>月度收入趋势</span>
                </template>
                <div class="chart" id="revenueChart" style="height: 300px;"></div>
              </el-card>
              <el-card shadow="hover" class="chart-card">
                <template #header>
                  <span>设备类型收入分布</span>
                </template>
                <div class="chart" id="typeChart" style="height: 300px;"></div>
              </el-card>
            </div>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 规则编辑对话框 -->
    <el-dialog
      v-model="ruleDialogVisible"
      :title="ruleDialogTitle"
      width="500px"
    >
      <el-form :model="ruleForm" :rules="ruleRules" ref="ruleFormRef" label-width="120px">
        <el-form-item label="设备类型" prop="equipmentType">
          <el-input v-model="ruleForm.equipmentType" placeholder="请输入设备类型" />
        </el-form-item>
        <el-form-item label="费率(元/小时)" prop="rate">
          <el-input v-model.number="ruleForm.rate" type="number" placeholder="请输入费率" min="0" step="0.1" />
        </el-form-item>
        <el-form-item label="最低计费小时" prop="minHours">
          <el-input v-model.number="ruleForm.minHours" type="number" placeholder="请输入最低计费小时" min="0.1" step="0.1" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="ruleForm.status" placeholder="请选择状态">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="ruleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveRule">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 记录详情对话框 -->
    <el-dialog
      v-model="recordDialogVisible"
      title="费用记录详情"
      width="600px"
    >
      <div v-if="selectedRecord" class="record-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="记录ID">{{ selectedRecord.id }}</el-descriptions-item>
          <el-descriptions-item label="设备名称">{{ selectedRecord.equipmentName }}</el-descriptions-item>
          <el-descriptions-item label="设备类型">{{ selectedRecord.equipmentType }}</el-descriptions-item>
          <el-descriptions-item label="使用人">{{ selectedRecord.userName }}</el-descriptions-item>
          <el-descriptions-item label="使用日期">{{ selectedRecord.usageDate }}</el-descriptions-item>
          <el-descriptions-item label="使用时长">{{ selectedRecord.usageHours }}小时</el-descriptions-item>
          <el-descriptions-item label="费率">¥{{ selectedRecord.rate.toFixed(2) }}/小时</el-descriptions-item>
          <el-descriptions-item label="总金额">¥{{ selectedRecord.totalAmount.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ getStatusText(selectedRecord.status) }}</el-descriptions-item>
          <el-descriptions-item label="支付方式" v-if="selectedRecord.paymentMethod">
            {{ selectedRecord.paymentMethod }}
          </el-descriptions-item>
          <el-descriptions-item label="支付日期" v-if="selectedRecord.paymentDate">
            {{ selectedRecord.paymentDate }}
          </el-descriptions-item>
          <el-descriptions-item label="备注" v-if="selectedRecord.remark">
            {{ selectedRecord.remark }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="recordDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'

// 响应式数据
const activeTab = ref('rules')
const searchQuery = ref('')
const statusFilter = ref('')
const dateRange = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const billingRules = ref([])
const billingRecords = ref([])
const ruleDialogVisible = ref(false)
const recordDialogVisible = ref(false)
const selectedRecord = ref(null)
const ruleForm = ref({
  id: '',
  equipmentType: '',
  rate: 0,
  minHours: 1,
  status: 'active'
})
const ruleFormRef = ref(null)
const ruleDialogTitle = ref('')

// 表单验证规则
const ruleRules = {
  equipmentType: [{ required: true, message: '请输入设备类型', trigger: 'blur' }],
  rate: [{ required: true, message: '请输入费率', trigger: 'blur' }, { type: 'number', min: 0, message: '费率必须大于等于0', trigger: 'blur' }],
  minHours: [{ required: true, message: '请输入最低计费小时', trigger: 'blur' }, { type: 'number', min: 0.1, message: '最低计费小时必须大于0', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 过滤后的记录
const filteredRecords = computed(() => {
  let result = billingRecords.value
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(record => 
      record.equipmentName.toLowerCase().includes(query) || 
      record.userName.toLowerCase().includes(query)
    )
  }
  
  // 状态过滤
  if (statusFilter.value) {
    result = result.filter(record => record.status === statusFilter.value)
  }
  
  return result
})

// 统计数据
const totalRevenue = computed(() => {
  return billingRecords.value
    .filter(record => record.status === 'paid')
    .reduce((sum, record) => sum + record.totalAmount, 0)
})

const totalRecords = computed(() => billingRecords.value.length)

const pendingPayments = computed(() => {
  return billingRecords.value.filter(record => record.status === 'unpaid').length
})

const averageAmount = computed(() => {
  if (billingRecords.value.length === 0) return 0
  const total = billingRecords.value.reduce((sum, record) => sum + record.totalAmount, 0)
  return total / billingRecords.value.length
})

// 生命周期钩子
onMounted(() => {
  loadBillingRules()
  loadBillingRecords()
})

// 加载计费规则
function loadBillingRules() {
  // 模拟数据
  billingRules.value = [
    {
      id: 'rule_001',
      equipmentType: '光谱分析仪',
      rate: 50,
      minHours: 2,
      status: 'active',
      createdAt: '2024-01-01'
    },
    {
      id: 'rule_002',
      equipmentType: '电子显微镜',
      rate: 100,
      minHours: 1,
      status: 'active',
      createdAt: '2024-01-01'
    },
    {
      id: 'rule_003',
      equipmentType: '离心机',
      rate: 30,
      minHours: 1,
      status: 'inactive',
      createdAt: '2024-01-01'
    },
    {
      id: 'rule_004',
      equipmentType: '恒温培养箱',
      rate: 20,
      minHours: 4,
      status: 'active',
      createdAt: '2024-01-01'
    }
  ]
}

// 加载费用记录
function loadBillingRecords() {
  // 模拟数据
  billingRecords.value = [
    {
      id: 'bill_001',
      equipmentName: '高精度光谱分析仪',
      equipmentType: '光谱分析仪',
      userName: '李同学',
      usageHours: 3,
      rate: 50,
      totalAmount: 150,
      status: 'paid',
      usageDate: '2024-01-10',
      paymentMethod: '微信支付',
      paymentDate: '2024-01-10'
    },
    {
      id: 'bill_002',
      equipmentName: '电子显微镜',
      equipmentType: '电子显微镜',
      userName: '王老师',
      usageHours: 2,
      rate: 100,
      totalAmount: 200,
      status: 'unpaid',
      usageDate: '2024-01-11'
    },
    {
      id: 'bill_003',
      equipmentName: '恒温培养箱',
      equipmentType: '恒温培养箱',
      userName: '赵同学',
      usageHours: 5,
      rate: 20,
      totalAmount: 100,
      status: 'paid',
      usageDate: '2024-01-09',
      paymentMethod: '支付宝',
      paymentDate: '2024-01-09'
    },
    {
      id: 'bill_004',
      equipmentName: '高精度光谱分析仪',
      equipmentType: '光谱分析仪',
      userName: '刘同学',
      usageHours: 2,
      rate: 50,
      totalAmount: 100,
      status: 'unpaid',
      usageDate: '2024-01-12'
    }
  ]
}

// 打开规则对话框
function openRuleDialog() {
  ruleForm.value = {
    id: '',
    equipmentType: '',
    rate: 0,
    minHours: 1,
    status: 'active'
  }
  ruleDialogTitle.value = '添加计费规则'
  ruleDialogVisible.value = true
}

// 编辑规则
function editRule(rule) {
  ruleForm.value = { ...rule }
  ruleDialogTitle.value = '编辑计费规则'
  ruleDialogVisible.value = true
}

// 保存规则
function saveRule() {
  ruleFormRef.value?.validate((valid) => {
    if (valid) {
      ElMessageBox.confirm('确认保存规则吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        setTimeout(() => {
          if (ruleForm.value.id) {
            // 更新规则
            const index = billingRules.value.findIndex(r => r.id === ruleForm.value.id)
            if (index !== -1) {
              billingRules.value[index] = { ...ruleForm.value }
            }
          } else {
            // 添加规则
            const newRule = {
              ...ruleForm.value,
              id: 'rule_' + Date.now(),
              createdAt: new Date().toLocaleDateString()
            }
            billingRules.value.push(newRule)
          }
          ElMessage.success('规则保存成功')
          ruleDialogVisible.value = false
        }, 1000)
      }).catch(() => {
        // 取消操作
      })
    } else {
      ElMessage.error('请填写完整的规则信息')
      return false
    }
  })
}

// 切换规则状态
function toggleRuleStatus(rule) {
  const newStatus = rule.status === 'active' ? 'inactive' : 'active'
  ElMessageBox.confirm(`确认${newStatus === 'active' ? '启用' : '禁用'}该规则吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    setTimeout(() => {
      rule.status = newStatus
      ElMessage.success(`规则已${newStatus === 'active' ? '启用' : '禁用'}`)
    }, 1000)
  }).catch(() => {
    // 取消操作
  })
}

// 查看记录详情
function viewRecordDetail(record) {
  selectedRecord.value = record
  recordDialogVisible.value = true
}

// 处理支付
function processPayment(record) {
  ElMessageBox.confirm('确认标记该记录为已支付吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    setTimeout(() => {
      record.status = 'paid'
      record.paymentDate = new Date().toLocaleDateString()
      record.paymentMethod = '系统处理'
      ElMessage.success('支付处理成功')
    }, 1000)
  }).catch(() => {
    // 取消操作
  })
}

// 获取状态文本
function getStatusText(status) {
  const statusMap = {
    unpaid: '未支付',
    paid: '已支付',
    refunded: '已退款'
  }
  return statusMap[status] || status
}

// 获取状态标签类型
function getStatusTagType(status) {
  const statusMap = {
    unpaid: 'warning',
    paid: 'success',
    refunded: 'danger'
  }
  return statusMap[status] || 'default'
}

// 分页处理
function handleSizeChange(size) {
  pageSize.value = size
  currentPage.value = 1
}

function handleCurrentChange(current) {
  currentPage.value = current
}
</script>

<style scoped>
.billing {
  padding: 20px;
}

.billing-tabs {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  text-align: center;
}

.stat-info {
  padding: 20px 0;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.chart-card {
  height: 350px;
}

.chart {
  width: 100%;
  height: 100%;
}

.record-detail {
  max-height: 500px;
  overflow-y: auto;
}
</style>