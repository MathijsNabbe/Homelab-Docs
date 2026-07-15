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

function edgeId(source, target) {
  return `${source}->${target}`
}

function createNode(id, type, label, position, extraData = {}) {
  return {
    id,
    type,
    position,
    data: { label, ...extraData },
  }
}

function createEdge(source, target) {
  return {
    id: edgeId(source, target),
    source,
    target,
  }
}

function rowSpan(count, gap) {
  if (count <= 1) {
    return 0
  }

  return (count - 1) * gap
}

function branchWidth(service) {
  const containerCount = (service.Containers ?? []).length

  return Math.max(
    LAYOUT.nodeMinWidth,
    rowSpan(containerCount, LAYOUT.containerGap) + LAYOUT.nodeMinWidth,
  )
}

function branchContentHeight() {
  return LAYOUT.levelHeight
}

function deviceCenterX(services) {
  if (services.length === 0) {
    return 0
  }

  let totalWidth = 0

  for (const [index, service] of services.entries()) {
    totalWidth += branchWidth(service)

    if (index < services.length - 1) {
      totalWidth += LAYOUT.branchGap
    }
  }

  return totalWidth / 2
}

function centeredRowStart(branchX, branchWidthValue, count, gap) {
  if (count === 0) {
    return branchX
  }

  const span = rowSpan(count, gap)

  return branchX + (branchWidthValue - span) / 2
}

function addServiceBranch(device, service, branchX, serviceY, nodes, edges, currentDeviceId) {
  const currentServiceId = serviceId(device.Name, service.Name)
  const containers = service.Containers ?? []
  const width = branchWidth(service)
  const containerY = serviceY + LAYOUT.levelHeight

  const containerStartX = centeredRowStart(
    branchX,
    width,
    containers.length,
    LAYOUT.containerGap,
  )

  nodes.push(
    createNode(currentServiceId, 'service', service.Name, {
      x: branchX + width / 2,
      y: serviceY,
    }, {
      iconSource: service.IconUrl ?? null,
    }),
  )

  edges.push(createEdge(currentDeviceId, currentServiceId))

  for (const [index, container] of containers.entries()) {
    const currentContainerId = containerId(
      device.Name,
      service.Name,
      container.Name,
    )

    nodes.push(
      createNode(currentContainerId, 'container', container.Name, {
        x: containerStartX + index * LAYOUT.containerGap,
        y: containerY,
      }, {
        ports: container.Ports ?? [],
      }),
    )

    edges.push(createEdge(currentServiceId, currentContainerId))
  }

  return branchContentHeight()
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
        x: deviceCenterX(services),
        y,
      }),
    )

    let branchX = 0

    for (const service of services) {
      addServiceBranch(
        device,
        service,
        branchX,
        serviceY,
        nodes,
        edges,
        currentDeviceId,
      )

      branchX += branchWidth(service) + LAYOUT.branchGap
    }

    y = serviceY + LAYOUT.levelHeight + branchContentHeight() + LAYOUT.blockGap
  }

  return { nodes, edges }
}
