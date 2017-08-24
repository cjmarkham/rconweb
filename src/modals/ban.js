import React from 'react';
import Modal from '../modal';

class BanModal extends React.Component {
  state = {
    reason: '',
  }

  banPlayer (e) {
    e.preventDefault();
    this.props.onBan(this.props.match.params.id, this.state.reason);
    this.props.history.goBack();
  }

  render () {
    return (
      <Modal onClose={ () => this.props.history.goBack() } title="Ban player">
        <form onSubmit={ e => { this.banPlayer(e) } }>
          <div className="form-group">
            <label>Reason for ban</label>
            <textarea
              autoFocus="true"
              onChange={ e => this.setState({ reason: e.target.value }) }
              className="form-control" />
          </div>
          <div className="form-group text-center">
            <button
              type="submit"
              className="btn btn-success">
              Ban Player
            </button>
          </div>
        </form>
      </Modal>
    );
  }
}

export default BanModal;
