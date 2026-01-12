<template>
  <div class="register-container">
    <div class="register-box">
      <!-- 返回登录链接 -->
      <div class="back-to-login">
        <el-button link @click="goToLogin">
          <el-icon><ArrowLeft /></el-icon> 返回登录
        </el-button>
      </div>
      
      <div class="register-header">
        <h1>用户注册</h1>
        <p>请选择您的身份类型并填写相关信息</p>
      </div>
      
      <!-- 注册表单 -->
      <el-form 
        ref="registerForm" 
        :model="form" 
        :rules="rules" 
        class="register-form"
        label-position="top"
        @submit.prevent="handleRegister"
      >
        <!-- 用户类型选择 -->
        <el-form-item label="注册类型" prop="userType" class="user-type-select">
          <el-radio-group v-model="form.userType" @change="handleUserTypeChange">
            <el-card 
              class="user-type-card" 
              :class="{ 'selected': form.userType === 'student' }"
              @click="form.userType = 'student'"
            >
              <div class="card-content">
                <el-icon class="type-icon" size="40"><User /></el-icon>
                <h3>学生</h3>
                <p class="type-desc">在校学生注册</p>
              </div>
            </el-card>
            
            <el-card 
              class="user-type-card" 
              :class="{ 'selected': form.userType === 'teacher' }"
              @click="form.userType = 'teacher'"
            >
              <div class="card-content">
                <el-icon class="type-icon" size="40"><School /></el-icon>
                <h3>教师</h3>
                <p class="type-desc">教职员工注册</p>
              </div>
            </el-card>
            
            <el-card 
              class="user-type-card" 
              :class="{ 'selected': form.userType === 'external' }"
              @click="form.userType = 'external'"
            >
              <div class="card-content">
                <el-icon class="type-icon" size="40"><Briefcase /></el-icon>
                <h3>校外人员</h3>
                <p class="type-desc">合作单位人员注册</p>
              </div>
            </el-card>
          </el-radio-group>
        </el-form-item>
        
        <el-divider>基本信息</el-divider>
        
        <!-- 用户名和密码 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input
                v-model="form.username"
                placeholder="请输入用户名"
                prefix-icon="User"
                size="large"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input
                v-model="form.email"
                placeholder="请输入邮箱"
                prefix-icon="Message"
                size="large"
                type="email"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="form.password"
                placeholder="请输入密码（至少6位）"
                prefix-icon="Lock"
                size="large"
                type="password"
                show-password
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="form.confirmPassword"
                placeholder="请再次输入密码"
                prefix-icon="Lock"
                size="large"
                type="password"
                show-password
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <!-- 角色特定信息 -->
        <div v-if="form.userType === 'student' || form.userType === 'teacher'" class="role-specific">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item 
                :label="form.userType === 'student' ? '学号' : '工号'" 
                prop="number"
                :rules="form.userType === 'student' ? studentNumberRules : teacherNumberRules"
              >
                <el-input
                  v-model="form.number"
                  :placeholder="form.userType === 'student' ? '请输入学号' : '请输入工号'"
                  prefix-icon="Ticket"
                  size="large"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="姓名" prop="name">
                <el-input
                  v-model="form.name"
                  placeholder="请输入真实姓名"
                  prefix-icon="UserFilled"
                  size="large"
                />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="学院" prop="college">
                <el-select
                  v-model="form.college"
                  placeholder="请选择学院"
                  size="large"
                  style="width: 100%"
                >
                  <el-option label="电子信息学院" value="electronic" />
                  <el-option label="计算机学院" value="computer" />
                  <el-option label="生物工程学院" value="biology" />
                  <el-option label="机械工程学院" value="mechanical" />
                  <el-option label="材料科学与工程学院" value="material" />
                  <el-option label="设计学院" value="design" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item 
                v-if="form.userType === 'student'" 
                label="专业" 
                prop="major"
              >
                <el-input
                  v-model="form.major"
                  placeholder="请输入专业"
                  size="large"
                />
              </el-form-item>
              <el-form-item 
                v-if="form.userType === 'teacher'" 
                label="职称" 
                prop="title"
              >
                <el-select
                  v-model="form.title"
                  placeholder="请选择职称"
                  size="large"
                  style="width: 100%"
                >
                  <el-option label="教授" value="professor" />
                  <el-option label="副教授" value="associate_professor" />
                  <el-option label="讲师" value="lecturer" />
                  <el-option label="助教" value="assistant" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        
        <!-- 校外人员信息 -->
        <div v-if="form.userType === 'external'" class="role-specific">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="姓名" prop="name">
                <el-input
                  v-model="form.name"
                  placeholder="请输入真实姓名"
                  prefix-icon="UserFilled"
                  size="large"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系电话" prop="phone">
                <el-input
                  v-model="form.phone"
                  placeholder="请输入联系电话"
                  prefix-icon="Phone"
                  size="large"
                />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item label="单位名称" prop="company">
            <el-input
              v-model="form.company"
              placeholder="请输入工作单位名称"
              prefix-icon="OfficeBuilding"
              size="large"
            />
          </el-form-item>
          
          <el-form-item label="单位地址" prop="address">
            <el-input
              v-model="form.address"
              placeholder="请输入单位地址"
              prefix-icon="Location"
              size="large"
            />
          </el-form-item>
        </div>
        
        <!-- 用户须知 -->
        <div class="user-notice" v-if="form.userType">
          <el-alert 
            :type="noticeType" 
            :title="noticeTitle" 
            :description="noticeDescription"
            :closable="false"
            show-icon
          />
        </div>
        
        <!-- 协议和提交 -->
        <el-form-item prop="agreement">
          <el-checkbox v-model="form.agreement">
            我已阅读并同意
            <el-link type="primary" @click="showAgreement">《用户服务协议》</el-link>
            和
            <el-link type="primary" @click="showPrivacy">《隐私政策》</el-link>
          </el-checkbox>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleRegister"
            style="width: 100%"
          >
            立即注册
          </el-button>
        </el-form-item>
        
        <div class="login-link">
          已有账号？<el-link type="primary" @click="goToLogin">立即登录</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { 
  ElMessage, 
  ElMessageBox,
  ElLoading
} from 'element-plus'

const router = useRouter()
const store = useStore()

const registerForm = ref(null)
const loading = ref(false)

// 表单数据
const form = reactive({
  userType: 'student', // student, teacher, external
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  number: '', // 学号/工号
  name: '',
  college: '',
  major: '',
  title: '',
  phone: '',
  company: '',
  address: '',
  agreement: false
})

// 验证规则
const rules = {
  userType: [
    { required: true, message: '请选择用户类型', trigger: 'change' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          callback(new Error('密码必须包含大小写字母和数字'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== form.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  number: [
    { required: true, message: '请输入学号/工号', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  college: [
    { required: true, message: '请选择学院', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  company: [
    { required: true, message: '请输入单位名称', trigger: 'blur' }
  ],
  agreement: [
    { 
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请同意用户协议'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

// 学生学号验证规则
const studentNumberRules = [
  { required: true, message: '请输入学号', trigger: 'blur' },
  { pattern: /^\d{10}$/, message: '学号应为10位数字', trigger: 'blur' }
]

// 教师工号验证规则
const teacherNumberRules = [
  { required: true, message: '请输入工号', trigger: 'blur' },
  { pattern: /^\d{8}$/, message: '工号应为8位数字', trigger: 'blur' }
]

// 计算用户须知信息
const noticeType = computed(() => {
  switch (form.userType) {
    case 'student': return 'info'
    case 'teacher': return 'success'
    case 'external': return 'warning'
    default: return 'info'
  }
})

const noticeTitle = computed(() => {
  switch (form.userType) {
    case 'student': return '学生注册须知'
    case 'teacher': return '教师注册须知'
    case 'external': return '校外人员注册须知'
    default: return ''
  }
})

const noticeDescription = computed(() => {
  switch (form.userType) {
    case 'student':
      return '学生注册后可以预约实验设备，需经指导老师审批后方可使用。'
    case 'teacher':
      return '教师注册后可以审批学生申请、管理学生列表，并享有优先预约权。'
    case 'external':
      return '校外人员需付费使用设备，审批流程较复杂，请确保信息准确。'
    default:
      return ''
  }
})

// 用户类型变化处理
const handleUserTypeChange = (type) => {
  // 重置特定字段
  if (type !== 'student' && type !== 'teacher') {
    form.number = ''
    form.college = ''
    form.major = ''
    form.title = ''
  }
  if (type !== 'external') {
    form.phone = ''
    form.company = ''
    form.address = ''
  }
}

// 注册处理
const handleRegister = async () => {
  if (!registerForm.value) return
  
  try {
    // 验证表单
    await registerForm.value.validate()
    
    loading.value = true
    
    // 显示加载动画
    const loadingInstance = ElLoading.service({
      lock: true,
      text: '正在提交注册信息...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 构建用户数据
    const userData = {
      username: form.username,
      email: form.email,
      password: form.password,
      role: form.userType,
      ...(form.userType === 'student' || form.userType === 'teacher' ? {
        number: form.number,
        name: form.name,
        college: form.college,
        ...(form.userType === 'student' ? { major: form.major } : { title: form.title })
      } : {}),
      ...(form.userType === 'external' ? {
        name: form.name,
        phone: form.phone,
        company: form.company,
        address: form.address
      } : {})
    }
    
    // 模拟注册成功
    // 在实际项目中，这里应该调用后端API
    console.log('注册数据:', userData)
    
    // 保存用户数据到本地存储（模拟）
    localStorage.setItem('registered_user', JSON.stringify(userData))
    
    // 关闭加载动画
    loadingInstance.close()
    
    // 显示成功消息
    ElMessage.success({
      message: '注册成功！',
      duration: 2000,
      showClose: true
    })
    
    // 跳转到登录页面
    setTimeout(() => {
      router.push('/login')
    }, 1500)
    
  } catch (error) {
    loading.value = false
    console.error('注册失败:', error)
    
    if (error instanceof Error) {
      ElMessage.error(`注册失败：${error.message}`)
    } else {
      ElMessage.error('注册失败，请检查表单信息')
    }
  }
}

// 显示用户协议
const showAgreement = () => {
  ElMessageBox.alert(
    `江南大学实验设备管理系统用户服务协议
    
    1. 用户注册
    用户需提供真实、准确、完整的个人信息。
    
    2. 设备使用
    用户需按照设备使用规范操作，爱护实验设备。
    
    3. 预约规则
    按时使用设备，如需取消请提前通知。
    
    4. 责任声明
    因用户违规操作造成的设备损坏需照价赔偿。
    
    5. 隐私保护
    我们承诺保护用户个人信息安全。
    
    本协议最终解释权归江南大学所有。`,
    '用户服务协议',
    {
      confirmButtonText: '我已阅读',
      customClass: 'agreement-dialog',
      dangerouslyUseHTMLString: true
    }
  )
}

// 显示隐私政策
const showPrivacy = () => {
  ElMessageBox.alert(
    `隐私政策
    
    1. 信息收集
    我们收集必要的个人信息用于身份验证和设备管理。
    
    2. 信息使用
    个人信息仅用于系统内部管理，不会对外泄露。
    
    3. 信息安全
    采用加密技术保护用户数据安全。
    
    4. 信息共享
    除法律规定外，不会与第三方共享用户信息。
    
    5. 用户权利
    用户可以随时查看和修改个人信息。`,
    '隐私政策',
    {
      confirmButtonText: '我已阅读',
      customClass: 'privacy-dialog'
    }
  )
}

// 跳转到登录页面
const goToLogin = () => {
  router.push('/login')
}

// 组件挂载时初始化
onMounted(() => {
  // 如果有已登录用户，建议直接跳转
  const user = localStorage.getItem('user')
  if (user) {
    ElMessage.info('您已登录，正在跳转到主页...')
    setTimeout(() => {
      router.push('/main/dashboard')
    }, 1000)
  }
})
</script>

<style scoped>
.register-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-box {
  width: 800px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  background: white;
  border-radius: 15px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.back-to-login {
  margin-bottom: 20px;
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 28px;
  font-weight: 600;
}

.register-header p {
  color: #7f8c8d;
  font-size: 16px;
}

.register-form {
  margin-top: 20px;
}

.user-type-select {
  margin-bottom: 30px;
}

.user-type-select :deep(.el-radio-group) {
  display: flex;
  gap: 20px;
  width: 100%;
}

.user-type-card {
  flex: 1;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid #e4e7ed;
  background: #fafafa;
}

.user-type-card:hover {
  border-color: #409eff;
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(64, 158, 255, 0.1);
}

.user-type-card.selected {
  border-color: #409eff;
  background: #ecf5ff;
}

.card-content {
  text-align: center;
  padding: 20px 10px;
}

.type-icon {
  color: #409eff;
  margin-bottom: 15px;
}

.card-content h3 {
  margin: 10px 0;
  color: #303133;
}

.type-desc {
  color: #909399;
  font-size: 12px;
  margin: 0;
}

.role-specific {
  margin: 20px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.user-notice {
  margin: 20px 0;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #606266;
  font-size: 14px;
}

/* 滚动条样式 */
.register-box::-webkit-scrollbar {
  width: 8px;
}

.register-box::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.register-box::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.register-box::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>

<style>
/* 对话框样式 */
.agreement-dialog,
.privacy-dialog {
  max-width: 600px;
}

.agreement-dialog .el-message-box__content,
.privacy-dialog .el-message-box__content {
  max-height: 400px;
  overflow-y: auto;
  white-space: pre-line;
  line-height: 1.6;
}
</style>