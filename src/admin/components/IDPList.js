import React, { Component } from 'react';
import IDPSingle from './IDPSingle';

class IDPList extends Component {

  constructor(props) {
    super(props);

    console.log(this.props.idps);
  }

  render() {
    return (
      <div className="ips-list-react">
        <div className="idps">
          {
            Object
            .keys(this.props.idps)
            .map(key => <IDPSingle idp={this.props.idps[key]}
              key={key.domain}
              login={this.props.login}
              callback={this.props.callback}
            />)
          }
        </div>


      </div>
    );
  }
}

export default IDPList;
