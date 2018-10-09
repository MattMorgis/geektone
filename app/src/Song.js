// TODO move to song reducer as "action?""
export const toJSON = song => ({ 
  ...song, 
  tracks: song.tracks.map(track => ({...track, notes: track.notes.toJSON()}))
});
