<template>
  <div>
    <h1>Проекты</h1>
    <button @click="openWizard = true">+ Новый проект</button>
    <div v-if="projectsStore.loading">Загрузка...</div>
    <div v-else>
      <ProjectCard
        v-for="project in projectsStore.projects"
        :key="project.id"
        :project="project"
        @click="goToProject(project.id)"
      />
    </div>
    <ProjectWizard v-if="openWizard" @close="openWizard = false" @saved="refreshProjects" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useProjectsStore } from "@/stores/projects";
import ProjectCard from "@/components/projects/ProjectCard.vue";
import ProjectWizard from "@/components/projects/ProjectWizard.vue";

const router = useRouter();
const projectsStore = useProjectsStore();
const openWizard = ref(false);

const refreshProjects = () => {
  projectsStore.fetchProjects();
};

const goToProject = (id: number) => {
  router.push(`/projects/${id}`);
};

onMounted(() => {
  projectsStore.fetchProjects();
});
</script>
