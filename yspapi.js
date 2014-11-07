var YSP = (function(me, $) {
    "use strict";

    me.youtube_player = null;
    me.options = null;

    me.api = {
        init: function(player_id){
            me.options = {
                player_id: player_id,
                youtube_subtitles: {},
                transcripts: {},
                keywords: {},
                languages: [],
                parsedResult: $.Deferred()
            };
            me.youtube_player = document.getElementById(player_id);
            me.options.video_id = me.common.getVideoId();
            if(!me.youtube_player && !me.options.video_id) {
                console.log('Player Id was wrong!');
            }

            me.api.getSubtitles();
        },

        getSubtitles: function(){
            me.common.getLangs();
        },

        getParsedData: function(callback){
            me.options.parsedResult.done(function(){
                if(callback){
                    callback({
                        transcripts: me.options.transcripts,
                        keywords: me.options.keywords,
                        languages: me.options.languages
                    });
                }
            });
        }
    };

    return me;

})(YSP, jQuery);
