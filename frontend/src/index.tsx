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
import * as Modal from 'react-modal';

const body = document.body;
const root = document.createElement('div');
root.id = 'root';
body.appendChild(root);

Modal.setAppElement(document.getElementById('root'));

if (process.env.SENTRY_DSN) {
  (window as any).Sentry.init({ dsn: process.env.SENTRY_DSN });
}

if (process.env.GA_TRACKING_ID && 'ga' in window) {
  (window as any).ga('create', process.env.GA_TRACKING_ID, 'auto');
  (window as any).ga('send', 'pageview');
}

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <Main />
    </Router>
  </Provider>,
  document.getElementById('root'),
);