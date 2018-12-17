import {applyMiddleware, combineReducers, createStore, Store} from 'redux';
import thunk from 'redux-thunk';
import stats, {StatsState} from './stats';
import overrides, {OverridesState} from './overrides';

export type AppState = { stats: StatsState, overrides: OverridesState };

const store: Store<AppState> = createStore(combineReducers({
  stats,
  overrides,
}), {}, applyMiddleware(thunk));
export default store;