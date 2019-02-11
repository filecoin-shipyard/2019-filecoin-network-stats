import {Ask, askFromJSON, AskJSON, askToJSON} from './Ask';
import {
  TimeseriesDatapoint,
  timeseriesDatapointFromJSON,
  TimeseriesDatapointJSON,
  timeseriesDatapointToJSON,
} from './TimeseriesDatapoint';
import BigNumber from 'bignumber.js';
import {Node} from './Node';
import {
  HistogramDatapoint,
  histogramDatapointFromJSON,
  HistogramDatapointJSON,
  histogramDatapointToJSON,
} from './HistogramDatapoint';
import {MinerStat} from './MinerStat';
import {
  CategoryDatapoint,
  categoryDatapointFromJSON,
  CategoryDatapointJSON,
  categoryDatapointToJSON,
} from './CategoryDatapoint';
import {
  CostCapacityForMinerStat,
  costCapacityForMinerStatFromJSON,
  CostCapacityForMinerStatJSON,
  costCapacityForMinerStatToJSON,
} from './CostCapacityForMinerStat';

export interface MarketStats {
  asks: Ask[]
  bids: any[]
  volume: TimeseriesDatapoint[]
}

export interface MarketStatsJSON {
  asks: AskJSON[]
  bids: any[]
  volume: TimeseriesDatapointJSON[]
}

export function marketStatsToJSON (stats: MarketStats): MarketStatsJSON {
  return {
    asks: stats.asks.map(askToJSON),
    bids: stats.bids,
    volume: stats.volume.map(timeseriesDatapointToJSON),
  };
}

export function marketStatsFromJSON (stats: MarketStatsJSON): MarketStats {
  return {
    asks: stats.asks.map(askFromJSON),
    bids: stats.bids,
    volume: stats.volume.map(timeseriesDatapointFromJSON),
  };
}

export interface MiningStats {
  lastBlockHeight: number
  lastBlockTime: number
  averageBlockTime: number
  minerName: string | null
  minerAddress: string
  power: number
  blocksInTipset: number
  peerId: string
}

export interface StorageStats {
  storageAmount: {
    total: BigNumber,
    trend: number,
    data: TimeseriesDatapoint[]
  },
  storageCost: {
    average: BigNumber,
    trend: number,
    data: TimeseriesDatapoint[]
  },
  historicalCollateral: TimeseriesDatapoint[]
  historicalCollateralPerGB: {
    average: BigNumber,
    data: TimeseriesDatapoint[]
  }
  historicalMinerCounts: TimeseriesDatapoint[]
  capacityHistogram: HistogramDatapoint[]
  miners: MinerStat[]
  networkUtilization: TimeseriesDatapoint[]
  distributionOverTime: CategoryDatapoint[]
  evolution: CategoryDatapoint[]
  costCapacityBySize: CostCapacityForMinerStat[]
}

export interface StorageStatsJSON {
  storageAmount: {
    total: string,
    trend: number,
    data: TimeseriesDatapointJSON[]
  },
  storageCost: {
    average: string,
    trend: number,
    data: TimeseriesDatapointJSON[]
  },
  historicalCollateral: TimeseriesDatapointJSON[]
  historicalCollateralPerGB: {
    average: string
    data: TimeseriesDatapointJSON[]
  }
  historicalMinerCounts: TimeseriesDatapointJSON[]
  capacityHistogram: HistogramDatapointJSON[]
  miners: MinerStat[]
  networkUtilization: TimeseriesDatapointJSON[]
  distributionOverTime: CategoryDatapointJSON[]
  evolution: CategoryDatapointJSON[]
  costCapacityBySize: CostCapacityForMinerStatJSON[]
}

export function storageStatsToJSON (stats: StorageStats): StorageStatsJSON {
  return {
    storageAmount: {
      total: stats.storageAmount.total.toFixed(18),
      trend: stats.storageAmount.trend,
      data: stats.storageAmount.data.map(timeseriesDatapointToJSON),
    },
    storageCost: {
      average: stats.storageCost.average.toFixed(18),
      trend: stats.storageCost.trend,
      data: stats.storageCost.data.map(timeseriesDatapointToJSON),
    },
    historicalCollateral: stats.historicalCollateral.map(timeseriesDatapointToJSON),
    historicalCollateralPerGB: {
      average: stats.historicalCollateralPerGB.average.toFixed(18),
      data: stats.historicalCollateralPerGB.data.map(timeseriesDatapointToJSON)
    },
    historicalMinerCounts: stats.historicalMinerCounts.map(timeseriesDatapointToJSON),
    capacityHistogram: stats.capacityHistogram.map(histogramDatapointToJSON),
    miners: stats.miners,
    networkUtilization: stats.networkUtilization.map(timeseriesDatapointToJSON),
    distributionOverTime: stats.distributionOverTime.map(categoryDatapointToJSON),
    evolution: stats.evolution.map(categoryDatapointToJSON),
    costCapacityBySize: [
      costCapacityForMinerStatToJSON(stats.costCapacityBySize[0]),
      costCapacityForMinerStatToJSON(stats.costCapacityBySize[1]),
    ],
  };
}

export function storageStatsFromJSON (stats: StorageStatsJSON): StorageStats {
  return {
    storageAmount: {
      total: new BigNumber(stats.storageAmount.total),
      trend: stats.storageAmount.trend,
      data: stats.storageAmount.data.map(timeseriesDatapointFromJSON),
    },
    storageCost: {
      average: new BigNumber(stats.storageCost.average),
      trend: stats.storageCost.trend,
      data: stats.storageCost.data.map(timeseriesDatapointFromJSON),
    },
    historicalCollateral: stats.historicalCollateral.map(timeseriesDatapointFromJSON),
    historicalCollateralPerGB: {
      average: new BigNumber(stats.historicalCollateralPerGB.average),
      data: stats.historicalCollateralPerGB.data.map(timeseriesDatapointFromJSON)
    },
    historicalMinerCounts: stats.historicalMinerCounts.map(timeseriesDatapointFromJSON),
    capacityHistogram: stats.capacityHistogram.map(histogramDatapointFromJSON),
    miners: stats.miners,
    networkUtilization: stats.networkUtilization.map(timeseriesDatapointFromJSON),
    distributionOverTime: stats.distributionOverTime.map(categoryDatapointFromJSON),
    evolution: stats.evolution.map(categoryDatapointFromJSON),
    costCapacityBySize: [
      costCapacityForMinerStatFromJSON(stats.costCapacityBySize[0]),
      costCapacityForMinerStatFromJSON(stats.costCapacityBySize[1]),
    ],
  };
}

export interface TokenStats {
  tokenHoldingsDistribution: HistogramDatapoint[]
  blockRewardsOverTime: TimeseriesDatapoint[]
  coinsInCirculation: CategoryDatapoint[]
}

export interface TokenStatsJSON {
  tokenHoldingsDistribution: HistogramDatapointJSON[]
  blockRewardsOverTime: TimeseriesDatapointJSON[]
  coinsInCirculation: CategoryDatapointJSON[]
}

export function tokenStatsFromJSON (stats: TokenStatsJSON) {
  return {
    tokenHoldingsDistribution: stats.tokenHoldingsDistribution.map(histogramDatapointFromJSON),
    blockRewardsOverTime: stats.blockRewardsOverTime.map(timeseriesDatapointFromJSON),
    coinsInCirculation: stats.coinsInCirculation.map(categoryDatapointFromJSON),
  };
}

export function tokenStatsToJSON (stats: TokenStats) {
  return {
    tokenHoldingsDistribution: stats.tokenHoldingsDistribution.map(histogramDatapointToJSON),
    blockRewardsOverTime: stats.blockRewardsOverTime.map(timeseriesDatapointToJSON),
    coinsInCirculation: stats.coinsInCirculation.map(categoryDatapointToJSON),
  };
}

export interface Stats {
  market: MarketStats,
  mining: MiningStats,
  storage: StorageStats
  nodes: Node[]
  token: TokenStats
}

export interface StatsJSON {
  market: MarketStatsJSON
  mining: MiningStats
  storage: StorageStatsJSON
  nodes: Node[]
  token: TokenStatsJSON
}

export function statsToJSON (stats: Stats): StatsJSON {
  return {
    market: marketStatsToJSON(stats.market),
    mining: stats.mining,
    storage: storageStatsToJSON(stats.storage),
    nodes: stats.nodes,
    token: tokenStatsToJSON(stats.token),
  };
}

export function statsFromJSON (stats: StatsJSON): Stats {
  return {
    market: marketStatsFromJSON(stats.market),
    mining: stats.mining,
    storage: storageStatsFromJSON(stats.storage),
    nodes: stats.nodes,
    token: tokenStatsFromJSON(stats.token),
  };
}