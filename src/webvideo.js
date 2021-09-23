'use strict';

import Thing from './thing';

var DEFAULT_WIDTH = 150;
var DEFAULT_HEIGHT = (DEFAULT_WIDTH * 3) / 4;

const WEBCAM_INDICATOR = 'WEBCAM';

/**
 * @constructor
 * @augments Thing
 * @param {string} filename - Filepath to the video
 */
export default class WebVideo extends Thing {
    constructor(filename) {
        if (typeof filename !== 'string') {
            throw new TypeError(
                'You must pass a string to <span class="code">' +
                    "new WebVideo(filename)</span> that has the video's location.",
            );
        }
        Thing.call(this);
        var self = this;

        var vid = document.createElement('video');
        this.width = DEFAULT_WIDTH;
        this.height = DEFAULT_HEIGHT;
        this.type = 'WebVideo';

        this.isWebCam = filename === WEBCAM_INDICATOR;

        this.browserSupportsVideo = !!vid.canPlayType;
        if (this.browserSupportsVideo) {
            this.video = vid;
            if (!this.isWebCam) {
                this.video.src = filename;
            } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices
                    .getUserMedia({ video: true })
                    .then(function (stream) {
                        self.video.srcObject = stream;
                        self.video.play();
                    })
                    .catch(function (error) {
                        throw new Error('Web camera access was denied: ' + error);
                    });
            } else {
                throw new TypeError('Your browser does not support web camera access');
            }
            this.filename = filename;
            this.video.autoplay = true;
            this.video.loop = false;

            // Treat cross origin URLs as same origin. Allows for videos from different
            // origins to be loaded and played, as long as that origin allows us to load
            // the given video resource.
            this.video.crossOrigin = 'anonymous';
        }
    }
}

WebVideo.WEBCAM = WEBCAM_INDICATOR;

WebVideo.prototype = new Thing();
WebVideo.prototype.constructor = WebVideo;

/**
 * Draws the WebVideo in the canvas.
 *
 * @param {CodeHSGraphics} __graphics__ - Instance of the __graphics__ module.
 */
WebVideo.prototype.draw = function (__graphics__) {
    if (this.browserSupportsVideo) {
        var context = __graphics__.getContext('2d');

        // Scale and translate
        // X scale, X scew, Y scew, Y scale, X position, Y position
        context.setTransform(1, 0, 0, 1, this.x + this.width / 2, this.y + this.height / 2);
        context.rotate(this.rotation);

        context.drawImage(this.video, -this.width / 2, -this.height / 2, this.width, this.height);

        // Reset transformation matrix
        // X scale, X scew, Y scew, Y scale, X position, Y position
        context.setTransform(1, 0, 0, 1, 0, 0);
    }
};

/**
 * Checks if the passed point is contained in the WebVideo.
 *
 * @param {number} x - The x coordinate of the point being tested.
 * @param {number} y - The y coordinate of the point being tested.
 * @returns {boolean} Whether the passed point is contained in the WebVideo.
 */
WebVideo.prototype.containsPoint = function (x, y) {
    if (this.browserSupportsVideo) {
        return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
    }
    return false;
};

/**
 * Gets the width of the WebVideo.
 *
 * @returns {number} Width of the WebVideo.
 */
WebVideo.prototype.getWidth = function () {
    return this.width;
};

/**
 * Gets the height of the WebVideo.
 *
 * @returns {number} Height of the WebVideo.
 */
WebVideo.prototype.getHeight = function () {
    return this.height;
};

/**
 * Sets the size of the WebVideo.
 *
 * @param {number} width - The desired width of the resulting WebVideo.
 * @param {number} height - The desired height of the resulting WebVideo.
 */
WebVideo.prototype.setSize = function (width, height) {
    this.width = width;
    this.height = height;
};

/**
 * Sets whether the WebVideo should start playing automatically once loaded.
 *
 * @param {boolean} autoplay - True/false whether the video should start playing automatically.
 */
WebVideo.prototype.setAutoplay = function (autoplay) {
    if (this.browserSupportsVideo) {
        this.video.autoplay = autoplay;
    }
};

/**
 * Sets whether the WebVideo should loop and play again once finished.
 *
 * @param {boolean} loop - True/false whether the video should loop.
 */
WebVideo.prototype.setLoop = function (loop) {
    if (this.browserSupportsVideo) {
        this.video.loop = loop;
    }
};

/**
 * Sets whether the WebVideo is muted or not.
 *
 * @param {boolean} muted - True/false whether the video should be muted.
 */
WebVideo.prototype.setMuted = function (muted) {
    if (this.browserSupportsVideo) {
        this.video.muted = muted;
    }
};

/**
 * Starts playing the WebVideo.
 */
WebVideo.prototype.play = function () {
    if (this.browserSupportsVideo) {
        this.video.play();
    }
};

/**
 * Pauses the WebVideo.
 */
WebVideo.prototype.pause = function () {
    if (this.browserSupportsVideo) {
        this.video.pause();
    }
};

/**
 * Stops the WebVideo.
 */
WebVideo.prototype.stop = function () {
    if (this.browserSupportsVideo) {
        this.video.pause();
        this.video.currentTime = 0;

        if (this.isWebCam && this.video.srcObject) {
            this.video.srcObject.getTracks().forEach(function (track) {
                track.stop();
            });
        }
    }
};

/**
 * Returns whether the WebVideo is currently playing.
 *
 * @returns {boolean} True if the video is playing, false if it is not.
 */
WebVideo.prototype.isPlaying = function () {
    if (this.browserSupportsVideo) {
        return !(this.video.paused || this.video.ended);
    }
    return false;
};

/**
 * Returns whether the WebVideo is currently muted.
 *
 * @returns {boolean} True if the video is muted, false if it is not.
 */
WebVideo.prototype.isMuted = function () {
    if (this.browserSupportsVideo) {
        return this.video.muted;
    }
    return false;
};

/**
 * Defines a function to call once the video has loaded enough and is ready to play.
 * @param  {Function} fn A function to call when the video is ready to play.
 */
WebVideo.prototype.onReadyToPlay = function (fn) {
    if (this.browserSupportsVideo) {
        this.video.oncanplay = fn;
    }
};

// module.exports = WebVideo;
