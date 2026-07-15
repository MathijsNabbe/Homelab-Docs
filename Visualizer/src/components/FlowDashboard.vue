<script setup>
import { markRaw, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { fetchMapping } from '../composables/useMapping.js'
import { buildGraph, layoutGraph } from '../utils/buildGraph.js'
import { resolveServiceIcons, revokeServiceIcons } from '../utils/resolveIcons.js'
import EntityNode from './nodes/EntityNode.vue'

const nodeTypes = {
  device: markRaw(EntityNode),
  service: markRaw(EntityNode),
}

const nodes = ref([])
const edges = ref([])
const error = ref(null)
const loading = ref(true)
const flowRef = ref(null)

onMounted(async () => {
  try {
    const devices = await fetchMapping()
    const graph = buildGraph(devices)
    nodes.value = await resolveServiceIcons(graph.nodes)
    edges.value = graph.edges
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  revokeServiceIcons()
})

function onNodesInitialized(measuredNodes) {
  nodes.value = layoutGraph(measuredNodes)

  nextTick(() => {
    flowRef.value?.fitView({ padding: 0.12 })
  })
}
</script>

<template>
  <div class="dashboard">
    <p v-if="loading" class="dashboard__status">Loading mapping.json…</p>
    <p v-else-if="error" class="dashboard__status dashboard__status--error">
      {{ error }}
    </p>

    <VueFlow
      v-else
      ref="flowRef"
      v-model:nodes="nodes"
      v-model:edges="edges"
      :node-types="nodeTypes"
      class="dashboard__flow"
      :fit-view-on-init="false"
      :fit-view-options="{ padding: 0.12 }"
      :min-zoom="0.25"
      :max-zoom="1.5"
      :nodes-draggable="false"
      :nodes-connectable="false"
      :elements-selectable="false"
      @nodes-initialized="onNodesInitialized"
    >
      <Background :gap="20" :size="1" pattern-color="#e2e8f0" />
      <Controls />
    </VueFlow>
  </div>
</template>
