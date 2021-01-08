
export function generateBrokerMap(brokerDetail, clusterMap, brokerMap) {
  const map = {}
  for (const k in brokerDetail) {
    const v = brokerDetail[k]
    for (const ck in clusterMap) {
      const cv = clusterMap[ck]
      if (map[ck] === undefined) {
        map[ck] = []
      }
      for (const cvi in cv) {
        const cvv = cv[cvi]
        if (cvv === k) {
          let index = 0
          for (const vi in v) {
            const vv = v[vi]
            vv.index = index
            vv.address = brokerMap[cvv].brokerAddrs[index]
            vv.brokerName = brokerMap[cvv].brokerName
            map[ck].push(vv)
            index++
          }
        }
      }
    }
  }
  return map
}
