<template>
  <div class="approval-list">
    <h2>{{ getTitle() }}</h2>
    
    <!-- 操作栏 -->
    <div class="action-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索申请标题、申请人"
        clearable
        style="width: 300px; margin-right: 10px;"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      
      <el-select v-model="statusFilter" placeholder="筛选状态" clearable style="width: 150px; margin-right: 10px;">
        <el-option label="待审批" value="pending" />
        <el-option label="已通过" value="approved" />
        <el-option label="已拒绝" value="rejected" />
      </el-select>
      
      <el-button type="primary" @click="refreshList">
        <el-icon><Refresh /></el-icon>
        刷新列表
      </el-button>
    </div>
    
    <!-- 审批列表 -->
    <el-table :data="paginatedApplications" style="width: 100%; margin-top: 20px;">
      <el-table-column prop="id" label="申请ID" width="120" />
      <el-table-column prop="title" label="申请标题" min-width="200" />
      <el-table-column prop="applicant" label="申请人" width="120">
        <template #default="scope">
          {{ scope.row.applicant }}
        </template>
      </el-table-column>
      <el-table-column prop="applicantId" label="申请人ID" width="150" />
      <el-table-column prop="equipmentName" label="设备名称" min-width="180" />
      <el-table-column prop="applyTime" label="申请时间" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.applyTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="approvalTime" label="审批时间" width="180" v-if="approvalType.value === 'history'">
        <template #default="scope">
          {{ formatDate(scope.row.approvalTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="approvalBy" label="审批人" width="120" v-if="approvalType.value === 'history'">
        <template #default="scope">
          {{ scope.row.approvalBy }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag 
            :type="getStatusType(scope.row.status)"
          >
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="scope">
          <el-button 
            size="small" 
            type="primary" 
            @click="viewApplication(scope.row)"
            :disabled="scope.row.status !== 'pending'"
          >
            查看详情
          </el-button>
          <template v-if="scope.row.status === 'pending'">
            <el-button 
              size="small" 
              type="success" 
              @click="approveApplication(scope.row)"
            >
              通过
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="rejectApplication(scope.row)"
            >
              拒绝
            </el-button>
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
    
    <!-- 申请详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="currentApplication ? '申请详情' : '申请详情'"
      width="700px"
    >
      <div v-if="currentApplication" class="application-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="申请ID">{{ currentApplication.id }}</el-descriptions-item>
          <el-descriptions-item label="申请标题">{{ currentApplication.title }}</el-descriptions-item>
          <el-descriptions-item label="申请人">{{ currentApplication.applicant }}</el-descriptions-item>
          <el-descriptions-item label="申请人ID">{{ currentApplication.applicantId }}</el-descriptions-item>
          <el-descriptions-item label="设备名称">{{ currentApplication.equipmentName }}</el-descriptions-item>
          <el-descriptions-item label="设备ID">{{ currentApplication.equipmentId }}</el-descriptions-item>
          <el-descriptions-item label="申请时间">{{ formatDate(currentApplication.applyTime) }}</el-descriptions-item>
          <el-descriptions-item label="申请状态">{{ getStatusText(currentApplication.status) }}</el-descriptions-item>
          <el-descriptions-item label="审批时间" v-if="currentApplication.approvalTime">{{ formatDate(currentApplication.approvalTime) }}</el-descriptions-item>
          <el-descriptions-item label="审批人" v-if="currentApplication.approvalBy">{{ currentApplication.approvalBy }}</el-descriptions-item>
          <el-descriptions-item label="预约时间" :span="2" v-if="currentApplication.reservationTime">
            {{ formatDate(currentApplication.reservationTime.start) }} 至 {{ formatDate(currentApplication.reservationTime.end) }}
          </el-descriptions-item>
          <el-descriptions-item label="申请理由" :span="2">
            {{ currentApplication.reason }}
          </el-descriptions-item>
          <el-descriptions-item label="审批意见" :span="2" v-if="currentApplication.approvalComment">
            {{ currentApplication.approvalComment }}
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
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'

// 响应式数据
const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const currentApplication = ref(null)
const applications = ref([])

// 从路由获取审批类型
import { useRoute } from 'vue-router'
const route = useRoute()
const approvalType = computed(() => route.meta.approvalType || 'student')

// 获取标题
const getTitle = () => {
  const titles = {
    student: '学生申请审批',
    teacher: '教师申请审批',
    external: '校外人员申请审批',
    history: '审批历史'
  }
  return titles[approvalType.value] || '审批管理'
}

// 生命周期钩子
onMounted(() => {
  loadApplications()
})

// 加载申请数据
function loadApplications() {
  // 模拟数据
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
  const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000)
  
  if (approvalType.value === 'student') {
    applications.value = [
      {
        id: 'app_stu_001',
        title: '实验设备使用申请',
        applicant: '张三',
        applicantId: '2023123456',
        equipmentName: '电子显微镜',
        equipmentId: 'eq_001',
        applyTime: yesterday.toISOString(),
        status: 'pending',
        reservationTime: {
          start: now.toISOString(),
          end: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString()
        },
        reason: '需要使用电子显微镜进行材料分析实验，为期2小时。'
      },
      {
        id: 'app_stu_002',
        title: '计算机实验室使用申请',
        applicant: '李四',
        applicantId: '2023123457',
        equipmentName: '高性能计算机',
        equipmentId: 'eq_002',
        applyTime: twoDaysAgo.toISOString(),
        status: 'approved',
        reservationTime: {
          start: yesterday.toISOString(),
          end: new Date(yesterday.getTime() + 4 * 60 * 60 * 1000).toISOString()
        },
        reason: '需要使用高性能计算机进行数据处理，为期4小时。',
        approvalComment: '同意使用，请注意设备安全。'
      },
      {
        id: 'app_stu_003',
        title: '化学实验设备使用申请',
        applicant: '王五',
        applicantId: '2023123458',
        equipmentName: '分光光度计',
        equipmentId: 'eq_003',
        applyTime: twoDaysAgo.toISOString(),
        status: 'rejected',
        reservationTime: {
          start: now.toISOString(),
          end: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString()
        },
        reason: '需要使用分光光度计进行化学实验，为期3小时。',
        approvalComment: '设备当前维护中，暂无法使用。'
      }
    ]
  } else if (approvalType.value === 'teacher') {
    applications.value = [
      {
        id: 'app_tea_001',
        title: '实验室设备采购申请',
        applicant: '李教授',
        applicantId: '10001',
        equipmentName: '核磁共振仪',
        equipmentId: 'eq_004',
        applyTime: yesterday.toISOString(),
        status: 'pending',
        reservationTime: null,
        reason: '需要采购新的核磁共振仪，用于科研实验。'
      },
      {
        id: 'app_tea_002',
        title: '设备维修申请',
        applicant: '王老师',
        applicantId: '10002',
        equipmentName: '气相色谱仪',
        equipmentId: 'eq_005',
        applyTime: twoDaysAgo.toISOString(),
        status: 'approved',
        reservationTime: null,
        reason: '气相色谱仪需要进行定期维护和校准。',
        approvalComment: '同意维修，请联系设备管理处。'
      }
    ]
  } else if (approvalType.value === 'external') {
    applications.value = [
      {
        id: 'app_ext_001',
        title: '校外合作实验申请',
        applicant: '赵先生',
        applicantId: 'ext2024001',
        equipmentName: '电子显微镜',
        equipmentId: 'eq_001',
        applyTime: yesterday.toISOString(),
        status: 'pending',
        reservationTime: {
          start: now.toISOString(),
          end: new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString()
        },
        reason: '需要使用电子显微镜进行合作项目实验，为期8小时。'
      },
      {
        id: 'app_ext_002',
        title: '技术交流实验申请',
        applicant: '钱女士',
        applicantId: 'ext2024002',
        equipmentName: '高性能计算机',
        equipmentId: 'eq_002',
        applyTime: twoDaysAgo.toISOString(),
        status: 'approved',
        reservationTime: {
          start: yesterday.toISOString(),
          end: new Date(yesterday.getTime() + 6 * 60 * 60 * 1000).toISOString()
        },
        reason: '需要使用高性能计算机进行技术交流实验，为期6小时。',
        approvalComment: '同意使用，按校外人员标准收费。'
      }
    ]
  } else if (approvalType.value === 'history') {
    // 审批历史数据 - 包含所有类型的已审批申请
    applications.value = [
      // 学生申请历史
      {
        id: 'app_stu_002',
        title: '计算机实验室使用申请',
        applicant: '李四',
        applicantId: '2023123457',
        equipmentName: '高性能计算机',
        equipmentId: 'eq_002',
        applyTime: threeDaysAgo.toISOString(),
        status: 'approved',
        approvalTime: twoDaysAgo.toISOString(),
        reservationTime: {
          start: yesterday.toISOString(),
          end: new Date(yesterday.getTime() + 4 * 60 * 60 * 1000).toISOString()
        },
        reason: '需要使用高性能计算机进行数据处理，为期4小时。',
        approvalComment: '同意使用，请注意设备安全。',
        approvalBy: '张老师'
      },
      {
        id: 'app_stu_003',
        title: '化学实验设备使用申请',
        applicant: '王五',
        applicantId: '2023123458',
        equipmentName: '分光光度计',
        equipmentId: 'eq_003',
        applyTime: fourDaysAgo.toISOString(),
        status: 'rejected',
        approvalTime: threeDaysAgo.toISOString(),
        reservationTime: {
          start: now.toISOString(),
          end: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString()
        },
        reason: '需要使用分光光度计进行化学实验，为期3小时。',
        approvalComment: '设备当前维护中，暂无法使用。',
        approvalBy: '张老师'
      },
      // 教师申请历史
      {
        id: 'app_tea_002',
        title: '设备维修申请',
        applicant: '王老师',
        applicantId: '10002',
        equipmentName: '气相色谱仪',
        equipmentId: 'eq_005',
        applyTime: fourDaysAgo.toISOString(),
        status: 'approved',
        approvalTime: threeDaysAgo.toISOString(),
        reservationTime: null,
        reason: '气相色谱仪需要进行定期维护和校准。',
        approvalComment: '同意维修，请联系设备管理处。',
        approvalBy: '李主任'
      },
      // 校外人员申请历史
      {
        id: 'app_ext_002',
        title: '技术交流实验申请',
        applicant: '钱女士',
        applicantId: 'ext2024002',
        equipmentName: '高性能计算机',
        equipmentId: 'eq_002',
        applyTime: fourDaysAgo.toISOString(),
        status: 'approved',
        approvalTime: threeDaysAgo.toISOString(),
        reservationTime: {
          start: yesterday.toISOString(),
          end: new Date(yesterday.getTime() + 6 * 60 * 60 * 1000).toISOString()
        },
        reason: '需要使用高性能计算机进行技术交流实验，为期6小时。',
        approvalComment: '同意使用，按校外人员标准收费。',
        approvalBy: '李主任'
      }
    ]
  }
}

// 过滤后的申请列表
const filteredApplications = computed(() => {
  let result = [...applications.value]
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(app => 
      app.title.toLowerCase().includes(query) || 
      app.applicant.toLowerCase().includes(query)
    )
  }
  
  // 状态过滤
  if (statusFilter.value) {
    result = result.filter(app => app.status === statusFilter.value)
  }
  
  return result
})

// 分页后的申请列表
const paginatedApplications = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredApplications.value.slice(start, end)
})

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 获取状态类型
function getStatusType(status) {
  const types = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return types[status] || 'info'
}

// 获取状态文本
function getStatusText(status) {
  const texts = {
    pending: '待审批',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return texts[status] || '未知'
}

// 查看申请详情
function viewApplication(application) {
  currentApplication.value = { ...application }
  dialogVisible.value = true
}

// 批准申请
function approveApplication(application) {
  application.status = 'approved'
  application.approvalComment = '同意申请'
  ElMessage.success('申请已通过')
  refreshList()
}

// 拒绝申请
function rejectApplication(application) {
  application.status = 'rejected'
  application.approvalComment = '拒绝申请'
  ElMessage.success('申请已拒绝')
  refreshList()
}

// 刷新列表
function refreshList() {
  loadApplications()
  ElMessage.success('列表已刷新')
}

// 处理分页大小变化
function handleSizeChange(size) {
  pageSize.value = size
  currentPage.value = 1
}

// 处理当前页码变化
function handleCurrentChange(page) {
  currentPage.value = page
}
</script>

<style scoped>
.approval-list {
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.application-detail {
  padding: 10px 0;
}
</style>