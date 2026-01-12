<template>
  <div class="teacher-manage">
    <h2>教师管理</h2>
    <p>管理员功能：管理教师信息</p>
    
    <!-- 操作按钮 -->
    <el-card shadow="hover" class="action-card">
      <div class="action-buttons">
        <el-button type="primary" @click="openAddTeacherDialog">
          <el-icon><Plus /></el-icon>
          新增教师
        </el-button>
        <el-button type="success" @click="exportTeachers">
          <el-icon><Download /></el-icon>
          导出教师列表
        </el-button>
        <el-button type="warning" @click="batchUpdateStatus">
          <el-icon><Edit /></el-icon>
          批量更新状态
        </el-button>
        <el-button @click="refreshTeachers">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </el-card>
    
    <!-- 搜索和筛选 -->
    <el-card shadow="hover" class="search-card" style="margin-top: 20px;">
      <div class="search-container">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input 
              v-model="searchForm.keyword" 
              placeholder="搜索姓名、工号或联系方式"
              prefix-icon="Search"
            />
          </el-col>
          <el-col :span="6">
            <el-select 
              v-model="searchForm.department" 
              placeholder="部门"
              clearable
            >
              <el-option label="计算机科学与技术学院" value="cs" />
              <el-option label="电子信息工程学院" value="ee" />
              <el-option label="软件工程学院" value="se" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select 
              v-model="searchForm.status" 
              placeholder="教师状态"
              clearable
            >
              <el-option label="在职" value="active" />
              <el-option label="休假" value="on_leave" />
              <el-option label="离职" value="resigned" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="searchTeachers">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
          </el-col>
        </el-row>
      </div>
    </el-card>
    
    <!-- 教师列表 -->
    <el-card shadow="hover" class="teachers-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>教师列表</span>
          <span class="total-count">共 {{ filteredTeachers.length }} 名教师</span>
        </div>
      </template>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-spinner size="large" />
        <p>加载中...</p>
      </div>
      
      <!-- 无数据 -->
      <div v-else-if="filteredTeachers.length === 0" class="empty-container">
        <el-empty description="暂无教师数据" />
      </div>
      
      <!-- 教师表格 -->
      <el-table 
        v-else 
        :data="currentPageData" 
        style="width: 100%;"
        stripe
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="teacherId" label="工号" width="120" />
        <el-table-column prop="name" label="姓名" min-width="100">
          <template #default="scope">
            <div class="teacher-info">
              <el-avatar :size="32" :src="scope.row.avatar" class="teacher-avatar">
                {{ scope.row.name.charAt(0) }}
              </el-avatar>
              <span class="teacher-name">{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="department" label="部门" min-width="150" />
        <el-table-column prop="title" label="职称" width="120" />
        <el-table-column prop="contactPhone" label="联系方式" width="150" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewTeacherDetail(scope.row)">
              查看详情
            </el-button>
            <el-button size="small" type="primary" @click="editTeacher(scope.row)">
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="deleteTeacher(scope.row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container" v-if="filteredTeachers.length > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredTeachers.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 新增/编辑教师对话框 -->
    <el-dialog 
      v-model="addTeacherDialogVisible" 
      :title="teacherDialogTitle" 
      width="70%"
    >
      <el-form :model="teacherForm" :rules="formRules" ref="formRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="工号" prop="teacherId">
              <el-input v-model="teacherForm.teacherId" placeholder="输入工号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="teacherForm.name" placeholder="输入姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-select v-model="teacherForm.gender" placeholder="选择性别">
                <el-option label="男" value="男" />
                <el-option label="女" value="女" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门" prop="department">
              <el-select v-model="teacherForm.department" placeholder="选择部门">
                <el-option label="计算机科学与技术学院" value="cs" />
                <el-option label="电子信息工程学院" value="ee" />
                <el-option label="软件工程学院" value="se" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="职称" prop="title">
              <el-input v-model="teacherForm.title" placeholder="输入职称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系方式" prop="contactPhone">
              <el-input v-model="teacherForm.contactPhone" placeholder="输入联系方式" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="teacherForm.email" placeholder="输入邮箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="教师状态" prop="status">
              <el-select v-model="teacherForm.status" placeholder="选择教师状态">
                <el-option label="在职" value="active" />
                <el-option label="休假" value="on_leave" />
                <el-option label="离职" value="resigned" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="teacherForm.notes" type="textarea" placeholder="输入备注信息" rows="3" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addTeacherDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveTeacher">保存</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 批量更新状态对话框 -->
    <el-dialog v-model="batchStatusDialogVisible" title="批量更新教师状态" width="50%">
      <el-form :model="batchStatusForm" :rules="batchStatusRules" ref="batchStatusFormRef">
        <el-form-item label="教师状态" prop="status">
          <el-select v-model="batchStatusForm.status" placeholder="选择教师状态">
            <el-option label="在职" value="active" />
            <el-option label="休假" value="on_leave" />
            <el-option label="离职" value="resigned" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="batchStatusForm.notes" type="textarea" placeholder="输入更新备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchStatusDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmBatchStatusUpdate">确定更新</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  Plus, 
  Download, 
  Edit, 
  Refresh, 
  Search 
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// 状态管理
const addTeacherDialogVisible = ref(false);
const batchStatusDialogVisible = ref(false);
const teacherDialogTitle = ref('新增教师');
const loading = ref(false);
const searchForm = ref({
  keyword: '',
  department: '',
  status: ''
});
const currentPage = ref(1);
const pageSize = ref(10);
const selectedTeachers = ref([]);

// 表单数据
const teacherForm = ref({
  id: '',
  teacherId: '',
  name: '',
  gender: '男',
  department: 'cs',
  title: '',
  contactPhone: '',
  email: '',
  status: 'active',
  notes: ''
});

// 批量更新状态表单
const batchStatusForm = ref({
  status: '',
  notes: ''
});

// 表单验证规则
const formRules = {
  teacherId: [{ required: true, message: '请输入工号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
  title: [{ required: true, message: '请输入职称', trigger: 'blur' }],
  contactPhone: [{ required: true, message: '请输入联系方式', trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }, { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }],
  status: [{ required: true, message: '请选择教师状态', trigger: 'change' }]
};

const batchStatusRules = {
  status: [{ required: true, message: '请选择教师状态', trigger: 'change' }]
};

// 教师数据（模拟）
const teachersList = ref([
  {
    id: 1,
    teacherId: 'T2024001',
    name: '王教授',
    gender: '男',
    department: 'cs',
    title: '教授',
    contactPhone: '13800138001',
    email: 'wang@example.com',
    status: 'active',
    notes: '计算机科学与技术学院',
    avatar: ''
  },
  {
    id: 2,
    teacherId: 'T2024002',
    name: '李教授',
    gender: '女',
    department: 'ee',
    title: '教授',
    contactPhone: '13900139001',
    email: 'li@example.com',
    status: 'active',
    notes: '电子信息工程学院',
    avatar: ''
  },
  {
    id: 3,
    teacherId: 'T2024003',
    name: '张副教授',
    gender: '男',
    department: 'se',
    title: '副教授',
    contactPhone: '13700137001',
    email: 'zhang@example.com',
    status: 'active',
    notes: '软件工程学院',
    avatar: ''
  },
  {
    id: 4,
    teacherId: 'T2024004',
    name: '刘讲师',
    gender: '女',
    department: 'cs',
    title: '讲师',
    contactPhone: '13600136001',
    email: 'liu@example.com',
    status: 'on_leave',
    notes: '休假中',
    avatar: ''
  },
  {
    id: 5,
    teacherId: 'T2024005',
    name: '赵教授',
    gender: '男',
    department: 'other',
    title: '教授',
    contactPhone: '13500135001',
    email: 'zhao@example.com',
    status: 'resigned',
    notes: '已离职',
    avatar: ''
  }
]);

// 过滤教师数据
const filteredTeachers = computed(() => {
  return teachersList.value.filter(item => {
    const matchesKeyword = !searchForm.value.keyword || 
      item.name.toLowerCase().includes(searchForm.value.keyword.toLowerCase()) ||
      item.teacherId.includes(searchForm.value.keyword) ||
      item.contactPhone.includes(searchForm.value.keyword);
    
    const matchesDepartment = !searchForm.value.department || item.department === searchForm.value.department;
    
    const matchesStatus = !searchForm.value.status || item.status === searchForm.value.status;
    
    return matchesKeyword && matchesDepartment && matchesStatus;
  });
});

// 当前页数据
const currentPageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredTeachers.value.slice(start, end);
});

// 状态文本和类型
const getStatusText = (status) => {
  const statusMap = {
    active: '在职',
    on_leave: '休假',
    resigned: '离职'
  };
  return statusMap[status] || status;
};

const getStatusType = (status) => {
  const typeMap = {
    active: 'success',
    on_leave: 'warning',
    resigned: 'danger'
  };
  return typeMap[status] || '';
};

// 选择教师
const handleSelectionChange = (selection) => {
  selectedTeachers.value = selection;
};

// 打开新增教师对话框
const openAddTeacherDialog = () => {
  teacherDialogTitle.value = '新增教师';
  teacherForm.value = {
    id: '',
    teacherId: '',
    name: '',
    gender: '男',
    department: 'cs',
    title: '',
    contactPhone: '',
    email: '',
    status: 'active',
    notes: ''
  };
  addTeacherDialogVisible.value = true;
};

// 保存教师
const saveTeacher = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    addTeacherDialogVisible.value = false;
    
    if (!teacherForm.value.id) {
      // 新增教师
      const newTeacher = {
        ...teacherForm.value,
        id: teachersList.value.length + 1,
        avatar: ''
      };
      teachersList.value.unshift(newTeacher);
    } else {
      // 编辑教师
      const index = teachersList.value.findIndex(t => t.id === teacherForm.value.id);
      if (index !== -1) {
        teachersList.value[index] = { ...teacherForm.value };
      }
    }
    
    ElMessage.success('保存成功');
  }, 500);
};

// 查看教师详情
const viewTeacherDetail = (teacher) => {
  console.log('查看教师详情:', teacher);
  ElMessage.info('查看教师详情功能开发中');
};

// 编辑教师
const editTeacher = (teacher) => {
  teacherDialogTitle.value = '编辑教师';
  teacherForm.value = { ...teacher };
  addTeacherDialogVisible.value = true;
};

// 删除教师
const deleteTeacher = (id) => {
  ElMessageBox.confirm('确定要删除这个教师吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    teachersList.value = teachersList.value.filter(t => t.id !== id);
    ElMessage.success('删除成功');
  }).catch(() => {});
};

// 导出教师列表
const exportTeachers = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('教师列表导出成功');
  }, 1000);
};

// 批量更新状态
const batchUpdateStatus = () => {
  if (selectedTeachers.value.length === 0) {
    ElMessage.warning('请先选择要更新状态的教师');
    return;
  }
  batchStatusDialogVisible.value = true;
};

// 确认批量更新状态
const confirmBatchStatusUpdate = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    batchStatusDialogVisible.value = false;
    
    selectedTeachers.value.forEach(teacher => {
      const index = teachersList.value.findIndex(t => t.id === teacher.id);
      if (index !== -1) {
        teachersList.value[index].status = batchStatusForm.value.status;
      }
    });
    
    ElMessage.success(`成功更新 ${selectedTeachers.value.length} 个教师的状态`);
    selectedTeachers.value = [];
  }, 1000);
};

// 刷新教师列表
const refreshTeachers = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('教师列表刷新成功');
  }, 800);
};

// 搜索教师
const searchTeachers = () => {
  currentPage.value = 1;
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
  refreshTeachers();
});
</script>

<style scoped>
.teacher-manage {
  padding: 20px;
}

.action-card {
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.search-card {
  margin-bottom: 20px;
}

.search-container {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-count {
  font-size: 14px;
  color: #606266;
}

.loading-container {
  text-align: center;
  padding: 60px 0;
}

.empty-container {
  padding: 60px 0;
}

.teacher-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.teacher-avatar {
  margin-right: 8px;
}

.teacher-name {
  font-weight: 500;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .teacher-manage {
    padding: 10px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }
  
  .search-container {
    flex-direction: column;
    gap: 10px;
  }
}
</style>