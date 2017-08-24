import React from 'react';
import * as Rcon from '../utils/rcon';
import { Link } from 'react-router-dom';

class PlayerPage extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      players: [],
      bans: [],
      loading: true,
    }

    this.playerInterval = null;
  }

  componentDidMount () {
    this.getPlayers();
    this.getBans();
    this.playerInterval = setInterval(() => this.getPlayers(), 1000);
  }

  componentWillUnmount () {
    clearInterval(this.playerInterval);
  }

  getPlayers () {
    Rcon.send('playerlist', players => {
      this.setState({
        players: players.message,
        loading: false,
      });
    });
  }

  getBans () {
    Rcon.send('banlistex', banlist => {
      let parsedBans = [];
      const bans = banlist.message.split("\n");
      bans.forEach(ban => {
        const matches = ban.match(/\d\s*(\d+)\s*"(.*)"\s*"(.*)"/i);

        if (matches) {
          parsedBans.push({
            steamid: matches[1],
            username: matches[2],
            reason: matches[3],
          });
        }
      });

      this.setState({
        bans: parsedBans,
      });
    });
  }

  kickPlayer (player) {
    Rcon.send(`kick ${player.SteamID}`);
  }

  unbanPlayer (player) {
    Rcon.send(`unban ${player.steamid}`, e => {
      if (e.message.indexOf('Unbanned User') !== -1) {
        this.getBans();
      }
    });
  }

  render () {
    if (this.state.loading) {
      return (
        <div className="panel panel-default">
          <div className="panel-body text-center">
            Loading...
          </div>
        </div>
      )
    }
    return (
      <div className="container-fluid">
        <div className="panel panel-default">
          <div className="panel-heading">
            Online Players
          </div>
          <div className="panel-body">
            {
              this.state.players.length === 0 ?
                <div className="alert alert-info">
                  <p>No players online</p>
                </div> :
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <td width="20%">Steam ID</td>
                      <td width="20%">Name</td>
                      <td width="20%">Health</td>
                      <td className="text-center">Play time</td>
                      <td className="text-center">Ping</td>
                      <td></td>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      this.state.players.map(player => {
                        let connectedSeconds = player.ConnectedSeconds;
                        let connectedHours = Math.floor(connectedSeconds / 3600);
                        connectedSeconds %= 3600;
                        let connectedMinutes = Math.floor(connectedSeconds / 60);
                        if (connectedHours.toString().length === 1) {
                          connectedHours = '0' + connectedHours;
                        }
                        if (connectedMinutes.toString().length === 1) {
                          connectedMinutes = '0' + connectedMinutes;
                        }

                        return (
                          <tr key={ player.SteamID }>
                            <td width="20%">{ player.SteamID }</td>
                            <td width="20%">{ player.DisplayName }</td>
                            <td width="20%">
                              <div className="progress">
                                <div className="progress-bar" style={{width: `${player.Health}%`}} />
                              </div>
                            </td>
                            <td className="text-center" width="10%">{ connectedHours }:{ connectedMinutes }</td>
                            <td className="text-center" width="10%">{ player.Ping }</td>
                            <td className="text-right">
                              <button
                                type="button"
                                className="btn btn-warning btn-xs"
                                onClick={ () => this.kickPlayer(player) }>
                                Kick
                              </button>
                              <Link
                                className="btn btn-danger btn-xs"
                                to={{pathname: `ban/${player.SteamID}`, state: {modal: true}}}>
                                Ban
                              </Link>
                            </td>
                          </tr>
                        )
                      })
                    }
                  </tbody>
                </table>
            }
          </div>
        </div>
        <div className="panel panel-default">
          <div className="panel-heading">
            Banned Players
          </div>
          <div className="panel-body">
            <table className="table table-striped">
              <thead>
                <tr>
                  <td width="20%">Steam ID</td>
                  <td width="20%">Name</td>
                  <td>Reason</td>
                  <td></td>
                </tr>
              </thead>
              <tbody>
                {
                  this.state.bans.map((player, index) => {
                    return (
                      <tr key={ index }>
                        <td width="20%">{ player.steamid }</td>
                        <td width="20%">{ player.username }</td>
                        <td width="20%">{ player.reason }</td>
                        <td className="text-right">
                          <button
                            type="button"
                            className="btn btn-danger btn-xs"
                            onClick={ () => this.unbanPlayer(player) }>
                            Unban
                          </button>
                        </td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }
}

export default PlayerPage;
