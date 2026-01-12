<template>
  <div class="approval-list">
    <h2>{{ getTitle() }}</h2>
    
    <!-- 根据approvalType显示不同的审批列表 -->
    <template v-if="approvalType === 'student'">
      <p>学生申请审批列表</p>
      <!-- 具体实现 -->
    </template>
    
    <template v-else-if="approvalType === 'teacher'">
      <p>教师申请审批列表</p>
      <!-- 具体实现 -->
    </template>
    
    <template v-else-if="approvalType === 'external'">
      <p>校外人员申请审批列表</p>
      <!-- 具体实现 -->
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 从路由meta中获取审批类型
const approvalType = computed(() => route.meta.approvalType || 'student')

const getTitle = () => {
  const titles = {
    student: '学生申请审批',
    teacher: '教师申请审批',
    external: '校外人员申请审批'
  }
  return titles[approvalType.value] || '审批管理'
}
</script>