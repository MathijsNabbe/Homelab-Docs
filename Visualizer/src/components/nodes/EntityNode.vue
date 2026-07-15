<script setup>
import { Handle, Position } from '@vue-flow/core'

defineProps({
  data: {
    type: Object,
    required: true,
  },
  type: {
    type: String,
    default: 'default',
  },
})
</script>

<template>
  <div class="entity-node" :class="`entity-node--${type}`">
    <Handle type="target" :position="Position.Top" />

    <template v-if="type === 'service'">
      <div class="entity-node__header">
        <img
          v-if="data.iconUrl"
          class="entity-node__icon"
          :src="data.iconUrl"
          :alt="data.label"
        />
        <span class="entity-node__label">{{ data.label }}</span>
      </div>

      <div v-if="data.containers?.length" class="entity-node__containers">
        <div
          v-for="container in data.containers"
          :key="container.name"
          class="entity-node__container"
        >
          <span class="entity-node__container-name">{{ container.name }}</span>
          <span
            v-if="container.route"
            class="entity-node__route-chip"
          >{{ container.route }}</span>
          <div v-if="container.ports?.length" class="entity-node__ports">
            <span
              v-for="port in container.ports"
              :key="port"
              class="entity-node__port-chip"
            >{{ port }}</span>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <span class="entity-node__label">{{ data.label }}</span>
      <Handle type="source" :position="Position.Bottom" />
    </template>
  </div>
</template>
