<template>
  <div class="help-container">
    <div class="help-header">
      <h2>帮助中心</h2>
      <el-button type="primary" @click="contactSupport">
        <el-icon><Phone /></el-icon>
        联系支持
      </el-button>
    </div>
    
    <!-- 快速导航 -->
    <div class="quick-nav">
      <el-card shadow="hover" class="nav-card">
        <div class="nav-items">
          <div class="nav-item" @click="scrollToSection('guide')">
            <el-icon class="nav-icon"><Document /></el-icon>
            <span>使用指南</span>
          </div>
          <div class="nav-item" @click="scrollToSection('faq')">
            <el-icon class="nav-icon"><QuestionFilled /></el-icon>
            <span>常见问题</span>
          </div>
          <div class="nav-item" @click="scrollToSection('troubleshooting')">
            <el-icon class="nav-icon"><Warning /></el-icon>
            <span>故障排查</span>
          </div>
          <div class="nav-item" @click="scrollToSection('contact')">
            <el-icon class="nav-icon"><Message /></el-icon>
            <span>联系我们</span>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 主要内容 -->
    <div class="help-content">
      <!-- 使用指南 -->
      <section id="guide" class="help-section">
        <h3>
          <el-icon class="section-icon"><Document /></el-icon>
          使用指南
        </h3>
        
        <el-card shadow="hover" class="guide-card">
          <template #header>
            <div class="card-header">
              <span>设备预约流程</span>
            </div>
          </template>
          
          <div class="guide-steps">
            <div class="step-item">
              <div class="step-number">1</div>
              <div class="step-content">
                <h4>登录系统</h4>
                <p>使用您的账号密码登录实验设备管理系统</p>
              </div>
            </div>
            <div class="step-divider"></div>
            <div class="step-item">
              <div class="step-number">2</div>
              <div class="step-content">
                <h4>浏览设备</h4>
                <p>在设备查询页面浏览可预约的设备，查看设备详情</p>
              </div>
            </div>
            <div class="step-divider"></div>
            <div class="step-item">
              <div class="step-number">3</div>
              <div class="step-content">
                <h4>提交预约</h4>
                <p>在预约申请页面选择设备、预约时间和用途</p>
              </div>
            </div>
            <div class="step-divider"></div>
            <div class="step-item">
              <div class="step-number">4</div>
              <div class="step-content">
                <h4>等待审批</h4>
                <p>提交后等待管理员审批，可在"我的预约"中查看状态</p>
              </div>
            </div>
            <div class="step-divider"></div>
            <div class="step-item">
              <div class="step-number">5</div>
              <div class="step-content">
                <h4>使用设备</h4>
                <p>审批通过后，按时前往实验室使用设备</p>
              </div>
            </div>
          </div>
        </el-card>
        
        <el-card shadow="hover" class="guide-card" style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <span>系统功能说明</span>
            </div>
          </template>
          
          <div class="feature-list">
            <div class="feature-item">
              <h4>
                <el-icon class="feature-icon"><Dashboard /></el-icon>
                仪表盘
              </h4>
              <p>查看系统概览、设备状态和预约统计</p>
            </div>
            <div class="feature-item">
              <h4>
                <el-icon class="feature-icon"><Box /></el-icon>
                设备查询
              </h4>
              <p>浏览和搜索实验设备，查看设备详情和位置</p>
            </div>
            <div class="feature-item">
              <h4>
                <el-icon class="feature-icon"><Calendar /></el-icon>
                预约管理
              </h4>
              <p>提交预约申请，查看我的预约和历史记录</p>
            </div>
            <div class="feature-item">
              <h4>
                <el-icon class="feature-icon"><DocumentChecked /></el-icon>
                审批管理
              </h4>
              <p>审批学生和教师的设备预约申请</p>
            </div>
            <div class="feature-item">
              <h4>
                <el-icon class="feature-icon"><Tools /></el-icon>
                设备管理
              </h4>
              <p>管理设备台账、维护记录和状态</p>
            </div>
            <div class="feature-item">
              <h4>
                <el-icon class="feature-icon"><User /></el-icon>
                用户管理
              </h4>
              <p>管理学生、教师和管理员账号</p>
            </div>
            <div class="feature-item">
              <h4>
                <el-icon class="feature-icon"><DataAnalysis /></el-icon>
                报表统计
              </h4>
              <p>查看设备使用率和预约统计报表</p>
            </div>
            <div class="feature-item">
              <h4>
                <el-icon class="feature-icon"><Setting /></el-icon>
                系统管理
              </h4>
              <p>系统设置、日志管理和备份恢复</p>
            </div>
          </div>
        </el-card>
      </section>
      
      <!-- 常见问题 -->
      <section id="faq" class="help-section">
        <h3>
          <el-icon class="section-icon"><QuestionFilled /></el-icon>
          常见问题
        </h3>
        
        <el-card shadow="hover">
          <el-collapse v-model="activeFaq">
            <el-collapse-item title="如何预约实验设备？" name="1">
              <div class="faq-content">
                <p>1. 登录系统后，进入"预约管理"页面</p>
                <p>2. 点击"预约申请"标签</p>
                <p>3. 选择要预约的设备、日期、时间和使用时长</p>
                <p>4. 填写预约用途和备注信息</p>
                <p>5. 点击"提交预约"按钮</p>
                <p>6. 等待管理员审批，可在"我的预约"中查看状态</p>
              </div>
            </el-collapse-item>
            <el-collapse-item title="预约审批需要多长时间？" name="2">
              <div class="faq-content">
                <p>一般情况下，预约申请会在1-2个工作日内完成审批。紧急预约可联系管理员加急处理。</p>
              </div>
            </el-collapse-item>
            <el-collapse-item title="如何取消已提交的预约？" name="3">
              <div class="faq-content">
                <p>1. 进入"预约管理"页面</p>
                <p>2. 点击"我的预约"标签</p>
                <p>3. 找到待审批的预约记录</p>
                <p>4. 点击"取消"按钮</p>
                <p>5. 确认取消操作</p>
              </div>
            </el-collapse-item>
            <el-collapse-item title="设备使用过程中出现故障怎么办？" name="4">
              <div class="faq-content">
                <p>1. 立即停止使用设备</p>
                <p>2. 联系实验室管理员</p>
                <p>3. 在系统中提交设备故障报告</p>
                <p>4. 等待技术人员处理</p>
              </div>
            </el-collapse-item>
            <el-collapse-item title="忘记密码怎么办？" name="5">
              <div class="faq-content">
                <p>1. 在登录页面点击"忘记密码"</p>
                <p>2. 输入注册时的邮箱地址</p>
                <p>3. 点击"发送验证码"</p>
                <p>4. 输入收到的验证码</p>
                <p>5. 设置新密码并确认</p>
              </div>
            </el-collapse-item>
            <el-collapse-item title="如何修改个人信息？" name="6">
              <div class="faq-content">
                <p>1. 登录系统后，点击顶部导航栏的用户头像</p>
                <p>2. 选择"个人中心"</p>
                <p>3. 在个人信息页面修改相关信息</p>
                <p>4. 点击"保存"按钮</p>
              </div>
            </el-collapse-item>
            <el-collapse-item title="设备使用有时间限制吗？" name="7">
              <div class="faq-content">
                <p>是的，每台设备的预约时长有一定限制，具体限制如下：</p>
                <p>- 一般设备：单次最长4小时</p>
                <p>- 贵重设备：单次最长2小时</p>
                <p>- 特殊设备：根据设备类型和管理规定而定</p>
                <p>如需更长时间使用，请提前与管理员沟通。</p>
              </div>
            </el-collapse-item>
            <el-collapse-item title="如何查看设备使用指南？" name="8">
              <div class="faq-content">
                <p>1. 进入"设备查询"页面</p>
                <p>2. 找到要查看的设备</p>
                <p>3. 点击设备名称进入详情页面</p>
                <p>4. 在详情页面查看"使用指南"部分</p>
                <p>5. 如需纸质版指南，可联系实验室管理员</p>
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-card>
      </section>
      
      <!-- 故障排查 -->
      <section id="troubleshooting" class="help-section">
        <h3>
          <el-icon class="section-icon"><Warning /></el-icon>
          故障排查
        </h3>
        
        <el-card shadow="hover" class="troubleshooting-card">
          <template #header>
            <div class="card-header">
              <span>常见故障及解决方案</span>
            </div>
          </template>
          
          <div class="trouble-list">
            <div class="trouble-item">
              <h4>设备无法启动</h4>
              <div class="trouble-solutions">
                <p><strong>可能原因：</strong>电源未连接、电源开关未打开、设备故障</p>
                <p><strong>解决方案：</strong></p>
                <ul>
                  <li>检查电源插头是否插紧</li>
                  <li>检查电源开关是否处于打开状态</li>
                  <li>检查实验室电源是否正常</li>
                  <li>如以上均正常，联系技术人员维修</li>
                </ul>
              </div>
            </div>
            
            <div class="trouble-item">
              <h4>系统登录失败</h4>
              <div class="trouble-solutions">
                <p><strong>可能原因：</strong>账号密码错误、账号被锁定、网络问题</p>
                <p><strong>解决方案：</strong></p>
                <ul>
                  <li>检查账号密码是否输入正确</li>
                  <li>如忘记密码，点击"忘记密码"重置</li>
                  <li>检查网络连接是否正常</li>
                  <li>如账号被锁定，联系管理员解锁</li>
                </ul>
              </div>
            </div>
            
            <div class="trouble-item">
              <h4>预约提交失败</h4>
              <div class="trouble-solutions">
                <p><strong>可能原因：</strong>信息填写不完整、设备已被预约、网络问题</p>
                <p><strong>解决方案：</strong></p>
                <ul>
                  <li>检查所有必填字段是否填写完整</li>
                  <li>选择其他可用时间段</li>
                  <li>检查网络连接是否正常</li>
                  <li>刷新页面后重新提交</li>
                </ul>
              </div>
            </div>
            
            <div class="trouble-item">
              <h4>设备操作无响应</h4>
              <div class="trouble-solutions">
                <p><strong>可能原因：</strong>设备死机、操作错误、软件问题</p>
                <p><strong>解决方案：</strong></p>
                <ul>
                  <li>尝试重启设备</li>
                  <li>查阅设备操作手册</li>
                  <li>联系技术人员协助</li>
                  <li>如设备损坏，提交故障报告</li>
                </ul>
              </div>
            </div>
          </div>
        </el-card>
      </section>
      
      <!-- 联系我们 -->
      <section id="contact" class="help-section">
        <h3>
          <el-icon class="section-icon"><Message /></el-icon>
          联系我们
        </h3>
        
        <el-card shadow="hover">
          <div class="contact-info">
            <div class="contact-item">
              <el-icon class="contact-icon"><Phone /></el-icon>
              <div class="contact-details">
                <h4>电话支持</h4>
                <p>工作日：8:30-17:30</p>
                <p>联系电话：0510-88888888</p>
              </div>
            </div>
            
            <div class="contact-item">
              <el-icon class="contact-icon"><Message /></el-icon>
              <div class="contact-details">
                <h4>在线客服</h4>
                <p>工作日：9:00-17:00</p>
                <p>点击右侧悬浮按钮联系</p>
              </div>
            </div>
            
            <div class="contact-item">
              <el-icon class="contact-icon"><Mail /></el-icon>
              <div class="contact-details">
                <h4>邮件支持</h4>
                <p>support@lab-system.com</p>
                <p>24小时内回复</p>
              </div>
            </div>
            
            <div class="contact-item">
              <el-icon class="contact-icon"><Position /></el-icon>
              <div class="contact-details">
                <h4>办公地址</h4>
                <p>江南大学实验楼A楼301室</p>
                <p>邮编：214122</p>
              </div>
            </div>
          </div>
          
          <!-- 反馈表单 -->
          <div class="feedback-form">
            <h4>问题反馈</h4>
            <el-form :model="feedbackForm" :rules="feedbackRules" ref="feedbackRef" label-width="100px">
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="问题类型" prop="type">
                    <el-select v-model="feedbackForm.type" placeholder="请选择问题类型" style="width: 100%">
                      <el-option label="系统问题" value="system" />
                      <el-option label="设备问题" value="equipment" />
                      <el-option label="预约问题" value="reservation" />
                      <el-option label="其他问题" value="other" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="问题描述" prop="description">
                    <el-input 
                      v-model="feedbackForm.description" 
                      type="textarea" 
                      placeholder="请详细描述您遇到的问题" 
                      rows="4"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="联系方式" prop="contact">
                    <el-input v-model="feedbackForm.contact" placeholder="请留下您的邮箱或电话" style="width: 100%" />
                  </el-form-item>
                </el-col>
              </el-row>
              <div class="form-actions">
                <el-button type="primary" @click="submitFeedback">提交反馈</el-button>
                <el-button @click="resetFeedback">重置</el-button>
              </div>
            </el-form>
          </div>
        </el-card>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { 
  Phone, 
  Document, 
  QuestionFilled, 
  Warning, 
  Message, 
  Dashboard, 
  Box, 
  Calendar, 
  DocumentChecked, 
  Tools, 
  User, 
  DataAnalysis, 
  Setting,
  Mail,
  Position
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

// 状态管理
const activeFaq = ref(['1']);
const feedbackRef = ref(null);

// 反馈表单
const feedbackForm = reactive({
  type: '',
  description: '',
  contact: ''
});

// 反馈表单验证规则
const feedbackRules = {
  type: [{ required: true, message: '请选择问题类型', trigger: 'blur' }],
  description: [{ required: true, message: '请描述您的问题', trigger: 'blur' }],
  contact: [{ required: true, message: '请留下联系方式', trigger: 'blur' }]
};

// 滚动到指定 section
const scrollToSection = (sectionId) => {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
};

// 联系支持
const contactSupport = () => {
  ElMessage.info('正在连接客服...');
};

// 提交反馈
const submitFeedback = async () => {
  try {
    await feedbackRef.value.validate();
    // 模拟提交
    setTimeout(() => {
      ElMessage.success('反馈提交成功，我们会尽快处理');
      resetFeedback();
    }, 1000);
  } catch (error) {
    console.error('表单验证失败:', error);
  }
};

// 重置反馈表单
const resetFeedback = () => {
  feedbackRef.value?.resetFields();
};

// 初始化
onMounted(() => {
  console.log('Help component mounted');
});
</script>

<style scoped>
.help-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.help-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.help-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.quick-nav {
  margin-bottom: 40px;
}

.nav-card {
  padding: 20px;
}

.nav-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.nav-item:hover {
  background: #f0f9eb;
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.nav-icon {
  font-size: 32px;
  color: #409EFF;
  margin-bottom: 10px;
}

.nav-item span {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.help-content {
  max-width: 1200px;
  margin: 0 auto;
}

.help-section {
  margin-bottom: 60px;
}

.help-section h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #409EFF;
}

.section-icon {
  font-size: 20px;
  color: #409EFF;
}

.guide-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.guide-steps {
  position: relative;
  padding: 20px 0;
}

.step-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #409EFF;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 20px;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.step-content p {
  margin: 0;
  color: #606266;
  line-height: 1.5;
}

.step-divider {
  position: absolute;
  left: 15px;
  top: 32px;
  bottom: 0;
  width: 2px;
  background: #e4e7ed;
  z-index: 0;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.feature-item {
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  transition: all 0.3s;
}

.feature-item:hover {
  background: #f0f9eb;
  transform: translateY(-2px);
}

.feature-item h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 10px 0;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.feature-icon {
  font-size: 16px;
  color: #67c23a;
}

.feature-item p {
  margin: 0;
  color: #606266;
  font-size: 13px;
  line-height: 1.4;
}

.faq-content {
  padding: 10px 0;
}

.faq-content p {
  margin: 8px 0;
  color: #606266;
  line-height: 1.5;
}

.trouble-list {
  padding: 20px 0;
}

.trouble-item {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.trouble-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.trouble-item h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.trouble-solutions p {
  margin: 8px 0;
  color: #606266;
  line-height: 1.5;
}

.trouble-solutions ul {
  margin: 10px 0;
  padding-left: 20px;
}

.trouble-solutions li {
  margin: 4px 0;
  color: #606266;
  line-height: 1.4;
}

.contact-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  transition: all 0.3s;
}

.contact-item:hover {
  background: #f0f9eb;
  transform: translateY(-2px);
}

.contact-icon {
  font-size: 24px;
  color: #409EFF;
  margin-top: 2px;
  flex-shrink: 0;
}

.contact-details h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.contact-details p {
  margin: 4px 0;
  color: #606266;
  font-size: 13px;
  line-height: 1.4;
}

.feedback-form {
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.feedback-form h4 {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  gap: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .help-container {
    padding: 10px;
  }
  
  .help-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .nav-items {
    grid-template-columns: 1fr;
  }
  
  .feature-list {
    grid-template-columns: 1fr;
  }
  
  .contact-info {
    grid-template-columns: 1fr;
  }
  
  .step-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .step-number {
    margin-bottom: 10px;
  }
  
  .step-divider {
    display: none;
  }
}
</style>