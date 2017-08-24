import React from 'react';
import * as Rcon from '../utils/rcon';
import ProgressBar from 'progressbar.js';

class Dashboard extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      fps: 0,
      memory: 0,
      entityCount: 0,
      playerCount: 0,
      maxPlayers: 0,
      hostname: '',
      interval: null,
    }
  }

  componentDidMount () {
    const interval = setInterval(() => {
      this.getStats();
      this.doAnimations();
    }, 100);

    this.setState({
      interval: interval,
    });

    this.fpsBar = new ProgressBar.Circle('#fps-count', {
      color: '#FCB03C',
      duration: 1000,
      easing: 'easeInOut',
      strokeWidth: 3,
      trailColor: '#ddd',
      text: {
        value: this.state.fps
      },
    });

    this.playerCountBar = new ProgressBar.Circle('#player-count', {
      color: '#3CB0FC',
      duration: 1000,
      easing: 'easeInOut',
      strokeWidth: 3,
      trailColor: '#ddd',
      text: {
        value: this.state.playerCount
      },
    });

    this.memoryBar = new ProgressBar.Circle('#memory-bar', {
      color: '#B03CFC',
      duration: 1000,
      easing: 'easeInOut',
      strokeWidth: 3,
      trailColor: '#ddd',
      text: {
        value: this.state.memory
      },
    });

    this.doAnimations();
  }

  doAnimations () {
    this.playerCountBar.setText(`${this.state.playerCount} / ${this.state.maxPlayers}`);
    this.playerCountBar.set(((this.state.playerCount / this.state.maxPlayers) * 100) / 100);
    this.fpsBar.setText(this.state.fps);
    this.fpsBar.set(Math.min((this.state.fps / 350) * 100, 100) / 100);
    this.memoryBar.setText(this.state.memory);
    this.memoryBar.set(((this.state.memory / 32000) * 100) / 100);
  }

  getStats () {
    Rcon.send('serverinfo', info => {
      this.setState({
        fps: info.message.Framerate,
        memory: info.message.Memory,
        entityCount: info.message.EntityCount,
        playerCount: info.message.Players,
        maxPlayers: info.message.MaxPlayers,
        hostname: info.message.Hostname,
      });
    });
  }

  componentWillUnmount () {
    clearInterval(this.state.interval);
  }

  render () {
    return (
      <div className="container-fluid">
        <h1 className="text-center">
          { this.state.hostname }
        </h1>
        <div className="row">
          <div className="col-md-4">
            <div className="panel panel-default">
              <div className="panel-heading">
                Players
              </div>
              <div className="panel-body text-center">
                <div className="text-center progress-wrapper">
                  <div className="dashboard-progress" id="player-count"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="panel panel-default">
              <div className="panel-heading">
                Framerate
              </div>
              <div className="panel-body text-center">
                <div className="text-center progress-wrapper">
                  <div className="dashboard-progress" id="fps-count"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="panel panel-default">
              <div className="panel-heading">
                Memory
              </div>
              <div className="panel-body text-center">
                <div className="text-center progress-wrapper">
                  <div className="dashboard-progress" id="memory-bar"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Dashboard;
