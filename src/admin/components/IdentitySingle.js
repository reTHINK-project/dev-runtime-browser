import React, { Component } from 'react';

class IdentitySingle extends Component {
  constructor(props) {
    super(props);
  }

  handleClick(userURL) {

    if (this.props.callback) {
      this.props.callback(userURL);
    }
  }


render() {

  let key = this.props.identity;
  let current = this.props.current;




const highlight = (key.userURL === current) ? ' mdc-temporary-drawer--selected' : '';
const classes = `mdc-list-item ${highlight}`;


return (
  <div className="entity-single">
    <a id="active-identities"
      href = '#'
      id ={'link-' + key}
      data-userurl={key}
      className={classes}
      onClick={() => this.handleClick(key)}
      >
        <img className="mdc-list-item__start-detail"
          width="40" height="40"
          alt={this.props.identity.userProfile.name}
          src={this.props.identity.userProfile.picture}
          onError={(e) => e.srcElement.src = './assets/question.svg'}
        />
          <span className="name mdc-list-item__text">{this.props.identity.userProfile.name}
            <span className="email mdc-list-item__secondary-text">{this.props.identity.userProfile.email}</span></span>
          </a>
        </div>
      );
    }
  }

  export default IdentitySingle;
