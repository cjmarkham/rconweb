import React from 'react';
import * as Rcon from '../utils/rcon';
import * as Storage from '../utils/storage';
import DateFormat from 'dateformat';

class Console extends React.Component {
  state = {
    command: 'serverinfo',
    console: [],
    commandHistory: [],
    commandHistoryIndex: 0,
  }

  componentDidMount () {
    Rcon.on('message', (e) => this.onMessage(e));

    // Get console tail
    Rcon.getConsoleHistory(history => {
      const consoleHistory = history.filter(h => ! h.chat);

      this.setState({
        console: consoleHistory,
      });
      this.scrollBottom();
    });

    const commandHistory = localStorage.getItem('commandHistory');
    if (commandHistory) {
      this.setState({
        commandHistory: JSON.parse(commandHistory),
      });
    }
  }

  onMessage (payload) {
    if (payload.chat) {
      return;
    }

    this.setState(state => ({
      console: state.console.concat(payload),
    }), () => {
      this.scrollBottom();
    });
  }

  scrollBottom () {
    const consoleInner = document.getElementById('console-output');
    if (consoleInner) {
      consoleInner.scrollTop = consoleInner.scrollHeight;
    }
  }

  saveCommand (command) {
    Storage.save('commandHistory', command);
  }

  sendCommand () {
    Rcon.send(this.state.command);
  }

  consoleKeyUp (e) {
    let index = this.state.commandHistoryIndex;

    if (e.keyCode === 38) {
      --index
      if (index < 0) {
        index = this.state.commandHistory.length;
      }
    } else if (e.keyCode === 40) {
      index++;
      if (index > this.state.commandHistory.length) {
        index = 0;
      }
    }

    if (e.keyCode === 40 || e.keyCode === 38) {
      if (this.state.commandHistory[index]) {
        this.setState({
          command: this.state.commandHistory[index],
        })
      }
      this.setState({
        commandHistoryIndex: index,
      })
    }
  }

  componentWillUnmount () {
    Rcon.off('message');
  }

  renderConsoleOutput (output, index) {
    return (
      <div key={ index }>
        <p className="text-muted">
          { DateFormat(output.timestamp, 'HH:MM:ss') }
        </p>
        <p>
          {
            output.prefix && <span className="console-prefix">{ output.prefix }</span>
          }
          {
            output.name && <span className="console-prefix">{ output.name }</span>
          }
          { output.message }
        </p>
      </div>
    )
  }

  render () {
    return (
      <div className="container-fluid">
        <div className="panel panel-default">
          <div className="panel-body">
            <div id="console-output">
              <div id="console-output-inner">
                {
                  this.state.console.map((output, index) => {
                    const dataType = toString.call(output.message);

                    if (dataType === '[object Array]') {
                      return output.message.map((message, i) => {
                        return this.renderConsoleOutput(message, i);
                      })
                    } else if (dataType === '[object Object]') {
                      output.message = JSON.stringify(output.message);
                      return this.renderConsoleOutput(output, index);
                    } else {
                      return this.renderConsoleOutput(output, index);
                    }
                  })
                }
              </div>
            </div>
            <div className="container-fluid input-with-button">
              <input
                type="text"
                className="form-control"
                placeholder="Command"
                value={ this.state.command }
                onKeyUp={ e => this.consoleKeyUp(e) }
                onChange={ e => this.setState({ command: e.target.value }) } />
              <button
                className="btn btn-primary"
                type="submit"
                onClick={ () => this.sendCommand() }>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Console;
