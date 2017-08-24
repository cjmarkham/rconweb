import React from 'react';

const Modal = (props) => {
  return (
    <div className="modal">
      <div className="modal-inner">
        <h2 className="modal-title">{ props.title }</h2>
        <div className="modal-close" onClick={props.onClose}>Close</div>
        { props.children }
      </div>
    </div>
  )
}

export default Modal;
