import { LAYOUT } from '../config/layout.js'

function deviceId(name) {
  return `device:${name}`
}

function serviceId(deviceName, serviceName) {
  return `service:${deviceName}/${serviceName}`
}

function edgeId(source, target) {
  return `${source}->${target}`
}

function createNode(id, type, label, position, extraData = {}) {
  return {
    id,
    type,
    position,
    origin: [0.5, 0],
    sourcePosition: 'bottom',
    targetPosition: 'top',
    data: { label, ...extraData },
  }
}

function createEdge(source, target) {
  return {
    id: edgeId(source, target),
    source,
    target,
    type: 'default',
  }
}

function estimateServiceHeight(service) {
  const containerCount = (service.Containers ?? []).length

  return LAYOUT.serviceHeaderHeight + containerCount * LAYOUT.containerRowHeight
}

function mapContainers(containers) {
  return (containers ?? []).map((container) => ({
    name: container.Name,
    ports: container.Ports ?? [],
    route: container.Route ?? null,
  }))
}

function getNodeDimensions(node) {
  const width = node.dimensions?.width ?? node.measured?.width ?? 0
  const height = node.dimensions?.height ?? node.measured?.height ?? 0

  return {
    width: Math.max(width, node.type === 'device' ? LAYOUT.nodeMinWidth : LAYOUT.nodeMinWidth),
    height: Math.max(height, node.type === 'device' ? LAYOUT.nodeMinHeight : LAYOUT.serviceHeaderHeight),
  }
}

function effectiveWidth(width) {
  return width + LAYOUT.nodeMargin * 2
}

function effectiveHeight(height) {
  return height + LAYOUT.nodeMargin * 2
}

export function buildGraph(devices) {
  const nodes = []
  const edges = []
  let y = 0

  for (const device of devices) {
    const services = device.Services ?? []
    const currentDeviceId = deviceId(device.Name)
    const serviceY = y + LAYOUT.nodeMinHeight + LAYOUT.deviceToServicesGap

    nodes.push(
      createNode(currentDeviceId, 'device', device.Name, {
        x: 0,
        y,
      }),
    )

    let maxServiceHeight = LAYOUT.serviceHeaderHeight

    for (const [index, service] of services.entries()) {
      const currentServiceId = serviceId(device.Name, service.Name)

      maxServiceHeight = Math.max(maxServiceHeight, estimateServiceHeight(service))

      nodes.push(
        createNode(currentServiceId, 'service', service.Name, {
          x: 0,
          y: serviceY,
        }, {
          iconSource: service.IconUrl ?? null,
          containers: mapContainers(service.Containers),
          deviceName: device.Name,
          serviceIndex: index,
        }),
      )

      edges.push(createEdge(currentDeviceId, currentServiceId))
    }

    y = serviceY + maxServiceHeight + LAYOUT.blockGap
  }

  return { nodes, edges }
}

export function layoutGraph(nodes) {
  const dimensionsById = new Map(
    nodes.map((node) => [node.id, getNodeDimensions(node)]),
  )

  const deviceNames = nodes
    .filter((node) => node.type === 'device')
    .sort((a, b) => a.position.y - b.position.y)
    .map((node) => node.data.label)

  const positionById = new Map()
  const rowWidths = []
  let currentY = 0

  for (const deviceName of deviceNames) {
    const device = nodes.find(
      (node) => node.type === 'device' && node.data.label === deviceName,
    )
    const services = nodes
      .filter((node) => node.type === 'service' && node.data.deviceName === deviceName)
      .sort((a, b) => a.data.serviceIndex - b.data.serviceIndex)

    const deviceDims = dimensionsById.get(device.id)
    const serviceY = currentY + effectiveHeight(deviceDims.height) + LAYOUT.deviceToServicesGap

    positionById.set(device.id, {
      x: 0,
      y: currentY,
    })

    let cursorX = 0
    let maxServiceHeight = 0

    for (const service of services) {
      const dims = dimensionsById.get(service.id)
      const slotWidth = effectiveWidth(dims.width)

      positionById.set(service.id, {
        x: cursorX + slotWidth / 2,
        y: serviceY,
      })

      maxServiceHeight = Math.max(maxServiceHeight, effectiveHeight(dims.height))
      cursorX += slotWidth + LAYOUT.branchGap
    }

    const rowWidth = services.length > 0
      ? cursorX - LAYOUT.branchGap
      : effectiveWidth(deviceDims.width)

    positionById.set(device.id, {
      x: rowWidth / 2,
      y: currentY,
    })

    rowWidths.push({ deviceName, rowWidth })
    currentY = serviceY + maxServiceHeight + LAYOUT.blockGap
  }

  const maxRowWidth = Math.max(...rowWidths.map((row) => row.rowWidth), 0)
  const centerX = maxRowWidth / 2

  for (const { deviceName, rowWidth } of rowWidths) {
    const xOffset = centerX - rowWidth / 2
    const device = nodes.find(
      (node) => node.type === 'device' && node.data.label === deviceName,
    )
    const services = nodes.filter(
      (node) => node.type === 'service' && node.data.deviceName === deviceName,
    )

    for (const node of [device, ...services]) {
      const position = positionById.get(node.id)

      positionById.set(node.id, {
        x: position.x + xOffset,
        y: position.y,
      })
    }
  }

  return nodes.map((node) => {
    const position = positionById.get(node.id)

    if (!position) {
      return node
    }

    return {
      ...node,
      position: {
        ...node.position,
        ...position,
      },
    }
  })
}
