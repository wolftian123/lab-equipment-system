<template>
  <div class="equipment-audit">
    <h2>设备审批</h2>
    <p>管理员功能：审批设备相关申请</p>
    
    <!-- 操作栏 -->
    <div class="action-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索设备名称、申请人"
        clearable
        style="width: 300px; margin-right: 10px;"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      
      <el-select v-model="statusFilter" placeholder="状态筛选" clearable style="width: 150px; margin-right: 10px;">
        <el-option label="待审批" value="pending" />
        <el-option label="已通过" value="approved" />
        <el-option label="已拒绝" value="rejected" />
      </el-select>
      
      <el-select v-model="typeFilter" placeholder="类型筛选" clearable style="width: 150px;">
        <el-option label="设备申购" value="purchase" />
        <el-option label="设备维修" value="repair" />
        <el-option label="设备报废" value="scrap" />
      </el-select>
    </div>
    
    <!-- 审批列表 -->
    <el-table :data="paginatedApplications" style="width: 100%; margin-top: 20px;" stripe>
      <el-table-column prop="id" label="申请编号" width="150" />
      <el-table-column prop="equipmentName" label="设备名称" min-width="180" />
      <el-table-column prop="applicant" label="申请人" width="120" />
      <el-table-column prop="department" label="所属部门" width="150" />
      <el-table-column prop="type" label="申请类型" width="120">
        <template #default="scope">
          <el-tag :type="getTypeTagType(scope.row.type)">
            {{ getTypeText(scope.row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="applyDate" label="申请日期" width="180" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="viewDetail(scope.row)">查看详情</el-button>
          <template v-if="scope.row.status === 'pending'">
            <el-button size="small" type="success" @click="approveApplication(scope.row)">通过</el-button>
            <el-button size="small" type="danger" @click="rejectApplication(scope.row)">拒绝</el-button>
          </template>
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
        :total="filteredApplications.length"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    
    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="申请详情"
      width="600px"
    >
      <div v-if="selectedApplication" class="application-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="申请编号">{{ selectedApplication.id }}</el-descriptions-item>
          <el-descriptions-item label="设备名称">{{ selectedApplication.equipmentName }}</el-descriptions-item>
          <el-descriptions-item label="设备型号">{{ selectedApplication.equipmentModel }}</el-descriptions-item>
          <el-descriptions-item label="申请类型">{{ getTypeText(selectedApplication.type) }}</el-descriptions-item>
          <el-descriptions-item label="申请人">{{ selectedApplication.applicant }}</el-descriptions-item>
          <el-descriptions-item label="所属部门">{{ selectedApplication.department }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ selectedApplication.contactPhone }}</el-descriptions-item>
          <el-descriptions-item label="申请日期">{{ selectedApplication.applyDate }}</el-descriptions-item>
          <el-descriptions-item label="申请原因">{{ selectedApplication.reason }}</el-descriptions-item>
          <el-descriptions-item label="申请金额" v-if="selectedApplication.amount">
            ¥{{ selectedApplication.amount.toFixed(2) }}
          </el-descriptions-item>
          <el-descriptions-item label="审批状态">{{ getStatusText(selectedApplication.status) }}</el-descriptions-item>
          <el-descriptions-item label="审批意见" v-if="selectedApplication.approvalComment">
            {{ selectedApplication.approvalComment }}
          </el-descriptions-item>
          <el-descriptions-item label="审批时间" v-if="selectedApplication.approvalDate">
            {{ selectedApplication.approvalDate }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 审批对话框 -->
    <el-dialog
      v-model="approvalDialogVisible"
      :title="approvalDialogTitle"
      width="500px"
    >
      <el-form :model="approvalForm" :rules="approvalRules" ref="approvalFormRef" label-width="80px">
        <el-form-item label="审批意见" prop="comment">
          <el-input
            v-model="approvalForm.comment"
            type="textarea"
            placeholder="请输入审批意见"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="approvalDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitApproval">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

// 响应式数据
const searchQuery = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const applications = ref([])
const detailDialogVisible = ref(false)
const approvalDialogVisible = ref(false)
const selectedApplication = ref(null)
const approvalForm = ref({
  comment: ''
})
const approvalFormRef = ref(null)
const approvalType = ref('')
const approvalDialogTitle = ref('')

// 表单验证规则
const approvalRules = {
  comment: [{ required: true, message: '请输入审批意见', trigger: 'blur' }]
}

// 过滤后的申请列表
const filteredApplications = computed(() => {
  let result = applications.value
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(app => 
      app.equipmentName.toLowerCase().includes(query) || 
      app.applicant.toLowerCase().includes(query)
    )
  }
  
  // 状态过滤
  if (statusFilter.value) {
    result = result.filter(app => app.status === statusFilter.value)
  }
  
  // 类型过滤
  if (typeFilter.value) {
    result = result.filter(app => app.type === typeFilter.value)
  }
  
  return result
})

// 分页后的申请列表
const paginatedApplications = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredApplications.value.slice(start, end)
})

// 生命周期钩子
onMounted(() => {
  loadApplications()
})

// 加载申请数据
function loadApplications() {
  // 模拟数据
  applications.value = [
    {
      id: 'audit_001',
      equipmentName: '高精度光谱分析仪',
      equipmentModel: 'SpectraPro-5000',
      type: 'purchase',
      status: 'pending',
      applicant: '张教授',
      department: '物理实验室',
      contactPhone: '13800138001',
      applyDate: '2024-01-10',
      reason: '现有设备老化，需要更新高精度分析设备以满足科研需求',
      amount: 150000.00
    },
    {
      id: 'audit_002',
      equipmentName: '电子显微镜',
      equipmentModel: 'EM-2000',
      type: 'repair',
      status: 'pending',
      applicant: '李老师',
      department: '生物实验室',
      contactPhone: '13800138002',
      applyDate: '2024-01-09',
      reason: '设备镜头损坏，需要更换新的镜头组件',
      amount: 25000.00
    },
    {
      id: 'audit_003',
      equipmentName: '旧版离心机',
      equipmentModel: 'Centri-1000',
      type: 'scrap',
      status: 'approved',
      applicant: '王老师',
      department: '化学实验室',
      contactPhone: '13800138003',
      applyDate: '2024-01-08',
      reason: '设备已使用超过10年，故障率高，维修成本大',
      approvalComment: '同意报废，建议尽快采购新设备',
      approvalDate: '2024-01-09'
    },
    {
      id: 'audit_004',
      equipmentName: '恒温培养箱',
      equipmentModel: 'Incubator-3000',
      type: 'purchase',
      status: 'rejected',
      applicant: '刘老师',
      department: '生物实验室',
      contactPhone: '13800138004',
      applyDate: '2024-01-07',
      reason: '实验需求增加，需要新增培养箱',
      amount: 18000.00,
      approvalComment: '预算不足，建议暂缓采购',
      approvalDate: '2024-01-08'
    }
  ]
}

// 获取类型文本
function getTypeText(type) {
  const typeMap = {
    purchase: '设备申购',
    repair: '设备维修',
    scrap: '设备报废'
  }
  return typeMap[type] || type
}

// 获取类型标签类型
function getTypeTagType(type) {
  const typeMap = {
    purchase: 'primary',
    repair: 'warning',
    scrap: 'danger'
  }
  return typeMap[type] || 'default'
}

// 获取状态文本
function getStatusText(status) {
  const statusMap = {
    pending: '待审批',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return statusMap[status] || status
}

// 获取状态标签类型
function getStatusTagType(status) {
  const statusMap = {
    pending: 'info',
    approved: 'success',
    rejected: 'danger'
  }
  return statusMap[status] || 'default'
}

// 查看详情
function viewDetail(application) {
  selectedApplication.value = application
  detailDialogVisible.value = true
}

// 审批通过
function approveApplication(application) {
  selectedApplication.value = application
  approvalType.value = 'approve'
  approvalDialogTitle.value = '审批通过'
  approvalForm.value.comment = ''
  approvalDialogVisible.value = true
}

// 审批拒绝
function rejectApplication(application) {
  selectedApplication.value = application
  approvalType.value = 'reject'
  approvalDialogTitle.value = '审批拒绝'
  approvalForm.value.comment = ''
  approvalDialogVisible.value = true
}

// 提交审批
function submitApproval() {
  approvalFormRef.value?.validate((valid) => {
    if (valid) {
      ElMessageBox.confirm(`确认${approvalType.value === 'approve' ? '通过' : '拒绝'}该申请吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        setTimeout(() => {
          // 更新申请状态
          const index = applications.value.findIndex(app => app.id === selectedApplication.value.id)
          if (index !== -1) {
            applications.value[index].status = approvalType.value === 'approve' ? 'approved' : 'rejected'
            applications.value[index].approvalComment = approvalForm.value.comment
            applications.value[index].approvalDate = new Date().toLocaleDateString()
          }
          
          ElMessage.success(`申请已${approvalType.value === 'approve' ? '通过' : '拒绝'}`)
          approvalDialogVisible.value = false
          detailDialogVisible.value = false
        }, 1000)
      }).catch(() => {
        // 取消操作
      })
    } else {
      ElMessage.error('请输入审批意见')
      return false
    }
  })
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
.equipment-audit {
  padding: 20px;
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

.application-detail {
  max-height: 500px;
  overflow-y: auto;
}
</style>