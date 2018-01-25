import React, { Component } from 'react';
import IdentitySingle from './IdentitySingle';

class IdentityList extends Component {

  constructor(props) {
    super(props);

  }

  render() {
    return (
      <div className="identities-list-react">
        <div className="identities">
          {
            Object
            .keys(this.props.identities)
            .map(key => <IdentitySingle identity={this.props.identities[key]}
              key={key.domain}
              callback={this.props.callback}
              current={this.props.current}
            />)
          }
        </div>
      </div>
    );
  }
}

export default IdentityList;
