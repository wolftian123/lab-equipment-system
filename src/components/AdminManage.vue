<template>
  <div class="admin-manage">
    <h2>管理员管理</h2>
    <p>负责人功能：管理系统管理员</p>
    
    <!-- 操作栏 -->
    <div class="action-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索管理员姓名、账号"
        clearable
        style="width: 300px; margin-right: 10px;"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      
      <el-button type="primary" @click="handleAddAdmin">
        <el-icon><CirclePlus /></el-icon>
        添加管理员
      </el-button>
    </div>
    
    <!-- 管理员列表 -->
    <el-table :data="paginatedAdmins" style="width: 100%; margin-top: 20px;">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column prop="username" label="账号" width="180" />
      <el-table-column prop="department" label="部门" width="150" />
      <el-table-column prop="position" label="职位" width="150" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="phone" label="电话" width="150" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
            {{ scope.row.status === 'active' ? '活跃' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="handleEditAdmin(scope.row)">编辑</el-button>
          <el-button 
            size="small" 
            :type="scope.row.status === 'active' ? 'warning' : 'success'"
            @click="handleToggleStatus(scope.row)"
          >
            {{ scope.row.status === 'active' ? '禁用' : '启用' }}
          </el-button>
          <el-button size="small" type="danger" @click="handleDeleteAdmin(scope.row.id)">删除</el-button>
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
        :total="filteredAdmins.length"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    
    <!-- 添加/编辑管理员对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="账号" prop="username">
          <el-input v-model="form.username" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!form.id">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-input v-model="form.department" placeholder="请输入部门" />
        </el-form-item>
        <el-form-item label="职位" prop="position">
          <el-input v-model="form.position" placeholder="请输入职位" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入电话" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, CirclePlus } from '@element-plus/icons-vue'

// 响应式数据
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const dialogTitle = ref('添加管理员')
const form = ref({
  id: '',
  name: '',
  username: '',
  password: '',
  department: '',
  position: '',
  email: '',
  phone: '',
  status: 'active'
})
const formRef = ref(null)
const admins = ref([])

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  department: [{ required: true, message: '请输入部门', trigger: 'blur' }],
  position: [{ required: true, message: '请输入职位', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [{ required: true, message: '请输入电话', trigger: 'blur' }]
}

// 过滤后的管理员列表
const filteredAdmins = computed(() => {
  if (!searchQuery.value) {
    return admins.value
  }
  const query = searchQuery.value.toLowerCase()
  return admins.value.filter(admin => 
    admin.name.toLowerCase().includes(query) || 
    admin.username.toLowerCase().includes(query)
  )
})

// 分页后的管理员列表
const paginatedAdmins = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredAdmins.value.slice(start, end)
})

// 生命周期钩子
onMounted(() => {
  loadAdmins()
})

// 加载管理员数据
function loadAdmins() {
  // 模拟数据
  admins.value = [
    {
      id: 'adm_001',
      name: '王管理员',
      username: 'admin001',
      department: '设备管理处',
      position: '设备管理员',
      email: 'admin@jiangnan.edu.cn',
      phone: '13800138003',
      status: 'active'
    },
    {
      id: 'adm_002',
      name: '李管理员',
      username: 'admin002',
      department: '设备管理处',
      position: '设备管理员',
      email: 'admin2@jiangnan.edu.cn',
      phone: '13800138004',
      status: 'active'
    },
    {
      id: 'adm_003',
      name: '张管理员',
      username: 'admin003',
      department: '设备管理处',
      position: '设备管理员',
      email: 'admin3@jiangnan.edu.cn',
      phone: '13800138005',
      status: 'inactive'
    }
  ]
}

// 处理添加管理员
function handleAddAdmin() {
  form.value = {
    id: '',
    name: '',
    username: '',
    password: '',
    department: '',
    position: '',
    email: '',
    phone: '',
    status: 'active'
  }
  dialogTitle.value = '添加管理员'
  dialogVisible.value = true
}

// 处理编辑管理员
function handleEditAdmin(admin) {
  form.value = { ...admin }
  dialogTitle.value = '编辑管理员'
  dialogVisible.value = true
}

// 处理提交表单
async function handleSubmit() {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    if (form.value.id) {
      // 编辑管理员
      const index = admins.value.findIndex(admin => admin.id === form.value.id)
      if (index !== -1) {
        admins.value[index] = { ...form.value }
        ElMessage.success('管理员信息更新成功')
      }
    } else {
      // 添加管理员
      const newAdmin = {
        ...form.value,
        id: `adm_${String(admins.value.length + 1).padStart(3, '0')}`
      }
      admins.value.push(newAdmin)
      ElMessage.success('管理员添加成功')
    }
    
    dialogVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 处理切换管理员状态
function handleToggleStatus(admin) {
  admin.status = admin.status === 'active' ? 'inactive' : 'active'
  ElMessage.success(`管理员${admin.status === 'active' ? '启用' : '禁用'}成功`)
}

// 处理删除管理员
function handleDeleteAdmin(id) {
  admins.value = admins.value.filter(admin => admin.id !== id)
  ElMessage.success('管理员删除成功')
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
.admin-manage {
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
</style>
