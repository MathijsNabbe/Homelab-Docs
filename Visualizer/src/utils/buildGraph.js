import { LAYOUT } from '../config/layout.js'

function deviceId(name) {
  return `device:${name}`
}

function serviceId(deviceName, serviceName) {
  return `service:${deviceName}/${serviceName}`
}

function containerId(deviceName, serviceName, containerName) {
  return `container:${deviceName}/${serviceName}/${containerName}`
}

function portId(deviceName, serviceName, containerName, index, port) {
  return `port:${deviceName}/${serviceName}/${containerName}/${index}:${port}`
}

function edgeId(source, target) {
  return `${source}->${target}`
}

function createNode(id, type, label, position) {
  return {
    id,
    type,
    position,
    data: { label },
  }
}

function createEdge(source, target) {
  return {
    id: edgeId(source, target),
    source,
    target,
  }
}

function branchContentHeight(service) {
  let height = 0

  for (const container of service.Containers ?? []) {
    height += LAYOUT.levelHeight
    height += (container.Ports ?? []).length * LAYOUT.levelHeight
  }

  return height
}

function deviceCenterX(serviceCount) {
  if (serviceCount <= 1) {
    return 0
  }

  return ((serviceCount - 1) * LAYOUT.branchGap) / 2
}

function addServiceBranch(device, service, branchX, serviceY, nodes, edges, currentDeviceId) {
  const currentServiceId = serviceId(device.Name, service.Name)

  nodes.push(
    createNode(currentServiceId, 'service', service.Name, {
      x: branchX,
      y: serviceY,
    }),
  )

  edges.push(createEdge(currentDeviceId, currentServiceId))

  let y = serviceY + LAYOUT.levelHeight

  for (const container of service.Containers ?? []) {
    const currentContainerId = containerId(
      device.Name,
      service.Name,
      container.Name,
    )

    nodes.push(
      createNode(currentContainerId, 'container', container.Name, {
        x: branchX,
        y,
      }),
    )

    edges.push(createEdge(currentServiceId, currentContainerId))

    y += LAYOUT.levelHeight

    for (const [index, port] of (container.Ports ?? []).entries()) {
      const currentPortId = portId(
        device.Name,
        service.Name,
        container.Name,
        index,
        port,
      )

      nodes.push(
        createNode(currentPortId, 'port', port, {
          x: branchX,
          y,
        }),
      )

      edges.push(createEdge(currentContainerId, currentPortId))

      y += LAYOUT.levelHeight
    }
  }

  return branchContentHeight(service)
}

export function buildGraph(devices) {
  const nodes = []
  const edges = []
  let y = 0

  for (const device of devices) {
    const services = device.Services ?? []
    const currentDeviceId = deviceId(device.Name)
    const serviceY = y + LAYOUT.levelHeight

    nodes.push(
      createNode(currentDeviceId, 'device', device.Name, {
        x: deviceCenterX(services.length),
        y,
      }),
    )

    let maxBranchHeight = 0

    for (const [index, service] of services.entries()) {
      const branchX = index * LAYOUT.branchGap
      const branchHeight = addServiceBranch(
        device,
        service,
        branchX,
        serviceY,
        nodes,
        edges,
        currentDeviceId,
      )

      maxBranchHeight = Math.max(maxBranchHeight, branchHeight)
    }

    y = serviceY + LAYOUT.levelHeight + maxBranchHeight + LAYOUT.blockGap
  }

  return { nodes, edges }
}
