import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';
import { Provider } from 'react-redux';
import { articleStore } from './redux/store.jsx';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import '../src/assets/css/custom.css'


window.api_url = "http://mywebdevapps.com/api/";

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Provider store={articleStore}>
        <App />
      </Provider>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);