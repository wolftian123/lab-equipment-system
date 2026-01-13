<template>
  <div class="system-backup">
    <h2>系统备份</h2>
    <p>管理员功能：创建和管理系统备份，从备份恢复系统</p>
    
    <!-- 备份操作区 -->
    <el-card shadow="hover" class="backup-actions">
      <div class="action-buttons">
        <el-button type="primary" @click="createBackup">
          <el-icon><Plus /></el-icon>
          创建备份
        </el-button>
        <el-button type="warning" @click="refreshBackups">
          <el-icon><Refresh /></el-icon>
          刷新备份列表
        </el-button>
        <el-button @click="exportBackup">
          <el-icon><Download /></el-icon>
          导出备份
        </el-button>
        <el-button @click="importBackup">
          <el-icon><Upload /></el-icon>
          导入备份
        </el-button>
      </div>
    </el-card>
    
    <!-- 备份设置 -->
    <el-card shadow="hover" class="backup-settings" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>备份设置</span>
        </div>
      </template>
      
      <el-form :model="backupSettings" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="自动备份">
              <el-switch v-model="backupSettings.autoBackup" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备份频率" prop="backupFrequency" v-if="backupSettings.autoBackup">
              <el-select v-model="backupSettings.backupFrequency" placeholder="选择备份频率">
                <el-option label="每天" value="daily" />
                <el-option label="每周" value="weekly" />
                <el-option label="每月" value="monthly" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="备份存储路径" prop="backupPath">
              <el-input v-model="backupSettings.backupPath" placeholder="输入备份存储路径" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="保留备份数" prop="backupRetention">
              <el-input-number v-model="backupSettings.backupRetention" :min="1" :max="100" />
              <span style="margin-left: 10px;">个</span>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="备份数据库" prop="backupDatabase">
              <el-switch v-model="backupSettings.backupDatabase" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备份文件" prop="backupFiles">
              <el-switch v-model="backupSettings.backupFiles" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item>
          <el-button type="primary" @click="saveBackupSettings">保存设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 备份列表 -->
    <el-card shadow="hover" class="backup-list" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>备份记录</span>
          <span class="total-backups">共 {{ backups.length }} 个备份</span>
        </div>
      </template>
      
      <el-table 
        v-if="backups.length > 0"
        :data="backups" 
        style="width: 100%;"
        stripe
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="备份名称" min-width="200" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.type === 'manual' ? 'primary' : 'success'">
              {{ scope.row.type === 'manual' ? '手动' : '自动' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="大小" width="100" />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getBackupStatusType(scope.row.status)">
              {{ scope.row.status === 'completed' ? '完成' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              size="small" 
              @click="restoreFromBackup(scope.row)"
              :disabled="scope.row.status !== 'completed'"
            >
              <el-icon><Refresh /></el-icon>
              恢复
            </el-button>
            <el-button 
              type="text" 
              size="small" 
              @click="viewBackupDetail(scope.row)"
            >
              <el-icon><View /></el-icon>
              详情
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="deleteBackup(scope.row)"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div v-else class="empty-backups">
        <el-empty description="暂无备份记录" />
      </div>
    </el-card>
    
    <!-- 备份详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="备份详情"
      width="60%"
    >
      <el-descriptions :column="1" border v-if="selectedBackup">
        <el-descriptions-item label="备份ID">{{ selectedBackup.id }}</el-descriptions-item>
        <el-descriptions-item label="备份名称">{{ selectedBackup.name }}</el-descriptions-item>
        <el-descriptions-item label="备份类型">
          <el-tag :type="selectedBackup.type === 'manual' ? 'primary' : 'success'">
            {{ selectedBackup.type === 'manual' ? '手动' : '自动' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="备份大小">{{ selectedBackup.size }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(selectedBackup.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getBackupStatusType(selectedBackup.status)">
            {{ selectedBackup.status === 'completed' ? '完成' : '失败' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="备份内容" v-if="selectedBackup.content">
          <pre>{{ selectedBackup.content }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="错误信息" v-if="selectedBackup.error">
          <pre>{{ selectedBackup.error }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { 
  Plus, 
  Refresh, 
  Download, 
  Upload, 
  View, 
  Delete 
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// 状态管理
const loading = ref(false);
const selectedBackups = ref([]);
const detailDialogVisible = ref(false);
const selectedBackup = ref(null);

// 备份设置
const backupSettings = ref({
  autoBackup: true,
  backupFrequency: 'daily',
  backupPath: './backups',
  backupRetention: 10,
  backupDatabase: true,
  backupFiles: true
});

// 备份数据
const backups = ref([
  {
    id: 1,
    name: '手动备份-20240113-100000',
    type: 'manual',
    size: '15.2 MB',
    createdAt: '2024-01-13 10:00:00',
    status: 'completed',
    content: '数据库: 包含所有表\n文件: 包含上传文件和配置文件'
  },
  {
    id: 2,
    name: '自动备份-20240113-000000',
    type: 'auto',
    size: '14.8 MB',
    createdAt: '2024-01-13 00:00:00',
    status: 'completed',
    content: '数据库: 包含所有表\n文件: 包含上传文件'
  },
  {
    id: 3,
    name: '手动备份-20240112-163000',
    type: 'manual',
    size: '13.5 MB',
    createdAt: '2024-01-12 16:30:00',
    status: 'completed',
    content: '数据库: 包含所有表\n文件: 包含上传文件和配置文件'
  },
  {
    id: 4,
    name: '自动备份-20240112-000000',
    type: 'auto',
    size: '13.2 MB',
    createdAt: '2024-01-12 00:00:00',
    status: 'completed',
    content: '数据库: 包含所有表\n文件: 包含上传文件'
  },
  {
    id: 5,
    name: '自动备份-20240111-000000',
    type: 'auto',
    size: '0 MB',
    createdAt: '2024-01-11 00:00:00',
    status: 'failed',
    error: '存储空间不足，备份失败'
  }
]);

// 格式化日期
const formatDate = (dateString) => {
  return dateString;
};

// 获取备份状态类型
const getBackupStatusType = (status) => {
  return status === 'completed' ? 'success' : 'danger';
};

// 处理选择变更
const handleSelectionChange = (val) => {
  selectedBackups.value = val;
};

// 创建备份
const createBackup = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    const newBackup = {
      id: backups.value.length + 1,
      name: `手动备份-${new Date().toISOString().replace(/[-:]/g, '').substring(0, 14)}`,
      type: 'manual',
      size: '16.0 MB',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'completed',
      content: '数据库: 包含所有表\n文件: 包含上传文件和配置文件'
    };
    backups.value.unshift(newBackup);
    ElMessage.success('备份创建成功');
  }, 1500);
};

// 从备份恢复
const restoreFromBackup = (backup) => {
  ElMessageBox.confirm(`确定要从备份 ${backup.name} 恢复系统吗？此操作将覆盖当前系统数据，且不可恢复。`, '恢复系统', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'danger'
  }).then(() => {
    loading.value = true;
    setTimeout(() => {
      loading.value = false;
      ElMessage.success('系统恢复成功');
    }, 2000);
  }).catch(() => {});
};

// 查看备份详情
const viewBackupDetail = (backup) => {
  selectedBackup.value = backup;
  detailDialogVisible.value = true;
};

// 删除备份
const deleteBackup = (backup) => {
  ElMessageBox.confirm(`确定要删除备份 ${backup.name} 吗？`, '删除备份', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'danger'
  }).then(() => {
    loading.value = true;
    setTimeout(() => {
      loading.value = false;
      const index = backups.value.findIndex(item => item.id === backup.id);
      if (index > -1) {
        backups.value.splice(index, 1);
      }
      ElMessage.success('备份删除成功');
    }, 800);
  }).catch(() => {});
};

// 刷新备份列表
const refreshBackups = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('备份列表刷新成功');
  }, 500);
};

// 导出备份
const exportBackup = () => {
  if (selectedBackups.value.length === 0) {
    ElMessage.warning('请选择要导出的备份');
    return;
  }
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('备份导出成功');
  }, 1000);
};

// 导入备份
const importBackup = () => {
  ElMessage.info('备份导入功能开发中');
};

// 保存备份设置
const saveBackupSettings = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('备份设置保存成功');
  }, 800);
};

// 初始化
onMounted(() => {
  console.log('系统备份初始化');
});
</script>

<style scoped>
.system-backup {
  padding: 20px;
}

.backup-actions {
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.backup-settings {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-backups {
  font-size: 14px;
  color: #666;
}

.empty-backups {
  padding: 40px 0;
  text-align: center;
}

@media (max-width: 768px) {
  .system-backup {
    padding: 10px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons .el-button {
    width: 100%;
  }
}
</style>