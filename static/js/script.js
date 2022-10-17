document.querySelector("body").onselectstart = function() { return false; };
document.querySelector("#home").onclick = function() { window.location.href = '..' }

var MuBlob = null;
var Mudata = {};

function setdata(data) {
    MuBlob = $.parseJSON(data);
}

function pauseAudio() {
    var audio = document.getElementById("audio1");
    audio.pause();
}

jQuery(async function($) {
    var supportsAudio = !!document.createElement('audio').canPlayType;
    if (supportsAudio) {
        // initialize plyr
        var player = new Plyr('#audio1', {
            controls: [
                'restart',
                'play',
                'progress',
                'current-time',
                'duration',
                'mute',
                'volume',
                'download'
            ]
        });
        // initialize playlist and controls
        var index = 0,
            playing = false,
            tracks = MuBlob['data'],
            buildPlaylist = $.each(tracks, function(key, value) {
                var trackNumber = value.index,
                    trackName = value.title,
                    trackDuration = value.duration.time;
                if (trackNumber.toString().length === 1) {
                    trackNumber = '0' + trackNumber;
                }
                $('#plList').append('<li> \
                    <div class="plItem"> \
                        <span class="plNum">' + trackNumber + '.</span> \
                        <span class="plTitle">' + trackName + '</span> \
                        <span class="plLength">' + trackDuration + '</span> \
                    </div> \
                </li>');
            }),
            trackCount = tracks.length,
            npAction = $('#npAction'),
            npTitle = $('#npTitle'),
            audio = $('#audio1').on('play', function() {
                playing = true;
                npAction.text('Now Playing...');
            }).on('pause', function() {
                pauseAudio();
                npAction.text('Paused...');
            }).on('ended', function() {
                pauseAudio();
                npAction.text('Paused...');
                if ((index + 1) < trackCount) {
                    index++;
                    loadTrack(index);
                } else {
                    index = 0;
                    loadTrack(index);
                };
            }).get(0),
            btnPrev = $('#btnPrev').on('click', function() {
                if ((index - 1) > -1) {
                    index--;
                    loadTrack(index);
                    if (playing) {
                        audio.play();
                    }
                } else {
                    pauseAudio();
                    index = 0;
                    loadTrack(index);
                }
            }),
            btnNext = $('#btnNext').on('click', function() {
                if ((index + 1) < trackCount) {
                    index++;
                    loadTrack(index);
                    if (playing) {
                        audio.play();
                    }
                } else {
                    pauseAudio();
                    index = 0;
                    loadTrack(index);
                }
            }),
            li = $('#plList li').on('click', function() {
                var id = parseInt($(this).index());
                if (id !== index) {
                    playTrack(id);
                }
            }),
            loadTrack = function(id) {
                $('.plSel').removeClass('plSel');
                $('#plList li:eq(' + id + ')').addClass('plSel');
                npTitle.text(tracks[id].title);
                index = id;
                if (id in Mudata && Mudata[id].exp > parseInt(Date.now().toString().slice(0, -3))) {
                    audio.src = Mudata[id].src;
                    updateDownload(id, audio.src);
                } else {
                    $.ajax({
                        contentType: 'application/json',
                        data: JSON.stringify({ baseurl: 'https://www.youtube.com/watch?v=', id: tracks[id].data }),
                        success: function(data) {
                            audio.src = data['data'].link;
                            Mudata[index] = { id: index, exp: parseInt(data['expire']), src: audio.src };
                            updateDownload(id, audio.src);
                        },
                        error: function() {},
                        processData: false,
                        type: 'POST',
                        url: '/req'
                    });
                };
            },
            updateDownload = function(id, source) {
                player.on('loadedmetadata', function() {
                    $('a[data-plyr="download"]').attr('href', source);
                    if (playing) {
                        audio.play().then(() => {}).catch(error => {});
                    }
                });
            },
            playTrack = function(id) {
                loadTrack(id);
                audio.play();
            };
        //extension = audio.canPlayType('audio/mpeg') ? '.mp3' : audio.canPlayType('audio/ogg') ? '.ogg' : '';
        loadTrack(index);
    } else {
        // no audio support
        $('.column').addClass('hidden');
        var noSupport = $('#audio1').text();
        $('.container').append('<p class="no-support">' + noSupport + '</p>');
    }
});
