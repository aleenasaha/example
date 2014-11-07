/*
* VB.Player and VB.interface.
* Work with players
* */
voiceBase = (function(VB, $) {

    VB.Player = function(a, b) {
        var me = this;
        this.instance = a;
        var h = VB.settings.playerType;
        h = h.toLowerCase().replace(/^\s+|\s+$/, ""), me.player_type = h;
        me.instance.player_ready = false;
        this.find_player_interval = setInterval(function() {
            try {
                me.interface = new VB.interface[h](b, me.instance);
                clearInterval(me.find_player_interval);
                VB.events.time = setInterval(function() {
                    VB.events.onTime();
                }, 250);
            } catch (f) {
                console.log(f);
            }
        }, 250);
    };

    VB.interface = {
        youtube: function(a, b) {
            var me = this;
            me.instance = b;
            if (document.getElementById(a) && document.getElementById(a).tagName.toLowerCase() == "iframe") {
                if (typeof YT == "undefined" || typeof YT.Player == "undefined"){
                    throw "not_ready";
                }
                if (!YT.loaded){
                    throw "not_ready";
                }
                if (me.instance.ytplayerloaded){
                    return !1;
                }
                me.youtube_player = new YT.Player(a);
                me.instance.ytplayerloaded = !0
            }
            else {
                me.youtube_player = window.document[a];
            }

            me.play = function() {
                me.youtube_player.playVideo();
            };

            me.pause = function() {
                me.youtube_player.pauseVideo();
            };

            me.play_state = function() {
                try {
                    var a = me.youtube_player.getPlayerState()
                } catch (b) {
                    return "PAUSED"
                }
                return parseInt(a) == 1 || parseInt(a) == 5 ? "PLAYING" : "PAUSED"
            };

            me.position = function() {
                try {
                    return me.youtube_player.getCurrentTime() + 0.07;
                } catch (b) {
                    return 0;
                }
            };

            me.duration = function() {
                return me.youtube_player ? parseInt(me.youtube_player.getDuration() + .5) : !1
            };

            me.seek = function(position) {
                position = parseInt(position, 10);
                me.youtube_player.seekTo(position);
                me.play();
            };

            me.get_volume = function() {
                return me.youtube_player ? me.youtube_player.getVolume() : !1;
            };

            me.set_volume = function(a) {
                me.youtube_player.setVolume(a);
            };

            me.get_buffer = function() {
                return (me.youtube_player && me.youtube_player.getVideoBytesLoaded) ? ( me.youtube_player.getVideoBytesLoaded() * 100 / me.youtube_player.getVideoBytesTotal() ) : !1;
            };

            window.onYouTubePlayerReady = function(playerId){
                if(!me.instance.player_ready){
                    me.instance.player_ready = true;
                    if(VB.settings.localApp) {
                        YSP.api.init('ytplayer');
                        YSP.api.getParsedData(function(data){
                            console.log(data);
                            VB.data.localData = data;
                            VB.view.initApi();
                        });
                    }
                }
            };
        },
        jwplayer: function(a, b) {
            var me = this;
            me.instance = b;
            if (typeof jwplayer != "undefined" && jwplayer(a) && jwplayer(a).play){
                me.jw_player = jwplayer(a);
                me.jw_player.onReady(function(){
                    me.instance.player_ready = true;
                    initJwMethods();
                    if(VB.settings.hasPlaylist){
                        me.onChangePlayListItem();
                    }
                });

                var initJwMethods = function(){
                    me.play = function() {
                        me.jw_player.play();
                    };
                    me.pause = function() {
                        me.jw_player.pause();
                    };
                    me.play_state = function() {
                        return me.jw_player.getState() == "PLAYING" ? "PLAYING" : "PAUSED";
                    };
                    me.position = function() {
                        return me.jw_player.getPosition();
                    };
                    me.duration = function() {
                        return me.jw_player.getDuration();
                    };
                    me.seek = function(t) {
                        me.jw_player.seek(t);
                    };
                    me.get_volume = function() {
                        return me.jw_player.getVolume();
                    };
                    me.set_volume = function(a) {
                        return me.jw_player.setVolume(a);
                    };
                    me.get_buffer = function() {
                        return me.jw_player.getBuffer();
                    };
                    me.get_rendering_mode = function() {
                        return me.jw_player.getRenderingMode();
                    };
                    me.load_file = function(f) {
                        me.jw_player.load([{file: f}]);
                    };
                    me.initPluginFromPlaylistItem = function(){
                        var item = me.getCurrentPlaylistItem();
                        if(item.vbs_mediaid) {
                            VB.settings.mediaId = item.vbs_mediaid;
                        }
                        else if(item.vbs_externalid) {
                            VB.settings.externalId = item.vbs_externalid;
                        }
                        VB.view.initApi();
                    };
                    me.onChangePlayListItem = function(){
                        me.jw_player.onPlaylistItem(function(){
                            me.initPluginFromPlaylistItem();
                        });
                    };
                    me.getCurrentPlaylistItem = function(){
                        return me.jw_player.getPlaylistItem();
                    };
                };
                initJwMethods();
            }
            else {
                if (!window.document[a] || typeof window.document[a].addModelListener == "undefined") {
                    throw "not_ready";
                }
                me.jw_player = window.document[a];
                me.play = function() {
                        me.jw_player.sendEvent("PLAY", "true");
                };
                me.pause = function() {
                    me.jw_player.sendEvent("PLAY", "false");
                };
                me.play_state = function() {
                    return this.player_state;
                };
                me.position = function() {
                    return this.playhead_time;
                };
                me.duration = function() {
                    return 1e3 * this.jw_player.getPlaylist()[me.jw_player.getConfig().item].duration;
                };
                me.seek = function(a) {
                    var b = parseInt(a, 10);
                    b = Math.max(0, b - 1), me.jw_player.sendEvent("SEEK", b);
                };
                me.get_volume = function() {
                    return me.jw_player.getVolume();
                };
                me.set_volume = function(a) {
                    return me.jw_player.setVolume(a);
                };
                me.get_buffer = function() {
                    return me.jw_player.getBuffer();
                };
                me.get_rendering_mode = function() {
                    return me.jw_player.getRenderingMode();
                };
                me.load_file = function(f) {
                    me.jw_player.load(f);
                };
            }
        },
        kaltura: function(t, e) {
            var me = this;
            me.instance = e;
            me.kaltura_player = $("#" + t).get(0);
            me.kaltura_states = {
                buffered: 0,
                bytes_total: 0,
                player_state: false,
                playhead_time: 0,
                volume: 1,
                ready: false
            };

            window.bytesTotalChangeHandler = function(data){
                me.kaltura_states.bytes_total = data;
            };

            window.html5_kaltura_play_handler = function(data){
                console.log('Kaltura is PLAYING!');
                me.kaltura_states.player_state = true;
            };

            window.html5_kaltura_pause_handler = function(){
                console.log('Kaltura is PAUSED!');
                me.kaltura_states.player_state = false;
            };

            window.html5_kaltura_update_playhead = function(t){
                me.kaltura_states.playhead_time = parseFloat(t);
            };

            window.volumeChangedHandler = function(volumeValue){
                me.kaltura_states.volume = volumeValue.newVolume;
            };

            window.bytesDownloadedChangeHandler = function(data, id){
                me.kaltura_states.buffered = data.newValue;
            };

            window.playerSeekEndHandler = function(){
                me.play();
            };

            me.player_state = !1;
            me.playhead_time = 0;
            me.player_id = t;

            me.play = function () {
                me.kaltura_player.sendNotification("doPlay");
            };
            me.pause = function () {
                me.kaltura_player.sendNotification("doPause")
            };
            me.play_state = function () {
                return (me.kaltura_states.player_state) ? 'PLAYING' : 'PAUSED';
            };
            me.position = function () {
                return me.kaltura_states.playhead_time;
            };
            me.duration = function () {
                return me.kaltura_player.evaluate("{mediaProxy.entry.msDuration}")
            };
            me.video_id = function () {
                return me.kaltura_player.evaluate("{mediaProxy.entry.id}")
            };
            me.seek = function (t) {
                me.kaltura_player.sendNotification("doPlay");

                setTimeout(function(){
                    me.kaltura_player.sendNotification("doSeek", parseFloat(parseInt(t)));
                }, 0);
            };
            me.play_file = function (t) {
                if (t.video_id != this.video_id()) {
                    var e = t.m || 0;
                    me.kaltura_player.sendNotification("changeMedia", {
                        entryId: t.video_id, seekFromStart: e.toString()
                    });
                    me.timer = setInterval(function () {
                        return "PLAYING" == me.play_state() && me.video_id() == t.video_id ? (clearInterval(me.timer), !0) : void me.play()
                    }, 200)
                } else
                    this.seek(t.m)
            };
            me.get_buffer = function(t) {
                if(me.kaltura_states.bytes_total && me.kaltura_states.buffered){
                    return me.kaltura_states.buffered * 100 / me.kaltura_states.bytes_total;
                }
                return 0;
            };
            me.get_volume = function() {
                return me.kaltura_states.volume * 100;
            };
            me.set_volume = function(a) {
                me.kaltura_player.sendNotification('changeVolume', a/100);
            };

            window.kdpReady = function(){
                me.kaltura_states.ready = true;
                console.log('Kaltura is ready!');

                me.kaltura_player.addJsListener("volumeChanged", "volumeChangedHandler");

                me.kaltura_player.addJsListener("playerPlayed", 'html5_kaltura_play_handler');
                me.kaltura_player.addJsListener("playerPaused", 'html5_kaltura_pause_handler');
                me.kaltura_player.addJsListener("playerPlayEnd", 'html5_kaltura_pause_handler');
                me.kaltura_player.addJsListener("playerUpdatePlayhead", 'html5_kaltura_update_playhead');
                me.kaltura_player.addJsListener("bytesTotalChange", "bytesTotalChangeHandler");
                me.kaltura_player.addJsListener("bytesDownloadedChange", "bytesDownloadedChangeHandler");
                me.kaltura_player.addJsListener("playerSeekEnd", "playerSeekEndHandler");
                if(VB.api.response.metadata && !VB.api.response.metadata.response.hasVideo){
                    $(me.kaltura_player).css('height', 0);
                }
                if(me.kaltura_player.tagName == 'OBJECT'){ // flash player
                    me.play();
                }
            };

            window.jsCallbackReady = function(player_id) {
                me.kaltura_player.addJsListener("kdpReady", "kdpReady");
            };

            if (!me.kaltura_player || !me.kaltura_player.addJsListener)
                throw "not_ready";

        },
        flowplayer: function(player_id, e) {
            var me = this;
            me.instance = e;
            if (typeof flowplayer === "undefined" ){
                throw "not_ready";
            }
            me.flow_player = $('#' + player_id);
            var api = flowplayer(me.flow_player);

            me.play = function() {
                api.play();
            };
            me.pause = function() {
                return api.pause();
            };
            me.play_state = function() {
                var status = api.paused;
                return (status) ? "PAUSED" : "PLAYING";
            };
            me.position = function() {
                return (api.video) ? api.video.time : 0;
            };
            me.duration = function() {
                return (api.video) ? api.video.duration : 0; // 1e3 ??
            };
            me.seek = function(position) {
                api.seek(position); // in seconds
                me.play();
            };
            me.get_buffer = function(t) {
                if(api.video){ // in percent
                    return api.video.buffer * 100 / me.duration();
                }
                return 0;
            };
            me.flow_player.bind("volume", function() {
                var vol = me.get_volume();
                VB.helper.setPluginVolume(vol);
            });
            me.get_volume = function() {
                return api.volumeLevel*100;
            };
            me.set_volume = function(volume) {
                api.volume(volume/100);
            };
        },
        sublime: function(player_id, e) {
            var me = this;
            me.instance = e;
            if(typeof sublime == "undefined" || typeof sublime.player == "undefined"){
                throw "not_ready";
            }
            else if(typeof sublime.player(player_id) == "undefined"){
                throw "not_ready";
            }
            me.player_id = player_id
            me.default_size = {
                width: $('#' + me.player_id).width(),
                height: $('#' + me.player_id).height()
            };
            me.player_state = !1;
            var api = sublime.player(me.player_id);
            api.on({
                start: function() {
                    me.player_state = "PLAYING";
                },
                end: function() {
                    me.player_state = "PAUSED";
                },
                stop: function() {
                    me.player_state = "PAUSED";
                },
                pause: function() {
                    me.player_state = "PAUSED";
                },
                play: function() {
                    me.player_state = "PLAYING";
                }
            });
            me.play = function() {
                api.play();
            };
            me.pause = function() {
                api.pause();
            };
            me.play_state = function() {
                return me.player_state;
            };
            me.position = function() {
                return api.playbackTime();
            };
            me.duration = function() {
                return api.duration();
            };
            me.get_buffer = function(t) {
                return 0;
            };
            me.seek = function(position) {
                api.seekTo(position);
                me.play();
            };
            me.setSize = function(width, height){
                api.setSize(width, height);
            };
            me.setDefaultSize = function(){
                api.setSize(me.default_size.width, me.default_size.height);
            };
        },
        video_js: function(t, e) {
            var me = this;
            me.instance = e;
            me.player_id = t;
            if (typeof _V_ === "undefined")
                throw "not_ready";
            var api = _V_(t);
            me.play = function() {
                api.play()
            };
            me.pause = function() {
                api.pause()
            };
            me.play_state = function() {
                return api.paused() ? "PAUSED" : "PLAYING"
            };
            me.position = function() {
                return api.currentTime()
            };
            me.duration = function() {
                return api.duration()
            };
            me.seek = function(position) {
                api.currentTime(position);
                me.play()
            };
            me.get_buffer = function(t) {
                return api.bufferedPercent() * 100 || 0;
            };
            api.on("volumechange", function() {
                var vol = me.get_volume();
                VB.helper.setPluginVolume(vol);
            });
            me.get_volume = function() {
                return api.volume() * 100;
            };
            me.set_volume = function(volume) {
                api.volume(volume / 100);
            };
        },
        jplayer: function(player_id, instance){
            var me = this;
            me.instance = instance;
            me.player_id = player_id;
            var $player = $('#' + me.player_id);

            me.default_size = {
                width: $('#' + me.player_id).width(),
                height: $('#' + me.player_id).height()
            };

            me.play = function(){
                $player.jPlayer("play");
            };
            me.pause = function(){
                $player.jPlayer("pause");
            };
            me.play_state = function() {
                return $player.data('jPlayer').status.paused ? "PAUSED" : "PLAYING"
            };
            me.position = function() {
                return $player.data('jPlayer').status.currentTime || 0;
            };
            me.duration = function() {
                return $player.data('jPlayer').status.duration || 0;
            };
            me.seek = function(position) { // in seconds
                position = parseInt(position);
                $player.jPlayer("play", position);
            };
            me.get_buffer = function(t) {
                return 0;
            };
            me.get_volume = function() {
                return ($player.data("jPlayer").options.volume * 100) || 0;
            };
            me.set_volume = function(volume) {
                $('#jplayer').jPlayer("volume", volume / 100);
            };
            me.isVideo = function(){
                return $player.data('jPlayer').status.video;
            };
            me.getGui = function(){
                return $($player.data('jPlayer').ancestorJq);
            };
            me.initEvents = function(){
                $player.bind($.jPlayer.event.volumechange, function(){
                    var vol = me.get_volume();
                    VB.helper.setPluginVolume(vol);
                });
            };
            me.setSize = function(width, height){
                $player.jPlayer({
                    size:  {
                        width: width,
                        height: height
                    }
                });
            };
            me.setDefaultSize = function(){
                me.setSize(me.default_size.width, me.default_size.height);
            };

            var init = function(){
                var $gui = me.getGui();
                if(!me.isVideo()){
                    $gui.hide();
                }
                me.initEvents();
            };
            init();

        }
    };

    return VB;
})(voiceBase, jQuery);
