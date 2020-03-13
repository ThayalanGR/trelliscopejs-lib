import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import 'react-virtualized/styles.css';
import blue from '@material-ui/core/colors/blue';
import lightBlue from '@material-ui/core/colors/lightBlue';
import './assets/styles/main.css';
//import './assets/fonts/IcoMoon/style.css';
import './assets/fonts/OpenSans/style.css';

import { addClass } from './classManipulation';
import { fetchDisplayList, windowResize, setAppDims } from './actions';
import createCallbackMiddleware from './callbackMiddleware';
import crossfilterMiddleware from './crossfilterMiddleware';
import reducers from './reducers';
import App from './App';
let store = null;

const trelliscope = (id, config, options) => {

  // console.log(JSON.stringify(config))
  console.log(config, "config");

  // setting up logger and usecallback initial state
  let useLogger = true;
  let loggerOptions = {};
  let useCallback = false;
  if (options !== undefined) {
    if (typeof options.logger === 'boolean') {
      useLogger = options.logger;
    } else if (options.logger !== undefined) {
      loggerOptions = options.logger;
    }
    if (options.callbacks !== undefined) {
      useCallback = true;
    }
  }

  // root element
  const el = document.getElementById(id);

  // setting app container class and stylings to the root element
  addClass(el, 'trelliscope-app');
  const appDims = {};
  appDims.width = el.clientWidth;
  appDims.height = el.clientHeight;

  // setting up redux middleware
  const middlewares = [thunkMiddleware, crossfilterMiddleware];
  if (useLogger) {
    const loggerMiddleware = createLogger(loggerOptions);
    middlewares.push(loggerMiddleware);
  }

  if (useCallback) {
    const callbackMiddleware = createCallbackMiddleware(options.callbacks);
    middlewares.push(callbackMiddleware);
  }

  // creating redux store
  store = createStore(reducers, { appId: id, singlePageApp: false, fullscreen: false }, applyMiddleware(...middlewares));

  // hot moduel replacement webpack script
  if (module.hot) {
    module.hot.accept('./reducers', () => {
      store.replaceReducer(reducers);
    });
  }

  // setting up app dimension
  store.dispatch(windowResize(appDims));
  store.dispatch(setAppDims(appDims));

  // load the list of displays
  store.dispatch(fetchDisplayList(config, id, false));
  // console.log("finished processing fetchDesplaylsit", store.getState())

  window.addEventListener('resize', () => {
    store.dispatch(windowResize({
      height: el.clientHeight,
      width: el.clientWidth
    }));
  });

  // setting up MUI Theme
  const themeV1 = createMuiTheme({
    palette: {
      primary: { light: blue.A100, main: blue.A200 }, // '#4285f4', // lightBlue500,
      secondary: { light: lightBlue[200], main: lightBlue[700] }
      // accent1Color: redA200
    },
    typography: {
      fontFamily: '"Open Sans", sans-serif',
      fontWeightLight: 200,
      fontWeightRegular: 300,
      fontWeightMedium: 400
    }
  });

  // entry point
  ReactDOM.render(<MuiThemeProvider theme={themeV1}>
    <Provider store={store}>
      <App />
    </Provider>
  </MuiThemeProvider>, document.getElementById(id)
  );

  // Hot moduel replacement (HMR) script
  if (module.hot) {
    module.hot.accept('./App', () => {
      ReactDOM.render(
        <MuiThemeProvider theme={themeV1}>
          <Provider store={store}>
            <App />
          </Provider>
        </MuiThemeProvider>,
        document.getElementById(id)
      );
    });
  }

};

window.trelliscope = trelliscope;

export { trelliscope, store }
