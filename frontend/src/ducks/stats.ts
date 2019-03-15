import {Action} from './Action';
import {ThunkAction} from 'redux-thunk';
import {getBackendJSON, Network} from '../utils/net';
import {Stats, statsFromJSON, StatsJSON} from 'filecoin-network-stats-common/lib/domain/Stats';
import {AppState} from './store';
import {local} from 'd3-selection';

export const SWITCH_NETWORK = 'stats/SWITCH_NETWORK';
export const SET_STATS = 'stats/SET_STATS';
export const TOGGLE_LOADING = 'stats/TOGGLE_LOADING';

export interface StatsState {
  stats: Stats | null,
  network: Network
  customURL: string | null
  isLoading: false
}

let timer: number | null;

export function poll (): ThunkAction<Promise<void>, AppState, any, any> {
  let first = true;

  const doPoll: ThunkAction<Promise<void>, AppState, any, any> = async (dispatch, getState) => {
    dispatch(toggleLoading(true));

    const {network, customURL} = getState().stats;

    try {
      const data = await getBackendJSON<StatsJSON>(network, customURL, 'sync');
      dispatch({
        type: SET_STATS,
        payload: statsFromJSON(data),
      });
    } catch (e) {
      console.error('Caught error while polling!', e);

      if (first) {
        throw e;
      }
    } finally {
      dispatch(toggleLoading(false));
    }

    first = false;
    timer = setTimeout(() => dispatch(poll()), 5000);
  };

  return doPoll;
}

export function switchNetwork (network: Network, customURL: string): ThunkAction<Promise<void>, AppState, any, any> {
  return async (dispatch, getState) => {
    clearTimeout(timer);

    const oldNetwork = getState().stats.network;
    const oldCustomURL = getState().stats.customURL;

    dispatch({
      type: SWITCH_NETWORK,
      payload: {
        network,
        customURL,
      },
    });

    try {
      await dispatch(poll());
    } catch (e) {
      dispatch({
        type: SWITCH_NETWORK,
        payload: {
          network: oldNetwork,
          customURL: oldCustomURL,
        },
      });

      dispatch(poll());
      throw e;
    }

    localStorage.setItem('network', network);
    localStorage.setItem('customURL', customURL);
  };
}

export function toggleLoading (status: boolean): Action<boolean> {
  return {
    type: TOGGLE_LOADING,
    payload: status,
  };
}


function getInitialState (): StatsState {
  return {
    isLoading: false,
    network: localStorage.getItem('network') as Network|undefined || Network.STABLE,
    customURL: localStorage.getItem('customURL') || '',
    stats: null,
  };
}

export default function reducer (state = getInitialState(), action: Action<any>): StatsState {
  switch (action.type) {
    case SET_STATS:
      return {...state, stats: action.payload};
    case TOGGLE_LOADING:
      return {...state, isLoading: action.payload};
    case SWITCH_NETWORK:
      return {...state, ...action.payload};
    default:
      return state;
  }
}