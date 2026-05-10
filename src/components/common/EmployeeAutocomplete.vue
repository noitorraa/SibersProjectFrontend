<template>
  <div class="autocomplete" @focusout="onFocusOut">
    <input
      :value="modelValue"
      type="text"
      :placeholder="placeholder"
      :required="required"
      @focus="onFocus"
      @input="onInput"
    />
    <ul v-if="showDropdown && options.length" class="autocomplete-list">
      <li
        v-for="employee in options"
        :key="employee.id"
        class="autocomplete-item"
        @mousedown.prevent="selectEmployee(employee)"
      >
        {{ formatEmployee(employee) }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { Employee } from "@/types";

withDefaults(defineProps<{
  modelValue: string;
  options: Employee[];
  placeholder?: string;
  required?: boolean;
}>(), {
  placeholder: "",
  required: false,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "search", query: string): void;
  (e: "select", employee: Employee): void;
}>();

const showDropdown = ref(false);

const formatEmployee = (employee: Employee) => `${employee.lastName} ${employee.firstName} (${employee.email})`;

const onInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  emit("update:modelValue", value);
  emit("search", value.trim());
  showDropdown.value = true;
};

const onFocus = () => {
  showDropdown.value = true;
};

const onFocusOut = () => {
  setTimeout(() => {
    showDropdown.value = false;
  }, 100);
};

const selectEmployee = (employee: Employee) => {
  emit("update:modelValue", formatEmployee(employee));
  emit("select", employee);
  showDropdown.value = false;
};
</script>

<style scoped>
.autocomplete { position: relative; }
.autocomplete-list {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 220px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  z-index: 20;
  margin: 0;
  padding: 0;
  list-style: none;
}
.autocomplete-item {
  padding: 0.5rem 0.75rem;
  cursor: pointer;
}
.autocomplete-item:hover {
  background: #f4f7fb;
}
</style>
