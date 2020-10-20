let acceptableFormats = ["wav", "mp4", "aac", "ogg", "webm", "ogg", "flac", "mp3"]

export function isFileAcceptable(fileExtension) {
    var isTrue = false;
    acceptableFormats.forEach((format) => {
        if (fileExtension == format) isTrue = true;
    });
    return isTrue;
}