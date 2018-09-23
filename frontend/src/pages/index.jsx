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
    let desired_link = event.target.desired_link.value;
    let bounty = event.target.bounty.value;
    let price_per = event.target.price_per.value;
    let private_key = "5J8GwbXpAfgj89gSUH4j63uknX9vdsQBVXctjW2tDuuxgGfNvi2";

    // prepare variables for the switch below to send transactions
    let actionName = "";
    let actionData = {};

    // define actionName and action according to event type
    switch (event.type) {
      case "submit":
        actionName = "bidscreate";
        actionData = {
          bidder: "acmesuper",
          desired_link: desired_link,
          bounty: bounty,
          price_per: price_per
        };
        break;
      default:
        return;
    }

    // eosjs function call: connect to the blockchain
    const eos = Eos({keyProvider: private_key, httpEndpoint: 'http://www.cookie-store.my.to:8888'});
    const result = await eos.transaction({
      actions: [{
        account: "cookie.store",
        name: actionName,
        authorization: [{
          actor: "acmesuper",
          permission: "active",
        }],
        data: actionData,
      }],
    });

    console.log(result);

    let payment_memo = result.transaction.transaction.actions[0].account + " " + result.transaction.transaction.actions[0].name;
    console.log(payment_memo);
    console.log(["acmesuper", "cookie.store", bounty, payment_memo]);

    const payment_result = await eos.transaction({
     actions: [{
       account: "eosio.token",
       name: "transfer",
        authorization: [{
          actor: "acmesuper",
          permission: "active",
        }],
        data: ["acmesuper", "cookie.store", bounty, payment_memo],
      }],
    });

    console.log(payment_result);

    this.getCookiesTable();
  }

  // gets table data from the blockchain
  async getCookiesTable() {
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
     this.setState({cookieTable:objectTable});
  }

  componentDidMount() {
    this.getCookiesTable();
  }

  render() {
    return (
      <div>
        <h1 align="center"><img src="/cookie128.png" alt="cookie store"/>Cookie Store</h1>
        <div id="bid" align="center">
          <h3>Bid for verified cookies</h3>
          <form onSubmit={this.handleFormEvent}>
              <div id="bid_el">Desired link <input type="text" name="desired_link"></input><br/></div>
              <div id="bid_el">Price per verified cookie <input type="text" name="price_per"></input><br/></div>
              <div id="bid_el">Total bounty <input type="text" name="bounty"></input><br/></div>
              <div id="bid_el"><input type="submit"></input></div>
          </form>
        </div>
          <div>
            <table className="minimalistBlack">
              <thead>
              <tr>
               <th align="center">UUID</th>
                <th>Desired Link</th>
                <th align="right">Price Per Verified Cookie</th>
                <th align="right">Remaining Bounty</th>
              </tr>
              </thead>
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
                          <td colSpan="3">{cookie.cookie}</td>
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
