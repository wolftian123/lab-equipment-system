<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>江南大学实验设备管理系统</h1>
        <p>Laboratory Equipment Management System</p>
      </div>

      <el-form
        ref="loginForm"
        :model="form"
        :rules="rules"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名/学号/工号"
            prefix-icon="User"
            size="large"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>

        <el-form-item prop="role">
          <el-select
            v-model="form.role"
            placeholder="请选择您的角色"
            size="large"
            style="width: 100%"
          >
            <el-option label="学生" value="student" />
            <el-option label="教师" value="teacher" />
            <el-option label="设备管理员" value="admin" />
            <el-option label="实验室负责人" value="director" />
            <el-option label="校外人员" value="external" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleLogin"
            style="width: 100%; margin-top: 20px"
          >
            登录系统
          </el-button>
        </el-form-item>

        <!-- 测试账号快速登录 -->
        <div class="test-accounts-section">
          <el-divider>
            <span style="color: #909399; font-size: 14px;">测试账号（点击直接登录）</span>
          </el-divider>
          
          <div class="test-accounts-grid">
            <!-- 学生测试账号 -->
            <el-card 
              class="test-account-card student-card" 
              shadow="hover"
              @click="useTestAccount('student')"
            >
              <div class="account-content">
                <el-avatar 
                  size="48" 
                  src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
                  class="account-avatar"
                />
                <div class="account-info">
                  <div class="account-header">
                    <el-icon><User /></el-icon>
                    <h4>学生账号</h4>
                  </div>
                  <p class="account-role">🎓 学生角色</p>
                  <p class="account-creds">
                    <el-icon><User /></el-icon> 2023123456
                  </p>
                  <p class="account-creds">
                    <el-icon><Lock /></el-icon> student123
                  </p>
                  <el-tag type="success" size="small" class="account-tag">免费使用</el-tag>
                </div>
              </div>
            </el-card>
            
            <!-- 教师测试账号 -->
            <el-card 
              class="test-account-card teacher-card" 
              shadow="hover"
              @click="useTestAccount('teacher')"
            >
              <div class="account-content">
                <el-avatar 
                  size="48" 
                  src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
                  class="account-avatar"
                />
                <div class="account-info">
                  <div class="account-header">
                    <el-icon><School /></el-icon>
                    <h4>教师账号</h4>
                  </div>
                  <p class="account-role">👨‍🏫 教师角色</p>
                  <p class="account-creds">
                    <el-icon><User /></el-icon> 10001
                  </p>
                  <p class="account-creds">
                    <el-icon><Lock /></el-icon> teacher123
                  </p>
                  <el-tag type="warning" size="small" class="account-tag">可审批学生申请</el-tag>
                </div>
              </div>
            </el-card>
            
            <!-- 管理员测试账号 -->
            <el-card 
              class="test-account-card admin-card" 
              shadow="hover"
              @click="useTestAccount('admin')"
            >
              <div class="account-content">
                <el-avatar 
                  size="48" 
                  src="https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png"
                  class="account-avatar"
                />
                <div class="account-info">
                  <div class="account-header">
                    <el-icon><Setting /></el-icon>
                    <h4>管理员账号</h4>
                  </div>
                  <p class="account-role">👨‍💼 管理员角色</p>
                  <p class="account-creds">
                    <el-icon><User /></el-icon> admin001
                  </p>
                  <p class="account-creds">
                    <el-icon><Lock /></el-icon> admin123
                  </p>
                  <el-tag type="danger" size="small" class="account-tag">设备管理权限</el-tag>
                </div>
              </div>
            </el-card>
            
            <!-- ✅ 校外人员测试账号 -->
            <el-card 
              class="test-account-card external-card" 
              shadow="hover"
              @click="useTestAccount('external')"
            >
              <div class="account-content">
                <el-avatar 
                  size="48" 
                  src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
                  class="account-avatar"
                  style="background-color: #f0f9ff;"
                />
                <div class="account-info">
                  <div class="account-header">
                    <el-icon><OfficeBuilding /></el-icon>
                    <h4>校外人员账号</h4>
                  </div>
                  <p class="account-role">👤 校外人员角色</p>
                  <p class="account-creds">
                    <el-icon><User /></el-icon> ext2024001
                  </p>
                  <p class="account-creds">
                    <el-icon><Lock /></el-icon> external123
                  </p>
                  <el-tag type="primary" size="small" class="account-tag">付费使用</el-tag>
                </div>
              </div>
            </el-card>
            
            <!-- ✅ 实验室负责人测试账号 -->
            <el-card 
              class="test-account-card director-card" 
              shadow="hover"
              @click="useTestAccount('director')"
            >
              <div class="account-content">
                <el-avatar 
                  size="48" 
                  src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
                  class="account-avatar"
                  style="background-color: #fdf4ff;"
                />
                <div class="account-info">
                  <div class="account-header">
                    <el-icon><Management /></el-icon>
                    <h4>实验室负责人账号</h4>
                  </div>
                  <p class="account-role">🏢 负责人角色</p>
                  <p class="account-creds">
                    <el-icon><User /></el-icon> director001
                  </p>
                  <p class="account-creds">
                    <el-icon><Lock /></el-icon> director123
                  </p>
                  <el-tag type="info" size="small" class="account-tag">最高权限</el-tag>
                </div>
              </div>
            </el-card>
          </div>
          
          <div class="test-notice">
            <el-alert 
              title="测试说明" 
              type="info" 
              :closable="false"
            >
              <template #default>
                <div style="font-size: 12px;">
                  <p>👆 <strong>点击测试账号卡片会自动填写并登录，无需手动输入。</strong></p>
                  <p style="margin-top: 8px;">🎯 <strong>角色权限说明：</strong></p>
                  <ul style="margin: 4px 0 0 16px;">
                    <li><strong>学生</strong>：可查询设备、提交预约申请（需教师+管理员审批）</li>
                    <li><strong>教师</strong>：可审批学生申请、批量导入学生名单、管理指导学生</li>
                    <li><strong>管理员</strong>：可管理设备、审批教师/学生申请</li>
                    <li><strong>校外人员</strong>：可查询设备、付费预约（需管理员+负责人双重审批）</li>
                    <li><strong>实验室负责人</strong>：最高权限，可审批校外申请、查看财务报表</li>
                  </ul>
                </div>
              </template>
            </el-alert>
          </div>
        </div>

        <div class="login-footer">
          <div
            style="display: flex; justify-content: space-between; width: 100%"
          >
            <div>
              <el-checkbox v-model="form.remember">记住密码</el-checkbox>
              <el-link type="primary">忘记密码？</el-link>
            </div>
            <div>
              <el-link type="primary" @click="$router.push('/register')">
                还没有账号？立即注册
              </el-link>
            </div>
          </div>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import { 
  User, Lock, 
  School, Setting, 
  OfficeBuilding, Management 
} from '@element-plus/icons-vue';

const router = useRouter();
const store = useStore();

const loginForm = ref(null);
const loading = ref(false);

const form = reactive({
  username: "",
  password: "",
  role: "",
  remember: false,
});

const rules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码长度不能少于6位", trigger: "blur" },
  ],
  role: [{ required: true, message: "请选择角色", trigger: "change" }],
};

// 测试账号数据
const testAccounts = {
  student: {
    username: '2023123456',
    password: 'student123',
    role: 'student',
    userData: {
      id: 'stu_001',
      name: '张三',
      role: 'student',
      avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
      email: '2023123456@jiangnan.edu.cn',
      number: '2023123456',
      college: '计算机学院',
      major: '软件工程',
      grade: '2023级',
      phone: '13800138001',
      status: 'active',
      // 学生特有字段
      studentId: '2023123456',
      advisor: '李教授',
      admissionDate: '2023-09-01'
    }
  },
  teacher: {
    username: '10001',
    password: 'teacher123',
    role: 'teacher',
    userData: {
      id: 'tea_001',
      name: '李教授',
      role: 'teacher',
      avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
      email: 'li@jiangnan.edu.cn',
      number: '10001',
      college: '计算机学院',
      title: '教授',
      department: '软件工程系',
      phone: '13800138002',
      status: 'active',
      // 教师特有字段
      teacherId: '10001',
      researchField: '软件工程',
      position: '系主任',
      canApproveStudents: true,
      canImportStudents: true
    }
  },
  admin: {
    username: 'admin001',
    password: 'admin123',
    role: 'admin',
    userData: {
      id: 'adm_001',
      name: '王管理员',
      role: 'admin',
      avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
      email: 'admin@jiangnan.edu.cn',
      department: '设备管理处',
      position: '设备管理员',
      phone: '13800138003',
      status: 'active',
      // 管理员特有字段
      adminId: 'admin001',
      permissions: ['equipment_manage', 'approval_teacher', 'approval_student', 'user_manage'],
      canManageAllEquipment: true,
      canApproveAll: true
    }
  },
  // ✅ 新增：校外人员账号
  external: {
    username: 'ext2024001',
    password: 'external123',
    role: 'external',
    userData: {
      id: 'ext_001',
      name: '赵先生',
      role: 'external',
      avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
      email: 'zhao@company.com',
      externalId: 'ext2024001',
      company: '江南科技有限公司',
      position: '研发工程师',
      phone: '13800138000',
      address: '江苏省无锡市滨湖区',
      status: 'active',
      // 校外人员特有字段
      isPaidUser: true,
      balance: 500.00,
      paymentMethod: '预付费',
      rate: 50, // 50元/小时
      needDoubleApproval: true,
      // 限制条件
      canReserve: true,
      maxReserveHours: 8,
      canViewEquipment: true,
      canManageProfile: true
    }
  },
  // ✅ 新增：实验室负责人账号
  director: {
    username: 'director001',
    password: 'director123',
    role: 'director',
    userData: {
      id: 'dir_001',
      name: '陈主任',
      role: 'director',
      avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
      email: 'chen@jiangnan.edu.cn',
      number: 'director001',
      department: '实验室管理中心',
      position: '实验室主任',
      phone: '13800138004',
      status: 'active',
      // 实验室负责人特有权限
      directorId: 'director001',
      permissions: ['all'],
      canApproveExternal: true,
      canManageAllDevices: true,
      canViewFinancial: true,
      canManageStaff: true,
      canGenerateReports: true,
      // 财务权限
      financialAccess: true,
      reportAccess: true,
      auditAccess: true,
      // 系统权限
      systemConfig: true,
      dataExport: true
    }
  }
};

// 角色标题辅助函数
const getRoleTitle = (role) => {
  const titles = {
    student: '学生',
    teacher: '教师',
    admin: '管理员',
    external: '校外人员',
    director: '实验室负责人'
  };
  return titles[role] || '用户';
};

// 使用测试账号
const useTestAccount = (role) => {
  const account = testAccounts[role];
  
  if (!account) {
    ElMessage.error('该测试账号不存在');
    return;
  }
  
  // 自动填充表单
  form.username = account.username;
  form.password = account.password;
  form.role = account.role;
  
  // 显示加载状态
  loading.value = true;
  
  // 模拟登录过程
  setTimeout(() => {
    // 直接设置用户数据到store
    store.commit('SET_USER', account.userData);
    
    // 根据角色显示不同欢迎消息
    const welcomeMessages = {
      student: `同学，欢迎回来！祝您学习愉快！`,
      teacher: `李教授，欢迎回来！今天有3个学生申请待审批。`,
      admin: `王管理员，欢迎回来！系统运行正常。`,
      external: `赵先生，欢迎使用！当前余额：¥${account.userData.balance}`,
      director: `陈主任，欢迎回来！本周设备使用率92%。`
    };
    
    ElMessage.success({
      message: welcomeMessages[role] || `欢迎回来，${account.userData.name}！`,
      duration: 2000
    });
    
    // 跳转到仪表盘
    router.push('/main/dashboard');
    
    loading.value = false;
  }, 800);
};

// 手动登录
const handleLogin = async () => {
  if (!loginForm.value) return;

  try {
    await loginForm.value.validate();
    loading.value = true;

    // 模拟登录
    await store.dispatch("login", form);

    ElMessage.success("登录成功！");
    router.push("/main/dashboard");
  } catch (error) {
    ElMessage.error("登录失败，请检查用户名和密码");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-box {
  width: 100%;
  max-width: 480px;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 24px;
  font-weight: 600;
}

.login-header p {
  color: #7f8c8d;
  font-size: 14px;
}

.login-form {
  margin-bottom: 20px;
}

.login-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

/* 测试账号区域 */
.test-accounts-section {
  margin-top: 30px;
}

.test-accounts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.test-account-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  height: 100%;
  padding: 12px;
  border-radius: 8px;
}

.test-account-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.student-card:hover {
  border-color: #67c23a;
  background-color: rgba(103, 194, 58, 0.05);
}

.teacher-card:hover {
  border-color: #e6a23c;
  background-color: rgba(230, 162, 60, 0.05);
}

.admin-card:hover {
  border-color: #f56c6c;
  background-color: rgba(245, 108, 108, 0.05);
}

.external-card:hover {
  border-color: #409eff;
  background-color: rgba(64, 158, 255, 0.05);
}

.director-card:hover {
  border-color: #909399;
  background-color: rgba(144, 147, 153, 0.05);
}

.account-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.account-avatar {
  flex-shrink: 0;
}

.account-info {
  flex: 1;
  min-width: 0; /* 防止内容溢出 */
}

.account-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.account-header .el-icon {
  font-size: 14px;
  color: #409eff;
}

.account-info h4 {
  margin: 0;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.account-role {
  margin: 0 0 8px 0;
  color: #606266;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.account-creds {
  margin: 3px 0;
  color: #909399;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.account-creds .el-icon {
  font-size: 11px;
}

.account-tag {
  margin-top: 6px;
  font-size: 10px;
}

.test-notice {
  margin-top: 15px;
}

.test-notice .el-alert {
  border-radius: 6px;
}

.test-notice ul {
  margin: 4px 0 0 16px;
  padding: 0;
}

.test-notice li {
  margin-bottom: 2px;
  line-height: 1.4;
  font-size: 11px;
}

/* 响应式调整 */
@media (min-width: 1200px) {
  .test-accounts-grid {
    grid-template-columns: repeat(5, 1fr);
  }
  
  .login-box {
    max-width: 600px;
  }
}

@media (max-width: 1199px) and (min-width: 992px) {
  .test-accounts-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 991px) and (min-width: 768px) {
  .test-accounts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 767px) {
  .login-container {
    padding: 10px;
    align-items: flex-start;
    padding-top: 40px;
  }
  
  .login-box {
    width: 100%;
    max-width: 400px;
    padding: 25px;
  }
  
  .test-accounts-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  .account-content {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
  
  .account-header {
    justify-content: center;
  }
  
  .account-info h4 {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .login-box {
    padding: 20px 15px;
  }
  
  .test-accounts-grid {
    grid-template-columns: 1fr;
  }
  
  .login-header h1 {
    font-size: 20px;
  }
  
  .login-header p {
    font-size: 12px;
  }
}
</style>