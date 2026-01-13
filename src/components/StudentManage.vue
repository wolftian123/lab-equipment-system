<template>
  <div class="student-manage">
    <h2>学生管理</h2>
    <p>教师功能：管理所指导的学生</p>
    
    <!-- 操作按钮 -->
    <el-card shadow="hover" class="action-card">
      <div class="action-buttons">
        <el-button type="primary" @click="openAddStudentDialog">
          <el-icon><Plus /></el-icon>
          新增学生
        </el-button>
        <el-button type="success" @click="exportStudents">
          <el-icon><Download /></el-icon>
          导出学生列表
        </el-button>
        <el-button type="warning" @click="batchUpdateStatus">
          <el-icon><Edit /></el-icon>
          批量更新状态
        </el-button>
        <el-button @click="refreshStudents">
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
              placeholder="搜索姓名、学号或联系方式"
              prefix-icon="Search"
            />
          </el-col>
          <el-col :span="6">
            <el-select 
              v-model="searchForm.grade" 
              placeholder="年级"
              clearable
            >
              <el-option label="2021级" value="2021" />
              <el-option label="2022级" value="2022" />
              <el-option label="2023级" value="2023" />
              <el-option label="2024级" value="2024" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select 
              v-model="searchForm.status" 
              placeholder="学生状态"
              clearable
            >
              <el-option label="在读" value="active" />
              <el-option label="休学" value="suspended" />
              <el-option label="毕业" value="graduated" />
              <el-option label="退学" value="withdrawn" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="searchStudents">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
          </el-col>
        </el-row>
      </div>
    </el-card>
    
    <!-- 学生列表 -->
    <el-card shadow="hover" class="students-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>学生列表</span>
          <span class="total-count">共 {{ filteredStudents.length }} 名学生</span>
        </div>
      </template>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-spinner size="large" />
        <p>加载中...</p>
      </div>
      
      <!-- 无数据 -->
      <div v-else-if="filteredStudents.length === 0" class="empty-container">
        <el-empty description="暂无学生数据" />
      </div>
      
      <!-- 学生表格 -->
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
        <el-table-column prop="studentId" label="学号" width="120" />
        <el-table-column prop="name" label="姓名" min-width="100">
          <template #default="scope">
            <div class="student-info">
              <el-avatar :size="32" :src="scope.row.avatar" class="student-avatar">
                {{ scope.row.name.charAt(0) }}
              </el-avatar>
              <span class="student-name">{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="grade" label="年级" width="100" />
        <el-table-column prop="major" label="专业" min-width="150" />
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
            <el-button size="small" @click="viewStudentDetail(scope.row)">
              查看详情
            </el-button>
            <el-button size="small" type="primary" @click="editStudent(scope.row)">
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="deleteStudent(scope.row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container" v-if="filteredStudents.length > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredStudents.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 新增/编辑学生对话框 -->
    <el-dialog 
      v-model="addStudentDialogVisible" 
      :title="studentDialogTitle" 
      width="70%"
    >
      <el-form :model="studentForm" :rules="formRules" ref="formRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学号" prop="studentId">
              <el-input v-model="studentForm.studentId" placeholder="输入学号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="studentForm.name" placeholder="输入姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-select v-model="studentForm.gender" placeholder="选择性别">
                <el-option label="男" value="男" />
                <el-option label="女" value="女" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年级" prop="grade">
              <el-select v-model="studentForm.grade" placeholder="选择年级">
                <el-option label="2021级" value="2021" />
                <el-option label="2022级" value="2022" />
                <el-option label="2023级" value="2023" />
                <el-option label="2024级" value="2024" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="专业" prop="major">
              <el-input v-model="studentForm.major" placeholder="输入专业" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="班级" prop="className">
              <el-input v-model="studentForm.className" placeholder="输入班级" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系方式" prop="contactPhone">
              <el-input v-model="studentForm.contactPhone" placeholder="输入联系方式" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="studentForm.email" placeholder="输入邮箱" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="导师" prop="advisor">
              <el-input v-model="studentForm.advisor" placeholder="输入导师姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学生状态" prop="status">
              <el-select v-model="studentForm.status" placeholder="选择学生状态">
                <el-option label="在读" value="active" />
                <el-option label="休学" value="suspended" />
                <el-option label="毕业" value="graduated" />
                <el-option label="退学" value="withdrawn" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="studentForm.notes" type="textarea" placeholder="输入备注信息" rows="3" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addStudentDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveStudent">保存</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 批量更新状态对话框 -->
    <el-dialog v-model="batchStatusDialogVisible" title="批量更新学生状态" width="50%">
      <el-form :model="batchStatusForm" :rules="batchStatusRules" ref="batchStatusFormRef">
        <el-form-item label="学生状态" prop="status">
          <el-select v-model="batchStatusForm.status" placeholder="选择学生状态">
            <el-option label="在读" value="active" />
            <el-option label="休学" value="suspended" />
            <el-option label="毕业" value="graduated" />
            <el-option label="退学" value="withdrawn" />
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
const addStudentDialogVisible = ref(false);
const batchStatusDialogVisible = ref(false);
const studentDialogTitle = ref('新增学生');
const loading = ref(false);
const searchForm = ref({
  keyword: '',
  grade: '',
  status: ''
});
const currentPage = ref(1);
const pageSize = ref(10);
const selectedStudents = ref([]);

// 表单数据
const studentForm = ref({
  id: '',
  studentId: '',
  name: '',
  gender: '男',
  grade: '2024',
  major: '',
  className: '',
  contactPhone: '',
  email: '',
  advisor: '',
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
  studentId: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  grade: [{ required: true, message: '请选择年级', trigger: 'change' }],
  major: [{ required: true, message: '请输入专业', trigger: 'blur' }],
  className: [{ required: true, message: '请输入班级', trigger: 'blur' }],
  contactPhone: [{ required: true, message: '请输入联系方式', trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }, { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }],
  advisor: [{ required: true, message: '请输入导师姓名', trigger: 'blur' }],
  status: [{ required: true, message: '请选择学生状态', trigger: 'change' }]
};

const batchStatusRules = {
  status: [{ required: true, message: '请选择学生状态', trigger: 'change' }]
};

// 学生数据（模拟）
const studentsList = ref([
  {
    id: 1,
    studentId: '2024001',
    name: '张三',
    gender: '男',
    grade: '2024',
    major: '计算机科学与技术',
    className: '计科2401',
    contactPhone: '13800138001',
    email: 'zhangsan@example.com',
    advisor: '王教授',
    status: 'active',
    notes: '优秀学生',
    avatar: ''
  },
  {
    id: 2,
    studentId: '2024002',
    name: '李四',
    gender: '女',
    grade: '2024',
    major: '电子信息工程',
    className: '电信2401',
    contactPhone: '13900139001',
    email: 'lisi@example.com',
    advisor: '李教授',
    status: 'active',
    notes: '成绩优异',
    avatar: ''
  },
  {
    id: 3,
    studentId: '2024003',
    name: '王五',
    gender: '男',
    grade: '2024',
    major: '软件工程',
    className: '软工2401',
    contactPhone: '13700137001',
    email: 'wangwu@example.com',
    advisor: '张教授',
    status: 'active',
    notes: '积极参与项目',
    avatar: ''
  },
  {
    id: 4,
    studentId: '2023001',
    name: '赵六',
    gender: '女',
    grade: '2023',
    major: '计算机科学与技术',
    className: '计科2301',
    contactPhone: '13600136001',
    email: 'zhaoliu@example.com',
    advisor: '王教授',
    status: 'active',
    notes: '学习刻苦',
    avatar: ''
  },
  {
    id: 5,
    studentId: '2023002',
    name: '孙七',
    gender: '男',
    grade: '2023',
    major: '电子信息工程',
    className: '电信2301',
    contactPhone: '13500135001',
    email: 'sunqi@example.com',
    advisor: '李教授',
    status: 'suspended',
    notes: '休学中',
    avatar: ''
  },
  {
    id: 6,
    studentId: '2022001',
    name: '周八',
    gender: '女',
    grade: '2022',
    major: '软件工程',
    className: '软工2201',
    contactPhone: '13400134001',
    email: 'zhouba@example.com',
    advisor: '张教授',
    status: 'graduated',
    notes: '已毕业',
    avatar: ''
  }
]);

// 过滤学生数据
const filteredStudents = computed(() => {
  return studentsList.value.filter(item => {
    const matchesKeyword = !searchForm.value.keyword || 
      item.name.toLowerCase().includes(searchForm.value.keyword.toLowerCase()) ||
      item.studentId.includes(searchForm.value.keyword) ||
      item.contactPhone.includes(searchForm.value.keyword);
    
    const matchesGrade = !searchForm.value.grade || item.grade === searchForm.value.grade;
    
    const matchesStatus = !searchForm.value.status || item.status === searchForm.value.status;
    
    return matchesKeyword && matchesGrade && matchesStatus;
  });
});

// 当前页数据
const currentPageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredStudents.value.slice(start, end);
});

// 状态文本和类型
const getStatusText = (status) => {
  const statusMap = {
    active: '在读',
    suspended: '休学',
    graduated: '毕业',
    withdrawn: '退学'
  };
  return statusMap[status] || status;
};

const getStatusType = (status) => {
  const typeMap = {
    active: 'success',
    suspended: 'warning',
    graduated: 'info',
    withdrawn: 'danger'
  };
  return typeMap[status] || '';
};

// 选择学生
const handleSelectionChange = (selection) => {
  selectedStudents.value = selection;
};

// 打开新增学生对话框
const openAddStudentDialog = () => {
  studentDialogTitle.value = '新增学生';
  studentForm.value = {
    id: '',
    studentId: '',
    name: '',
    gender: '男',
    grade: '2024',
    major: '',
    className: '',
    contactPhone: '',
    email: '',
    advisor: '',
    status: 'active',
    notes: ''
  };
  addStudentDialogVisible.value = true;
};

// 保存学生
const saveStudent = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    addStudentDialogVisible.value = false;
    
    if (!studentForm.value.id) {
      // 新增学生
      const newStudent = {
        ...studentForm.value,
        id: studentsList.value.length + 1,
        avatar: ''
      };
      studentsList.value.unshift(newStudent);
    } else {
      // 编辑学生
      const index = studentsList.value.findIndex(s => s.id === studentForm.value.id);
      if (index !== -1) {
        studentsList.value[index] = { ...studentForm.value };
      }
    }
    
    ElMessage.success('保存成功');
  }, 500);
};

// 查看学生详情
const viewStudentDetail = (student) => {
  // 这里可以打开详情对话框
  console.log('查看学生详情:', student);
  ElMessage.info('查看学生详情功能开发中');
};

// 编辑学生
const editStudent = (student) => {
  studentDialogTitle.value = '编辑学生';
  studentForm.value = { ...student };
  addStudentDialogVisible.value = true;
};

// 删除学生
const deleteStudent = (id) => {
  ElMessageBox.confirm('确定要删除这个学生吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    studentsList.value = studentsList.value.filter(s => s.id !== id);
    ElMessage.success('删除成功');
  }).catch(() => {});
};

// 导出学生列表
const exportStudents = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('学生列表导出成功');
  }, 1000);
};

// 批量更新状态
const batchUpdateStatus = () => {
  if (selectedStudents.value.length === 0) {
    ElMessage.warning('请先选择要更新状态的学生');
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
    
    selectedStudents.value.forEach(student => {
      const index = studentsList.value.findIndex(s => s.id === student.id);
      if (index !== -1) {
        studentsList.value[index].status = batchStatusForm.value.status;
      }
    });
    
    ElMessage.success(`成功更新 ${selectedStudents.value.length} 个学生的状态`);
    selectedStudents.value = [];
  }, 1000);
};

// 刷新学生列表
const refreshStudents = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('学生列表刷新成功');
  }, 800);
};

// 搜索学生
const searchStudents = () => {
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
  refreshStudents();
});
</script>

<style scoped>
.student-manage {
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

.student-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.student-avatar {
  margin-right: 8px;
}

.student-name {
  font-weight: 500;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .student-manage {
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