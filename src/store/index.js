import { createStore } from "vuex"
import { ElMessage } from 'element-plus'

export default createStore({
  state: {
    // 用户信息
    user: JSON.parse(localStorage.getItem("user") || "null"),
    // 认证token
    token: localStorage.getItem("token") || null,
    // 侧边栏折叠状态
    sidebarCollapsed: localStorage.getItem("sidebarCollapsed") === "true",
    // 用户偏好设置
    preferences: JSON.parse(localStorage.getItem("preferences") || "{}"),
    // 全局加载状态
    loading: false,
    // 待审批数量（缓存）
    pendingCounts: {
      student: 0,  // 学生申请待审批
      teacher: 0,  // 教师申请待审批
      external: 0  // 校外申请待审批
    }
  },
  
  mutations: {
    // 设置用户信息
    SET_USER(state, user) {
      state.user = user
      localStorage.setItem("user", JSON.stringify(user))
    },
    
    // 设置token
    SET_TOKEN(state, token) {
      state.token = token
      localStorage.setItem("token", token)
    },
    
    // 清除认证信息
    CLEAR_AUTH(state) {
      state.user = null
      state.token = null
      localStorage.removeItem("user")
      localStorage.removeItem("token")
    },
    
    // 切换侧边栏折叠状态
    TOGGLE_SIDEBAR(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed
      localStorage.setItem("sidebarCollapsed", state.sidebarCollapsed)
    },
    
    SET_SIDEBAR_COLLAPSED(state, collapsed) {
      state.sidebarCollapsed = collapsed
      localStorage.setItem("sidebarCollapsed", collapsed)
    },
    
    // 设置加载状态
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    
    // 更新用户偏好
    UPDATE_PREFERENCES(state, preferences) {
      state.preferences = { ...state.preferences, ...preferences }
      localStorage.setItem("preferences", JSON.stringify(state.preferences))
    },
    
    // 更新待审批数量
    UPDATE_PENDING_COUNTS(state, counts) {
      state.pendingCounts = { ...state.pendingCounts, ...counts }
    }
  },
  
  actions: {
    // 登录操作
    async login({ commit }, formData) {
      try {
        commit('SET_LOADING', true)
        
        // 根据角色生成不同的用户数据
        const userData = generateUserData(formData)
        const token = generateToken(formData.username)
        
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // 提交用户数据和token
        commit('SET_USER', userData)
        commit('SET_TOKEN', token)
        
        // 根据角色初始化待审批数量
        initializePendingCounts(commit, formData.role)
        
        ElMessage.success({
          message: getWelcomeMessage(userData),
          duration: 2000
        })
        
        return Promise.resolve({ user: userData, token })
      } catch (error) {
        ElMessage.error('登录失败：' + error.message)
        return Promise.reject(error)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 使用测试账号登录
    async loginWithTestAccount({ commit }, role) {
      try {
        commit('SET_LOADING', true)
        
        const testAccount = getTestAccount(role)
        const userData = testAccount.userData
        const token = generateToken(userData.id)
        
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 600))
        
        commit('SET_USER', userData)
        commit('SET_TOKEN', token)
        
        // 根据角色初始化待审批数量
        initializePendingCounts(commit, role)
        
        ElMessage.success({
          message: getWelcomeMessage(userData),
          duration: 2000
        })
        
        return Promise.resolve({ user: userData, token })
      } catch (error) {
        ElMessage.error('测试账号登录失败：' + error.message)
        return Promise.reject(error)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 退出登录
    logout({ commit }) {
      commit('CLEAR_AUTH')
      ElMessage.success('退出登录成功')
    },
    
    // 更新用户信息
    updateUser({ commit, state }, userInfo) {
      const updatedUser = { ...state.user, ...userInfo }
      commit('SET_USER', updatedUser)
      ElMessage.success('个人信息更新成功')
    },
    
    // 刷新token
    refreshToken({ commit, state }) {
      if (state.user) {
        const newToken = generateToken(state.user.id)
        commit('SET_TOKEN', newToken)
        console.log('Token已刷新')
      }
    },
    
    // 切换侧边栏
    toggleSidebar({ commit }) {
      commit('TOGGLE_SIDEBAR')
    },
    
    // 更新待审批数量
    updatePendingCounts({ commit }, counts) {
      commit('UPDATE_PENDING_COUNTS', counts)
    },
    
    // 模拟获取待审批数量（实际项目中应该调用API）
    fetchPendingCounts({ commit, state }) {
      if (!state.user) return
      
      // 根据用户角色返回模拟数据
      const role = state.user.role
      let counts = { student: 0, teacher: 0, external: 0 }
      
      switch (role) {
        case 'teacher':
          counts.student = 3  // 教师有3个学生申请待审批
          break
        case 'admin':
          counts.student = 2  // 管理员有2个学生申请待审批
          counts.teacher = 1  // 管理员有1个教师申请待审批
          break
        case 'director':
          counts.student = 1  // 负责人有1个学生申请待审批
          counts.teacher = 1  // 负责人有1个教师申请待审批
          counts.external = 2 // 负责人有2个校外申请待审批
          break
        default:
          break
      }
      
      commit('UPDATE_PENDING_COUNTS', counts)
      return counts
    }
  },
  
  getters: {
    // 是否已认证
    isAuthenticated: state => !!state.token && !!state.user,
    
    // 获取用户角色
    userRole: state => state.user?.role,
    
    // 获取完整用户信息
    currentUser: state => state.user,
    
    // 是否为学生
    isStudent: state => state.user?.role === 'student',
    
    // 是否为教师
    isTeacher: state => state.user?.role === 'teacher',
    
    // 是否为设备管理员
    isAdmin: state => state.user?.role === 'admin',
    
    // 是否为实验室负责人
    isDirector: state => state.user?.role === 'director',
    
    // 是否为校外人员
    isExternal: state => state.user?.role === 'external',
    
    // 获取待审批总数
    totalPendingCount: state => {
      const counts = state.pendingCounts
      return counts.student + counts.teacher + counts.external
    },
    
    // 获取学生待审批数
    studentPendingCount: state => state.pendingCounts.student,
    
    // 获取教师待审批数
    teacherPendingCount: state => state.pendingCounts.teacher,
    
    // 获取校外待审批数
    externalPendingCount: state => state.pendingCounts.external,
    
    // 获取用户显示名称
    userDisplayName: state => {
      if (!state.user) return '用户'
      return state.user.name || state.user.username || '用户'
    },
    
    // 获取用户头像
    userAvatar: state => {
      if (!state.user) return ''
      return state.user.avatar || getDefaultAvatar(state.user?.role)
    },
    
    // 获取用户部门/学院信息
    userDepartment: state => {
      if (!state.user) return ''
      const user = state.user
      
      if (user.role === 'student' || user.role === 'teacher') {
        return user.college || '江南大学'
      } else if (user.role === 'admin') {
        return user.department || '设备管理处'
      } else if (user.role === 'director') {
        return user.department || '实验室管理中心'
      } else if (user.role === 'external') {
        return user.company || '校外单位'
      }
      return '江南大学'
    }
  }
})

// ============= 辅助函数 =============

// 根据表单数据生成用户数据
function generateUserData(formData) {
  const baseUser = {
    id: formData.username,
    name: formData.username,
    username: formData.username,
    role: formData.role,
    loginTime: new Date().toISOString(),
    status: 'active'
  }
  
  // 根据角色添加额外信息
  switch (formData.role) {
    case 'student':
      return {
        ...baseUser,
        name: `学生${formData.username.slice(-4)}`,
        studentId: formData.username,
        college: '计算机学院',
        major: '软件工程',
        grade: '2023级',
        advisor: '李教授',
        avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
        email: `${formData.username}@jiangnan.edu.cn`,
        phone: '13800138000'
      }
      
    case 'teacher':
      return {
        ...baseUser,
        name: `教师${formData.username}`,
        teacherId: formData.username,
        college: '计算机学院',
        title: '教授',
        department: '软件工程系',
        researchField: '软件工程',
        avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
        email: `${formData.username}@jiangnan.edu.cn`,
        phone: '13800138001',
        canApproveStudents: true,
        canImportStudents: true
      }
      
    case 'admin':
      return {
        ...baseUser,
        name: '设备管理员',
        adminId: formData.username,
        department: '设备管理处',
        position: '设备管理员',
        avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
        email: 'admin@jiangnan.edu.cn',
        phone: '13800138002',
        permissions: ['equipment_manage', 'approval_teacher', 'approval_student', 'user_manage'],
        canManageAllEquipment: true,
        canApproveAll: true
      }
      
    case 'director':
      return {
        ...baseUser,
        name: '实验室主任',
        directorId: formData.username,
        department: '实验室管理中心',
        position: '实验室主任',
        avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
        email: 'director@jiangnan.edu.cn',
        phone: '13800138003',
        permissions: ['all'],
        canApproveExternal: true,
        canManageAllDevices: true,
        canViewFinancial: true,
        canManageStaff: true,
        canGenerateReports: true,
        financialAccess: true,
        systemConfig: true
      }
      
    case 'external':
      return {
        ...baseUser,
        name: '校外用户',
        externalId: formData.username,
        company: '江南科技有限公司',
        position: '研发工程师',
        avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
        email: 'external@company.com',
        phone: '13800138004',
        isPaidUser: true,
        balance: 500.00,
        rate: 50, // 50元/小时
        needDoubleApproval: true,
        canReserve: true,
        maxReserveHours: 8
      }
      
    default:
      return baseUser
  }
}

// 生成token
function generateToken(username) {
  return `jnu_equipment_${username}_${Date.now()}_${Math.random().toString(36).substr(2)}`
}

// 获取测试账号数据
function getTestAccount(role) {
  const testAccounts = {
    student: {
      username: '2023123456',
      password: 'student123',
      role: 'student',
      userData: {
        id: 'stu_001',
        name: '张三',
        role: 'student',
        username: '2023123456',
        studentId: '2023123456',
        college: '计算机学院',
        major: '软件工程',
        grade: '2023级',
        advisor: '李教授',
        avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
        email: '2023123456@jiangnan.edu.cn',
        phone: '13800138001',
        status: 'active',
        loginTime: new Date().toISOString()
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
        username: '10001',
        teacherId: '10001',
        college: '计算机学院',
        title: '教授',
        department: '软件工程系',
        researchField: '软件工程',
        avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
        email: 'li@jiangnan.edu.cn',
        phone: '13800138002',
        status: 'active',
        loginTime: new Date().toISOString(),
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
        username: 'admin001',
        adminId: 'admin001',
        department: '设备管理处',
        position: '设备管理员',
        avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
        email: 'admin@jiangnan.edu.cn',
        phone: '13800138003',
        status: 'active',
        loginTime: new Date().toISOString(),
        permissions: ['equipment_manage', 'approval_teacher', 'approval_student', 'user_manage'],
        canManageAllEquipment: true,
        canApproveAll: true
      }
    },
    director: {
      username: 'director001',
      password: 'director123',
      role: 'director',
      userData: {
        id: 'dir_001',
        name: '陈主任',
        role: 'director',
        username: 'director001',
        directorId: 'director001',
        department: '实验室管理中心',
        position: '实验室主任',
        avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
        email: 'chen@jiangnan.edu.cn',
        phone: '13800138004',
        status: 'active',
        loginTime: new Date().toISOString(),
        permissions: ['all'],
        canApproveExternal: true,
        canManageAllDevices: true,
        canViewFinancial: true,
        canManageStaff: true,
        canGenerateReports: true,
        financialAccess: true,
        systemConfig: true
      }
    },
    external: {
      username: 'ext2024001',
      password: 'external123',
      role: 'external',
      userData: {
        id: 'ext_001',
        name: '赵先生',
        role: 'external',
        username: 'ext2024001',
        externalId: 'ext2024001',
        company: '江南科技有限公司',
        position: '研发工程师',
        avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
        email: 'zhao@company.com',
        phone: '13800138000',
        status: 'active',
        loginTime: new Date().toISOString(),
        isPaidUser: true,
        balance: 500.00,
        paymentMethod: '预付费',
        rate: 50,
        needDoubleApproval: true,
        canReserve: true,
        maxReserveHours: 8
      }
    }
  }
  
  return testAccounts[role] || testAccounts.student
}

// 获取欢迎消息
function getWelcomeMessage(user) {
  const messages = {
    student: `同学，欢迎回来！祝您学习愉快！`,
    teacher: `老师，欢迎回来！今天有新的学生申请待审批。`,
    admin: `管理员，欢迎回来！系统运行正常，设备管理有序。`,
    director: `主任，欢迎回来！今天有校外申请待审批，请及时处理。`,
    external: `先生/女士，欢迎使用！当前余额：¥${user.balance}，校外人员使用设备需付费。`
  }
  return messages[user.role] || '欢迎回来！'
}

// 初始化待审批数量
function initializePendingCounts(commit, role) {
  let counts = { student: 0, teacher: 0, external: 0 }
  
  switch (role) {
    case 'teacher':
      counts.student = 3
      break
    case 'admin':
      counts.student = 2
      counts.teacher = 1
      break
    case 'director':
      counts.student = 1
      counts.teacher = 1
      counts.external = 2
      break
    default:
      break
  }
  
  commit('UPDATE_PENDING_COUNTS', counts)
}

// 获取默认头像
function getDefaultAvatar(role) {
  const avatars = {
    student: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    teacher: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    admin: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
    director: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    external: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
  }
  return avatars[role] || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
}