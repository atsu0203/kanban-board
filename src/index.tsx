import React from 'react';
import {createGlobalStyle} from 'styled-components';
import ReactDOM from 'react-dom/client';
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import { reducer } from './reducer'
import App from './App';
import reportWebVitals from './reportWebVitals';
import cssVariables from './css_variables.json';

const variable = cssVariables.variable;
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: sans-serif;
    font-size: ${variable.textSize};
    color: ${variable.textColor};
    *, *:before, *:after {
        box-sizing: border-box;
    }
    a {
        color: $base-color;
    }
  }
`;

const store = createStore(reducer)

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <Provider store={store}>
    <GlobalStyle />
    <App />
  </Provider>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

