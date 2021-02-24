import React from 'react';
import PropTypes from 'prop-types';
import { AccountsQuery, Dropdown, DropdownItem, Spinner } from 'nr1';

export default class AccountListSelect extends React.Component {
  static propTypes = {
    onAccountChange: PropTypes.func.isRequired
  };

  constructor() {
    super();
    this.state = {
      accountName: 'Select account...'
    };
    this.onAccountChange = this.onAccountChange.bind(this);
  }

  // Actions to perform on initial load
  componentDidMount() {
    this.queryAccounts();
  }

  onAccountChange(item) {
    this.setState({ accountName: item.name });
    this.props.onAccountChange(item.id);
  }

  async queryAccounts() {
    const { data } = await AccountsQuery.query();
    // Automatically load the account if there is only one
    if (data.length === 1) this.onAccountChange(data[0]);
  }

  render() {
    return (
      <AccountsQuery>
        {({ loading, error, data }) => {
          if (loading) {
            return <Spinner />;
          }

          if (error) {
            return 'Error!';
          }

          const dropDownitems = data.map(item => {
            return (
              <DropdownItem
                key={item.id}
                onClick={() => this.onAccountChange(item)}
              >
                {item.name}
              </DropdownItem>
            );
          });

          return (
            <Dropdown title={this.state.accountName}>{dropDownitems}</Dropdown>
          );
        }}
      </AccountsQuery>
    );
  }
}
