import React from 'react';
import { Route, Switch, Link } from 'react-router-dom';
import * as Rcon from './utils/rcon';
import Dashboard from './pages/dashboard';
import Players from './pages/players';
import Chat from './pages/chat';
import Console from './pages/console';
import BanModal from './modals/ban';

class Main extends React.Component {
  state = {
    url: '',
    password: '',
    connected: false,
    loading: false,
  }

  previousLocation = this.props.location;

  componentWillUpdate(nextProps) {
    const { location } = this.props
    // set previousLocation if props.location is not modal
    if (
      nextProps.history.action !== 'POP' &&
      ( !location.state || ! location.state.modal)
    ) {
      this.previousLocation = this.props.location
    }
  }

  connect (e) {
    e.preventDefault();
    this.setState({ loading: true });

    Rcon.connect(this.state.url, this.state.password, event => {
      if (event.type === 'error') {
        this.setState({ error: event.error || 'Count not connect to the server', loading: false });
      } else {
        this.setState({
          connected: true,
          url: '',
          password: '',
        });
      }
    });
  }

  disconnect (e) {
    e.preventDefault();
    Rcon.disconnect(() => {
      this.setState({
        connected: false,
      })
    });
  }

  banPlayer (steamID, reason) {
    Rcon.send(`ban ${steamID} "${reason}"`);
  }

  render () {
    if ( ! this.state.connected) {
      return (
        <div className="container">
          <div className="row">
            <div className="col-md-6 col-md-offset-3">
              <div className="panel panel-default connection-form">
                <div className="panel-body">
                  <div className="alert alert-info text-center">
                    <p>This app is currently in early alpha. As such, there may be bugs</p>
                    <p>No information is stored, this app is completely client side</p>
                  </div>
                  {
                    this.state.error &&
                      <div className="alert alert-danger">
                        <p>{ this.state.error }</p>
                      </div>
                  }
                  <form onSubmit={ (e) => this.connect(e) }>
                    <div className="form-group">
                      <label>Web URL</label>
                      <input
                        type="text"
                        autoFocus="true"
                        value={ this.state.url }
                        disabled={ this.state.loading }
                        placeholder="000.000.000.000:0000"
                        className="form-control"
                        onChange={ e => this.setState({ url: e.target.value }) } />
                    </div>
                    <div className="form-group">
                      <label>Password</label>
                      <input
                        type="password"
                        value={ this.state.password }
                        disabled={ this.state.loading }
                        placeholder="Password"
                        className="form-control"
                        onChange={ e => this.setState({ password: e.target.value }) } />
                    </div>
                    <div className="form-group text-center">
                      <button
                        type="submit"
                        className={`btn btn-primary ${this.state.loading && 'disabled'}`}>
                        {
                          this.state.loading ? 'Connecting...' : 'Connect'
                        }
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const { location } = this.props
    const isModal = !!(
      location.state &&
      location.state.modal &&
      this.previousLocation !== location // not initial render
    )

    return (
      <div>
        <nav className="navbar navbar-default">
          <div className="container-fluid">
            <div className="navbar-header">
              <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar-collapse" aria-expanded="false">
                <span className="sr-only">Toggle navigation</span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
              </button>
              <a className="navbar-brand" href="">CARL</a>
            </div>
            <div className="collapse navbar-collapse" id="navbar-collapse">
              <ul className="nav navbar-nav">
                <li>
                  <Link to="/">Dashboard</Link>
                </li>
                <li>
                  <Link to={{pathname: '/chat'}}>
                    Chat
                  </Link>
                </li>
                <li>
                  <Link to={{pathname: '/console'}}>
                    Console
                  </Link>
                </li>
                <li>
                  <Link to={{pathname: '/players'}}>
                    Players
                  </Link>
                </li>
                <li>
                  <a href="#" onClick={ e => this.disconnect(e) }>
                    Disconnect
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <Switch location={ isModal ? this.previousLocation : location }>
          <Route exact path='/' component={ Dashboard } />
          <Route exact path='/players' component={ Players } />
          <Route exact path='/console' component={ Console } />
          <Route exact path='/chat' component={ Chat } />
        </Switch>
        {
          isModal &&
            <div>
              <Route exact path='/ban/:id' render={({ match, history }) => (
                <BanModal
                  history={ history }
                  match={ match }
                  onBan={ (steamID, reason) => this.banPlayer(steamID, reason) } />
              )} />
            </div>
        }
      </div>
    );
  }
}

export default Main;
