<template>
  <div class="equipment-add">
    <h2>新增设备</h2>
    <p>管理员功能：添加新的设备信息</p>
    
    <!-- 设备添加表单 -->
    <el-card shadow="hover">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px" class="equipment-form">
        <!-- 基本信息 -->
        <el-divider content-position="left">基本信息</el-divider>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入设备名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备型号" prop="model">
              <el-input v-model="form.model" placeholder="请输入设备型号" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备编号" prop="code">
              <el-input v-model="form.code" placeholder="请输入设备编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择设备状态">
                <el-option label="可使用" value="available" />
                <el-option label="使用中" value="busy" />
                <el-option label="维护中" value="maintenance" />
                <el-option label="故障" value="broken" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所属实验室" prop="laboratory">
              <el-input v-model="form.laboratory" placeholder="请输入所属实验室" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="存放位置" prop="location">
              <el-input v-model="form.location" placeholder="请输入存放位置" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="负责人" prop="manager">
              <el-input v-model="form.manager" placeholder="请输入负责人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="contactPhone">
              <el-input v-model="form.contactPhone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="设备描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="请输入设备描述"
            :rows="3"
          />
        </el-form-item>
        
        <!-- 技术参数 -->
        <el-divider content-position="left">技术参数</el-divider>
        
        <div class="tech-params">
          <div v-for="(param, index) in form.techParams" :key="index" class="param-item">
            <el-row :gutter="20">
              <el-col :span="10">
                <el-form-item :label="'参数名称' + (index + 1)" :prop="'techParams.' + index + '.name'">
                  <el-input v-model="param.name" placeholder="请输入参数名称" />
                </el-form-item>
              </el-col>
              <el-col :span="10">
                <el-form-item :label="'参数值' + (index + 1)" :prop="'techParams.' + index + '.value'">
                  <el-input v-model="param.value" placeholder="请输入参数值" />
                </el-form-item>
              </el-col>
              <el-col :span="4" class="param-actions">
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="removeParam(index)"
                  :disabled="form.techParams.length <= 1"
                >
                  删除
                </el-button>
              </el-col>
            </el-row>
          </div>
          
          <el-form-item>
            <el-button type="primary" size="small" @click="addParam">
              <el-icon><Plus /></el-icon>
              添加参数
            </el-button>
          </el-form-item>
        </div>
        
        <!-- 使用说明 -->
        <el-divider content-position="left">使用说明</el-divider>
        
        <div class="usage-instructions">
          <div v-for="(instruction, index) in form.usageInstructions" :key="index" class="instruction-item">
            <el-row :gutter="20">
              <el-col :span="20">
                <el-form-item :label="'说明' + (index + 1)" :prop="'usageInstructions.' + index">
                  <el-input v-model="form.usageInstructions[index]" placeholder="请输入使用说明" />
                </el-form-item>
              </el-col>
              <el-col :span="4" class="instruction-actions">
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="removeInstruction(index)"
                  :disabled="form.usageInstructions.length <= 1"
                >
                  删除
                </el-button>
              </el-col>
            </el-row>
          </div>
          
          <el-form-item>
            <el-button type="primary" size="small" @click="addInstruction">
              <el-icon><Plus /></el-icon>
              添加说明
            </el-button>
          </el-form-item>
        </div>
        
        <!-- 操作按钮 -->
        <el-form-item class="form-actions">
          <el-button @click="resetForm">重置</el-button>
          <el-button type="primary" @click="submitForm">提交</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

// 表单引用
const formRef = ref(null)

// 表单数据
const form = reactive({
  name: '',
  model: '',
  code: '',
  status: 'available',
  laboratory: '',
  location: '',
  manager: '',
  contactPhone: '',
  description: '',
  techParams: [
    { name: '', value: '' }
  ],
  usageInstructions: [
    ''
  ]
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  model: [{ required: true, message: '请输入设备型号', trigger: 'blur' }],
  code: [{ required: true, message: '请输入设备编号', trigger: 'blur' }],
  status: [{ required: true, message: '请选择设备状态', trigger: 'change' }],
  laboratory: [{ required: true, message: '请输入所属实验室', trigger: 'blur' }],
  location: [{ required: true, message: '请输入存放位置', trigger: 'blur' }],
  manager: [{ required: true, message: '请输入负责人', trigger: 'blur' }],
  contactPhone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }]
}

// 添加技术参数
function addParam() {
  form.techParams.push({ name: '', value: '' })
}

// 删除技术参数
function removeParam(index) {
  form.techParams.splice(index, 1)
}

// 添加使用说明
function addInstruction() {
  form.usageInstructions.push('')
}

// 删除使用说明
function removeInstruction(index) {
  form.usageInstructions.splice(index, 1)
}

// 重置表单
function resetForm() {
  formRef.value?.resetFields()
  // 重置技术参数和使用说明
  form.techParams = [{ name: '', value: '' }]
  form.usageInstructions = ['']
}

// 提交表单
function submitForm() {
  formRef.value?.validate((valid) => {
    if (valid) {
      // 检查技术参数
      const hasEmptyParam = form.techParams.some(param => !param.name || !param.value)
      if (hasEmptyParam) {
        ElMessage.warning('请填写完整的技术参数')
        return
      }
      
      // 检查使用说明
      const hasEmptyInstruction = form.usageInstructions.some(instruction => !instruction)
      if (hasEmptyInstruction) {
        ElMessage.warning('请填写完整的使用说明')
        return
      }
      
      // 模拟API请求
      ElMessageBox.confirm('确认添加该设备吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        setTimeout(() => {
          ElMessage.success('设备添加成功')
          resetForm()
        }, 1000)
      }).catch(() => {
        // 取消操作
      })
    } else {
      ElMessage.error('请填写完整的表单信息')
      return false
    }
  })
}
</script>

<style scoped>
.equipment-add {
  padding: 20px;
}

.equipment-form {
  max-width: 1000px;
}

.tech-params, .usage-instructions {
  margin: 20px 0;
}

.param-item, .instruction-item {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.param-actions, .instruction-actions {
  display: flex;
  align-items: flex-end;
  padding-bottom: 24px;
}

.form-actions {
  margin-top: 30px;
  display: flex;
  gap: 10px;
}
</style>