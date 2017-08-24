import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Main from './main';

class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <Route component={Main} />
      </BrowserRouter>
    );
  }
}

export default App;
