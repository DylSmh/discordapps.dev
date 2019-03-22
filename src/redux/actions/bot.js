import Locations from "../../data/Locations";
import { isNull } from "util";

export const REQUEST_BOT = 'REQUEST_BOT';
export const RECIEVE_BOT = 'RECIEVE_BOT';
export const RESET_BOT = 'RESET_BOT';

function requestBot() {
  return {
    type: REQUEST_BOT
  };
}

function resetBot() {
  return {
    type: RESET_BOT
  };
}


function recieveBot(json, status) {
  return {
    type: RECIEVE_BOT,
    data: json.data,
    status
  };
}

function fetchBot(id) {
  return (dispatch) => {
    dispatch(requestBot());
    return fetch(`${Locations.server}/reactjs/v1/bots/id/${id}`, {
      credentials: 'include'
    })
      .then(res => {
        res.json()
          .then((json) => {
            dispatch(recieveBot(json, res.status))
          })
      })
  };
}

function shouldFetchBot(state, id) {
  if (state.bot.fetched && isNull(state.bot.data)) return true;
  if (state.bot.data && state.bot.data.id !== id) return true;
  if (state.bot.fetching) return false;
  if (state.bot.fetched) return false;
  return true;
}

export function fetchABot({match}) {
  return (dispatch, getState) => {
    if (shouldFetchBot(getState(), match.params.id)) {
      return dispatch(fetchBot(match.params.id))
    }
  };
}

export function resetTheBot() {
  return (dispatch) => {
    dispatch(resetBot());
  }
}
