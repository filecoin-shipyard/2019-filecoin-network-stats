import {Action} from './Action';
import {ThunkAction} from 'redux-thunk';
import {getBackendJSON} from '../utils/net';
import {Stats, statsFromJSON, StatsJSON} from 'filecoin-network-stats-common/lib/domain/Stats';

export const SET_STATS = 'stats/SET_STATS';
export const TOGGLE_LOADING = 'stats/TOGGLE_LOADING';

export interface StatsState {
  stats: Stats | null,
  isLoading: false
}

export function poll (): ThunkAction<Promise<void>, StatsState, any, any> {
  return async (dispatch) => {
    dispatch(toggleLoading(true));

    try {
      const data = await getBackendJSON<StatsJSON>('sync');
      dispatch({
        type: SET_STATS,
        payload: statsFromJSON(data),
      });
    } catch (e) {
      console.error('Caught error while polling!', e);
    } finally {
      dispatch(toggleLoading(false));
    }

    setTimeout(() => dispatch(poll()), 5000);
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
    stats: null,
  };
}

export default function reducer (state = getInitialState(), action: Action<any>): StatsState {
  switch (action.type) {
    case SET_STATS:
      return {...state, stats: action.payload};
    case TOGGLE_LOADING:
      return {...state, isLoading: action.payload};
    default:
      return state;
  }
}