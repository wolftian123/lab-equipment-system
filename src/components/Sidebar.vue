<template>
  <aside class="sidebar">
    <nav>
      <ul>
        <!-- 导航菜单 -->
        <li v-for="item in menuItems" :key="item.path">
          <router-link :to="item.path">{{ item.title }}</router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script>
export default {
  name: 'Sidebar',
  data() {
    return {
      menuItems: [
        // 菜单项
      ]
    }
  },
  computed: {
    // 当前路由
    currentRoute() {
      return this.$route.path
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 250px;
  background: #304156;
  color: #fff;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
}

nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

nav li {
  padding: 12px 20px;
  border-bottom: 1px solid #2c3e50;
}

nav a {
  color: #fff;
  text-decoration: none;
}

nav a:hover {
  color: #409EFF;
}

nav a.router-link-active {
  color: #409EFF;
  font-weight: bold;
}
</style>