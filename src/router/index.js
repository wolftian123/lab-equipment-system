// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import store from '../store'  // 导入store实例

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: {
      title: '登录',
      requiresAuth: false,
      hidden: true
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: {
      title: '注册',
      requiresAuth: false,
      hidden: true
    }
  },
  {
    path: '/main',
    name: 'Main',
    component: () => import('../views/MainLayout.vue'),
    meta: {
      requiresAuth: true
    },
    children: [
      // ==================== 仪表盘 ====================
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../components/Dashboard.vue'),
        meta: {
          title: '仪表盘',
          icon: 'Odometer',
          roles: ['student', 'teacher', 'admin', 'director', 'external']
        }
      },
      
      // ==================== 设备查询 ====================
      {
        path: 'equipment',
        name: 'Equipment',
        redirect: '/main/equipment/list',
        meta: {
          title: '设备查询',
          icon: 'Box',
          roles: ['student', 'teacher', 'admin', 'director', 'external']
        },
        children: [
          {
            path: 'list',
            name: 'EquipmentList',
            component: () => import('../components/EquipmentList.vue'),
            meta: { title: '设备列表', icon: 'Search' }
          },
          {
            path: 'detail/:id',
            name: 'EquipmentDetail',
            component: () => import('../components/EquipmentDetail.vue'),
            meta: { title: '设备详情', hidden: true }
          },
          // 设备位置（管理员和负责人可见）
          {
            path: 'map',
            name: 'EquipmentMap',
            component: () => import('../components/EquipmentMap.vue'),
            meta: { 
              title: '设备位置', 
              icon: 'Location',
              roles: ['admin', 'director']
            }
          }
        ]
      },
      
      // ==================== 预约管理 ====================
      {
        path: 'reservation',
        name: 'Reservation',
        redirect: '/main/reservation/apply',
        meta: {
          title: '预约管理',
          icon: 'Calendar',
          roles: ['student', 'teacher', 'admin', 'director', 'external']
        },
        children: [
          {
            path: 'apply',
            name: 'ReservationApply',
            component: () => import('../components/Reservation.vue'),
            meta: { title: '预约申请', icon: 'DocumentAdd' }
          },
          {
            path: 'my',
            name: 'MyReservation',
            component: () => import('../components/Reservation.vue'),
            meta: { title: '我的预约', icon: 'List' }
          },
          {
            path: 'history',
            name: 'ReservationHistory',
            component: () => import('../components/Reservation.vue'),
            meta: { title: '预约历史', icon: 'Histogram' }
          }
        ]
      },
      
      // ==================== 审批管理 ====================
      {
        path: 'approval',
        name: 'Approval',
        redirect: '/main/approval/students',
        meta: {
          title: '审批管理',
          icon: 'DocumentChecked',
          roles: ['teacher', 'admin', 'director']
        },
        children: [
          // 学生申请 - 教师、管理员、负责人可见
          {
            path: 'students',
            name: 'StudentApproval',
            component: () => import('../components/ApprovalList.vue'),
            meta: { 
              title: '学生申请', 
              icon: 'User',
              roles: ['teacher', 'admin', 'director'],
              approvalType: 'student'
            }
          },
          // 教师申请 - 管理员、负责人可见
          {
            path: 'teachers',
            name: 'TeacherApproval',
            component: () => import('../components/ApprovalList.vue'),
            meta: { 
              title: '教师申请', 
              icon: 'School',
              roles: ['admin', 'director'],
              approvalType: 'teacher'
            }
          },
          // 校外人员申请 - 只有负责人可见
          {
            path: 'external',
            name: 'ExternalApproval',
            component: () => import('../components/ApprovalList.vue'),
            meta: { 
              title: '校外人员申请', 
              icon: 'OfficeBuilding',
              roles: ['director'],
              approvalType: 'external'
            }
          }
        ]
      },
      
      // ==================== 设备管理 ====================
      {
        path: 'equipment-manage',
        name: 'EquipmentManage',
        redirect: '/main/equipment-manage/list',
        meta: {
          title: '设备管理',
          icon: 'Tools',
          roles: ['admin', 'director']
        },
        children: [
          {
            path: 'list',
            name: 'EquipmentManageList',
            component: () => import('../components/EquipmentManage.vue'),
            meta: { title: '设备台账', icon: 'List' }
          },
          {
            path: 'maintenance',
            name: 'EquipmentMaintenance',
            component: () => import('../components/EquipmentMaintenance.vue'),
            meta: { title: '设备维护', icon: 'Tools' }
          },
          {
            path: 'add',
            name: 'EquipmentAdd',
            component: () => import('../components/EquipmentAdd.vue'),
            meta: { title: '新增设备', icon: 'CirclePlus' }
          },
          {
            path: 'audit',
            name: 'EquipmentAudit',
            component: () => import('../components/EquipmentAudit.vue'),
            meta: { title: '设备审批', icon: 'DocumentChecked' }
          },
          {
            path: 'status',
            name: 'EquipmentStatus',
            component: () => import('../components/EquipmentStatus.vue'),
            meta: { title: '设备状态', icon: 'DataLine' }
          }
        ]
      },
      
      // ==================== 用户管理 ====================
      {
        path: 'user-manage',
        name: 'UserManage',
        redirect: '/main/user-manage/students',
        meta: {
          title: '用户管理',
          icon: 'User',
          roles: ['teacher', 'admin', 'director']
        },
        children: [
          // 学生管理 - 教师、管理员、负责人可见
          {
            path: 'students',
            name: 'StudentManage',
            component: () => import('../components/StudentManage.vue'),
            meta: { 
              title: '学生管理', 
              icon: 'User',
              roles: ['teacher', 'admin', 'director']
            }
          },
          // 教师管理 - 管理员、负责人可见
          {
            path: 'teachers',
            name: 'TeacherManage',
            component: () => import('../components/UserManage.vue'),
            meta: { 
              title: '教师管理', 
              icon: 'School',
              roles: ['admin', 'director']
            }
          },
          // 校外人员管理 - 只有负责人可见
          {
            path: 'external',
            name: 'ExternalUserManage',
            component: () => import('../components/ExternalUserManage.vue'),
            meta: { 
              title: '校外人员管理', 
              icon: 'OfficeBuilding',
              roles: ['director']
            }
          },
          // 管理员管理 - 只有负责人可见
          {
            path: 'admins',
            name: 'AdminManage',
            component: () => import('../components/AdminManage.vue'),
            meta: { 
              title: '管理员管理', 
              icon: 'Setting',
              roles: ['director']
            }
          }
        ]
      },
      
      // ==================== 财务管理 ====================
      {
        path: 'financial',
        name: 'Financial',
        redirect: '/main/financial/reports',
        meta: {
          title: '财务管理',
          icon: 'Money',
          roles: ['director'] // 只有实验室负责人可见
        },
        children: [
          {
            path: 'reports',
            name: 'FinancialReports',
            component: () => import('../components/FinancialReports.vue'),
            meta: { title: '财务报表', icon: 'PieChart' }
          }
        ]
      },
      
      // ==================== 报表统计 ====================
      {
        path: 'report',
        name: 'Report',
        redirect: '/main/report/usage',
        meta: {
          title: '报表统计',
          icon: 'DataAnalysis',
          roles: ['admin', 'director']
        },
        children: [
          {
            path: 'usage',
            name: 'UsageReport',
            component: () => import('../components/Reports.vue'),
            meta: { title: '使用率报表', icon: 'Histogram' }
          }
        ]
      },
      
      // ==================== 系统管理 ====================
      {
        path: 'system',
        name: 'System',
        redirect: '/main/system/settings',
        meta: {
          title: '系统管理',
          icon: 'Setting',
          roles: ['director'] // 只有实验室负责人可见
        },
        children: [
          {
            path: 'settings',
            name: 'SystemSettings',
            component: () => import('../components/SystemSettings.vue'),
            meta: { title: '系统设置', icon: 'Tools' }
          }
        ]
      },
      
      // ==================== 个人中心 ====================
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../components/UserProfile.vue'),
        meta: {
          title: '个人中心',
          icon: 'UserFilled',
          roles: ['student', 'teacher', 'admin', 'director', 'external']
        }
      },
      
      // ==================== 帮助中心 ====================
      {
        path: 'help',
        name: 'Help',
        component: () => import('../components/Help.vue'),
        meta: {
          title: '帮助中心',
          icon: 'QuestionFilled',
          roles: ['student', 'teacher', 'admin', 'director', 'external']
        }
      }
    ]
  },
  
  // ==================== 404页面 ====================
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: { 
      title: '页面不存在',
      hidden: true 
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// 🚨 路由守卫 - 完整的权限控制
router.beforeEach(async (to, from, next) => {
  // 打印路由信息（开发环境）
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 路由守卫检查 ====================')
    console.log('访问路径:', to.path)
    console.log('路由名称:', to.name)
    console.log('权限要求:', to.meta?.roles)
    console.log('路由参数:', to.params)
    console.log('路由查询:', to.query)
  }
  
  // 获取用户认证状态
  const isAuthenticated = store.getters.isAuthenticated
  const user = store.state.user
  const token = store.state.token
  
  // 用户信息摘要
  const userSummary = user ? `${user.name || user.username}(${user.role})` : '未登录'
  
  console.log('用户状态:', userSummary)
  console.log('Token状态:', token ? '有效' : '无效')
  console.log('认证状态:', isAuthenticated ? '已认证' : '未认证')
  
  // 1. 检查是否需要认证的页面
  const requiresAuth = to.meta?.requiresAuth || to.path.startsWith('/main')
  
  if (requiresAuth) {
    // 1.1 未认证，重定向到登录页
    if (!isAuthenticated || !user || !token) {
      console.log('❌ 未认证，重定向到登录页')
      
      // 保存目标路由，登录后跳转
      if (to.path !== '/login') {
        localStorage.setItem('redirectPath', to.fullPath)
      }
      
      ElMessage.warning('请先登录')
      next('/login')
      return
    }
    
    // 1.2 已认证，但访问登录页，重定向到仪表盘
    if (to.path === '/login' || to.path === '/register') {
      console.log('✅ 已认证，重定向到仪表盘')
      next('/main/dashboard')
      return
    }
  } else {
    // 2. 不需要认证的页面
    // 2.1 已认证但访问登录页，重定向到仪表盘
    if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
      console.log('✅ 已认证，重定向到仪表盘')
      next('/main/dashboard')
      return
    }
  }
  
  // 3. 角色权限检查（仅针对需要认证的页面）
  if (requiresAuth && user) {
    const requiredRoles = to.meta?.roles
    
    if (requiredRoles && requiredRoles.length > 0) {
      const hasPermission = requiredRoles.includes(user.role)
      
      if (!hasPermission) {
        console.log(`❌ 权限不足: 需要 ${requiredRoles.join(', ')}，实际 ${user.role}`)
        
        // 根据用户角色显示不同的错误信息
        let errorMessage = '您没有权限访问该页面'
        let redirectPath = '/main/dashboard'
        
        switch (user.role) {
          case 'student':
            errorMessage = '学生无法访问管理页面'
            break
          case 'teacher':
            errorMessage = '教师只能访问学生管理和审批页面'
            redirectPath = '/main/approval/students'
            break
          case 'external':
            errorMessage = '校外人员只能使用查询和预约功能'
            redirectPath = '/main/equipment/list'
            break
          case 'admin':
            errorMessage = '设备管理员无法访问系统管理页面'
            break
          case 'director':
            errorMessage = '实验室负责人无法访问该页面'
            break
        }
        
        ElMessage.error(errorMessage)
        next(redirectPath)
        return
      }
      
      console.log(`✅ 权限检查通过: ${user.role}`)
    }
  }
  
  // 4. 特殊情况检查
  
  // 4.1 学生限制 - 不能访问管理页面
  if (user?.role === 'student') {
    const studentRestrictedPaths = [
      '/main/approval',
      '/main/equipment-manage',
      '/main/user-manage/teachers',
      '/main/user-manage/external',
      '/main/user-manage/admins',
      '/main/financial',
      '/main/report',
      '/main/system'
    ]
    
    if (studentRestrictedPaths.some(path => to.path.startsWith(path))) {
      console.log('❌ 学生不能访问管理页面')
      ElMessage.error('学生只能访问查询和预约功能')
      next('/main/dashboard')
      return
    }
  }
  
  // 4.2 校外人员限制 - 付费用户特殊规则
  if (user?.role === 'external') {
    const externalRestrictedPaths = [
      '/main/approval',
      '/main/equipment-manage',
      '/main/user-manage',
      '/main/financial',
      '/main/report',
      '/main/system'
    ]
    
    if (externalRestrictedPaths.some(path => to.path.startsWith(path))) {
      console.log('❌ 校外人员不能访问管理页面')
      ElMessage.error('校外人员只能使用查询和预约功能')
      next('/main/equipment/list')
      return
    }
    
    // 检查余额是否充足（模拟）
    if (to.path === '/main/reservation/apply' && user.balance < 50) {
      console.log('❌ 校外人员余额不足')
      ElMessage.warning('余额不足，请先充值（当前设备使用费：¥50/小时）')
      // 可以跳转到充值页面
      next('/main/profile')
      return
    }
  }
  
  // 4.3 教师限制 - 只能访问学生相关管理
  if (user?.role === 'teacher') {
    const teacherRestrictedPaths = [
      '/main/approval/teachers',
      '/main/approval/external',
      '/main/equipment-manage',
      '/main/user-manage/teachers',
      '/main/user-manage/external',
      '/main/user-manage/admins',
      '/main/financial',
      '/main/system'
    ]
    
    if (teacherRestrictedPaths.some(path => to.path.startsWith(path))) {
      console.log('❌ 教师只能访问学生相关管理')
      ElMessage.error('教师只能管理学生和审批学生申请')
      next('/main/approval/students')
      return
    }
  }
  
  // 4.4 设备管理员限制 - 不能访问系统管理和财务管理
  if (user?.role === 'admin') {
    const adminRestrictedPaths = [
      '/main/financial',
      '/main/system',
      '/main/user-manage/external',
      '/main/user-manage/admins',
      '/main/approval/external'
    ]
    
    if (adminRestrictedPaths.some(path => to.path.startsWith(path))) {
      console.log('❌ 设备管理员权限不足')
      ElMessage.error('设备管理员无法访问财务和系统管理')
      next('/main/equipment-manage/list')
      return
    }
  }
  
  // 5. Token有效性检查（模拟）
  if (requiresAuth && token) {
    // 检查token是否即将过期（这里只是示例）
    const tokenAge = Date.now() - parseInt(token.split('_').pop() || '0')
    const maxTokenAge = 24 * 60 * 60 * 1000 // 24小时
    
    if (tokenAge > maxTokenAge) {
      console.log('⚠️ Token即将过期，尝试刷新')
      
      try {
        // 尝试刷新token
        await store.dispatch('refreshToken')
        console.log('✅ Token刷新成功')
      } catch (error) {
        console.log('❌ Token刷新失败，需要重新登录')
        ElMessage.warning('登录已过期，请重新登录')
        
        // 清除认证信息
        store.dispatch('logout')
        next('/login')
        return
      }
    }
  }
  
  // 6. 所有检查通过，允许访问
  console.log('✅ 所有检查通过，允许访问')
  
  // 7. 设置页面标题
  if (to.meta?.title) {
    const systemName = '江南大学实验设备管理系统'
    const pageTitle = to.meta.title
    
    // 如果是子页面，显示父页面标题
    if (to.matched.length > 1) {
      const parentRoute = to.matched[to.matched.length - 2]
      if (parentRoute.meta?.title) {
        document.title = `${pageTitle} - ${parentRoute.meta.title} - ${systemName}`
      } else {
        document.title = `${pageTitle} - ${systemName}`
      }
    } else {
      document.title = `${pageTitle} - ${systemName}`
    }
  }
  
  // 8. 如果是404页面，记录日志
  if (to.name === 'NotFound') {
    console.warn('访问了不存在的页面:', from.path, '->', to.path)
  }
  
  next()
})

// 路由后置守卫
router.afterEach((to, from) => {
  // 开发环境记录路由跳转
  if (process.env.NODE_ENV === 'development') {
    console.log(`📍 路由跳转: ${from.path} -> ${to.path}`)
  }
  
  // 记录页面访问（可以用于统计分析）
  if (to.meta?.title && to.path !== '/login' && to.path !== '/register') {
    const visitLog = {
      path: to.path,
      title: to.meta.title,
      timestamp: new Date().toISOString(),
      user: store.state.user?.id
    }
    
    // 保存到localStorage（实际项目中应该发送到服务器）
    const logs = JSON.parse(localStorage.getItem('visitLogs') || '[]')
    logs.push(visitLog)
    
    // 只保留最近50条记录
    if (logs.length > 50) {
      logs.splice(0, logs.length - 50)
    }
    
    localStorage.setItem('visitLogs', JSON.stringify(logs))
  }
  
  // 滚动到顶部
  window.scrollTo(0, 0)
})

// 路由错误处理
router.onError((error) => {
  console.error('🚨 路由错误:', error)
  
  // 处理组件加载失败
  if (/loading chunk \d+ failed/.test(error.message)) {
    ElMessage.error('页面加载失败，请刷新页面')
    
    // 可以尝试重新加载
    const path = router.currentRoute.value.fullPath
    router.replace(path).then(() => {
      window.location.reload()
    })
  }
})

export default router