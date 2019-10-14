import React from 'react'
import { AccountsQuery, Dropdown, DropdownItem, Spinner } from 'nr1';

export default class AccountListSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            accountName: 'Select account...'
        }
        this.onAccountChange = this.onAccountChange.bind(this);
    }

    onAccountChange(item) {
        this.setState({ accountName: item.name });
        this.props.onAccountChange(item.id);
    }

    // Actions to perform on initial load
    componentDidMount() {
        this.queryAccounts();
    }

    async queryAccounts() {
        let {data} = await AccountsQuery.query();
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

                    const dropDownitems = data.map((item) => {
                        return (
                            <DropdownItem key={item.id} onClick={() => this.onAccountChange(item)}>                            
                                {item.name}
                            </DropdownItem>
                        );
                    });

                    return (
                            <Dropdown title={this.state.accountName}>
                                {dropDownitems}
                            </Dropdown>
                    );
                }}
            </AccountsQuery>        
        );
    }
}