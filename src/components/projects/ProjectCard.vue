<template>
  <div class="project-card" @click="$emit('open')">
    <div class="project-card__content">
      <h3>{{ project.name }}</h3>
      <p>Приоритет: {{ project.priority }}</p>
      <p>{{ formatDate(project.startDate) }} – {{ formatDate(project.endDate) }}</p>
    </div>
    <div class="project-card__actions">
      <button @click.stop="$emit('open')">Детали</button>
      <button @click.stop="$emit('edit')">Редактировать</button>
      <button class="danger" @click.stop="$emit('delete')">Удалить</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Project } from "@/types";

defineProps<{ project: Project }>();
defineEmits<{ (e: 'open'): void; (e: 'edit'): void; (e: 'delete'): void }>();

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();
</script>

<style scoped>
.project-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}
.project-card__content {
  cursor: pointer;
}
.project-card:hover {
  background: #f5f5f5;
}
.project-card__actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.danger {
  color: #b00020;
}
</style>
