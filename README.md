# nr1-apdex-optimizer

![GitHub release (latest SemVer including pre-releases)](https://img.shields.io/github/v/release/newrelic/nr1-apdex-optimizer?include_prereleases&sort=semver) [![Snyk](https://snyk.io/test/github/newrelic/nr1-apdex-optimizer/badge.svg)](https://snyk.io/test/github/newrelic/nr1-apdex-optimizer)

## Usage

New Relic customers often ask what they should set their Apdex Thresholds to. This observability application (nerdpack) provides actionable recommendations based on existing best practice, and provides links to the relevant page to make the suggested changes.

If you have an app that has been running for a while in a steady state and you feel you have a good baseline for acceptable performance, you can start by setting your Apdex threshold to give you a baseline Apdex score of 0.95. So you’ll want to get the 90th percentile value and set that to Apdex T.

The suggested thresholds above are based on the 90th percentile. It is recommended that the time picker is set to 7 days.
 
This follows great advice provided by Bill Kayser on the New Relic company [blog](https://blog.newrelic.com/product-news/how-to-choose-apdex-t/).

![Screenshot #1](screenshots/nr1-apdex-optimizer.png)

Once selected, each APM and Browser application for the account is listed in a table. For each application the currently configured Apdex Thresholds are presented, along with links to the application settings page where changes to the Apdex Threshold (ApdexT) can be made. Suggested APM and Browser Apdex Thresholds are provided and are updated based upon the time picker period.

In the case of deploying to a master account, a drop down allows each sub-account to be selected. If deployed to a single sub-account, the account is automatically selected.

The application relies upon a combination of native NerdGraph and NRQL-based queries. It consists of two top-level React components, the first to identify and list the user's available accounts, and the second to render the table. Based upon a third-party open source React library, react-table, the table can be sorted on every column, provides pagination and allow relevant cells to be filtered based on a search term. Throughput and errors have been added to allow users to use those values for prioritization.

## Open Source License

This project is distributed under the [Apache 2 license](LICENSE).

## What do you need to make this work?

1. [New Relic APM](https://newrelic.com/products/application-monitoring) and/or [Browser agent(s) installed](https://newrelic.com/products/browser-monitoring) and the related access to [New Relic One](https://newrelic.com/platform).
2. See step 1. :grin:

## Getting started

First, ensure that you have [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) and [NPM](https://www.npmjs.com/get-npm) installed. If you're unsure whether you have one or both of them installed, run the following command(s) (If you have them installed these commands will return a version number, if not, the commands won't be recognized):

```bash
git --version
npm -v
```

Next, install the [NR1 CLI](https://one.newrelic.com/launcher/developer-center.launcher) by going to [this link](https://one.newrelic.com/launcher/developer-center.launcher) and following the instructions (5 minutes or less) to install and setup your New Relic development environment.

Next, to clone this repository and run the code locally against your New Relic data, execute the following command:

```bash
nr1 nerdpack:clone -r https://github.com/newrelic/nr1-apdex-optimizer.git
cd nr1-apdex-optimizer
nr1 nerdpack:serve
```

Visit [https://one.newrelic.com/?nerdpacks=local](https://one.newrelic.com/?nerdpacks=local), navigate to the Nerdpack, and :sparkles:

## Deploying this Nerdpack

Open a command prompt in the nerdpack's directory and run the following commands.

```bash
# If you need to create a new uuid for the account to which you're deploying this Nerdpack, use the following
# nr1 nerdpack:uuid -g [--profile=your_profile_name]
# to see a list of APIkeys / profiles available in your development environment, run nr1 credentials:list
nr1 nerdpack:publish [--profile=your_profile_name]
nr1 nerdpack:deploy [-c [DEV|BETA|STABLE]] [--profile=your_profile_name]
nr1 nerdpack:subscribe [-c [DEV|BETA|STABLE]] [--profile=your_profile_name]
```

Visit [https://one.newrelic.com](https://one.newrelic.com), navigate to the Nerdpack, and :sparkles:

# Support

New Relic has open-sourced this project. This project is provided AS-IS WITHOUT WARRANTY OR SUPPORT, although you can report issues and contribute to the project here on GitHub.

_Please do not report issues with this software to New Relic Global Technical Support._

## Community

New Relic hosts and moderates an online forum where customers can interact with New Relic employees as well as other customers to get help and share best practices. Like all official New Relic open source projects, there's a related Community topic in the New Relic Explorers Hub. You can find this project's topic/threads here:

https://discuss.newrelic.com/t/apdex-optimizer-nerdpack/<CHANGEME>
*(Note: URL subject to change before GA)*

## Issues / Enhancement Requests

Issues and enhancement requests can be submitted in the [Issues tab of this repository](../../issues). Please search for and review the existing open issues before submitting a new issue.

# Contributing

Contributions are welcome (and if you submit a Enhancement Request, expect to be invited to contribute it yourself :grin:). Please review our [Contributors Guide](CONTRIBUTING.md).

Keep in mind that when you submit your pull request, you'll need to sign the CLA via the click-through using CLA-Assistant. If you'd like to execute our corporate CLA, or if you have any questions, please drop us an email at opensource@newrelic.com.
