const iconCache = new Map()

async function downloadIcon(url) {
  if (!url) {
    return null
  }

  if (iconCache.has(url)) {
    return iconCache.get(url)
  }

  try {
    const response = await fetch(url)

    if (!response.ok) {
      return null
    }

    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    iconCache.set(url, objectUrl)
    return objectUrl
  } catch {
    return null
  }
}

export async function resolveServiceIcons(nodes) {
  const iconSources = [
    ...new Set(
      nodes
        .filter((node) => node.type === 'service' && node.data.iconSource)
        .map((node) => node.data.iconSource),
    ),
  ]

  await Promise.all(iconSources.map((url) => downloadIcon(url)))

  return nodes.map((node) => {
    if (node.type !== 'service' || !node.data.iconSource) {
      return node
    }

    const iconUrl = iconCache.get(node.data.iconSource) ?? null

    return {
      ...node,
      data: {
        ...node.data,
        iconUrl,
      },
    }
  })
}

export function revokeServiceIcons() {
  for (const objectUrl of iconCache.values()) {
    URL.revokeObjectURL(objectUrl)
  }

  iconCache.clear()
}
