<template>
  <header>
    <div class="header-container">
      <!-- 头部内容 -->
      <div class="logo">实验室设备管理系统</div>
      <div class="user-info">
        <!-- 用户信息 -->
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'Header',
  data() {
    return {
      user: null
    }
  },
  methods: {
    // 登出方法
    logout() {
      // 登出逻辑
    }
  }
}
</script>

<style scoped>
header {
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 0 20px;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.logo {
  font-size: 18px;
  font-weight: bold;
  color: #409EFF;
}
</style>