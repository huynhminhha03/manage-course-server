const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

const getVideoDuration = (videoPath) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoPath, (err, metadata) => {
            if (err) {
                return reject(err);
            }
            const duration = metadata.format.duration; // Duration in seconds
            resolve(duration);
        });
    });
};

module.exports = { getVideoDuration }
