<template>
  <div class="equipment-detail">
    <h2>设备详情</h2>
    <p>查看设备的详细信息</p>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-spinner size="large" />
      <p>加载中...</p>
    </div>
    
    <!-- 设备不存在 -->
    <div v-else-if="!equipment" class="error-container">
      <el-empty description="设备不存在或已删除" />
      <el-button type="primary" @click="goBack">返回列表</el-button>
    </div>
    
    <!-- 设备详细信息 -->
    <div v-else class="equipment-info">
      <!-- 基本信息 -->
      <el-card class="basic-info" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
            <el-button type="primary" size="small" @click="reserveEquipment" style="margin-left: 10px;">
              <el-icon><Calendar /></el-icon>
              预约使用
            </el-button>
          </div>
        </template>
        
        <div class="info-grid">
          <div class="info-item">
            <label>设备名称：</label>
            <span>{{ equipment.name }}</span>
          </div>
          <div class="info-item">
            <label>设备编号：</label>
            <span>{{ equipment.code }}</span>
          </div>
          <div class="info-item">
            <label>设备型号：</label>
            <span>{{ equipment.model }}</span>
          </div>
          <div class="info-item">
            <label>设备状态：</label>
            <el-tag :type="getStatusType(equipment.status)">{{ equipment.statusText }}</el-tag>
          </div>
          <div class="info-item">
            <label>所属实验室：</label>
            <span>{{ equipment.laboratory }}</span>
          </div>
          <div class="info-item">
            <label>存放位置：</label>
            <span>{{ equipment.location }}</span>
          </div>
          <div class="info-item">
            <label>负责人：</label>
            <span>{{ equipment.manager }}</span>
          </div>
          <div class="info-item">
            <label>联系电话：</label>
            <span>{{ equipment.contactPhone }}</span>
          </div>
        </div>
      </el-card>
      
      <!-- 技术参数 -->
      <el-card class="tech-params" shadow="hover" style="margin-top: 20px;">
        <template #header>
          <span>技术参数</span>
        </template>
        
        <div class="params-grid">
          <div v-for="(param, index) in equipment.techParams" :key="index" class="param-item">
            <label>{{ param.name }}：</label>
            <span>{{ param.value }}</span>
          </div>
        </div>
      </el-card>
      
      <!-- 使用说明 -->
      <el-card class="usage-info" shadow="hover" style="margin-top: 20px;">
        <template #header>
          <span>使用说明</span>
        </template>
        
        <div class="usage-content">
          <p v-for="(item, index) in equipment.usageInstructions" :key="index" class="usage-item">
            {{ item }}
          </p>
        </div>
      </el-card>
      
      <!-- 历史使用记录 -->
      <el-card class="usage-history" shadow="hover" style="margin-top: 20px;">
        <template #header>
          <span>历史使用记录</span>
        </template>
        
        <el-table :data="equipment.usageHistory" style="width: 100%;">
          <el-table-column prop="user" label="使用人" width="120" />
          <el-table-column prop="date" label="使用日期" width="180" />
          <el-table-column prop="purpose" label="使用目的" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'completed' ? 'success' : 'warning'">
                {{ scope.row.status === 'completed' ? '已完成' : '进行中' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
      
      <!-- 操作按钮 -->
      <div class="action-buttons" style="margin-top: 20px;">
        <el-button @click="goBack">返回列表</el-button>
        <el-button type="primary" @click="reserveEquipment">立即预约</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Calendar } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 响应式数据
const equipment = ref(null)
const loading = ref(true)

// 获取设备ID参数
const equipmentId = computed(() => route.params.id)

// 生命周期钩子
onMounted(() => {
  fetchEquipmentDetail()
})

// 获取设备详情
function fetchEquipmentDetail() {
  loading.value = true
  // 模拟API请求
  setTimeout(() => {
    // 模拟设备数据
    equipment.value = {
      id: equipmentId.value,
      name: '高精度光谱分析仪',
      code: 'EQ-2024-001',
      model: 'SpectraPro-5000',
      status: 'available',
      statusText: '可使用',
      laboratory: '物理实验室',
      location: '科技楼A座302室',
      manager: '张教授',
      contactPhone: '13800138001',
      techParams: [
        { name: '波长范围', value: '200-1100nm' },
        { name: '分辨率', value: '0.1nm' },
        { name: '扫描速度', value: '1000nm/min' },
        { name: '光源', value: '氙灯+钨灯' },
        { name: '检测器', value: 'CCD阵列' },
        { name: '重量', value: '50kg' }
      ],
      usageInstructions: [
        '使用前请阅读操作手册',
        '开机预热15分钟',
        '使用完毕后清理设备',
        '填写使用记录',
        '关闭电源和光源'
      ],
      usageHistory: [
        { user: '李同学', date: '2024-01-10', purpose: '实验课程', status: 'completed' },
        { user: '王老师', date: '2024-01-08', purpose: '科研项目', status: 'completed' },
        { user: '赵同学', date: '2024-01-05', purpose: '毕业设计', status: 'completed' }
      ]
    }
    loading.value = false
  }, 1000)
}

// 获取状态类型
function getStatusType(status) {
  const statusMap = {
    available: 'success',
    busy: 'warning',
    maintenance: 'info',
    broken: 'danger'
  }
  return statusMap[status] || 'default'
}

// 返回列表
function goBack() {
  router.push('/main/equipment/list')
}

// 预约设备
function reserveEquipment() {
  if (equipment.value.status !== 'available') {
    ElMessage.warning('该设备当前不可预约')
    return
  }
  router.push({
    path: '/main/reservation/apply',
    query: { equipmentId: equipment.value.id, equipmentName: equipment.value.name }
  })
}
</script>

<style scoped>
.equipment-detail {
  padding: 20px;
}

.loading-container, .error-container {
  text-align: center;
  padding: 60px 0;
}

.equipment-info {
  max-width: 1200px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-item label {
  font-weight: 500;
  margin-right: 10px;
  min-width: 100px;
}

.params-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.param-item {
  display: flex;
  align-items: center;
}

.param-item label {
  font-weight: 500;
  margin-right: 10px;
  min-width: 120px;
}

.usage-content {
  margin-top: 20px;
}

.usage-item {
  margin-bottom: 10px;
  line-height: 1.6;
}

.action-buttons {
  margin-top: 30px;
  display: flex;
  gap: 10px;
}
</style>