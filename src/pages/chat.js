import React from 'react';
import * as Rcon from '../utils/rcon';
import DateFormat from 'dateformat';

class Chat extends React.Component {
  state = {
    chatMessage: 'Hello',
    chat: [],
    notifiers: [
      {
        regex: 'nope',
        color: 'green',
      }
    ],
  }

  componentDidMount () {
    Rcon.on('message', (e) => this.onMessage(e));

    // Get console (and chat) tail
    Rcon.getConsoleHistory(history => {
      const chatHistory = history.filter(h => h.chat);

      this.setState({
        chat: chatHistory.map(c => this.formatChat(c)),
      });
    });
  }

  componentWillUnmount () {
    Rcon.off('message');
  }

  onMessage (payload) {
    if ( ! payload.chat) {
      return;
    }

    let chat = payload;
    if (payload.name !== 'SERVER') {
      chat = this.formatChat(payload);
    }

    this.setState(state => ({
      chat: state.chat.concat(chat),
    }));

    this.scrollBottom();
  }

  scrollBottom () {
    const chatInner = document.getElementById('chat-output');
    if (chatInner) {
      chatInner.scrollTop = chatInner.scrollHeight;
    }
  }

  sendChat () {
    Rcon.send('say ' + this.state.chatMessage);
    this.setState({
      chatMessage: '',
    });
  }

  formatChat (payload) {
    const message = payload.message.replace('[Better Chat]', '');
    const matches = message.match(/(.*):\s(.*)/);
    let name = matches[1];
    let text = matches[2];

    if (name.indexOf('<color') !== -1) {
      name = name.replace(/<color=.*>(.*)<\/color>/, '$1');
    }

    return {
      name: name,
      message: text,
      timestamp: payload.timestamp,
    }
  }

  renderChatMessage (output, index) {
    this.state.notifiers.forEach(notifier => {
      const matches = output.message.match(new RegExp(notifier.regex));
      if (matches) {
        console.log(matches);
        const parsed = new DOMParser().parseFromString(output.message.replace(notifier.regex, `<span style="color:${notifier.color}">$1</span>`), 'text/html');
        console.log(parsed);
        output.message = 'foo';
      }
    });

    return (
      <div key={ index }>
        <p className="text-muted chat-name">
          { output.name }
          <small>{ DateFormat(output.timestamp, 'HH:MM:ss') }</small>
        </p>
        <p className="chat-message">{ output.message }</p>
      </div>
    )
  }

  render () {
    return (
      <div className="container-fluid">
        <div className="panel panel-default">
          <div className="panel-body">
            <div id="chat-output">
              <div id="chat-output-inner">
                {
                  this.state.chat.map((output, index) => {
                    return this.renderChatMessage(output, index);
                  })
                }
              </div>
            </div>
            <div className="container-fluid input-with-button">
              <input
                type="text"
                className="form-control"
                placeholder="Chat message"
                value={ this.state.chatMessage }
                onChange={ e => this.setState({ chatMessage: e.target.value }) } />
              <button
                type="submit"
                className="btn btn-success"
                onClick={ () => this.sendChat() }>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Chat;
