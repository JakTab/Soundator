<h1 align="center">
    <br>
    <img width = "64px" src = "https://raw.githubusercontent.com/JakTab/Soundator/main/assets/icon.png"><br>
    Soundator
</h1>
 
# About
Soundator is a minimalist-esque music player created in Electron and React.js as an alternative to other bloated music players. It uses Javascript as a code base, Sass for graphics, preserves your last opened songs and playlists, as well as uses music metadata and an album art fetcher for a proper display of your favorite songs and tracks.

The goal is to make an app which would not only run and maintain its quality over time but also it is an exercise to learn how to write a better code. This, hopefully, will be a start of a series of small Electron-based applications.

The project is still in development with new features and quality of life improvements being slowly added in.

First preview version is now ready, download it from here: [Releases](https://github.com/JakTab/Soundator/releases)

### Player
Download Soundator from the [Releases](https://github.com/JakTab/Soundator/releases) and enjoy your new music player! It is currently <b>only available on Windows</b> platform in two versions - as a whole package and a portable executable. Start your application by opening the executable. To choose a folder simply hold and drag a green bar and choose the folder icon. From there you can choose the music folder you want and then just navigate to your favorite tunes as needed! If you want to close the app simply right click and press 

### Building from the repository
Clone the repository, make it your working directory, and then on your terminal run ```npm i```. 
Once all the dependencies have finished downloading, run ```npm run start``` to start your app or ```npm run packageBuild``` which will build both portable and non-portable version of the application.

# Features list
<ul>
    <li>Supports: MP3, MP4, OGG, M4A, FLAC, WAV, WMA files</li>
    <li>Reads ID3 tags and displays the songs data and album art (if it exists) or downloads one from the Spotify API</li>
    <li>Quickly switch tracks from the playlist or by navigation buttons</li>
    <li>Use build-in folder viewer to find and navigate through the folder tree if needed</li>
    <li>Search functionality within the scope of the currently active folder</li>
    <li>Ability to add/remove folders to the Favorites so you can access them more easily</li>
    <li>You don't need to save anything - the last viewed folder and the last played song will be back there when you need it again</li>
    <li>Settings with option to change your application theme - allowing you to choose one which fits you best</li>
</ul>

# Screenshots
Coming soon!

# Features to come soon!
<ul>
    <li>Linux and MacOS versions</li>
    <li>...and maybe more?</li>
</ul>
