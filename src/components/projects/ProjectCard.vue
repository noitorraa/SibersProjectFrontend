<template>
  <div class="project-card" @click="$emit('click')">
    <h3>{{ project.name }}</h3>
    <p>Приоритет: {{ project.priority }}</p>
    <p>{{ formatDate(project.startDate) }} – {{ formatDate(project.endDate) }}</p>
  </div>
</template>

<script setup lang="ts">
import type { Project } from "@/types";

defineProps<{ project: Project }>();
defineEmits<{ (e: "click"): void }>();

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();
</script>

<style scoped>
.project-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
}
.project-card:hover {
  background: #f5f5f5;
}
</style>
