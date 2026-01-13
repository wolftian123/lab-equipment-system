<template>
  <div class="system-logs">
    <h2>系统日志</h2>
    <p>管理员功能：查看系统操作日志和审计记录</p>
    
    <!-- 筛选工具栏 -->
    <el-card shadow="hover" class="filter-card">
      <el-form :model="filterForm" inline label-width="80px">
        <el-form-item label="日志类型">
          <el-select v-model="filterForm.logType" placeholder="选择日志类型">
            <el-option label="全部" value="" />
            <el-option label="登录" value="login" />
            <el-option label="操作" value="operation" />
            <el-option label="错误" value="error" />
            <el-option label="警告" value="warning" />
            <el-option label="系统" value="system" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="操作人">
          <el-input v-model="filterForm.username" placeholder="输入操作人" clearable />
        </el-form-item>
        
        <el-form-item label="IP地址">
          <el-input v-model="filterForm.ipAddress" placeholder="输入IP地址" clearable />
        </el-form-item>
        
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="searchLogs">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="resetFilter">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 操作按钮 -->
    <div class="action-buttons" style="margin-top: 10px;">
      <el-button type="primary" @click="exportLogs">
        <el-icon><Download /></el-icon>
        导出日志
      </el-button>
      <el-button @click="clearLogs">
        <el-icon><Delete /></el-icon>
        清空日志
      </el-button>
      <el-button @click="refreshLogs">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>
    
    <!-- 日志列表 -->
    <el-card shadow="hover" class="logs-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>日志记录</span>
          <span class="total-logs">共 {{ filteredLogs.length }} 条记录</span>
        </div>
      </template>
      
      <el-table 
        v-if="filteredLogs.length > 0"
        :data="currentPageData" 
        style="width: 100%;"
        stripe
        border
        @row-click="handleRowClick"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="logType" label="类型" width="100">
          <template #default="scope">
            <el-tag :type="getLogTypeColor(scope.row.logType)">
              {{ getLogTypeText(scope.row.logType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="操作人" width="120" />
        <el-table-column prop="action" label="操作" min-width="200" />
        <el-table-column prop="ipAddress" label="IP地址" width="150" />
        <el-table-column prop="userAgent" label="用户代理" min-width="150" />
        <el-table-column prop="createdAt" label="操作时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="scope">
            <el-button 
              type="text" 
              size="small" 
              @click.stop="viewLogDetail(scope.row)"
            >
              <el-icon><View /></el-icon>
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div v-else class="empty-logs">
        <el-empty description="暂无日志记录" />
      </div>
      
      <!-- 分页 -->
      <div v-if="filteredLogs.length > 0" class="pagination" style="margin-top: 20px;">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredLogs.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 日志详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="日志详情"
      width="60%"
    >
      <el-descriptions :column="1" border v-if="selectedLog">
        <el-descriptions-item label="日志ID">{{ selectedLog.id }}</el-descriptions-item>
        <el-descriptions-item label="日志类型">
          <el-tag :type="getLogTypeColor(selectedLog.logType)">
            {{ getLogTypeText(selectedLog.logType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作人">{{ selectedLog.username }}</el-descriptions-item>
        <el-descriptions-item label="操作内容">{{ selectedLog.action }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ selectedLog.ipAddress }}</el-descriptions-item>
        <el-descriptions-item label="用户代理">{{ selectedLog.userAgent }}</el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ formatDate(selectedLog.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="详细信息" v-if="selectedLog.details">
          <pre>{{ selectedLog.details }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  Search, 
  Refresh, 
  Download, 
  Delete, 
  View 
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// 状态管理
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(20);
const detailDialogVisible = ref(false);
const selectedLog = ref(null);

// 筛选表单
const filterForm = ref({
  logType: '',
  username: '',
  ipAddress: '',
  dateRange: []
});

// 日志数据
const logs = ref([
  {
    id: 1,
    logType: 'login',
    username: 'admin',
    action: '用户登录',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    createdAt: '2024-01-13 10:00:00',
    details: '用户admin从IP 192.168.1.100登录系统'
  },
  {
    id: 2,
    logType: 'operation',
    username: 'admin',
    action: '添加教师',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    createdAt: '2024-01-13 10:05:00',
    details: '添加教师：张三，工号：20240001'
  },
  {
    id: 3,
    logType: 'error',
    username: 'user1',
    action: '权限不足',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    createdAt: '2024-01-13 10:10:00',
    details: '用户user1尝试访问管理员页面'
  },
  {
    id: 4,
    logType: 'warning',
    username: 'admin',
    action: '系统警告',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    createdAt: '2024-01-13 10:15:00',
    details: '系统存储空间不足'
  },
  {
    id: 5,
    logType: 'system',
    username: 'system',
    action: '系统启动',
    ipAddress: '127.0.0.1',
    userAgent: 'System',
    createdAt: '2024-01-13 09:00:00',
    details: '系统服务启动成功'
  },
  {
    id: 6,
    logType: 'login',
    username: 'teacher1',
    action: '用户登录',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    createdAt: '2024-01-13 10:20:00',
    details: '用户teacher1从IP 192.168.1.102登录系统'
  },
  {
    id: 7,
    logType: 'operation',
    username: 'teacher1',
    action: '预约设备',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    createdAt: '2024-01-13 10:25:00',
    details: '预约设备：实验台A，时间：2024-01-14 09:00-11:00'
  },
  {
    id: 8,
    logType: 'operation',
    username: 'admin',
    action: '修改系统设置',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    createdAt: '2024-01-13 10:30:00',
    details: '修改系统设置：更新邮件服务器配置'
  },
  {
    id: 9,
    logType: 'error',
    username: 'student1',
    action: '登录失败',
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    createdAt: '2024-01-13 10:35:00',
    details: '用户student1登录失败：密码错误'
  },
  {
    id: 10,
    logType: 'system',
    username: 'system',
    action: '备份完成',
    ipAddress: '127.0.0.1',
    userAgent: 'System',
    createdAt: '2024-01-13 08:00:00',
    details: '系统自动备份完成'
  }
]);

// 过滤后的日志
const filteredLogs = computed(() => {
  return logs.value.filter(log => {
    // 按日志类型筛选
    if (filterForm.value.logType && log.logType !== filterForm.value.logType) {
      return false;
    }
    // 按操作人筛选
    if (filterForm.value.username && !log.username.includes(filterForm.value.username)) {
      return false;
    }
    // 按IP地址筛选
    if (filterForm.value.ipAddress && !log.ipAddress.includes(filterForm.value.ipAddress)) {
      return false;
    }
    // 按日期范围筛选
    if (filterForm.value.dateRange && filterForm.value.dateRange.length === 2) {
      const logDate = log.createdAt.split(' ')[0];
      const startDate = filterForm.value.dateRange[0];
      const endDate = filterForm.value.dateRange[1];
      if (logDate < startDate || logDate > endDate) {
        return false;
      }
    }
    return true;
  });
});

// 当前页数据
const currentPageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredLogs.value.slice(start, end);
});

// 格式化日期
const formatDate = (dateString) => {
  return dateString;
};

// 获取日志类型文本
const getLogTypeText = (type) => {
  const typeMap = {
    login: '登录',
    operation: '操作',
    error: '错误',
    warning: '警告',
    system: '系统'
  };
  return typeMap[type] || type;
};

// 获取日志类型颜色
const getLogTypeColor = (type) => {
  const colorMap = {
    login: 'primary',
    operation: 'success',
    error: 'danger',
    warning: 'warning',
    system: 'info'
  };
  return colorMap[type] || 'info';
};

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
};

const handleCurrentChange = (current) => {
  currentPage.value = current;
};

// 搜索日志
const searchLogs = () => {
  currentPage.value = 1;
  ElMessage.success('日志筛选完成');
};

// 重置筛选
const resetFilter = () => {
  filterForm.value = {
    logType: '',
    username: '',
    ipAddress: '',
    dateRange: []
  };
  currentPage.value = 1;
};

// 导出日志
const exportLogs = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('日志导出成功');
  }, 1000);
};

// 清空日志
const clearLogs = () => {
  ElMessageBox.confirm('确定要清空所有日志吗？此操作不可恢复。', '清空日志', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'danger'
  }).then(() => {
    loading.value = true;
    setTimeout(() => {
      loading.value = false;
      logs.value = [];
      ElMessage.success('日志清空成功');
    }, 1000);
  }).catch(() => {});
};

// 刷新日志
const refreshLogs = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('日志刷新成功');
  }, 500);
};

// 查看日志详情
const viewLogDetail = (log) => {
  selectedLog.value = log;
  detailDialogVisible.value = true;
};

// 行点击事件
const handleRowClick = (row) => {
  viewLogDetail(row);
};

// 初始化
onMounted(() => {
  console.log('系统日志初始化');
});
</script>

<style scoped>
.system-logs {
  padding: 20px;
}

.filter-card {
  margin-bottom: 10px;
}

.filter-card .el-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.logs-card {
  margin-top: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-logs {
  font-size: 14px;
  color: #666;
}

.empty-logs {
  padding: 40px 0;
  text-align: center;
}

.pagination {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .system-logs {
    padding: 10px;
  }
  
  .filter-card .el-form {
    flex-direction: column;
    align-items: stretch;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons .el-button {
    width: 100%;
  }
}
</style>