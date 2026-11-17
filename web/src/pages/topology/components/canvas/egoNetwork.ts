import type { DeviceSummary, LinkSummary } from '@/api/topology'

export type KHopDistance = 1 | 2 | 3 | 'all'
export type KHopFilterMode = 'ghost' | 'prune'

export interface EgoNetworkResult {
  /** Map of deviceId -> shortest hop distance from nearest active beacon (beacons have distance 0) */
  nodeDistances: Map<string, number>
  /** Set of node IDs within the k-hop boundary (dist <= k) from ANY active beacon */
  reachableNodeIds: Set<string>
  /** Set of node IDs outside the k-hop boundary (dist > k or disconnected) */
  dimmedNodeIds: Set<string>
  /** Set of link IDs connecting nodes within the k-hop boundary */
  reachableLinkIds: Set<string>
  /** Set of link IDs outside the k-hop boundary */
  dimmedLinkIds: Set<string>
  /** Active epicenter / primary focus node ID */
  focusNodeId: string | null
  /** All active epicenter beacon node IDs */
  focusNodeIds: string[]
  /** Active k-hop radius */
  kHop: KHopDistance
  /** Filter visual mode ('ghost' | 'prune') */
  filterMode: KHopFilterMode
}

interface EdgeAdjacency {
  neighborId: string
  linkId: string
}

/**
 * Computes multi-source Breadth-First Search (BFS) Ego-Network up to k hops
 * around active beacon nodes (Stylebook §3.5 & Step 5.3).
 *
 * Stylebook Rule 3.5:
 * "Các node trong bán kính K (mặc định K = 2) từ bất kỳ beacon nào sẽ giữ nguyên hiển thị,
 *  trong khi những node nằm ngoài sẽ bị làm mờ. Các edge nối với node bị làm mờ cũng sẽ mờ theo."
 *
 * @param focusInput - Single node ID, array of node IDs, or Set of node IDs with active beacons
 * @param nodes - List of all network devices
 * @param links - List of all inter-tier links
 * @param kHop - Distance threshold (1, 2, 3 hops, or 'all')
 * @param filterMode - Visual presentation: 'ghost' (0.15 opacity) or 'prune' (hidden)
 */
export function computeEgoNetwork(
  focusInput: string | string[] | Set<string> | null | undefined,
  nodes: DeviceSummary[],
  links: LinkSummary[],
  kHop: KHopDistance = 'all',
  filterMode: KHopFilterMode = 'ghost'
): EgoNetworkResult {
  const nodeDistances = new Map<string, number>()
  const reachableNodeIds = new Set<string>()
  const dimmedNodeIds = new Set<string>()
  const reachableLinkIds = new Set<string>()
  const dimmedLinkIds = new Set<string>()

  // Normalize focusInput into array of unique active beacon IDs
  let focusList: string[] = []
  if (typeof focusInput === 'string') {
    focusList = [focusInput]
  } else if (Array.isArray(focusInput)) {
    focusList = focusInput
  } else if (focusInput instanceof Set) {
    focusList = Array.from(focusInput)
  }
  focusList = focusList.filter(Boolean)

  // If no beacons are active or kHop is 'all', entire network is fully visible (no dimming)
  if (focusList.length === 0 || kHop === 'all') {
    nodes.forEach((n) => reachableNodeIds.add(n.id))
    links.forEach((l) => reachableLinkIds.add(l.linkId))
    focusList.forEach((id) => nodeDistances.set(id, 0))
    return {
      nodeDistances,
      reachableNodeIds,
      dimmedNodeIds,
      reachableLinkIds,
      dimmedLinkIds,
      focusNodeId: focusList[0] ?? null,
      focusNodeIds: focusList,
      kHop,
      filterMode,
    }
  }

  const maxHops = typeof kHop === 'number' ? kHop : Infinity

  // 1. Build undirected adjacency graph
  const adjacency = new Map<string, EdgeAdjacency[]>()
  nodes.forEach((n) => adjacency.set(n.id, []))

  links.forEach((link) => {
    const sList = adjacency.get(link.sourceDeviceId) || []
    sList.push({ neighborId: link.targetDeviceId, linkId: link.linkId })
    adjacency.set(link.sourceDeviceId, sList)

    const tList = adjacency.get(link.targetDeviceId) || []
    tList.push({ neighborId: link.sourceDeviceId, linkId: link.linkId })
    adjacency.set(link.targetDeviceId, tList)
  })

  // 2. Perform Multi-Source BFS from ALL active beacons simultaneously
  const queue: Array<{ nodeId: string; dist: number }> = []
  focusList.forEach((beaconId) => {
    nodeDistances.set(beaconId, 0)
    reachableNodeIds.add(beaconId)
    queue.push({ nodeId: beaconId, dist: 0 })
  })

  while (queue.length > 0) {
    const current = queue.shift()!
    if (current.dist >= maxHops) {
      continue
    }

    const neighbors = adjacency.get(current.nodeId) || []
    for (const { neighborId, linkId } of neighbors) {
      const existingDist = nodeDistances.get(neighborId)
      const nextDist = current.dist + 1

      if (existingDist === undefined || nextDist < existingDist) {
        nodeDistances.set(neighborId, nextDist)
        reachableNodeIds.add(neighborId)
        reachableLinkIds.add(linkId)

        if (nextDist < maxHops) {
          queue.push({ nodeId: neighborId, dist: nextDist })
        }
      } else if (existingDist <= maxHops) {
        // Both endpoints are within k-hop, link is reachable
        reachableLinkIds.add(linkId)
      }
    }
  }

  // 3. Mark links connecting reachable nodes as reachable, others as dimmed
  links.forEach((link) => {
    const sReachable = reachableNodeIds.has(link.sourceDeviceId)
    const tReachable = reachableNodeIds.has(link.targetDeviceId)
    if (sReachable && tReachable) {
      reachableLinkIds.add(link.linkId)
    } else {
      dimmedLinkIds.add(link.linkId)
    }
  })

  // 4. Mark all nodes outside reachableNodeIds as dimmed
  nodes.forEach((node) => {
    if (!reachableNodeIds.has(node.id)) {
      dimmedNodeIds.add(node.id)
    }
  })

  return {
    nodeDistances,
    reachableNodeIds,
    dimmedNodeIds,
    reachableLinkIds,
    dimmedLinkIds,
    focusNodeId: focusList[0] ?? null,
    focusNodeIds: focusList,
    kHop,
    filterMode,
  }
}
