import React, { Component } from 'react';

class DefaultIdentity extends Component {
  constructor(props) {
    super(props);
  }


render() {

  let identity = this.props.identity;

return (
  <div className="entity-single">
    <li id={'item-' + identity.userProfile.userURL}
      className={"mdc-list-item item-" + identity.userProfile.userURL}
      data-userurl={identity.userProfile.userURL}>
      <img className="mdc-list-item__start-detail"
        width="56" height="56"
        alt={identity.userProfile.name}
        src={identity.userProfile.picture}/>
        <span
          className="name mdc-list-item__text">{identity.userProfile.name}
          <span
            className="email mdc-list-item__secondary-text">{identity.userProfile.email}
          </span>
        </span>
      </li>

    </div>
  );
}
}

export default DefaultIdentity;
