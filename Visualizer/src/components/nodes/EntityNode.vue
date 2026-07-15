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
    <img
      v-if="type === 'service' && data.iconUrl"
      class="entity-node__icon"
      :src="data.iconUrl"
      :alt="data.label"
    />
    <span class="entity-node__label">{{ data.label }}</span>
    <span
      v-if="type === 'container' && data.route"
      class="entity-node__route-chip"
    >{{ data.route }}</span>
    <div
      v-if="type === 'container' && data.ports?.length"
      class="entity-node__ports"
    >
      <span
        v-for="port in data.ports"
        :key="port"
        class="entity-node__port-chip"
      >{{ port }}</span>
    </div>
    <Handle
      v-if="type !== 'container'"
      type="source"
      :position="Position.Bottom"
    />
  </div>
</template>
