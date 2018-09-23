import React, { Component } from 'react';
import Eos from 'eosjs'; // https://github.com/EOSIO/eosjs
import './styles.css';

// material-ui dependencies
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';

// set up styling classes using material-ui "withStyles"
const styles = theme => ({
  card: {
    margin: 20,
  },
  paper: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
  },
  formButton: {
    marginTop: theme.spacing.unit,
    width: "100%",
  },
  pre: {
    background: "#ccc",
    padding: 10,
    marginBottom: 0.
  },
});

// Index component
class Index extends Component {

  constructor(props) {
    super(props)
    this.state = {
      cookieTable: [],
      bidsTable: [],
      usedTable: [] // to store the table rows from smart contract
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
    switch (event.id == "test") {
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
    // this.setState({ bidsTable: result.rows }));
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
    const { usedTable } = this.state;
    const { classes } = this.props;

    // generate each note as a card
    const generateCard = (key, cookie) => (
      <Card className={classes.card} key={key}>
        <CardContent>
          <Typography variant="headline" component="h2">
            {cookie}
          </Typography>
        </CardContent>
      </Card>
    );
    let noteCards = usedTable.map((row, i) =>
      generateCard(i, row.cookie));

    let cookieTable = [];

    return (
      <div>
        <AppBar position="static" color="default">
          <Toolbar>
            <Typography variant="title" color="inherit">
              Cookie Store
            </Typography>
          </Toolbar>
        </AppBar>
        <table>
        { this.state.cookieTable.map(function(item) {
          return (
          <tbody>
            <tr>
              <td>{item.bid.uuid}</td>
              <td>{item.bid.desired_link}</td>
              <td>{item.bid.bounty}</td>
              <td>{item.bid.price_per}</td>
            </tr>
            <tr>
            {item.cookies.map(function(cookie) {
              return (
                <tr>
                  <td colspan="3">{cookie.cookie}</td>
                </tr>
              )}
            )}
            </tr>
          </tbody>
          )
        })}
        </table>
        {noteCards}
        <Paper className={classes.paper}>
          <form onSubmit={this.handleFormEvent}>
            <TextField
              name="account"
              autoComplete="off"
              label="Account"
              margin="normal"
              fullWidth
            />
            <TextField
              name="privateKey"
              autoComplete="off"
              label="Private key"
              margin="normal"
              fullWidth
            />
            <TextField
              name="note"
              autoComplete="off"
              label="Note (Optional)"
              margin="normal"
              multiline
              rows="10"
              fullWidth
            />
            <Button
              id="test"
              name="test"
              variant="contained"
              color="primary"
              className={classes.formButton}
              type="submit">
              Add / Update note
            </Button>
          </form>
        </Paper>
      </div>
    );
  }
}

export default withStyles(styles)(Index);
/**        <pre className={classes.pre}>
          Below is a list of pre-created accounts information for add/update note:
          <br/><br/>
          accounts = { JSON.stringify(accounts, null, 2) }
        </pre>
            <input
              id="test2"
              name="name"
              type="submit"
              value="click me"
              onClick={ this.clicktest }
            />**/
