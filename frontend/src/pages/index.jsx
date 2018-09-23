import React, { Component } from 'react';
import Eos from 'eosjs'; // https://github.com/EOSIO/eosjs
import './styles.css';

class Index extends Component {

  constructor(props) {
    super(props)
    this.state = {
      cookieTable: [],
    };
    this.handleFormEvent = this.handleFormEvent.bind(this);
  }

  // generic function to handle form events (e.g. "submit" / "reset")
  // push transactions to the blockchain by using eosjs
  async handleFormEvent(event) {
    // stop default behaviour
    event.preventDefault();

    // collect form data
    let account = event.target.account.value;
    let privateKey = event.target.privateKey.value;
    let note = event.target.note.value;

    // prepare variables for the switch below to send transactions
    let actionName = "";
    let actionData = {};

    // define actionName and action according to event type
    console.log(event.target.name);
    switch (event.id === "test") {
      case "submit":
        actionName = "update";
        actionData = {
          _user: account,
          _note: note,
        };
        break;
      default:
        return;
    }

    // eosjs function call: connect to the blockchain
    const eos = Eos({keyProvider: privateKey, httpEndpoint: 'http://www.cookie-store.my.to:8888'});
    const result = await eos.transaction({
      actions: [{
        account: "cookie.store",
        name: actionName,
        authorization: [{
          actor: account,
          permission: 'active',
        }],
        data: actionData,
      }],
    });

    console.log(result);
    this.getUsedTable();
  }

  // gets table data from the blockchain
  // and saves it into the component state: "usedTable"
  getUsedTable() {
    const eos = Eos({httpEndpoint: 'http://www.cookie-store.my.to:8888'});
    eos.getTableRows({
      "json": true,
      "code": "cookie.store",   // contract who owns the table
      "scope": "cookie.store",  // scope of the table
      "table": "used",    // name of the table as specified by the contract abi
      "limit": 100,
    }).then(result => this.setState({ usedTable: result.rows }));
  }

  // gets table data from the blockchain
  // and saves it into the component state: "bidsTable"
  async getBidsTable() {
    let objectTable = [];
    const eos = Eos({httpEndpoint: 'http://www.cookie-store.my.to:8888'});
    const result = await eos.getTableRows({
      "json": true,
      "code": "cookie.store",   // contract who owns the table
      "scope": "cookie.store",  // scope of the table
      "table": "bids",    // name of the table as specified by the contract abi
      "limit": 100,
    });
     for (let i = 0; i < result.rows.length; i++) {
       const element = result.rows[i];
       const cookies = await eos.getTableRows(true, "cookie.store", "cookie.store", "used", "uuid", element.uuid, -1, null, "i64", "2");
       objectTable.push({bid:element,cookies:cookies.rows});
     }
     console.log(objectTable);
     this.setState({cookieTable:objectTable});
  }

  componentDidMount() {
    this.getBidsTable();
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <h1 align="center"><img src="/cookie128.png"/>Cookie Store</h1>
          <div>
            <table className="minimalistBlack">
              <tr>
               <th align="center">UUID</th>
                <th>Desired Link</th>
                <th align="right">Price Per Verified Cookie</th>
                <th align="right">Remaining Bounty</th>
              </tr>
              { this.state.cookieTable.map(function(item) {
                return (
                  <tbody>
                    <tr>
                      <td align="center">{item.bid.uuid}</td>
                      <td>{item.bid.desired_link}</td>
                      <td align="right">{item.bid.price_per}</td>
                      <td align="right">{item.bid.bounty}</td>
                    </tr>
                    {item.cookies.map(function(cookie) {
                      return (
                        <tr>
                          <td></td>
                          <td colspan="3">{cookie.cookie}</td>
                        </tr>
                      )}
                    )}
                  </tbody>
                  )
                })}
            </table>
          </div>
      </div>
    );
  }
}

export default(Index);
