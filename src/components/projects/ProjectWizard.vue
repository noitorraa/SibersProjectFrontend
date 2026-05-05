<template>
  <div class="modal">
    <div class="modal-content">
      <span class="close" @click="$emit('close')">&times;</span>
      <h2>Создание проекта (Wizard)</h2>
      <p>Будет реализован позже</p>
      <button @click="$emit('saved')">Сохранить (заглушка)</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{ (e: "close"): void; (e: "saved"): void }>();
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  min-width: 300px;
  position: relative;
}
.close {
  position: absolute;
  right: 1rem;
  top: 0.5rem;
  cursor: pointer;
  font-size: 1.5rem;
}
</style>
