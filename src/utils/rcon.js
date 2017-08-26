let socket = null;
let callbacks = {};
let index = 1000;

export const on = (event, callback) => {
  if ( ! isConnected()) {
    return;
  }

  socket[`on${event}`] = (e) => onMessage(e, callback);
}

export const off = event => {
  if ( ! isConnected()) {
    return;
  }
  socket[`on${event}`] = null;
}

export const connect = (url, password, callback) => {
  if (isConnected()) {
    return;
  }

  if ( ! url || ! password) {
    return callback({
      error: 'Please fill in all fields',
      type: 'error',
    });
  }

  try {
    socket = new WebSocket(`ws://${url}/${password}`);
  } catch (e) {
    callback({ error: e, type: 'error' });
    return;
  }

  socket.addEventListener('open', callback);
  socket.addEventListener('error', callback);
  socket.addEventListener('message', e => onMessage(e, callback));
}

const onMessage = (e, func) => {
  if ( ! isConnected()) {
    return;
  }
  const data = JSON.parse(e.data);

  if (data.Message.length === 0) {
    return;
  }

  const parsedMessage = parseMessagePayload(data);
  // For instances where 'send' has been passed a callback
  // Rcon.send('playerlist', players => {})
  const callback = callbacks[data.Identifier];
  if (callback && callback !== null) {
    callback(parsedMessage);
    delete callbacks[data.Identifier];
  } else {
    func(parsedMessage);
  }
}

export const parseMessagePayload = data => {
  let parsedMessage = {
    chat: false,
    name: data.Username || '',
    message: data.Message,
    timestamp: data.Time ? data.Time : new Date().getTime(),
    prefix: null,
    raw: data
  }

  if (data.Identifier === -1) {
    parsedMessage.name = 'SERVER';
    parsedMessage.message = JSON.parse(data.Message).Message;
    parsedMessage.chat = true;
  } else if (data.Message.indexOf('[Better Chat]') === 0) {
    parsedMessage.chat = true;
  } else {
    // some messages are doubly nested
    try {
      parsedMessage.message = JSON.parse(data.Message);
      const dataType = toString.call(parsedMessage.message);
      if (dataType === '[object Array]') {
        let messages = [];
        parsedMessage.message.forEach(message => {
          messages.push(parseMessagePayload(message));
        })
        parsedMessage.message = messages;
      }
    } catch (e) {}
  }

  return parsedMessage;
}

export const isConnected = () => {
  return socket !== null;
}

export const send = (command, callback) => {
  if ( ! isConnected()) {
    return;
  }

  callbacks[index] = callback;
  socket.send(JSON.stringify({
    Message: command,
    Name: 'Server',
    Identifier: index,
  }))

  ++index;
}

export const getConsoleHistory = (callback) => {
  send('console.tail 128', data => {
    callback(data.message);
  });
}
