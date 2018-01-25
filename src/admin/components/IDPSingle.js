import React, { Component } from 'react';

class IDPSingle extends Component {
  constructor(props) {
    super(props);

  }

handleClick(idp) {
  console.log('you clicked ' + idp)
  // console.log('you clicked ' + login)

  // this.props.login.idp = idp
  this.props.login(idp).then((result) => {

    if (this.props.callback) {
      this.props.callback.call(result);
    }

    // window.location.reload();

  });
}


render() {
  /**
  **/

  let key = this.props.idp;

  let name = key.domain +"";
  if (name.indexOf('.') !== -1) {
    name = name.substring(0, name.indexOf('.'));
  } else {
    name = 'question';
  }

  return (
    <div className="idp-single">
      <a id={"link-" + key.domain} data-idp={key.domain} className={'mdc-list-item link-' + key.domain} href="#"
        onClick={() => this.handleClick(key.domain)}>
        <img className="mdc-list-item__start-detail" src={'./assets/' + name + '.svg'} width="30" height="30"
          onError={(e) => e.srcElement.src = './assets/question.svg'}
      /> {key.domain}
      </a>
    </div>
  );
}
}

export default IDPSingle;
