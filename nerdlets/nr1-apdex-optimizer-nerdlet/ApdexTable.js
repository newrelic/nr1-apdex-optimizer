import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactTable, { ReactTableDefaults } from "react-table";
import "react-table/react-table.css";
import "./styles.scss";
import { Icon } from 'nr1';

const DEFAULT_APM_APDEX_T = 0.5;
const DEFAULT_BROWSER_APDEX_T = 7;

// Existing UI Colors
const CRITICAL_COLOR = "rgb(191, 0, 22)";
const WARNING_COLOR = "rgb(191, 150, 0)";
const NORMAL_COLOR = "rgb(17, 166, 0)";
const LINK_COLOR = "rgb(0, 121, 191)";

const columnDefaults = { ...ReactTableDefaults.column, headerClassName: 'wordwrap', headerStyle: {textAlign: 'left'} };
const columns = [
    {
        Header: 'Application Name',
        accessor: 'name',
    },
    {
        Header: 'APM Transactions',
        accessor: 'apmCount',
    },
    {
        Header: 'APM Transaction Errors',
        accessor: 'apmErrorCount',
    },
    {
        Header: 'Configured APM ApdexT',
        accessor: 'apmApdexT',
        Cell: cellInfo => (
            cellInfo.original.apmApdexT && <a target="_blank" href={cellInfo.original.apmApdexTHref} title="Click to launch APM app settings page in a new tab" style={{color: LINK_COLOR}} >{cellInfo.original.apmApdexT} <Icon type={Icon.TYPE.INTERFACE__OPERATIONS__EXTERNAL_LINK}/></a>
        ),
    },
    {
        Header: 'Current APM Apdex Score',
        accessor: 'apmApdexScore',
    },
    {
        Header: 'Suggested APM ApdexT',
        accessor: 'apmSuggestedApdexT',
        getProps: (state, rowInfo, column) => {
            return {
                style: {
                    color: rowInfo && rowInfo.row.apmSuggestedApdexT <= DEFAULT_APM_APDEX_T ? NORMAL_COLOR : CRITICAL_COLOR
                },
            };
        },
    },
    {
        Header: 'Browser Page Views',
        accessor: 'browserCount',
    },
    {
        Header: 'JavaScript Errors',
        accessor: 'browserErrorCount',
    },
    {
        Header: 'Configured Browser ApdexT',
        accessor: 'browserApdexT',
        Cell: cellInfo => (
            cellInfo.original.browserApdexT && <a target="_blank" href={cellInfo.original.browserApdexTHref} title="Click to launch Browser app settings page in a new tab" style={{color: LINK_COLOR}} >{cellInfo.original.browserApdexT} <Icon type={Icon.TYPE.INTERFACE__OPERATIONS__EXTERNAL_LINK}/></a>
        ),
    },
    {
        Header: 'Current Browser Apdex Score',
        accessor: 'browserApdexScore',
    },
    {
        Header: 'Suggested Browser ApdexT',
        accessor: 'browserSuggestedApdexT',
        getProps: (state, rowInfo, column) => {
            return {
                style: {
                    color: rowInfo && rowInfo.row.browserSuggestedApdexT <= DEFAULT_BROWSER_APDEX_T ? NORMAL_COLOR : CRITICAL_COLOR
                },
            };
        },
    }
]

export default class ApdexTable extends React.Component {
    static propTypes = {
        width: PropTypes.number,
        height: PropTypes.number,
        data: PropTypes.any.isRequired,
        isLoading: PropTypes.any.isRequired
    };
    
    constructor (props) {
        super(props)
        console.debug("Init props", this.props); //eslint-disable-line
		this.state = {
			search: ''
		}
	}
  
    render() {
        let data = this.props.data;
        if (this.state.search) {
            data = data.filter(row => {
                return (
                    row.name.includes(this.state.search) ||
                    String(row.age).includes(this.state.search) ||
                    String(row.apmApdexT).includes(this.state.search) ||
                    String(row.browserApdexT).includes(this.state.search) ||
                    String(row.apmApdexScore).includes(this.state.search) ||
                    String(row.browserApdexScore).includes(this.state.search)
                )
            })
        }

        return (
            <div>
                Search: <input
                            value={this.state.search}
                            onChange={e => this.setState({search: e.target.value})}
                            style={{border: '1px solid gray', width: '20%'}}
                        />
                <p>&nbsp;</p>
                <ReactTable
                    data={data}
                    column={columnDefaults}
                    columns={columns}
                    className='-striped -highlight'
                    minRows={1}
                    defaultPageSize = {10}
                    pageSizeOptions = {[10, 25, 50, 100]}
                    loading = {this.props.isLoading}
                />
            </div>
        )
    }
}