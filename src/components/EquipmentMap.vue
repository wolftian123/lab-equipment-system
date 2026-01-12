<template>
  <div class="equipment-map">
    <h2>设备位置</h2>
    <p>可视化查看设备在实验室的分布情况</p>
    
    <!-- 操作按钮 -->
    <el-card shadow="hover" class="action-card">
      <div class="action-buttons">
        <el-button type="primary" @click="toggleFullscreen">
          <el-icon><FullScreen /></el-icon>
          全屏查看
        </el-button>
        <el-button type="success" @click="exportMap">
          <el-icon><Download /></el-icon>
          导出地图
        </el-button>
        <el-button @click="refreshMap">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </el-card>
    
    <!-- 地图控制 -->
    <el-card shadow="hover" class="control-card" style="margin-top: 20px;">
      <div class="map-controls">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-select v-model="selectedBuilding" placeholder="选择实验楼" @change="filterByBuilding">
              <el-option label="全部实验楼" value="" />
              <el-option label="实验楼A座" value="building-a" />
              <el-option label="实验楼B座" value="building-b" />
              <el-option label="实验楼C座" value="building-c" />
            </el-select>
          </el-col>
          <el-col :span="8">
            <el-select v-model="selectedFloor" placeholder="选择楼层" @change="filterByFloor">
              <el-option label="全部楼层" value="" />
              <el-option label="1楼" value="floor-1" />
              <el-option label="2楼" value="floor-2" />
              <el-option label="3楼" value="floor-3" />
              <el-option label="4楼" value="floor-4" />
            </el-select>
          </el-col>
          <el-col :span="8">
            <el-select v-model="selectedStatus" placeholder="设备状态" @change="filterByStatus">
              <el-option label="全部状态" value="" />
              <el-option label="可使用" value="available" />
              <el-option label="使用中" value="busy" />
              <el-option label="维护中" value="maintenance" />
              <el-option label="故障" value="broken" />
            </el-select>
          </el-col>
        </el-row>
      </div>
    </el-card>
    
    <!-- 地图区域 -->
    <el-card shadow="hover" class="map-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>实验室设备分布图</span>
          <span class="equipment-count">显示 {{ filteredEquipment.length }} 台设备</span>
        </div>
      </template>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-spinner size="large" />
        <p>加载中...</p>
      </div>
      
      <!-- 地图内容 -->
      <div v-else class="map-container">
        <!-- 实验楼选择 -->
        <div class="building-selector">
          <el-button 
            v-for="building in buildings" 
            :key="building.id"
            :type="selectedBuilding === building.id ? 'primary' : 'default'"
            @click="selectBuilding(building.id)"
            class="building-btn"
          >
            {{ building.name }}
          </el-button>
        </div>
        
        <!-- 楼层选择 -->
        <div class="floor-selector">
          <el-button 
            v-for="floor in floors" 
            :key="floor.id"
            :type="selectedFloor === floor.id ? 'primary' : 'default'"
            @click="selectFloor(floor.id)"
            class="floor-btn"
          >
            {{ floor.name }}
          </el-button>
        </div>
        
        <!-- 模拟地图 -->
        <div class="simulated-map" ref="mapRef">
          <!-- 房间布局 -->
          <div class="room-grid">
            <div 
              v-for="room in currentRooms" 
              :key="room.id"
              class="room"
              :class="{ 'selected': selectedRoom === room.id }"
              @click="selectRoom(room.id)"
            >
              <div class="room-header">
                <span class="room-name">{{ room.name }}</span>
                <span class="room-equipment-count">{{ getRoomEquipmentCount(room.id) }} 台</span>
              </div>
              <div class="room-equipment">
                <div 
                  v-for="equipment in getRoomEquipment(room.id)" 
                  :key="equipment.id"
                  class="equipment-item"
                  :class="equipment.status"
                  @click.stop="showEquipmentDetail(equipment)"
                  :title="`${equipment.name} (${getStatusText(equipment.status)})`"
                >
                  <el-icon :size="16">
                    <component :is="getEquipmentIcon(equipment.status)" />
                  </el-icon>
                  <span class="equipment-name">{{ equipment.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 图例 -->
        <div class="map-legend">
          <h4>图例</h4>
          <div class="legend-items">
            <div class="legend-item">
              <div class="legend-dot available"></div>
              <span>可使用</span>
            </div>
            <div class="legend-item">
              <div class="legend-dot busy"></div>
              <span>使用中</span>
            </div>
            <div class="legend-item">
              <div class="legend-dot maintenance"></div>
              <span>维护中</span>
            </div>
            <div class="legend-item">
              <div class="legend-dot broken"></div>
              <span>故障</span>
            </div>
          </div>
        </div>
      </div>
    </el-card>
    
    <!-- 设备详情对话框 -->
    <el-dialog v-model="equipmentDetailVisible" :title="selectedEquipment?.name || '设备详情'" width="50%">
      <div v-if="selectedEquipment" class="equipment-detail-info">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="设备名称">{{ selectedEquipment.name }}</el-descriptions-item>
          <el-descriptions-item label="设备编号">{{ selectedEquipment.code }}</el-descriptions-item>
          <el-descriptions-item label="设备型号">{{ selectedEquipment.model }}</el-descriptions-item>
          <el-descriptions-item label="设备状态">
            <el-tag :type="getStatusType(selectedEquipment.status)">
              {{ getStatusText(selectedEquipment.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="所属实验室">{{ selectedEquipment.laboratory }}</el-descriptions-item>
          <el-descriptions-item label="存放位置">{{ selectedEquipment.location }}</el-descriptions-item>
          <el-descriptions-item label="负责人">{{ selectedEquipment.manager }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ selectedEquipment.contactPhone }}</el-descriptions-item>
        </el-descriptions>
        <div class="detail-actions" style="margin-top: 20px;">
          <el-button type="primary" @click="viewFullDetail">查看完整详情</el-button>
          <el-button @click="reserveEquipment">预约使用</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { 
  FullScreen, 
  Download, 
  Refresh, 
  Monitor, 
  Check, 
  Clock, 
  Setting, 
  Warning 
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();

// 状态管理
const loading = ref(false);
const selectedBuilding = ref('');
const selectedFloor = ref('');
const selectedRoom = ref('');
const selectedStatus = ref('');
const equipmentDetailVisible = ref(false);
const selectedEquipment = ref(null);
const mapRef = ref(null);

// 实验楼数据
const buildings = ref([
  { id: 'building-a', name: '实验楼A座' },
  { id: 'building-b', name: '实验楼B座' },
  { id: 'building-c', name: '实验楼C座' }
]);

// 楼层数据
const floors = ref([
  { id: 'floor-1', name: '1楼' },
  { id: 'floor-2', name: '2楼' },
  { id: 'floor-3', name: '3楼' },
  { id: 'floor-4', name: '4楼' }
]);

// 房间数据
const rooms = ref([
  { id: 'room-a101', building: 'building-a', floor: 'floor-1', name: 'A101 物理实验室' },
  { id: 'room-a102', building: 'building-a', floor: 'floor-1', name: 'A102 化学实验室' },
  { id: 'room-a201', building: 'building-a', floor: 'floor-2', name: 'A201 生物实验室' },
  { id: 'room-a202', building: 'building-a', floor: 'floor-2', name: 'A202 计算机实验室' },
  { id: 'room-a301', building: 'building-a', floor: 'floor-3', name: 'A301 精密仪器室' },
  { id: 'room-a302', building: 'building-a', floor: 'floor-3', name: 'A302 分析实验室' },
  { id: 'room-b101', building: 'building-b', floor: 'floor-1', name: 'B101 生物培养室' },
  { id: 'room-b102', building: 'building-b', floor: 'floor-1', name: 'B102 化学准备室' },
  { id: 'room-b201', building: 'building-b', floor: 'floor-2', name: 'B201 物理实验二室' },
  { id: 'room-b202', building: 'building-b', floor: 'floor-2', name: 'B202 生物实验二室' },
  { id: 'room-c101', building: 'building-c', floor: 'floor-1', name: 'C101 计算机实验一室' },
  { id: 'room-c102', building: 'building-c', floor: 'floor-1', name: 'C102 计算机实验二室' },
  { id: 'room-c201', building: 'building-c', floor: 'floor-2', name: 'C201 电子实验室' },
  { id: 'room-c202', building: 'building-c', floor: 'floor-2', name: 'C202 通信实验室' }
]);

// 设备数据（模拟）
const equipmentList = ref([
  {
    id: 1,
    code: 'EQ-2024-001',
    name: '高精度电子天平',
    model: 'FA2004B',
    laboratory: '化学实验室',
    location: '实验楼A座301室',
    status: 'available',
    manager: '张三',
    contactPhone: '13800138001',
    building: 'building-a',
    floor: 'floor-3',
    room: 'room-a301'
  },
  {
    id: 2,
    code: 'EQ-2024-002',
    name: '紫外可见分光光度计',
    model: 'UV-2600',
    laboratory: '化学实验室',
    location: '实验楼A座302室',
    status: 'busy',
    manager: '张三',
    contactPhone: '13800138001',
    building: 'building-a',
    floor: 'floor-3',
    room: 'room-a302'
  },
  {
    id: 3,
    code: 'EQ-2024-003',
    name: '生物显微镜',
    model: 'BX53',
    laboratory: '生物实验室',
    location: '实验楼B座201室',
    status: 'available',
    manager: '李四',
    contactPhone: '13900139001',
    building: 'building-b',
    floor: 'floor-2',
    room: 'room-b202'
  },
  {
    id: 4,
    code: 'EQ-2024-004',
    name: '气相色谱仪',
    model: 'GC-2014',
    laboratory: '化学实验室',
    location: '实验楼A座401室',
    status: 'maintenance',
    manager: '张三',
    contactPhone: '13800138001',
    building: 'building-a',
    floor: 'floor-4',
    room: 'room-a302'
  },
  {
    id: 5,
    code: 'EQ-2024-005',
    name: '示波器',
    model: 'DS1054Z',
    laboratory: '物理实验室',
    location: '实验楼C座101室',
    status: 'available',
    manager: '王五',
    contactPhone: '13700137001',
    building: 'building-c',
    floor: 'floor-1',
    room: 'room-c101'
  },
  {
    id: 6,
    code: 'EQ-2024-006',
    name: '离心机',
    model: 'TGL-16G',
    laboratory: '生物实验室',
    location: '实验楼B座202室',
    status: 'broken',
    manager: '李四',
    contactPhone: '13900139001',
    building: 'building-b',
    floor: 'floor-2',
    room: 'room-b202'
  },
  {
    id: 7,
    code: 'EQ-2024-007',
    name: 'PCR仪',
    model: 'T100',
    laboratory: '生物实验室',
    location: '实验楼B座301室',
    status: 'available',
    manager: '李四',
    contactPhone: '13900139001',
    building: 'building-b',
    floor: 'floor-3',
    room: 'room-b201'
  },
  {
    id: 8,
    code: 'EQ-2024-008',
    name: '电子拉力试验机',
    model: 'WDW-5',
    laboratory: '物理实验室',
    location: '实验楼C座201室',
    status: 'available',
    manager: '王五',
    contactPhone: '13700137001',
    building: 'building-c',
    floor: 'floor-2',
    room: 'room-c201'
  }
]);

// 过滤设备数据
const filteredEquipment = computed(() => {
  return equipmentList.value.filter(item => {
    const matchesBuilding = !selectedBuilding.value || item.building === selectedBuilding.value;
    const matchesFloor = !selectedFloor.value || item.floor === selectedFloor.value;
    const matchesStatus = !selectedStatus.value || item.status === selectedStatus.value;
    
    return matchesBuilding && matchesFloor && matchesStatus;
  });
});

// 当前显示的房间
const currentRooms = computed(() => {
  return rooms.value.filter(room => {
    const matchesBuilding = !selectedBuilding.value || room.building === selectedBuilding.value;
    const matchesFloor = !selectedFloor.value || room.floor === selectedFloor.value;
    return matchesBuilding && matchesFloor;
  });
});

// 状态文本和类型
const getStatusText = (status) => {
  const statusMap = {
    available: '可使用',
    busy: '使用中',
    maintenance: '维护中',
    broken: '故障'
  };
  return statusMap[status] || status;
};

const getStatusType = (status) => {
  const typeMap = {
    available: 'success',
    busy: 'warning',
    maintenance: 'info',
    broken: 'danger'
  };
  return typeMap[status] || '';
};

// 获取设备图标
const getEquipmentIcon = (status) => {
  const iconMap = {
    available: Check,
    busy: Clock,
    maintenance: Setting,
    broken: Warning
  };
  return iconMap[status] || Monitor;
};

// 选择实验楼
const selectBuilding = (buildingId) => {
  selectedBuilding.value = buildingId;
  selectedFloor.value = '';
  selectedRoom.value = '';
};

// 选择楼层
const selectFloor = (floorId) => {
  selectedFloor.value = floorId;
  selectedRoom.value = '';
};

// 选择房间
const selectRoom = (roomId) => {
  selectedRoom.value = roomId;
};

// 按实验楼过滤
const filterByBuilding = () => {
  selectedFloor.value = '';
  selectedRoom.value = '';
};

// 按楼层过滤
const filterByFloor = () => {
  selectedRoom.value = '';
};

// 获取房间内的设备
const getRoomEquipment = (roomId) => {
  return filteredEquipment.value.filter(e => e.room === roomId);
};

// 获取房间设备数量
const getRoomEquipmentCount = (roomId) => {
  return getRoomEquipment(roomId).length;
};

// 显示设备详情
const showEquipmentDetail = (equipment) => {
  selectedEquipment.value = equipment;
  equipmentDetailVisible.value = true;
};

// 查看完整详情
const viewFullDetail = () => {
  if (selectedEquipment.value) {
    router.push(`/main/equipment/detail/${selectedEquipment.value.id}`);
    equipmentDetailVisible.value = false;
  }
};

// 预约设备
const reserveEquipment = () => {
  if (selectedEquipment.value) {
    if (selectedEquipment.value.status !== 'available') {
      ElMessage.warning('该设备当前不可预约');
      return;
    }
    // 这里可以跳转到预约页面
    ElMessage.success('跳转至预约页面');
  }
};

// 全屏查看
const toggleFullscreen = () => {
  // 模拟全屏功能
  ElMessage.success('全屏模式已切换');
};

// 导出地图
const exportMap = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('地图导出成功');
  }, 1000);
};

// 刷新地图
const refreshMap = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('地图数据刷新成功');
  }, 800);
};

// 初始化
onMounted(() => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 1000);
});
</script>

<style scoped>
.equipment-map {
  padding: 20px;
}

.action-card {
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.control-card {
  margin-bottom: 20px;
}

.map-controls {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.equipment-count {
  font-size: 14px;
  color: #606266;
}

.loading-container {
  text-align: center;
  padding: 60px 0;
}

.map-container {
  position: relative;
  min-height: 600px;
}

.building-selector {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.floor-selector {
  margin-bottom: 30px;
  display: flex;
  gap: 10px;
}

.simulated-map {
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 30px;
  min-height: 500px;
}

.room-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.room {
  background-color: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.room:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.room.selected {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.room-name {
  font-weight: 600;
  font-size: 16px;
}

.room-equipment-count {
  font-size: 14px;
  color: #606266;
  background-color: #f5f7fa;
  padding: 2px 8px;
  border-radius: 10px;
}

.room-equipment {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.equipment-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  background-color: #f9f9f9;
  transition: all 0.2s ease;
}

.equipment-item:hover {
  background-color: #f0f9eb;
}

.equipment-item.available {
  border-left: 4px solid #67c23a;
}

.equipment-item.busy {
  border-left: 4px solid #e6a23c;
}

.equipment-item.maintenance {
  border-left: 4px solid #409eff;
}

.equipment-item.broken {
  border-left: 4px solid #f56c6c;
}

.equipment-name {
  font-size: 14px;
  flex: 1;
}

.map-legend {
  margin-top: 30px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.legend-items {
  display: flex;
  gap: 20px;
  margin-top: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-dot.available {
  background-color: #67c23a;
}

.legend-dot.busy {
  background-color: #e6a23c;
}

.legend-dot.maintenance {
  background-color: #409eff;
}

.legend-dot.broken {
  background-color: #f56c6c;
}

.detail-actions {
  display: flex;
  gap: 10px;
}

@media (max-width: 768px) {
  .equipment-map {
    padding: 10px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }
  
  .building-selector,
  .floor-selector {
    flex-wrap: wrap;
  }
  
  .room-grid {
    grid-template-columns: 1fr;
  }
  
  .legend-items {
    flex-wrap: wrap;
  }
}
</style>
