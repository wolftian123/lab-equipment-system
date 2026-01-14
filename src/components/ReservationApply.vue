<template>
  <div class="reservation-apply-container">
    <div class="reservation-header">
      <h2>预约申请</h2>
    </div>
    
    <el-card class="apply-card">
      <template #header>
        <div class="card-header">
          <span>预约信息</span>
        </div>
      </template>
      
      <el-form :model="applyForm" :rules="formRules" ref="formRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="设备选择" prop="equipmentId">
              <el-select 
                v-model="applyForm.equipmentId" 
                placeholder="请选择设备" 
                filterable
                clearable
                style="width: 100%"
              >
                <el-option 
                  v-for="equipment in equipmentList" 
                  :key="equipment.id"
                  :label="equipment.name"
                  :value="equipment.id"
                >
                  <div class="option-content">
                    <span class="option-name">{{ equipment.name }}</span>
                    <span class="option-model">{{ equipment.model }}</span>
                    <span class="option-status" :class="equipment.status">
                      {{ equipment.status === 'available' ? '可用' : '使用中' }}
                    </span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="预约日期" prop="date">
              <el-date-picker 
                v-model="applyForm.date" 
                type="date" 
                placeholder="选择预约日期" 
                style="width: 100%"
                :disabled-date="disabledDate"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="使用时长" prop="duration">
              <el-input-number 
                v-model="applyForm.duration" 
                :min="1" 
                :max="8" 
                :step="0.5" 
                style="width: 100%"
                placeholder="使用时长(小时)"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="24">
            <el-form-item label="开始时间" prop="startTime">
              <el-time-select 
                v-model="applyForm.startTime" 
                placeholder="选择开始时间" 
                style="width: 100%"
                :picker-options="{
                  start: '09:00',
                  step: '00:30',
                  end: '17:00'
                }"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="24">
            <el-form-item label="预约用途" prop="purpose">
              <el-input 
                v-model="applyForm.purpose" 
                type="textarea" 
                placeholder="请输入预约用途" 
                rows="3"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input 
                v-model="applyForm.remark" 
                type="textarea" 
                placeholder="请输入备注信息" 
                rows="2"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <div class="form-actions">
          <el-button @click="resetForm">重置</el-button>
          <el-button type="primary" @click="submitApply">提交预约</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { CirclePlus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

// 预约申请表单
const applyForm = reactive({
  equipmentId: '',
  date: '',
  startTime: '',
  duration: 2,
  purpose: '',
  remark: ''
});

// 表单验证规则
const formRules = {
  equipmentId: [{ required: true, message: '请选择设备', trigger: 'blur' }],
  date: [{ required: true, message: '请选择预约日期', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'blur' }],
  duration: [{ required: true, message: '请输入使用时长', trigger: 'blur' }],
  purpose: [{ required: true, message: '请输入预约用途', trigger: 'blur' }]
};

// 表单引用
const formRef = ref(null);

// 设备列表
const equipmentList = ref([
  { id: 1, name: '电子显微镜', model: 'SEM-1000', status: 'available' },
  { id: 2, name: '光谱分析仪', model: 'Spectrum-2000', status: 'available' },
  { id: 3, name: '激光切割机', model: 'Laser-3000', status: 'in_use' },
  { id: 4, name: '3D打印机', model: '3D-4000', status: 'available' },
  { id: 5, name: '示波器', model: 'Oscilloscope-5000', status: 'available' }
]);

// 禁用日期
const disabledDate = (time) => {
  return time.getTime() < Date.now() - 8.64e7; // 只能选择今天及以后
};

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields();
};

// 提交预约
const submitApply = async () => {
  try {
    await formRef.value.validate();
    // 模拟提交
    setTimeout(() => {
      ElMessage.success('预约申请提交成功，等待审批');
      resetForm();
    }, 1000);
  } catch (error) {
    console.error('表单验证失败:', error);
  }
};
</script>

<style scoped>
.reservation-apply-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.reservation-header {
  margin-bottom: 20px;
}

.reservation-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.apply-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 30px;
  gap: 10px;
}

.option-content {
  display: flex;
  flex-direction: column;
}

.option-name {
  font-weight: 500;
}

.option-model {
  font-size: 12px;
  color: #666;
}

.option-status {
  font-size: 12px;
  margin-top: 4px;
  padding: 2px 8px;
  border-radius: 10px;
  align-self: flex-start;
}

.option-status.available {
  background: #f0f9eb;
  color: #67c23a;
}

.option-status.in_use {
  background: #fef0f0;
  color: #f56c6c;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .reservation-apply-container {
    padding: 10px;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .form-actions .el-button {
    width: 100%;
  }
}
</style>