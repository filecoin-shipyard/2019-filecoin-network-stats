import {ThunkAction} from 'redux-thunk';
import {
  TimeseriesDatapoint,
  timeseriesDatapointFromJSON,
  TimeseriesDatapointJSON,
} from 'filecoin-network-stats-common/lib/domain/TimeseriesDatapoint';
import {
  CategoryDatapoint,
  categoryDatapointFromJSON,
  CategoryDatapointJSON,
} from 'filecoin-network-stats-common/lib/domain/CategoryDatapoint';
import {ChartDuration} from 'filecoin-network-stats-common/lib/domain/ChartDuration';
import {getBackendJSON} from '../utils/net';
import {Action} from './Action';
import {AppState} from './store';

export const SET_OVERRIDE = 'overrides/SET_OVERRIDE';

export interface OverridesState {
  storage: {
    historicalMinerCounts: TimeseriesDatapoint[]
    historicalStoragePrice: TimeseriesDatapoint[]
    historicalCollateralPerGB: TimeseriesDatapoint[]
    historicalCollateral: TimeseriesDatapoint[]
    historicalStorageAmount: TimeseriesDatapoint[]
    historicalUtilization: TimeseriesDatapoint[]
  },
  token: {
    historicalBlockRewards: TimeseriesDatapoint[]
    historicalCoinsInCirculation: CategoryDatapoint[]
  },
  market: {
    historicalTokenVolume: TimeseriesDatapoint[]
  }
}

type StatName = keyof OverridesState['storage'] | keyof OverridesState['token'] | keyof OverridesState['market']

const minDelay = 500;

export function setOverride (statType: keyof OverridesState, statName: StatName, duration: ChartDuration): ThunkAction<Promise<void>, AppState, any, any> {
  return async (dispatch, getState) => {
    const {network, customURL} = getState().stats;
    const start = Date.now();
    const data = await getBackendJSON(network, customURL, `stats/${statType}/${statName}/${duration}`) as any[];
    const elapsed = Date.now() - start;
    let parsedData: TimeseriesDatapoint[] | CategoryDatapoint[];

    if (data.length > 0) {
      if (data[0].amount) {
        parsedData = (data as TimeseriesDatapointJSON[]).map(timeseriesDatapointFromJSON);
      } else if (data[0].category) {
        parsedData = (data as CategoryDatapointJSON[]).map(categoryDatapointFromJSON);
      }
    } else {
      parsedData = [];
    }

    // introduce a small delay if elapsed time is under 500ms to allow
    // loading animations to fire. looks jerky without it.
    return new Promise((resolve) => setTimeout(() => {
      dispatch({
        type: SET_OVERRIDE,
        payload: {
          statType,
          statName,
          data: parsedData,
        },
      });
      resolve();
    }, elapsed < minDelay ? minDelay - elapsed : 0));
  };
}

function getInitialState (): OverridesState {
  return {
    storage: {
      historicalMinerCounts: [],
      historicalStoragePrice: [],
      historicalCollateral: [],
      historicalCollateralPerGB: [],
      historicalStorageAmount: [],
      historicalUtilization: [],
    },
    token: {
      historicalBlockRewards: [],
      historicalCoinsInCirculation: [],
    },
    market: {
      historicalTokenVolume: [],
    },
  };
}

export default function reducer (state = getInitialState(), action: Action<any>) {
  switch (action.type) {
    case SET_OVERRIDE:
      return {
        ...state,
        [action.payload.statType]: {
          ...(state as any)[action.payload.statType],
          [action.payload.statName]: action.payload.data,
        },
      };
    default:
      return state;
  }
}