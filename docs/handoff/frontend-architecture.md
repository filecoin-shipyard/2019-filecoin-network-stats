# Frontend Architecture

The dashboard’s frontend is a React/Redux application written in Typescript. Charting is provided by Amcharts 4. The frontend adheres closely to generally accepted React/Redux best practices:

- Reducers follow the “ducks” pattern, i.e. actions and their corresponding reducer functions are bundled into the same file.
- Routing is provided by react-router.
- Asynchronous actions are dispatched via redux-thunk.
- Components are split between store-connected “smart” components and stateless “dumb” components.
- SCSS is used to generated stylesheets.
The application is bundled using Webpack.

Due to the above, the following sections will focus on the parts of the frontend that are specific to the dashboard product.

## Ducks and API Calls

The frontend only uses two ducks: “stats,” and “overrides.” The “stats” duck, located in src/ducks/stats.ts, manages all of the dashboard data visible without changing time frames on individual charts. It also exposes a “poll()” action that kicks off a 5-second polling loop that uses the backend’s /sync endpoint to continually update the dashboard’s state. The response from the poll() action is inserted directly into the reducer - no further processing is required.

Note that while this duck includes network switching actions, the ability to switch networks in the UI was removed during the 0.3.1 dashboard update. These actions can be safely removed unless there are future plans to bring back network switching functionality.

The “overrides” duck handles user-initiated timeframe switches on individual charts. When a chart with a switchable time frame is rendered, it first checks the overrides reducer to see if the user has chosen a timeframe different from the default. If they have, it renders the override otherwise it falls back to the stats reducer. The overrides duck will make its own API calls to populate override data.
Entrypoint
The main entrypoint for the frontend is the Main component located in frontend/src/components/Main.tsx. It is here that we dispatch the action that starts the frontend’s polling loop, and switch between the application’s routes.

## Chart Components

There are three different types of chart components in the frontend. The first are “dumb chart types,” such as:

- PercentageLineChart
- StackedColumnChart
- TimelineDateChart
- HistogramChart
- GainLossTimelineChart

These render the chart type described in their name with the provided data and customization options. You will see that these use the AmCharts API to customize the chart’s rendering based on the component’s props. While not a very “React-friendly” style, the AmCharts library provides extensive documentation around how to customize each chart as well as a plethora of customization options that reduce the impact of this API inconsistency.

Next, there is the “base” chart type, which is simply named Chart. This component provides hooks into the AmCharts render lifecycle in a more React-friendly way, and is designed to be wrapped by other chart components. Finally, there is a “meta” chart component, SwitchableDateSwitchingChart, which is designed to wrap a chart with a date switches so that users can pick different time windows to render in the chart itself.

Charts automatically update themselves when their connected component’s data changes.

## Common Package

To force the interface between the frontend and backend to be identical, a “filecoin-network-stats-common” package is used to provide common typings for API responses. See the repository’s README.md file to learn how to set the common package up.
Deployment
The frontend is bundled, and deployed to an NGINX box that serves the frontend’s static assets. SSL support is provided by Let’s Encrypt. While the process is automated, we are still pointing stats.kittyhawk.wtf to a Netlify domain while we wait for DNS to be moved to Filecoin’s AWS infrastructure.