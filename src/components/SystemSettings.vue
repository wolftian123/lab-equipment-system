<template>
  <div class="system-settings">
    <h2>系统设置</h2>
    <p>管理员功能：配置系统参数和选项</p>
    
    <!-- 基本设置 -->
    <el-card shadow="hover" class="settings-card">
      <template #header>
        <div class="card-header">
          <span>基本设置</span>
        </div>
      </template>
      
      <el-form :model="settings" :rules="formRules" ref="formRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="系统名称" prop="systemName">
              <el-input v-model="settings.systemName" placeholder="输入系统名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="系统版本" prop="systemVersion">
              <el-input v-model="settings.systemVersion" placeholder="输入系统版本" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="系统语言" prop="systemLanguage">
              <el-select v-model="settings.systemLanguage" placeholder="选择系统语言">
                <el-option label="中文" value="zh-CN" />
                <el-option label="English" value="en-US" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="时区设置" prop="timeZone">
              <el-select v-model="settings.timeZone" placeholder="选择时区">
                <el-option label="UTC+8 (中国)" value="Asia/Shanghai" />
                <el-option label="UTC+0 (格林威治)" value="UTC" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="系统描述">
              <el-input v-model="settings.systemDescription" type="textarea" placeholder="输入系统描述" rows="3" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
    
    <!-- 安全设置 -->
    <el-card shadow="hover" class="settings-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>安全设置</span>
        </div>
      </template>
      
      <el-form :model="securitySettings" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="登录失败限制" prop="loginFailLimit">
              <el-input-number v-model="securitySettings.loginFailLimit" :min="0" :max="10" />
              <span style="margin-left: 10px;">次后锁定账户</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="会话超时" prop="sessionTimeout">
              <el-input-number v-model="securitySettings.sessionTimeout" :min="5" :max="120" />
              <span style="margin-left: 10px;">分钟</span>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="密码复杂度" prop="passwordComplexity">
              <el-select v-model="securitySettings.passwordComplexity" placeholder="选择密码复杂度">
                <el-option label="低" value="low" />
                <el-option label="中" value="medium" />
                <el-option label="高" value="high" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="密码过期" prop="passwordExpiry">
              <el-input-number v-model="securitySettings.passwordExpiry" :min="0" :max="365" />
              <span style="margin-left: 10px;">天（0表示永不过期）</span>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="启用验证码">
              <el-switch v-model="securitySettings.enableCaptcha" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="启用IP限制">
              <el-switch v-model="securitySettings.enableIPRestriction" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
    
    <!-- 邮件设置 -->
    <el-card shadow="hover" class="settings-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>邮件设置</span>
        </div>
      </template>
      
      <el-form :model="emailSettings" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="SMTP服务器" prop="smtpServer">
              <el-input v-model="emailSettings.smtpServer" placeholder="输入SMTP服务器地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="SMTP端口" prop="smtpPort">
              <el-input-number v-model="emailSettings.smtpPort" :min="1" :max="65535" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发件人邮箱" prop="senderEmail">
              <el-input v-model="emailSettings.senderEmail" placeholder="输入发件人邮箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱密码" prop="emailPassword">
              <el-input v-model="emailSettings.emailPassword" type="password" placeholder="输入邮箱密码" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="启用SSL">
              <el-switch v-model="emailSettings.enableSSL" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发送测试邮件">
              <el-button type="primary" @click="sendTestEmail">发送测试</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
    
    <!-- 存储设置 -->
    <el-card shadow="hover" class="settings-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>存储设置</span>
        </div>
      </template>
      
      <el-form :model="storageSettings" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="文件存储路径" prop="fileStoragePath">
              <el-input v-model="storageSettings.fileStoragePath" placeholder="输入文件存储路径" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大文件大小" prop="maxFileSize">
              <el-input-number v-model="storageSettings.maxFileSize" :min="1" :max="1024" />
              <span style="margin-left: 10px;">MB</span>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="允许的文件类型" prop="allowedFileTypes">
              <el-input v-model="storageSettings.allowedFileTypes" placeholder="输入允许的文件类型，用逗号分隔" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="启用文件压缩">
              <el-switch v-model="storageSettings.enableFileCompression" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
    
    <!-- 操作按钮 -->
    <div class="action-buttons" style="margin-top: 30px;">
      <el-button type="primary" @click="saveSettings">
        <el-icon><Check /></el-icon>
        保存设置
      </el-button>
      <el-button type="warning" @click="resetSettings">
        <el-icon><Refresh /></el-icon>
        恢复默认
      </el-button>
      <el-button @click="exportSettings">
        <el-icon><Download /></el-icon>
        导出设置
      </el-button>
      <el-button @click="importSettings">
        <el-icon><Upload /></el-icon>
        导入设置
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { 
  Check, 
  Refresh, 
  Download, 
  Upload 
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// 状态管理
const loading = ref(false);

// 基本设置
const settings = ref({
  systemName: '江南大学实验设备管理系统',
  systemVersion: '1.0.0',
  systemLanguage: 'zh-CN',
  timeZone: 'Asia/Shanghai',
  systemDescription: '江南大学实验室设备管理系统，用于管理实验室设备的预约、使用和维护'
});

// 安全设置
const securitySettings = ref({
  loginFailLimit: 5,
  sessionTimeout: 30,
  passwordComplexity: 'medium',
  passwordExpiry: 90,
  enableCaptcha: true,
  enableIPRestriction: false
});

// 邮件设置
const emailSettings = ref({
  smtpServer: 'smtp.qq.com',
  smtpPort: 587,
  senderEmail: 'example@qq.com',
  emailPassword: '',
  enableSSL: true
});

// 存储设置
const storageSettings = ref({
  fileStoragePath: './uploads',
  maxFileSize: 50,
  allowedFileTypes: 'jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx',
  enableFileCompression: true
});

// 表单验证规则
const formRules = {
  systemName: [{ required: true, message: '请输入系统名称', trigger: 'blur' }],
  systemVersion: [{ required: true, message: '请输入系统版本', trigger: 'blur' }],
  systemLanguage: [{ required: true, message: '请选择系统语言', trigger: 'change' }],
  timeZone: [{ required: true, message: '请选择时区', trigger: 'change' }]
};

// 保存设置
const saveSettings = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    
    ElMessage.success('系统设置保存成功');
  }, 1000);
};

// 恢复默认设置
const resetSettings = () => {
  ElMessageBox.confirm('确定要恢复默认设置吗？', '恢复默认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 恢复默认值
    settings.value = {
      systemName: '江南大学实验设备管理系统',
      systemVersion: '1.0.0',
      systemLanguage: 'zh-CN',
      timeZone: 'Asia/Shanghai',
      systemDescription: '江南大学实验室设备管理系统，用于管理实验室设备的预约、使用和维护'
    };
    
    securitySettings.value = {
      loginFailLimit: 5,
      sessionTimeout: 30,
      passwordComplexity: 'medium',
      passwordExpiry: 90,
      enableCaptcha: true,
      enableIPRestriction: false
    };
    
    emailSettings.value = {
      smtpServer: 'smtp.qq.com',
      smtpPort: 587,
      senderEmail: 'example@qq.com',
      emailPassword: '',
      enableSSL: true
    };
    
    storageSettings.value = {
      fileStoragePath: './uploads',
      maxFileSize: 50,
      allowedFileTypes: 'jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx',
      enableFileCompression: true
    };
    
    ElMessage.success('已恢复默认设置');
  }).catch(() => {});
};

// 导出设置
const exportSettings = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('设置导出成功');
  }, 800);
};

// 导入设置
const importSettings = () => {
  ElMessage.info('设置导入功能开发中');
};

// 发送测试邮件
const sendTestEmail = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('测试邮件发送成功');
  }, 1000);
};

// 初始化
onMounted(() => {
  console.log('系统设置初始化');
});
</script>

<style scoped>
.system-settings {
  padding: 20px;
}

.settings-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}

@media (max-width: 768px) {
  .system-settings {
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