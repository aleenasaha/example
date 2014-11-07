/**
 * jQuery VoiceBase Plugin v3
 */
var voiceBase = (function($) {
    var VB = {
        instances: [],
        init: function(b) {
            var c = VB.instances.length,
                d = !1;
            VB.instances.push(new VB.create_instance(c, b)), c++;
            this.current_instance = c - 1;
        },
        create_instance: function(c, b) {
            this.instance_index = c,
                this.player = new VB.Player(this, b);
        }
    };

    /*** Start Voicebase Plugin Settings ***/
    VB.default_settings = {
        apiUrl: 'https://www.voicebase.com/services',
        apiKey: null,
        externalId: null,
        apiVersion: "1.1",
        mediaId: null,
        password: null,
        token: null,
        tokenTimeOut: 10,
        example: !1,
        exampleTokenUrl: 'http://demo.voicsebasejwplayer.dev3.sibers.com/extoken.php',
        stream: false,
        vbsButtons: {
            share: !0,
            comment: !0,
            downloadMedia: !0,
            downloadTranscript: !0,
            remove: !0,
            favorite: !0,
            help: !0,
            evernote: !0,
            edit: !1,
            print: !0,
            orderTranscript: !0,
            prev: !0,
            next: !0,
            fullscreen: !0,
            readermode: !0,
            pwrdb: !0,
            unquotes: !0
        },
        webHooks: {},
        addThisButtons: ['gmail', 'facebook', 'twitter', 'google_plusone_share', 'compact'],
        mediumResponsiveWithSpeakers: 600,
        mediumResponsive: 450,
        minResponsive: 400,
        voicebaseShare: !1,
        shareTitle: "Checkout this!",
        showMore: !1,
        shareParams: {},
        shareUrl: !1,
        trackEvents: !1,
        mediaBlock: 'vbs-media',
        mediaWidth: !1,
        controlsBlock: 'vbs-controls',
        controlsWidth: !1,
        searchBarOuter: !0,
        tabView: !1,
        keywordsBlock: 'vbs-keywords',
        keywordsHeight: 170,
        keywordsWidth: !1,
        keywordsResizable: !1,
        keywordsGroups: !1,
        keywordsCounter: !0,
        editKeywords: !1,
        transcriptBlock: 'vbs-transcript',
        transcriptHeight: 148,
        transcriptWidth: !1,
        transcriptResizable: !1,
        transcriptHighlight: 10,
        transcriptCheckTimer: 10,
        turnTimes: !0,
        lineBreak: !1,
        commentsBlock: 'vbs-comments',
        humanOnly: !1,
        animation: !0,
        localApp: !1,
        localSearch: !0,
        colors: ['#78c361', '#9932cc', '#ff69b4', '#6495ed', '#ffd700', '#f6a7a1', '#7fb397', '#009999'],
        filterSpeaker: 'all',
        playerType: 'youtube',
        playerDom: '',
        playerId: 'ytplayer',
        movelistner: !1,
        dragging: !1,
        draggingVol: !1,
        played: 0,
        keywordsColumns: !1,
        topicHover: !0,
        zeroClipboardSwfPath: 'ZeroClipboard.swf',
        commentsUsername: !1,
        commentsUserhandle: !1,
        contextMenu: !0,
        debug: !0,
        toggleBlocks: !0,
        toggleMediaBlock: !0,
        toggleKeywordsBlock: !0,
        toggleTranscriptBlock: !0,
        toggleCommentBlock: !0,
        hasMediaBlockHeader: !0,
        hasKeywordsBlockHeader: !0,
        hasTranscriptBlockHeader: !0,
        hasCommentsBlockHeader: !0,
        showControlsBlock: !0,
        showKeywordsBlock: !0,
        showTranscriptBlock: !0,
        showCommentsBlock: !0,
        newsBlock: 'vbs-news',
        newsWidth: !1,
        showNewsBlock: !1,
        toggleNewsBlock: !0,
        hasNewsBlockHeader: !0
    };
    VB.settings = {};
    /*** End Voicebase Plugin Settings ***/

    VB.reSettings = function(cs) {
        VB.settings = jQuery.extend(true, {}, VB.default_settings);
        VB.data = jQuery.extend(true, {}, VB.default_data);
        var s = VB.common.keysToLowerCase(cs);

        // Main
        VB.settings.apiUrl = typeof s.apiurl !== 'undefined' ? s.apiurl : VB.settings.apiUrl;
        VB.settings.apiKey = typeof s.apikey !== 'undefined' ? s.apikey : VB.settings.apiKey;
        VB.settings.externalId = typeof s.externalid !== 'undefined' ? s.externalid : VB.settings.externalId;
        VB.settings.apiVersion = typeof s.apiversion !== 'undefined' ? s.apiversion : VB.settings.apiVersion;
        VB.settings.mediaId = typeof s.mediaid !== 'undefined' ? s.mediaid : VB.settings.mediaId;
        VB.settings.password = typeof s.password !== 'undefined' ? s.password : VB.settings.password;
        VB.settings.token = typeof s.token !== 'undefined' ? s.token : VB.settings.token;
        VB.settings.tokenTimeOut = typeof s.token !== 'undefined' ? s.tokentimeout : VB.settings.tokenTimeOut;
        VB.settings.example = typeof s.example !== 'undefined' ? s.example : VB.settings.example;
        VB.settings.exampleTokenUrl = typeof s.exampletokenurl !== 'undefined' ? s.exampletokenurl : VB.settings.exampleTokenUrl;
        VB.settings.stream = typeof s.stream !== 'undefined' ? s.stream : VB.settings.stream;
        VB.settings.debug = typeof s.debug !== 'undefined' ? s.debug : VB.settings.debug;
        VB.settings.toggleBlocks = typeof s.toggleblocks !== 'undefined' ? s.toggleblocks : VB.settings.toggleBlocks;
        VB.settings.showControlsBlock = typeof s.showcontrolsblock !== 'undefined' ? s.showcontrolsblock : VB.settings.showControlsBlock;
        VB.settings.showKeywordsBlock = typeof s.showkeywordsblock !== 'undefined' ? s.showkeywordsblock : VB.settings.showKeywordsBlock;
        VB.settings.showTranscriptBlock = typeof s.showtranscriptblock !== 'undefined' ? s.showtranscriptblock : VB.settings.showTranscriptBlock;
        VB.settings.showCommentsBlock = typeof s.showcommentsblock !== 'undefined' ? s.showcommentsblock : VB.settings.showCommentsBlock;
        VB.settings.showNewsBlock = typeof s.shownewsblock !== 'undefined' ? s.shownewsblock : VB.settings.showNewsBlock;

        if(!VB.settings.toggleBlocks){
            VB.settings.toggleMediaBlock = false;
            VB.settings.toggleKeywordsBlock = false;
            VB.settings.toggleTranscriptBlock = false;
            VB.settings.toggleCommentBlock = false;
            VB.settings.toggleNewsBlock = false;
        }
        else{
            VB.settings.toggleMediaBlock = typeof s.togglemediablock !== 'undefined' ? s.togglemediablock : VB.settings.toggleMediaBlock;
            VB.settings.toggleKeywordsBlock = typeof s.togglekeywordsblock !== 'undefined' ? s.togglekeywordsblock : VB.settings.toggleKeywordsBlock;
            VB.settings.toggleTranscriptBlock = typeof s.toggletranscriptblock !== 'undefined' ? s.toggletranscriptblock : VB.settings.toggleTranscriptBlock;
            VB.settings.toggleCommentBlock = typeof s.togglecommentblock !== 'undefined' ? s.togglecommentblock : VB.settings.toggleCommentBlock;
            VB.settings.toggleNewsBlock = typeof s.togglenewsblock !== 'undefined' ? s.togglenewsblock : VB.settings.toggleNewsBlock;
        }

        VB.settings.hasMediaBlockHeader = typeof s.hasmediablockheader !== 'undefined' ? s.hasmediablockheader : VB.settings.hasMediaBlockHeader;
        if(!VB.settings.hasMediaBlockHeader){
            VB.settings.toggleMediaBlock = false;
        }

        VB.settings.hasKeywordsBlockHeader = typeof s.haskeywordsblockheader !== 'undefined' ? s.haskeywordsblockheader : VB.settings.hasKeywordsBlockHeader;
        if(!VB.settings.hasKeywordsBlockHeader){
            VB.settings.toggleKeywordsBlock = false;
        }

        VB.settings.hasTranscriptBlockHeader = typeof s.hastranscriptblockheader !== 'undefined' ? s.hastranscriptblockheader : VB.settings.hasTranscriptBlockHeader;
        if(!VB.settings.hasTranscriptBlockHeader){
            VB.settings.toggleTranscriptBlock = false;
        }

        VB.settings.hasCommentsBlockHeader = typeof s.hascommentsblockheader !== 'undefined' ? s.hascommentsblockheader : VB.settings.hasCommentsBlockHeader;
        if(!VB.settings.hasCommentsBlockHeader){
            VB.settings.toggleCommentBlock = false;
        }

        VB.settings.hasNewsBlockHeader = typeof s.hasnewsblockheader !== 'undefined' ? s.hasnewsblockheader : VB.settings.hasNewsBlockHeader;
        if(!VB.settings.hasNewsBlockHeader){
            VB.settings.toggleNewsBlock = false;
        }

        if (typeof s.actionflag !== 'undefined') {
            for (var i in s.actionflag) {
                VB.settings.vbsButtons[i] = s.actionflag[i];
            }
        }
        VB.settings.webHooks = typeof s.webhooks !== 'undefined' ? s.webhooks : VB.settings.webHooks;
        VB.settings.mediumResponsiveWithSpeakers = typeof s.mediumresponsivewithspeakers !== 'undefined' ? s.mediumresponsivewithspeakers : VB.settings.mediumResponsiveWithSpeakers;
        VB.settings.mediumResponsive = typeof s.mediumresponsive !== 'undefined' ? s.mediumresponsive : VB.settings.mediumResponsive;
        VB.settings.minResponsive = typeof s.minresponsive !== 'undefined' ? s.minresponsive : VB.settings.minResponsive;
        VB.settings.showMore = typeof s.showmore !== 'undefined' ? s.showmore : VB.settings.showMore;
        VB.settings.animation = typeof s.animation !== 'undefined' ? s.animation : VB.settings.animation;
        VB.settings.playerType = typeof s.playertype !== 'undefined' ? s.playertype : VB.settings.playerType;
        VB.settings.playerId = typeof s.playerid !== 'undefined' ? s.playerid : VB.settings.playerId;
        VB.settings.contextMenu = typeof s.contextmenu !== 'undefined' ? s.contextmenu : VB.settings.contextMenu;
        VB.settings.trackEvents = typeof s.trackevents !== 'undefined' ? s.trackevents : VB.settings.trackEvents;

        // Share
        VB.settings.shareParams = typeof s.shareparams !== 'undefined' ? s.shareparams : VB.settings.shareParams;
        VB.settings.shareUrl = typeof s.shareurl !== 'undefined' ? s.shareurl : VB.settings.shareUrl;
        VB.settings.shareTitle = typeof s.sharetitle !== 'undefined' ? s.sharetitle : VB.settings.shareTitle;
        VB.settings.addThisButtons = typeof s.addthisbuttons !== 'undefined' ? s.addthisbuttons : VB.settings.addThisButtons;
        VB.settings.voicebaseShare = typeof s.voicebaseshare !== 'undefined' ? s.voicebaseshare : VB.settings.voicebaseShare;
        VB.settings.zeroClipboardSwfPath = typeof s.zeroclipboard !== 'undefined' ? s.zeroclipboard : VB.settings.zeroClipboardSwfPath;

        // Media
        VB.settings.mediaBlock = typeof s.mediablock !== 'undefined' ? s.mediablock : VB.settings.mediaBlock;
        VB.settings.mediaWidth = typeof s.mediawidth !== 'undefined' ? (s.mediawidth < 220 ? 220 : s.mediawidth) : VB.settings.mediaWidth;
        VB.settings.controlsBlock = typeof s.controlsblock !== 'undefined' ? s.controlsblock : VB.settings.controlsBlock;
        VB.settings.controlsWidth = typeof s.controlswidth !== 'undefined' ? (s.controlswidth < 220 ? 220 : s.controlswidth) : VB.settings.controlsWidth;

        VB.settings.tabView = typeof s.tabview !== 'undefined' ? s.tabview : VB.settings.tabView;
        if(!VB.settings.tabView){
            // Keywords
            VB.settings.searchBarOuter = typeof s.searchbarouter !== 'undefined' ? s.searchbarouter : VB.settings.searchBarOuter;
            VB.settings.keywordsBlock = typeof s.keywordsblock !== 'undefined' ? s.keywordsblock : VB.settings.keywordsBlock;
            VB.settings.keywordsHeight = typeof s.keywordsheight !== 'undefined' ? s.keywordsheight : VB.settings.keywordsHeight;
            VB.settings.keywordsWidth = typeof s.keywordswidth !== 'undefined' ? (s.keywordswidth < 220 ? 220 : s.keywordswidth) : VB.settings.keywordsWidth;
        }
        else{
            VB.settings.searchBarOuter = true;
        }
        VB.settings.keywordsColumns = typeof s.keywordscolumns !== 'undefined' ? s.keywordscolumns : VB.settings.keywordsColumns;
        VB.settings.keywordsResizable = typeof s.keywordsresizable !== 'undefined' ? s.keywordsresizable : VB.settings.keywordsResizable;
        VB.settings.editKeywords = typeof s.editkeywords !== 'undefined' ? s.editkeywords : VB.settings.editKeywords;
        VB.settings.localApp = typeof s.localapp !== 'undefined' ? s.localapp : VB.settings.localApp;
        VB.settings.localSearch = typeof s.localsearch !== 'undefined' ? s.localsearch : VB.settings.localSearch;
        if(VB.settings.localApp && typeof Fuse != 'undefined'){
            VB.settings.localSearch = true;
            VB.settings.showCommentsBlock = false;
            VB.settings.vbsButtons.edit = false;
            VB.settings.vbsButtons.downloadMedia = false;
            VB.settings.vbsButtons.downloadTranscript = false;
            VB.settings.vbsButtons.favorite = false;
            VB.settings.vbsButtons.remove = false;
            VB.settings.vbsButtons.share = false;
            VB.settings.vbsButtons.orderTranscript = false;
        }
        if(typeof Fuse == 'undefined'){
            VB.settings.localSearch = false;
        }

        VB.settings.topicHover = typeof s.topichover !== 'undefined' ? s.topichover : VB.settings.topicHover;
        VB.settings.keywordsGroups = typeof s.keywordsgroups !== 'undefined' ? s.keywordsgroups : VB.settings.keywordsGroups;
        VB.settings.keywordsCounter = typeof s.keywordscounter !== 'undefined' ? s.keywordscounter : VB.settings.keywordsCounter;

        // Transcript
        if(!VB.settings.tabView){
            VB.settings.transcriptBlock = typeof s.transcriptblock !== 'undefined' ? s.transcriptblock : VB.settings.transcriptBlock;
            VB.settings.transcriptHeight = typeof s.transcriptheight !== 'undefined' ? s.transcriptheight : VB.settings.transcriptHeight;
            VB.settings.transcriptWidth = typeof s.transcriptwidth !== 'undefined' ? (s.transcriptwidth < 220 ? 220 : s.transcriptwidth) : VB.settings.transcriptWidth;
        }
        VB.settings.transcriptResizable = typeof s.transcriptresizable !== 'undefined' ? s.transcriptresizable : VB.settings.transcriptResizable;
        VB.settings.transcriptHighlight = typeof s.transcripthighlight !== 'undefined' ? s.transcripthighlight : VB.settings.transcriptHighlight;
        VB.settings.turnTimes = typeof s.turntimes !== 'undefined' ? s.turntimes : VB.settings.turnTimes;
        VB.settings.lineBreak = typeof s.linebreak !== 'undefined' ? s.linebreak : VB.settings.lineBreak;
        VB.settings.humanOnly = typeof s.humanonly !== 'undefined' ? s.humanonly : VB.settings.humanOnly;

        // Comments
        if(!VB.settings.tabView){
            VB.settings.commentsBlock = typeof s.commentsblock !== 'undefined' ? s.commentsblock : VB.settings.commentsBlock;
            VB.settings.commentsWidth = typeof s.commentswidth !== 'undefined' ? s.commentswidth : VB.settings.commentsWidth;
        }
        VB.settings.commentsUsername = typeof s.commentsusername !== 'undefined' ? s.commentsusername : VB.settings.commentsUsername;
        VB.settings.commentsUserhandle = typeof s.commentsuserhandle !== 'undefined' ? s.commentsuserhandle : VB.settings.commentsUserhandle;

        if(VB.settings.playerType == 'jwplayer'){
            var playlist = jwplayer(VB.settings.playerId).config.playlist;
            VB.settings.hasPlaylist = !!(playlist && playlist.length > 1 && !VB.settings.mediaId);
        }

        if(!VB.settings.tabView){
            VB.settings.newsBlock = typeof s.newsblock !== 'undefined' ? s.newsblock : VB.settings.newsBlock;
            VB.settings.newsWidth = typeof s.newswidth !== 'undefined' ? (s.newswidth < 220 ? 220 : s.newsWidth) : VB.settings.newsWidth;
        }

    };

    VB.default_data = {
        speakers: {},
        allSpeakers: [],
        vbsSpeakers: {},
        keywords: {},
        duration: null,
        vclass: null,
        sclass: null,
        position: 0,
        commentsThreads: null,
        startParams: [],
        played: 0,
        playerHeight: null,
        kf: false,
        tf: false,
        lspeaker: null,
        clicker: false,
        waiterSave: false,
        searcht: null,
        searchHits: null,
        localData: null
    };
    VB.data = {};


    $.fn.voicebase = function(method) {

        if (VB.methods[method]) {
            return VB.methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return VB.methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.vbplugin');
        }

    };

    return VB;
})(jQuery);
