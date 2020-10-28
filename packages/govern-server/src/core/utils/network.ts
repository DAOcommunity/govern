import config from '../config'
import { ErrorInvalidNetwork } from '../errors'
import { Address, Network as NetworkType, Networkish } from '../types'

class Network {
  #chainId: number
  #ensAddress: Address
  #name: string
  #subgraphId: string

  constructor({
    chainId,
    ensAddress,
    name,
  }: {
    chainId?: number
    ensAddress?: Address
    name?: string
  }) {
    if (name === undefined && chainId === undefined) {
      throw new ErrorInvalidNetwork(
        `Network: no name or chainId passed. ` +
          `Please provide at least one of these.`
      )
    }

    // Handle the case of having a name but no chainId.
    if (name !== undefined && chainId === undefined) {
      this.#chainId = networkFromName(name)?.chainId

      if (chainId === undefined) {
        throw new ErrorInvalidNetwork(
          `Network: invalid name provided: ${name}. ` +
            `Please use provide a chainId or use one of the following names: ` +
            config.networks.map((network) => network.chainId).join(', ') +
            `.`
        )
      }
    }

    // Just a little help for TypeScript, at this
    // point we know that chainId cannot be undefined.
    this.#chainId = chainId as number

    const chainIdNetwork = networkFromChainId(chainId)

    if (!chainIdNetwork) {
      throw new ErrorInvalidNetwork(
        `Network: invalid chainId provided: ${chainId}. ` +
          `Please use one of the following: ` +
          config.networks.map((network) => network.chainId).join(', ') +
          `.`
      )
    }

    this.#name = name ?? chainIdNetwork.name
    this.#ensAddress = ensAddress ?? chainIdNetwork.ensAddress
    this.#subgraphId = chainIdNetwork.subgraphId
  }

  get chainId() {
    return this.#chainId
  }

  get ensAddress() {
    return this.#ensAddress
  }

  get name() {
    return this.#name
  }

  get subgraphUrl() {
    return `https://api.thegraph.com/subgraphs/name/${this.#subgraphId}`
  }
}

function networkFromChainId(chainId: number): NetworkType | null {
  return (
    config.networks.find(
      (network: NetworkType) => network.chainId === chainId
    ) || null
  )
}

function networkFromName(name: string): NetworkType | null {
  return (
    config.networks.find((network: NetworkType) => network.name === name) ||
    null
  )
}

export function toNetwork(network: Networkish): Network {
  if (!network) {
    throw new ErrorInvalidNetwork(`Network: incorrect value provided.`)
  }

  if (typeof network === 'string') {
    return new Network({ name: network })
  }

  if (typeof network === 'number') {
    return new Network({ chainId: network })
  }

  return new Network(network)
}

export default Network