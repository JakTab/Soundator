let acceptableMusicFormats = ["mp3", "mp4", "m4a", "ogg", "flac", "wav", "wma"]
let notPermitted = ["System Volume Information", "$RECYCLE.BIN"]

export function isStringMusicFile(fileExtension) {
    var isTrue = false;
    acceptableMusicFormats.forEach((format) => {
        if (fileExtension == format) 
            isTrue = true;
    });
    return isTrue;
}

export function folderNotPermitted(path) {
    var isNotPermitted = false;
    notPermitted.forEach((notAllowedPath) => {
        if (path.includes(notAllowedPath))
            isNotPermitted = true;
    })
    return isNotPermitted;
}