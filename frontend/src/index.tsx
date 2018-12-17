// put first to allow overrides
import 'normalize.css';
import './index.scss';
import 'c3/c3.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Main from './components/Main';
import {BrowserRouter as Router} from 'react-router-dom';
import {Provider} from 'react-redux';
import store from './ducks/store';

const body = document.body;
const root = document.createElement('div');
root.id = 'root';
body.appendChild(root);

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <Main />
    </Router>
  </Provider>,
  document.getElementById('root'),
);