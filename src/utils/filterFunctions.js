let unacceptableFormats = ["exe", "ini", "txt", "jpg", "jpeg", "png", "bmp", "cue", "log", "nfo", "m3u", "sfv"]
let acceptableMusicFormats = ["mp3", "flac", "wav", "mp4", "m4a", "aac", "ogg", "webm", "ogg"]

export function isFileAcceptable(fileExtension) {
    var isTrue = true;
    unacceptableFormats.forEach((format) => {
        if (fileExtension == format) isTrue = false;
    });
    return isTrue;
}

export function isStringMusicFile(fileExtension) {
    var isTrue = false;
    acceptableMusicFormats.forEach((format) => {
        if (fileExtension == format) isTrue = true;
    });
    return isTrue;
}