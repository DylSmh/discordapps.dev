import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { Helmet } from "react-helmet";
import { Provider as ReduxProvider } from 'react-redux';
import { matchPath, StaticRouter } from 'react-router';
import htmlData from '../../build/index.html';
import App from '../../src/App';
import routes from '../../src/data/routes';
import configureStore from '../../src/redux/store';
import copyright from '../data/copyright.html';

export default (req, res, next) => {
  const context = {
    status: 200,
  };

  const store = configureStore();

  // https://medium.freecodecamp.org/demystifying-reacts-server-side-render-de335d408fe4
  // Fetch everything needed to render the page from redux.
  const promises = [];
  
  for (let i = 0; i < routes.length; i += 1) {
    const match = matchPath(req.baseUrl, routes[i]);
    const route = routes[i];
    if (match && route.component.serverFetch) {
      promises.push(store.dispatch(route.component.serverFetch({match})))
    }
  }
  
  // After redux finishes, then send the HTML
  Promise.all(promises)
    .then(() => {
      // render the app as a string-
      const html = ReactDOMServer.renderToString(
        <ReduxProvider store={store}>
          <StaticRouter location={req.baseUrl} context={context}>
            <App />
          </StaticRouter>
        </ReduxProvider>
      );
      const helmet = Helmet.renderStatic();

      // Set the status code to the status of the components.
      res.status(context.status);

      res.send(
        htmlData
          .replace(
            '<title>Discord Apps Marketplace</title>',
            helmet.title.toString() +
            helmet.meta.toString() +
            helmet.link.toString()
          )
          .replace(
            '<div id="root"></div>',
            `<div id="root">${html}</div><script>window.REDUX_STATE = ${JSON.stringify(store.getState())}</script>`
          )
          .replace(
            '<!doctype html>',
            `<!doctype html>${copyright}`
          )
      );
    })
    .catch(err => next(err));
}
