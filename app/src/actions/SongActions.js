import * as type from './types';
import axios from 'axios';

const axiosClient = axios.create({ baseURL: 'http://localhost:3001', timeout: 4000});

export const addTrack = newTrack => ({ type: type.ADD_TRACK, payload: newTrack });

export const changeSongName = newName => ({ type: type.CHANGE_SONG_NAME, payload: 'new name' });

export const changeTrackInstrument = (instrument, id) => {
  return { type: type.CHANGE_TRACK_INSTRUMENT, payload: {instrument: instrument, trackId: id }};
};

// TODO test
export const loadSong = () => {
  return dispatch => {
    return axiosClient.get('/song')
      .then(response => {
        dispatch(replaceSong(response.data));
      })
      .catch(error => { 
        dispatch({ type: type.ERROR, payload: `unable to load song; ${error.toString()}` })
      })
  }
};

export const newTrack = () => ({ type: type.NEW_TRACK });

export const replaceSong = song => ({ type: type.REPLACE_SONG, payload: song });

// TODO test
export const saveSong = (song) => {
  return dispatch => {
    return axiosClient.post('/song', song)
      .then(response => { 
        dispatch({ type: type.MESSAGE, payload: 'song saved'});
      })
      .catch(error => { 
        dispatch({ type: type.ERROR, payload: `unable to save your song, sorry: ${error.toString()}` })
    })
  };
};
