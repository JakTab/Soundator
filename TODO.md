# TODO LIST

- [x] Push functions from App to LeftColView

- [x] Change design for LeftColView to match RightColView

- [x] Block time scroll when no song is in the player

- [x] Forward/backward after playMusicItem function change

- [x] On ending playback - check if the next item is not supported; if so - skip

- [x] On ending playback - check if the played item is the last; if so - clear player up + change time tracker to 0

- [x] Song values added to currently-playing: song-name, artist-name, album-name, song-number (x out of y)

- [x] View toggle for leftColView

- [x] Notifications bar on the bottom left corner - basic concept

- [x] Navigation through folders - basic concept

- [x] RightColView - LeftColView controls collapse & toggle

- [x] Back/forward - make tracks go in order between each other

- [x] Code refactor #1 - RightColView + project upkeep

- [x] Folder navigation up the level

- [x] electron-json-config not working - why? check for more stable alternatives

- [x] On app load check the existance of a last opened folder / saved Music folder

- [x] Proper file filtering (get all music files and folders, remove all else)

- [x] space button - play/pause

- [x] Catch isPlaying for RightColView when choosing song in LeftColView

- [x] LeftColView.js - rebuild music folders/music item creations

- [x] LeftColView.js - Change album cover image generation (Uint8ArrayToJpgURL)

- [x] RightColView.js - handle onEnded when playing track saved in config

- [x] Icon size change [ style={{ fontSize: "25px" }} ]

- [x] Move all leftColView to RightColView -> bottomRow

- [x] RightColView -> bottomRow redesign

- [x] Code refactor/cleanup #2

- [x] Streamline file filtering on folder loading

- [x] Drag and drop on playlist

- [x] Draggable frameless window

- [x] Search functionality within the scope of the currently active playlist (dynamic)

- [x] Settings view added

- [x] Top menu redesign - change to right-click menu

- [x] Basic theme management + saving themes

- [x] Code refactor/cleanup #3

- [x] Creating/opening/removing favorites

===

- [ ] Saving window size upon exiting

- [ ] Item list ordering by disk number (multiple disk albums)

- [ ] Folder navigation one level deeper

- [ ] Create themes

- [ ] Styles on resize screen

- [ ] Adding settings to settings view (clean saved data + restart app; change theme)

- [ ] Breaking pages to independent components

- [ ] AlbumArt lib - action on reject and no album art found

- [ ] Refreshing favorites list