import React from 'react'
import PropTypes from 'prop-types';
import { NerdGraphQuery } from 'nr1';
import gql from 'graphql-tag';
import ApdexTable from './ApdexTable'

const SUGGESTED_APDEX_PERCENTILE = 90;  // https://blog.newrelic.com/product-news/how-to-choose-apdex-t/

// Class used to encapsulate Apdex for a service
class ApdexRow {
    constructor(aName) {
        this.name = aName;
    }
    accountId = null;
    apmAppId = null;
    apmApdexT = null;
    apmApdexTHref = null;
    apmSuggestedApdexT = null;
    apmApdexScore = null;
    apmCount = null;
    apmErrorCount = null;
    browserAppId = null;
    browserApdexT = null;
    browserApdexTHref = null;
    browserSuggestedApdexT = null;
    browserApdexScore = null;
    browserCount = null;
    browserErrorCount = null;
}

export default class ApdexTableContainer extends React.Component {
    static propTypes = {
        accountId: PropTypes.any.isRequired,
        platformState: PropTypes.object.isRequired
    }

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            isLoading: true
        }
    }

    // Actions to perform on initial load
    componentDidMount() {
        this.fetchData();
    }

    // Actions to perform if the selected account changes
    componentDidUpdate(prevProps) {
        if (this.props !== prevProps) {
            // this.state.data = [];
            this.fetchData();
        }
    }

    async fetchData() {
        this.setState({ isLoading: true });
        let rowsMap = new Map();
        const response = await NerdGraphQuery.query(this.appsQuery(this.props.accountId));
        let entities = response.data.actor.entitySearch.results.entities;
        for (let i = 0; i < entities.length; i++) {
            let appName = entities[i].name;
            if (!rowsMap.has(appName)) {
                let row = new ApdexRow(appName);
                let domain = entities[i].domain;
                row.accountId = this.props.accountId;
                if (domain === "APM") {
                    row.apmAppId = entities[i].applicationId;
                    if (entities[i].settings) row.apmApdexT = entities[i].settings.apdexTarget;
                    row.apmApdexTHref = "https://rpm.newrelic.com/accounts/" + row.accountId + "/applications/" + row.apmAppId + "/settings-application";
                } else if (domain === "BROWSER") {
                    row.browserAppId = entities[i].applicationId;
                    if (entities[i].settings) row.browserApdexT = entities[i].settings.apdexTarget;
                    row.browserApdexTHref = "https://rpm.newrelic.com/accounts/" + row.accountId + "/browser/" + row.apmAppId + "/edit";
                }
                rowsMap.set(appName, row)
            } else {
                let row = rowsMap.get(appName);
                let domain = entities[i].domain;
                if (domain === "APM") {
                    row.apmAppId = entities[i].applicationId;
                    if (entities[i].settings) row.apmApdexT = entities[i].settings.apdexTarget;
                    row.apmApdexTHref = "https://rpm.newrelic.com/accounts/" + row.accountId + "/applications/" + row.apmAppId + "/settings-application";
                } else if (domain === "BROWSER") {
                    row.browserAppId = entities[i].applicationId;
                    if (entities[i].settings) row.browserApdexT = entities[i].settings.apdexTarget;
                    row.browserApdexTHref = "https://rpm.newrelic.com/accounts/" + row.accountId + "/browser/" + row.apmAppId + "/edit";
                }
            }
        }
        await this.fetchStats(rowsMap);
        await this.fetchErrors(rowsMap);
        await this.fetchSuggestedApdexT(rowsMap, "Transaction");
        await this.fetchSuggestedApdexT(rowsMap, "PageView");

        const data = await this.getData(rowsMap);
        
        this.setState({ 
            data, 
            isLoading: false 
        });
    }

    // NerdGraph grapql (nrql) query of suggested Apdex Threshold based on percentile and other supplied parameters
    suggestedApdexTQuery(accountId, percentile, eventType) {
        const { duration } = this.props.platformState.timeRange;
        const since = `SINCE ${duration/1000/60} MINUTES AGO`;
        const where = eventType == "Transaction" ? "WHERE transactionType = 'Web'" : "";  // Only Web Transactions
        return { 
            query: gql`{
                actor {
                    account(id: ${accountId}) {
                        nrql(query: "SELECT percentile(duration, ${percentile}) FROM ${eventType} ${where} ${since} FACET appName LIMIT MAX") {
                            results
                        }
                    }
                }
            }`
        };
    }     

    // NerdGraph grapql (nrql) query of Apdex Score and volume based on percentile and other supplied parameters
    statsQuery(accountId, threshold, eventType) {
        const { duration } = this.props.platformState.timeRange;
        const since = `SINCE ${duration/1000/60} MINUTES AGO`;
        return { 
            query: gql`{
                actor {
                    account(id: ${accountId}) {
                        nrql(query: "SELECT apdex(duration, t: ${threshold}), count(*) AS 'Throughput' FROM ${eventType} ${since} FACET appName LIMIT MAX") {
                          results
                        }
                    }
                }
            }`
        };
    } 

    // NerdGraph grapql (nrql) query of errors based on supplied parameters
    errorsQuery(accountId, eventType) {
        const { duration } = this.props.platformState.timeRange;
        const since = `SINCE ${duration/1000/60} MINUTES AGO`;
        return { 
            query: gql`{
                actor {
                    account(id: ${accountId}) {
                        nrql(query: "SELECT count(*) FROM ${eventType} ${since} FACET appName LIMIT MAX") {
                          results
                        }
                    }
                }
            }`
        };
    } 

    // NerdGraph graphql query of entities in the APM and BROWSER domains
    appsQuery(accountId) {
        return { 
            query: gql`{
                actor {
                    entitySearch(query: "accountId = '${accountId}' AND domain IN ('APM', 'BROWSER')") {
                        results {
                            entities {
                                name
                                domain
                                entityType
                                ... on BrowserApplicationEntityOutline {
                                    accountId
                                    alertSeverity
                                    settings {
                                        apdexTarget
                                    }
                                    reporting
                                    applicationId
                                }
                                ... on ApmApplicationEntityOutline {
                                    accountId
                                    alertSeverity
                                    settings {
                                        apdexTarget
                                    }
                                    apmSummary {
                                        apdexScore
                                    }
                                    reporting
                                    applicationId
                                }
                            }
                        nextCursor
                        }
                    }
                }
            }`
        };
    }

    // Convert retrieved rows to ReactTable compatible data (array of Objects)
    async getData (rowsMap) {
        let data = [];
        rowsMap.forEach((value, key, map) => {
            data.push(
                {
                    'name': value.name,
                    'accountId': value.accountId,
                    'apmApdexT': value.apmApdexT,
                    'apmApdexTHref': value.apmApdexTHref,
                    'apmSuggestedApdexT': value.apmSuggestedApdexT && value.apmSuggestedApdexT.toFixed(3),
                    'apmApdexScore': value.apmApdexScore && value.apmApdexScore.toFixed(2),
                    'apmCount': value.apmCount,
                    'apmErrorCount': value.apmErrorCount ? value.apmErrorCount : value.apmApdexT ? 0 : '',
                    'browserApdexT': value.browserApdexT,
                    'browserApdexTHref': value.browserApdexTHref,
                    'browserSuggestedApdexT': value.browserSuggestedApdexT && value.browserSuggestedApdexT.toFixed(3),
                    'browserApdexScore': value.browserApdexScore && value.browserApdexScore.toFixed(2),
                    'browserCount': value.browserCount,
                    'browserErrorCount': value.browserErrorCount ? value.browserErrorCount : value.browserApdexT ? 0 : ''
                }
            );
        });
        return data;
    }
  
    async fetchStats(rowsMap) {
        let response = await NerdGraphQuery.query(this.statsQuery(this.props.accountId, 0.5, "Transaction"));
        let results = response.data.actor.account.nrql.results;
        for (let i = 0; i < results.length; i++) {
            let appName = results[i].appName;
            let row = rowsMap.get(appName);
            if (row) {
                row.apmCount = results[i].count;
                row.apmApdexScore = results[i].score;
            } 
        }
        response = await NerdGraphQuery.query(this.statsQuery(this.props.accountId, 7.0, "PageView"));
        results = response.data.actor.account.nrql.results;
        for (let i = 0; i < results.length; i++) {
            let appName = results[i].appName;
            let row = rowsMap.get(appName);
            if (row) {
                row.browserCount = results[i].count;
                row.browserApdexScore = results[i].score;
            }
        }
    }
    
    async fetchErrors(rowsMap) {
        let response = await NerdGraphQuery.query(this.errorsQuery(this.props.accountId, "TransactionError"));
        let results = response.data.actor.account.nrql.results;
        for (let i = 0; i < results.length; i++) {
            let appName = results[i].appName;
            let row = rowsMap.get(appName);
            if (row) {
                row.apmErrorCount = results[i].count;
            }
        }
        response = await NerdGraphQuery.query(this.errorsQuery(this.props.accountId, "JavaScriptError"));
        results = response.data.actor.account.nrql.results;
        for (let i = 0; i < results.length; i++) {
            let appName = results[i].appName;
            let row = rowsMap.get(appName);
            if (row) {
                row.browserErrorCount = results[i].count;
            }
        }
    }
    
    async fetchSuggestedApdexT(rowsMap, eventType) {
        let {data} = await NerdGraphQuery.query(this.suggestedApdexTQuery(this.props.accountId, SUGGESTED_APDEX_PERCENTILE, eventType));
        let results = data.actor.account.nrql.results;
        for (let i = 0; i < results.length; i++) {
            let appName = results[i].appName;
            let row = rowsMap.get(appName);
            if (row) {
                let suggestedApdexT = results[i]["percentile.duration"][SUGGESTED_APDEX_PERCENTILE];
                eventType === "Transaction" ? row.apmSuggestedApdexT = suggestedApdexT : row.browserSuggestedApdexT = suggestedApdexT;
            }
        }
    }    

    render() {
        return (
            <ApdexTable data={this.state.data} isLoading={this.state.isLoading} />
        )
    }
}