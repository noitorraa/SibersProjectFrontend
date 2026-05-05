<template>
  <div class="app-layout">
    <aside class="sidebar">
      <h2>Sibers PM</h2>
      <nav>
        <RouterLink to="/projects">Проекты</RouterLink>
        <RouterLink to="/employees">Сотрудники</RouterLink>
        <RouterLink to="/companies">Компании</RouterLink>
      </nav>
    </aside>
    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
}
.sidebar {
  width: 250px;
  background: #2c3e50;
  color: white;
  padding: 1rem;
}
.sidebar h2 {
  margin-bottom: 1rem;
}
.sidebar nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.sidebar nav a {
  color: white;
  text-decoration: none;
  padding: 0.5rem;
  border-radius: 4px;
}
.sidebar nav a:hover,
.sidebar nav a.router-link-active {
  background: #42b983;
}
.content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}
</style>
