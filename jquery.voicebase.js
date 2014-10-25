/**
 * jQuery VoiceBase Plugin v3
 * 140725T13
 */
(function($) {
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
            pwrdb: !0
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
        localKeywordSearch: !1,
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
        debug: !0
    };
    VB.settings = {};

    /*** End Voicebase Plugin Settings ***/

    /*** Start custom functions ***/
    if (!Object.keys) {
        Object.keys = (function() {
            'use strict';
            var hasOwnProperty = Object.prototype.hasOwnProperty,
                    hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
                    dontEnums = [
                        'toString',
                        'toLocaleString',
                        'valueOf',
                        'hasOwnProperty',
                        'isPrototypeOf',
                        'propertyIsEnumerable',
                        'constructor'
                    ],
                    dontEnumsLength = dontEnums.length;

            return function(obj) {
                if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
                    throw new TypeError('Object.keys called on non-object');
                }

                var result = [], prop, i;

                for (prop in obj) {
                    if (hasOwnProperty.call(obj, prop)) {
                        result.push(prop);
                    }
                }

                if (hasDontEnumBug) {
                    for (i = 0; i < dontEnumsLength; i++) {
                        if (hasOwnProperty.call(obj, dontEnums[i])) {
                            result.push(dontEnums[i]);
                        }
                    }
                }
                return result;
            };
        }());
    }

    function keysToLowerCase(obj) {
        var keys = Object.keys(obj);
        var n = keys.length;
        while (n--) {
            var key = keys[n]; // "cache" it, for less lookups to the array
            if (key !== key.toLowerCase()) { // might already be in its lower case version
                obj[key.toLowerCase()] = obj[key] // swap the value to a new lower case key
                delete obj[key] // delete the old key
            }
        }
        return (obj);
    }

    String.prototype.padLeft = function(total) {
        return Array(total - this.length + 1).join('0') + this;
    };

    // Extends
    jQuery.extend(jQuery.expr[':'], {
        "wordtime": function(element, i, match, elements) {
            var value = parseFloat($(element).attr('t')),
                    minMaxValues = match[3].split(/\s?,\s?/);
            minValue = parseFloat(minMaxValues[0]),
                    maxValue = parseFloat(minMaxValues[1]);
            return !isNaN(value) && !isNaN(minValue) && !isNaN(maxValue) && value <= maxValue && value >= minValue;
        }
    });

    jQuery.extend(jQuery.expr[':'], {
        "speakertime": function(element, i, match, elements) {
            var s = parseFloat($(element).attr('s')),
                    e = parseFloat($(element).attr('e')),
                    minMaxValues = match[3].split(/\s?,\s?/),
                    value = parseFloat(minMaxValues[0]);
            return !isNaN(s) && !isNaN(e) && !isNaN(value) && value <= e && value >= s;
        }
    });


    // *** CONTEXT PLUGIN START *** //

    function vbmenus(event, type, elem) {
        var copy = typeof $.fn.zclip !== 'undefined';
        var share = typeof addthis !== 'undefined';
        if (copy == false && share == false && VB.settings.editKeywords == false || VB.settings.contextMenu == false && type != 'keyword') {
            return false;
        }

        event.preventDefault();
        var newparam = {};
        var kwGroup = $(elem).parents('ul').hasClass('group');

        if (type == 'timeline') {
            var played;
            if (event.target.localName == 'ins') {
                played = $(event.target).parent().attr('stime');
            } else {
                var x = (event.offsetX || event.clientX - $(event.target).offset().left);
                played = Math.round(VB.data.duration * (x + event.target.offsetLeft) / VB.helper.find(".vbs-record-timeline-wrap").width());
            }
            newparam['vbt'] = played;
            if ($('#voice_search_txt').val().length) {
                newparam['vbs'] = encodeURI($('#voice_search_txt').val());
            }
        } else if (type == 'keyword') {
            var keyword = $(elem).attr('in');
            if (keyword.match(/\s+/g)) {
                keyword = '"' + keyword + '"';
            }
            newparam['vbs'] = encodeURI(keyword);
        } else if (type == 'transcript') {
            var transcript = $(elem).text();
            transcript = encodeURI(transcript);
            newparam['vbs'] = transcript;
        }

        $("ul.vbs-vbcmenu").remove();
        var url = VB.helper.getNewUrl(newparam);

        var menu = '';
        if (copy && VB.settings.contextMenu) {
            menu += '<li id="vbc_url"><a href="#">Copy URL</a></li>';
        }
        if (share && VB.settings.contextMenu) {
            menu += '<li id="vbc_share"><a class="addthis_button_expanded addthis_default_style" addthis:url="' + url + '" addthis:title="Check out">Share</a></li>';
        }
        if (type == 'keyword' && VB.settings.editKeywords && !kwGroup) {
            var $elem = $(elem);
            var editmenu = '<span class="vbs-keyword_controls" data-elem-text="' + $elem.attr('in') + '">';
            if ($elem.parent().prev().length) {
                editmenu += '<span class="vbs-vbe vbs-voicebase_first" title="Move to Top">Move to Top</span>' +
                        '<span class="vbs-vbe vbs-voicebase_up" title="Move up">Move up</span>';
            }
            if ($elem.parent().next().length) {
                editmenu += '<span class="vbs-vbe vbs-voicebase_down" title="Move down">Move down</span>';
            }
            editmenu += '<span class="vbs-vbe vbs-voicebase_remove" title="Remove">Remove</span>' +
                    '</span>';
            menu += '<li id="vbc_move">' + editmenu + '</li>';
        }

        $("<ul class='vbs-vbcmenu'>" + menu + "</ul>")
                .appendTo("body")
                .css({
                    top: event.pageY + "px",
                    left: event.pageX + "px"
                });

        if (copy) {
            $("#vbc_url a").zclip({
                path: VB.settings.zeroClipboardSwfPath,
                copy: url
            });
        }
        if (share) {
            addthis.toolbox("#vbc_share");
        }
    }
    
    function vbEditMenu(event, elem) {
        $("ul.vbs-vbcmenu").remove();
        var $this = $(elem);
        var stime = $this.attr('t') / 1000;
        var stimep = stime > 1 ? stime - 1 : stime;
        var menu = '';
            menu += '<li><a href="#" class="vbsc-edit-play" data-time="'+ stimep  +'">Play</a></li>';
            menu += '<li><a href="#" class="vbsc-edit-speaker" data-time="'+ stime * 1000 +'">Insert Speaker</a></li>';

        $("<ul class='vbs-vbcmenu'>" + menu + "</ul>")
                .appendTo("body")
                .css({
                    top: event.pageY + "px",
                    left: event.pageX + "px"
                });
    }
    // *** CONTEXT PLUGIN END *** //

    function inSpeakers(needle) {
        for (var iss in VB.data.speakers) {
            if (VB.data.speakers[iss] == needle)
                return true;
        }
        return false;
    }

    function inArrayV(sarray, needle) {
        for (var iss in sarray) {
            if (sarray[iss] == needle)
                return true;
        }
        return false;
    }

    function getSpeakerName(key) {
        return typeof VB.data.speakers[key] != 'undefined' ? VB.data.speakers[key] : '';
    }

    function getStringFromObject(obj) {
        var str = Object.keys(obj).map(function(key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]);
        }).join('&');
        return str;
    }

    /*** End custom functions ***/

    /*** Start events ***/
    function registerEvents() {
        // Media Events
        VB.helper.find(".vbs-media-block .vbs-section-title").on('click', function() {
            var $this = $(this);
            $this.toggleClass('vbs-hidden');
            if ($this.hasClass('vbs-hidden')) {
                VB.data.playerHeight = VB.settings.playerDom.height();
                VB.settings.playerDom.css({height: '0px'});
                VB.helper.find('.vbs-expand-btn').hide();
                VB.helper.findc('.vbs-player-wrapper .vbs-time').hide();
                if($this.parents('.vbs-media-block').hasClass('vbs-video')){
                    $('.vbs-tooltip').text('Show Video');
                }
            } else {
                VB.settings.playerDom.css({height: VB.data.playerHeight + 'px'});
                VB.helper.find('.vbs-expand-btn').show();
                VB.helper.findc('.vbs-player-wrapper .vbs-time').show();
                if($this.parents('.vbs-media-block').hasClass('vbs-video')){
                    $('.vbs-tooltip').text('Hide Video');
                }
            }
        });

        // Timeline Events
        VB.helper.find('.vbs-markers').on('click', 'a.vbs-marker', function() {
            var stime = $(this).attr('stime');
            VB.helper.seek(stime);
            return false;
        });

        VB.helper.find('.vbs-comments-wrapper-block').on('click', '.vbs-comment-preview a', function() {
            var stime = $(this).attr('stime');
            VB.helper.seek(stime);
            return false;
        });

        // Play
        $("." + VB.data.vclass + " .vbs-player-control, ." + VB.data.vclass +" .vbs-edit-mode-prewrapper").on('click', ".vbs-play-btn", function() {
            if (!$(this).hasClass("vbs-playing")) {
                VB.helper.track('play');
                $(this).addClass('vbs-playing');
                $('.vbs-tooltip').text("Pause");
                $(this).attr("data-title", "Pause");
                VB.helper.showLoader();
                VB.helper.play();
            } else {
                $(this).removeClass('vbs-playing');
                VB.helper.track('pause');
                $('.vbs-tooltip').text("Play");
                $(this).attr("data-title", "Play");
                VB.helper.hideLoader();
                VB.helper.pause();
            }
            return false;
        });

        // Prev
        VB.helper.find('').on('click', ".vbs-prev-btn", function() {
            var btime = VB.helper.getPosition() - 15;
            btime = btime < 0 ? 0.001 : btime;
            VB.helper.seek(btime);
            return false;
        });

        // Next Marker Btn
        VB.helper.find('').on('click', '.vbs-next-action-btn', function(event) {
            event.preventDefault();
            if(!$(this).hasClass('vbs-next-notactive')){
                var lastmarker = true;
                var timesAr = [];
                VB.helper.find('.vbs-record-timeline-wrap .vbs-markers a').each(function() {
                    timesAr.push(parseFloat($(this).attr('stime')));
                });
                timesAr.sort(function(a, b) {
                    return parseInt(a, 10) - parseInt(b, 10);
                });
                for (var eltm in timesAr) {
                    if (timesAr[eltm] > VB.helper.getPosition() + 1) {
                        VB.helper.seek(timesAr[eltm]);
                        lastmarker = false;
                        return false;
                    }
                }
                // Loop markers
                if (lastmarker && VB.helper.find('.vbs-record-timeline-wrap .vbs-markers a').length) {
                    VB.helper.seek(timesAr[0]);
                }
            }
        });

        $(window).resize(function() {
            VB.view.resizeTimelineElements();
        });

        //// DRAG
        $(document).on("mousedown", ".vbs-record-timeline-wrap .vbs-dragger", function(e) {
            e.preventDefault();
            var $this = $(this).parents('.vbs-record-timeline-wrap');
            if (e.button == 0) {
                var tlw = 100 * (e.pageX - $this.offset().left) / $this.width();
                VB.helper.find(".vbs-player-slider").css("left", tlw + "%");
                VB.helper.find(".vbs-record-progress").css("width", tlw + "%");
                VB.settings.movelistner = true;
                VB.settings.dragging = true;
            }
        }).on("mousemove", ".vbs-record-timeline-wrap .vbs-dragger", function(e) {
            e.preventDefault();
            var $this = $(this).parents('.vbs-record-timeline-wrap');
            var tlw = 100 * (e.pageX - $this.offset().left) / $this.width();
            if (tlw > 100) {
                tlw = 100;
            } else
            if (tlw < 0) {
                tlw = 0;
            }
            VB.settings.played = Math.round(VB.data.duration * tlw / 100);
            if (VB.settings.dragging) {
                VB.helper.find(".vbs-player-slider").css("left", tlw + "%");
                VB.helper.find(".vbs-record-progress").css("width", tlw + "%");
                VB.helper.find(".vbs-ctime").html(VB.helper.parseTime(VB.settings.played));
                VB.helper.find('.vbs-share-popup .vbsp-time').html(VB.helper.parseTime(VB.settings.played)).attr('vbct', VB.settings.played);
                VB.helper.find('.vbs-comments-popup #vbs-comment-timeline').html(VB.helper.parseTime(VB.settings.played)).attr('vbct', VB.settings.played);
            }
        }).on('mouseup', function() {
            if (VB.settings.dragging) {
                VB.helper.seek(VB.settings.played);
                VB.helper.track('seek', VB.settings.played);
                VB.helper.find('.vbs-share-popup .vbsp-time').html(VB.helper.parseTime(VB.settings.played)).attr('vbct', VB.settings.played);
                VB.helper.find('.vbs-comments-popup #vbs-comment-timeline').html(VB.helper.parseTime(VB.settings.played)).attr('vbct', VB.settings.played);
                if (VB.helper.find('#vbs-share-position').is(':checked')) {
                    var newparam = {};
                    newparam['vbt'] = VB.settings.played;
                    var url = VB.helper.getNewUrl(newparam);
                    $('#vbsp-url').val(url);
                    if (typeof addthis !== 'undefined') {
                        addthis.update('share', 'url', url);
                    }
                }
            }
            VB.settings.dragging = false;
//            VB.settings.movelistner = false;
        });

        // Hover on markers
        VB.helper.find(".vbs-markers").on({
            mouseover: function(e) {
                VB.helper.find('[ctime="' + $(e.target).parent().attr('stime') + '"]').fadeIn(75);
            },
            mouseout: function(e) {
                VB.helper.find('[ctime="' + $(e.target).parent().attr('stime') + '"]').fadeOut(100);
            }
        });

        // Click on utterance markers
        VB.helper.find(".vbs-utterance-markers").on('click', '.vbs-utter-marker', function(){
            var stime = $(this).attr('data-stime');
            VB.helper.seek(stime);
            return false;
        });

        // Show/hide utterance marker
        $(document).on('change', '.vbs-utterance-block input[type=checkbox]', function(){
            var utterance_num = $(this).attr('data-row');
            VB.helper.find(".vbs-utterance-markers").find('.vbs-utter-row' + utterance_num).toggle();
        });

        VB.helper.find('').on('click', '.vbs-volume-btn', function(event) {
            event.preventDefault();
            var $this = $(this);
            if ($this.hasClass('show')) {
                VB.helper.find('.vbs-volume-toolbar-block').fadeOut('fast');
                $this.removeClass('show');
            } else {
                var vol = VB.helper.getVolume();
                VB.helper.find(".vbs-volume-slider-full").css("height", vol + "%");
                VB.helper.find(".vbs-volume-slider-handler").css("bottom", vol + "%");
                VB.helper.find('.vbs-volume-toolbar-block').fadeIn(100);
                $this.addClass('show');
            }
        });

        $(document).on("mousedown", ".vbs-volume-toolbar-block", function(e) {
            var $this = $(this);
            if (e.button == 0) {
                var vol = 100 - 100 * (e.pageY - $this.find('.vbs-volume-slider').offset().top) / $(this).height();
                if (vol > 100) {
                    vol = 100;
                } else
                if (vol < 0) {
                    vol = 0;
                }
                VB.helper.find(".vbs-volume-slider-full").css("height", vol + "%");
                VB.helper.find(".vbs-volume-slider-handler").css("bottom", vol + "%");
                VB.helper.setVolume(vol);
                VB.settings.draggingVol = true;
            }
        }).on("mousemove", ".vbs-volume-toolbar-block", function(e) {
            e.preventDefault();
            var $this = $(this);
            if (VB.settings.draggingVol) {
                var vol = 100 - 100 * (e.pageY - $this.find('.vbs-volume-slider').offset().top) / $(this).height();
                if (vol > 100) {
                    vol = 100;
                } else
                if (vol < 0) {
                    vol = 0;
                }
                VB.helper.find(".vbs-volume-slider-full").css("height", vol + "%");
                VB.helper.find(".vbs-volume-slider-handler").css("bottom", vol + "%");
                VB.helper.setVolume(vol);
            }
        }).on('mouseup mouseleave', function() {
            VB.settings.draggingVol = false;
        });

        //* Keywords Events *//
        VB.helper.find('.vbs-keywords-block').on('click', '.vbs-keywords-list-tab li a', function() {
            if(VB.helper.getStatus() == 'PLAYING'){
                VB.helper.pause();
            }
            VB.helper.showLoader();
            var $this = $(this);
            VB.helper.find('.vbs-markers').html('');
            VB.helper.find(".vbs-next-action-btn:not([class='vbs-next-notactive'])").addClass('vbs-next-notactive');
            VB.helper.removeBold();

            var word = $this.text().trim();
            if (VB.settings.localKeywordSearch) {
                var termstring = word;
            } else {
                var termstring = $this.attr("in");
            }
            if (word.match(/\s+/g)) {
                word = '"' + word + '"';
            }
            var term = VB.helper.termFor(termstring, 'url');
            var markerterms = VB.helper.termFor(termstring, 'marker');

            VB.helper.find('#voice_search_txt').val(term).change();
            $(this).addClass('bold');
            if (markerterms.length) {
                VB.view.searchWordWidget(markerterms);
            }
            VB.helper.find('#voice_search_txt').attr('data-val', VB.helper.find('#voice_search_txt').val());
            VB.helper.track('keyword', termstring);
            if (VB.settings.localKeywordSearch) {
                VB.helper.localSearch($this, term);
            } else {
                VB.api.getSearch([term]);
            }
            return false;
        });

        VB.helper.find(".vbs-keywords-block .vbs-section-title").on('click', function() {
            var $this = $(this);
            $this.toggleClass('vbs-hidden');
            if ($this.hasClass('vbs-hidden')) {
                $this.attr('data-title', 'Show Keywords');
                $this.parents('.vbs-keywords-block').find('.vbs-section-body').slideUp();
                $this.parents('.vbs-keywords-block').find('.vbs-search-form').hide();
            } else {
                $this.attr('data-title', 'Hide Keywords');
                $this.parents('.vbs-keywords-block').find('.vbs-section-body').slideDown();
                $this.parents('.vbs-keywords-block').find('.vbs-search-form').show();
            }
        });

        // Show/hide more keywords
        VB.helper.find(".vbs-keywords-block .vbs-more-btn a").on('click', function() {
            if (VB.settings.keywordsHeight > VB.helper.getMaxKeywordHeight()) {
                VB.settings.keywordsHeight = VB.helper.getKeywordHeight();
            }
            var maxKH = '100%';
            VB.helper.find('.vbs-keywords-list-wrapper').css({height: maxKH});
            var $this = $(this);

            if (VB.data.kf) {
                VB.data.kf = false;
                $this.text('Show More...');
                VB.helper.find(".vbs-keywords-wrapper").animate({height: VB.settings.keywordsHeight + "px"}, 700);
            } else {
                VB.helper.find(".vbs-keywords-wrapper").animate({height: VB.helper.getMaxKeywordHeight() + "px"}, 700);
                $this.text('Hide More...');
                VB.data.kf = true;
            }
            return false;
        });

        $(document).on('click', '.vbs-widget em', function(e) {
            var _this = $(this);
            var vb_words = _this.find('.vbs_word');
            var searchInput = $('#voice_search_txt');
            var words = [];

            if (vb_words.length) {
                $.each(vb_words, function(key, value) {
                    words.push($(value).find('.search_word').text());
                    $(value).remove();
                });
                searchInput.val(words.join(' '));
            }
            VB.helper.find('.vbs-widget-wrap').addClass('focused');
            searchInput.css("opacity", "1");
            VB.helper.find('#vbs-search-string').hide();
            VB.helper.find('#voice_search_txt').focus();
        });

        // Clear Searchbar
        VB.helper.find('#vbs-clear-string').on('click', function() {
            if ($(this).parents('.vbs-search-form').hasClass('vbs-filled')) {
                VB.helper.pause();
                VB.helper.find('.vbs-markers, .vbs-search-word-widget').html('');
                VB.helper.find(".vbs-next-action-btn:not([class='vbs-next-notactive'])").addClass('vbs-next-notactive');
                VB.helper.find('#voice_search_txt').val('').change();
                VB.helper.find('.vbs-kwe-add').remove();
                VB.helper.find("#vbs-search-string .vbs-marquee .vbs-search-word-widget").stop(true).css("left", 0);
            }
            return false;
        });

        // KeyUp Searchbar
        VB.helper.find('#voice_search_txt').on('keyup', function(e) {
            var words = VB.helper.getSearchWordsArray();
            if (words.length) {
                VB.helper.find('.vbs-powered-by-label').addClass('vbs-hidden-p');
            } else {
                VB.helper.find('.vbs-powered-by-label').removeClass('vbs-hidden-p');
            }
        });

        // Blur Searchbar
        VB.helper.find('#voice_search_txt').on('blur', function(e) {
            var words = VB.helper.getSearchWordsArray();
            if (words.length) {
                VB.view.searchWordWidget(words);
                VB.helper.find('.vbs-powered-by-label').addClass('vbs-hidden-p');
            } else {
                VB.helper.find('.vbs-markers, .vbs-search-word-widget').html('');
                VB.helper.find(".vbs-next-action-btn:not([class='vbs-next-notactive'])").addClass('vbs-next-notactive');
                VB.helper.find('.vbs-powered-by-label').removeClass('vbs-hidden-p');
            }
            var $this = $(this);
            $this.attr('data-val', $this.val());
            VB.helper.find('.vbs-widget-wrap').removeClass('focused');
            VB.helper.find('#vbs-search-string').show();
        });

        // Change Searchbar
        VB.helper.find('#voice_search_txt').on('change', function() {
            VB.helper.removeBold();
            if ($(this).val().length > 0) {
                VB.helper.find(".vbs-search-form").addClass('vbs-filled');
            } else {
                VB.helper.find(".vbs-search-form").removeClass('vbs-filled');
                $(this).css("opacity", "1");
                VB.helper.find('#vbs-search-string').hide();
                VB.helper.find('#voice_search_txt').focus();
            }
            if ($('#vbs-share-search').is(':checked')) {
                var newparam = {};
                newparam['vbs'] = encodeURI($(this).val());
                var url = VB.helper.getNewUrl(newparam);
                VB.helper.find('#vbsp-url').val(url);
                if (typeof addthis !== 'undefined') {
                    addthis.update('share', 'url', url);
                }
            }
            VB.helper.find('.vbs-kwe-add').remove();
            VB.helper.find('#vbs-search-string').show();
        });

        VB.helper.find('#vbs-search-btn').on('click', function(event) {
            event.preventDefault();
            VB.helper.find('#vbs-search-form').submit();
        });

        VB.helper.find('#vbs-search-form').on('submit', function() {
            VB.helper.showLoader();
            if(VB.helper.getStatus() == 'PLAYING'){
                VB.helper.pause();
            }
            VB.helper.find("#voice_search_txt").blur();
            VB.helper.find('.vbs-markers').html('');
            VB.helper.find(".vbs-next-action-btn:not([class='vbs-next-notactive'])").addClass('vbs-next-notactive');
            VB.helper.find('.vbs-kwe-add').remove();
            var words = VB.helper.getSearchWordsArray();

            if (words.length > 0) {
                VB.api.getSearch(words);
            }
            return false;
        });

        VB.helper.find('#vbs-search-string').on('click', function(event) {
            if ($(event.target).hasClass("vbs-search-word-widget") || VB.helper.find('#voice_search_txt').val().length == 0) {
                $(this).hide();
                VB.helper.find('#voice_search_txt').css("opacity", "1").focus();
            }
        });


        VB.helper.find(".vbs-topics").on('click', '.vbs-topics-list li[class="vbs-active"]', function(event) {
            event.preventDefault();
        });

        VB.helper.find(".vbs-topics").on('click', '.vbs-topics-list li[class!="vbs-active"]', function(event) {
            event.preventDefault();
            var li = $(this);
            if (li.hasClass('vbs-active') || li.hasClass('vbs-disabled')) {
                return false;
            }
            li.parent().find('.vbs-active').removeClass('vbs-active');
            li.addClass('vbs-active');
            var href = li.find('a');
            var catName = href.text().trim();
            VB.helper.find(".vbs-keywords-list-tab ul").removeClass('vbs-active');
            VB.helper.find('.vbs-keywords-list-tab ul[tid="' + catName + '"]').addClass('vbs-active');
            if (VB.settings.keywordsColumns == 'topics') {
                VB.helper.keywordsAutoTopicsColumns();
            }
            if (VB.settings.editKeywords) {
                $('.vbs-topic-delete-popup').fadeOut('fast', function() {
                    $(this).remove();
                });
            }
            VB.helper.filterSpeakersList(href.attr('speakers').split(','));
        });

        VB.helper.find(".vbs-keywords-list-tab").on('mouseenter touchstart', 'li.key a', function(e) {
            var target = $(e.target).is('span') ? $(e.target).parent() : $(e.target) ;
            var times = target.attr('t');
            VB.view.keywordHover(times);
        });

        VB.helper.find(".vbs-keywords-list-tab").on('mouseleave touchend', 'li.key a', function(e) {
            VB.view.removeKeywordHover();
        });


        if (VB.settings.topicHover == true) {
            VB.helper.find(".vbs-keywords-block").on({
                mouseover: function(e) {
                    var catName = $(this).text().trim();
                    var timesArray = [];
                    VB.helper.find('.vbs-keywords-list-tab ul[tid="' + catName + '"]').find('li.key a').each(function() {
                        timesArray.push($(this).attr('t'));
                    });

                    var uniqueNames = [];
                    $.each(timesArray.join().split(','), function(i, el) {
                        if ($.inArray(el, uniqueNames) === -1)
                            uniqueNames.push(el);
                    });
                    VB.view.keywordHover(uniqueNames.join());
                },
                mouseout: function(e) {
                    VB.view.removeKeywordHover();
                }
            }, '.vbs-topics-list li a');
        }

        VB.helper.find('.vbs-select-speaker').on('click', function(event) {
            event.preventDefault();
            var $this = $(this);
            if ($this.hasClass('vbs-s-show')) {
                VB.helper.find('.vbs-select-dropdown').fadeOut('fast');
                $this.removeClass('vbs-s-show');
            } else {
                VB.helper.find('.vbs-select-dropdown').fadeIn(100);
                $this.addClass('vbs-s-show');
            }
        });

        /*adjusting width of speaker select*/
        var $selectSpeaker = VB.helper.find('.vbs-select-speaker');
        var $searchBtn = VB.helper.find('.vbs-search-btn');
        var $widgetWrap = VB.helper.find('.vbs-widget-wrap');
        var widgetWrapPaddings = parseInt($widgetWrap.css('paddingLeft')) + parseInt($widgetWrap.css('paddingRight'));
        var searchBtnWidth = $searchBtn.width() + parseInt($searchBtn.css('borderLeft'));

        var selSpeakPaddings =  parseInt($selectSpeaker.css('paddingLeft')) + parseInt($selectSpeaker.css('paddingRight'));
        var selSpeakBorders =  parseInt($selectSpeaker.css('borderLeftWidth')) + parseInt($selectSpeaker.css('borderRightWidth'));

        var searchMinWidth = parseInt($widgetWrap.css('minWidth'));

        if($('#vbs-keywords').width() <= 437){
            $selectSpeaker.addClass('vbs-fixed-width');
            $widgetWrap.addClass('vbs-without-min-width')
        }
        if($('#vbs-keywords').width() <= 360){
            VB.helper.find('.vbs-search-form').addClass('less-360px');
        }

        VB.helper.find('.vbs-select-dropdown').on('click', 'li', function() {
            $selectSpeaker.css('width', 'auto');
            var $this = $(this);
            if($this.hasClass('vbs-disabled')){
                return false;
            }
            VB.helper.find('.vbs-select-dropdown').fadeOut('fast');
            var speaker_key = $this.attr("data-speaker");
            var label = speaker_key == 'all' ? 'Select speaker...' : $this.text();
            VB.helper.find('.vbs-select-speaker').removeClass('vbs-s-show').html(label);
            VB.helper.filterKeywords(speaker_key);

            /* adjusting positions of searching and search btn*/

            if($this.parents('#vbs-keywords').hasClass('less-600px')){

                if($this.parents('#vbs-keywords').width() <= 437){
                    return false;
                }else{
                    var selSpeakWidth = $selectSpeaker.width() + selSpeakPaddings + selSpeakBorders;
                    var searchMarginRight = 12;
                    $searchBtn.css('right', selSpeakWidth + searchMarginRight);
                    $widgetWrap.css('marginRight', selSpeakWidth + searchBtnWidth + searchMarginRight);

                    if($widgetWrap.width() <= searchMinWidth){
                        var keywordsWidth = VB.helper.find('.vbs-keywords-block').width();

                        var searchBorders = parseInt(VB.helper.find('.vbs-widget-wrap').css('borderLeftWidth')) + parseInt(VB.helper.find('.vbs-widget-wrap').css('borderRightWidth'));

                        var fixedWidthSelSpeaker = keywordsWidth - (searchMinWidth + searchBorders + searchBtnWidth + searchMarginRight + selSpeakBorders + selSpeakPaddings + widgetWrapPaddings);

                        $selectSpeaker.css('width', fixedWidthSelSpeaker);
                        $searchBtn.css('right', fixedWidthSelSpeaker + selSpeakPaddings + selSpeakBorders + searchMarginRight);
                        $widgetWrap.css('marginRight', fixedWidthSelSpeaker + selSpeakPaddings + selSpeakBorders + searchBtnWidth + searchMarginRight);
                    }
                }

            }else{

                selSpeakWidth = $selectSpeaker.width() + selSpeakPaddings + selSpeakBorders;

                $searchBtn.css('right', selSpeakWidth);
                $widgetWrap.css('marginRight', selSpeakWidth + searchBtnWidth);

                if($widgetWrap.width() <= searchMinWidth){
                    keywordsWidth = VB.helper.find('.vbs-keywords-block').width() - parseInt(VB.helper.find('.vbs-keywords-block .vbs-section-header').css('borderLeftWidth')) - parseInt(VB.helper.find('.vbs-keywords-block .vbs-section-header').css('borderRightWidth'));

                    var keywordsTitleWidth = VB.helper.find('.vbs-keywords-block .vbs-section-title').width() + parseInt(VB.helper.find('.vbs-keywords-block .vbs-search-form').css('borderLeftWidth'));

                    fixedWidthSelSpeaker = keywordsWidth - (keywordsTitleWidth + searchBtnWidth + searchMinWidth + selSpeakBorders + selSpeakPaddings + widgetWrapPaddings + 1);

                    $selectSpeaker.css('width', fixedWidthSelSpeaker);
                    $searchBtn.css('right', fixedWidthSelSpeaker + selSpeakPaddings + selSpeakBorders);
                    $widgetWrap.css('marginRight', fixedWidthSelSpeaker + selSpeakPaddings + selSpeakBorders + searchBtnWidth);
                }
            }

        });

        if (VB.settings.editKeywords) {
            $(document).on('click', ".vbs-voicebase_up", function() {
                if (typeof VB.settings.webHooks.keywordUp != 'undefined') {
                    VB.settings.webHooks.keywordUp();
                    return false;
                }
                var $this = $(this);
                var txt = $this.parent().attr('data-elem-text');
                var elem = VB.helper.find('.vbs-keywords-list-tab ul.vbs-active li a[in="' + txt + '"]');
                if (VB.helper.find('.vbs-topics')) {
                    var ecat = VB.helper.find(".vbs-topics-list li.vbs-active").text();
                }
                var ekey = $(elem).text();
                VB.api.editKeyword('up', ekey, ecat, elem);
            });

            $(document).on('click', ".vbs-voicebase_down", function() {
                if (typeof VB.settings.webHooks.keywordDown != 'undefined') {
                    VB.settings.webHooks.keywordDown();
                    return false;
                }
                var $this = $(this);
                var txt = $this.parent().attr('data-elem-text');
                var elem = VB.helper.find('.vbs-keywords-list-tab ul.vbs-active li a[in="' + txt + '"]');
                if (VB.helper.find('.vbs-topics')) {
                    var ecat = VB.helper.find(".vbs-topics-list li.vbs-active").text();
                }
                var ekey = $(elem).text();
                VB.api.editKeyword('down', ekey, ecat, elem);
            });

            $(document).on('click', ".vbs-voicebase_first", function() {
                if (typeof VB.settings.webHooks.keywordFirst != 'undefined') {
                    VB.settings.webHooks.keywordFirst();
                    return false;
                }
                var $this = $(this);
                var txt = $this.parent().attr('data-elem-text');
                var elem = VB.helper.find('.vbs-keywords-list-tab ul.vbs-active li a[in="' + txt + '"]');
                if (VB.helper.find('.vbs-topics')) {
                    var ecat = VB.helper.find(".vbs-topics-list li.vbs-active").text();
                }
                var ekey = $(elem).text();
                VB.api.editKeyword('first', ekey, ecat, elem);
            });

            $(document).on('click', ".vbs-voicebase_remove", function(event) {
                event.preventDefault();
                if (typeof VB.settings.webHooks.removeKeyword != 'undefined') {
                    VB.settings.webHooks.removeKeyword();
                    return false;
                }
                var $this = $(this);
                var txt = $this.parent().attr('data-elem-text');
                var elem = VB.helper.find('.vbs-keywords-list-tab ul.vbs-active li a[in="' + txt + '"]');
                if (VB.helper.find('.vbs-topics')) {
                    var ecat = VB.helper.find(".vbs-topics-list li.vbs-active").text();
                }
                var ekey = $(elem).text();
                VB.api.removeKeyword(ekey, ecat, elem);
            });

            $(document).on('click', ".vbs-topic-del-btn-wrap .vbs-cross-btn", function(event) {
                event.preventDefault();
                var $rmblock = $('.vbs-topic-delete-popup');
                var $this = $(this);

                if ($rmblock.length) {
                    $rmblock.fadeOut('fast', function() {
                        $rmblock.remove();
                    });
                } else {
                    $(document).find('.vbs-popup').hide();
                    $(document).find('.vbs-popup').siblings('a').removeClass('vbs-active');
                    /*appending del popup in the <body>*/
                    $(VB.templates.parse('deleteTopicPopup', {topicname: $this.parents('li').find('a').text()})).appendTo('body');
                    /*position of popup*/
                    var delBtnTopPos = $(this).offset().top;
                    var delBtnLeftPos = $(this).offset().left;
                    $('.vbs-topic-delete-popup').css({
                        'top': delBtnTopPos + 'px',
                        'left': delBtnLeftPos + 'px'
                    });
                    /*hiding popup if scroll happens*/
                    VB.helper.find('.vbs-edit-topics').scroll(function() {
                        $('.vbs-topic-delete-popup').fadeOut('fast', function() {
                            $(this).remove();
                        });
                    });
                }
            });

            $(document).on('click', ".vbs-add-search-word", function(event) {
                event.preventDefault();
                VB.api.addKeywords($(this).attr('data-kwa'), $(this).attr('data-kwt'));
            });
        }

        $(document).on('click', ".vbs-topic-delete-popup .vbs-confirm-btn", function(event) {
            event.preventDefault();
            $('.vbs-topic-delete-popup').fadeOut('fast', function() {
                $(this).remove();
            });
        });

        $(document).on('click', ".vbs-topic-delete-popup .vbs-cancel-btn", function(event) {
            event.preventDefault();
            if (typeof VB.settings.webHooks.removeTopic != 'undefined') {
                VB.settings.webHooks.removeTopic();
                return false;
            }
            var $this = $(this);
            var cat = $this.parents('.vbs-topic-delete-popup').attr('data-topic');
            VB.api.removeTopic(cat);
        });

        //* Transcript events *//
        VB.helper.find('.vbs-transcript-block .vbs-transcript-wrapper').on('click', 'span.w', function() {
            if(VB.helper.getStatus() == 'PLAYING'){
                VB.helper.pause();
            }
            VB.helper.showLoader();
            VB.helper.find('.vbs-markers').html('');
            VB.helper.find(".vbs-next-action-btn:not([class='vbs-next-notactive'])").addClass('vbs-next-notactive');
            var $this = $(this);
            var stime = $this.attr('t') / 1000;

            stime = stime > 1 ? stime - 1 : stime;
            VB.helper.find(".vbs-player-slider").css("left", stime / VB.data.duration * 100 + "%");
            VB.helper.find(".vbs-record-progress").css("width", stime / VB.data.duration * 100 + "%");

            VB.helper.seek(stime);
            var word = $this.text().trim();
            VB.helper.track('transcript', word);
            if (word.match(/\s+/g)) {
                word = '"' + word + '"';
            }
            VB.helper.find('#voice_search_txt').val(word).change();
            if (word.length) {
                VB.view.searchWordWidget([word]);
            }
            VB.helper.find('#voice_search_txt').attr('data-val', VB.helper.find('#voice_search_txt').val());
            VB.api.getSearch([word], false);
            return false;
        });

        VB.helper.find(".vbs-transcript-block .vbs-section-title").on('click', function() {
            var $this = $(this);
            $this.toggleClass('vbs-hidden');
            if ($this.hasClass('vbs-hidden')) {
                $this.attr('data-title', 'Show Transcript');
                $this.parents('.vbs-transcript-block').find('.vbs-section-body').slideUp();
            } else {
                $this.attr('data-title', 'Hide Transcript');
                $this.parents('.vbs-transcript-block').find('.vbs-section-body').slideDown();
            }
        });

        VB.helper.find(".vbs-transcript-block .vbs-more-btn a").on('click', function(event) {
            event.preventDefault();
            var maxTH = VB.helper.find('.vbs-transcript-wrapper').height();
            var $this = $(this);
            if (VB.data.tf) {
                VB.data.tf = false;
                $this.text('Show More...');
                $(".vbs-transcript-prewrapper").animate({height: VB.settings.transcriptHeight + "px"}, 700);
            } else {
                $(".vbs-transcript-prewrapper").animate({height: maxTH + 20 + "px"}, 700, "linear", function() {
                    $(this).css({height: "auto"});
                });
                $this.text('Hide More...');
                VB.data.tf = true;
            }
        });

        VB.helper.find(".vbs-transcript-block .vbs-transcript-prewrapper").on({
            mouseover: function(e) {
                $(this).addClass('vbs-t-hover');
            },
            mouseout: function(e) {
                $(this).removeClass('vbs-t-hover');
            }
        });

        //* Buttons Events *//
        VB.helper.find('.vbs-section-btns').on('click', '.vbs-cloud-btn', function(event) {
            event.preventDefault();
            if (typeof VB.settings.webHooks.downloadMedia != 'undefined') {
                VB.settings.webHooks.downloadMedia();
                return false;
            }
            var $this = $(this);
            if ($this.hasClass('vbs-active')) {
                $this.removeClass('vbs-active');
                $this.parent().find('.vbs-download-popup').fadeOut('fast');
            } else {
                $this.addClass('vbs-active');
                $this.parent().find('.vbs-download-popup').fadeIn('fast');
            }
        });

        // Dowload transcript
        VB.helper.find('.vbs-download-popup').on('click', '.vbs-donwload-pdf, .vbs-donwload-rtf, .vbs-donwload-srt', function(event) {
            event.preventDefault();
            VB.helper.find('.vbs-cloud-btn').removeClass('vbs-active');
            VB.helper.find('.vbs-download-popup').fadeOut('fast');
            var format = $(this).attr('format')
            VB.helper.downloadFile(format);
        });

        // Donwload Audio
        VB.helper.find('.vbs-media-block').on('click', '.vbs-download-audio-btn', function(event) {
            event.preventDefault();
            if (typeof VB.settings.webHooks.downloadTranscript != 'undefined') {
                VB.settings.webHooks.downloadTranscript();
                return false;
            }
            VB.api.downloadAudio();
        });

        // Share
        VB.helper.find('.vbs-share-btn-wrapper').on('click', '.vbs-share-btn', function(event) {
            event.preventDefault();
            if (typeof VB.settings.webHooks.socialShare != 'undefined') {
                VB.settings.webHooks.socialShare();
                return false;
            }
            var newparam = {};
            var ltime = VB.helper.getPosition();
            newparam['vbt'] = Math.round(ltime);
            var url = VB.helper.getNewUrl(newparam);
            var vbspTime = VB.helper.parseTime(Math.round(ltime));
            var zclipBox = typeof $.fn.zclip !== 'undefined' ? '' : 'vbs-no-zclip';
            var shareButtonsString = '';
            for (var atb in VB.settings.addThisButtons) {
                shareButtonsString += '<a class="addthis_button_' + VB.settings.addThisButtons[atb] + '"></a>';
            }

            var addthisBox = typeof addthis !== 'undefined' ? '<div class="vbs-share-social-row vbs-clearfix">\n\
                        <span>Choose one:</span>\n\
                        <div class="vbs-social-wrapper">\n\
                            <div class="vbs-addthis-toolbox addthis_toolbox addthis_default_style">' +
                    shareButtonsString +
                    '<a class="addthis_counter addthis_bubble_style"></a>\n\
                            </div>\n\
                        </div>\n\
                    </div>' : '';
            var vbShareButton = VB.settings.voicebaseShare ? '<span>or</span><a href="#" class="vbs-voicebase-share-btn">Share with E-mail</a>' : '';
            var html = VB.templates.parse('sharePopup', {"vbt": newparam['vbt'], "vbspTime": vbspTime, "zclip": zclipBox, "addthis": addthisBox, "url": url, "vbShareButton": vbShareButton});

            if (VB.helper.find('.vbs-share-popup').length === 0 || VB.helper.find('.vbs-share-popup').hasClass('vbs-hidden')) {
                VB.helper.find('.vbs-share-popup.vbs-hidden').remove();
                VB.helper.find('.vbs-share-btn-wrapper').append(html);
                if (typeof $.fn.zclip !== 'undefined') {
                    VB.helper.find(".vbs-copy-btn").zclip({
                        path: VB.settings.zeroClipboardSwfPath,
                        copy: function() {
                            return VB.helper.find('#vbsp-url').val();
                        }
                    });
                }
                if (typeof addthis !== 'undefined') {
                    addthis.toolbox('.vbs-addthis-toolbox', {}, {'url': url, 'title': VB.settings.shareTitle});
                }
            } else {
                VB.helper.find('.vbs-share-popup').fadeOut('fast', function() {
                    VB.helper.find('.vbs-share-popup').addClass('vbs-hidden').show();
                });
            }
        });

        $(document).on('click', '#vbs-share-position', function() {
            VB.helper.find(".vbs-share-popup .vbs-share-radio-row").removeClass('vbs-checked');
            $(this).parents('.vbs-share-radio-row').addClass('vbs-checked');
            var newparam = {};
            newparam['vbt'] = Math.round(ltime);
            var vbspTime = helper.parseTime(Math.round(ltime));
            var url = VB.helper.getNewUrl(newparam);
            VB.helper.find('#vbsp-url').val(url);
            if (typeof addthis !== 'undefined') {
                addthis.update('share', 'url', url);
            }
            VB.helper.find('.vbsp-time').html(vbspTime).attr('vbct', vbspTime);
        });
        $(document).on('click', '#vbs-share-search', function() {
            VB.helper.find(".vbs-share-popup .vbs-share-radio-row").removeClass('vbs-checked');
            $(this).parents('.vbs-share-radio-row').addClass('vbs-checked');
            var newparam = {};
            newparam['vbs'] = encodeURI($('#voice_search_txt').val());
            var url = VB.helper.getNewUrl(newparam);
            VB.helper.find('#vbsp-url').val(url);
            if (typeof addthis !== 'undefined') {
                addthis.update('share', 'url', url);
            }
        });
        $(document).on('click', '#vbs-share-file', function() {
            VB.helper.find(".vbs-share-popup .vbs-share-radio-row").removeClass('vbs-checked');
            $(this).parents('.vbs-share-radio-row').addClass('vbs-checked');
            var newparam = {};
            newparam['vbt'] = 0;
            var url = VB.helper.getNewUrl(newparam);
            VB.helper.find('#vbsp-url').val(url);
            if (typeof addthis !== 'undefined') {
                addthis.update('share', 'url', url);
            }
        });

        VB.helper.find('.vbs-share-btn-wrapper').on('click', '.vbs-cancel-btn', function(event) {
            event.preventDefault();
            VB.helper.find('.vbs-share-popup').fadeOut('fast', function() {
                VB.helper.find('.vbs-share-popup').addClass('vbs-hidden').show();
            });
        });

        VB.helper.find('.vbs-share-btn-wrapper').on('click', '.vbs-addthis-toolbox a', function(event) {
            VB.helper.find('.vbs-share-popup').fadeOut('fast', function() {
                VB.helper.find('.vbs-share-popup').addClass('vbs-hidden').show();
            });
        });

        VB.helper.find('.vbs-share-btn-wrapper').on('click', '.vbsp-url', function(event) {
            event.preventDefault();
            $(this).select();
        });

        // Share play
        var vbspPlay;
        VB.helper.find('.vbs-share-btn-wrapper').on('click', '.vbs-play-btn', function(event) {
            event.preventDefault();
            clearTimeout(vbspPlay);
            vbspPlay = setTimeout(function() {
                VB.helper.seek($('.vbsp-time').attr('vbct'));
            }, 250);
        });

        // Share VoiceBase
        VB.helper.find('.vbs-share-btn-wrapper').on('click', '.vbs-voicebase-share-btn', function(event) {
            event.preventDefault();
            if (typeof VB.settings.webHooks.vbShare != 'undefined') {
                VB.settings.webHooks.vbShare();
                if (typeof VB.settings.webHooks.vbShareClose == 'undefined' || (typeof VB.settings.webHooks.vbShareClose != 'undefined' && VB.settings.webHooks.vbShareClose == true)) {
                    VB.helper.find('.vbs-share-popup').fadeOut('fast', function() {
                        VB.helper.find('.vbs-share-popup').addClass('vbs-hidden').show();
                    });
                }
                return false;
            }
            alert('Default Voicebase Share action');
        });

        // Delete media popup
        VB.helper.find('.vbs-section-btns').on('click', '.vbs-del-btn', function(event) {
            event.preventDefault();
            var $this = $(this);
            if ($this.hasClass('vbs-active')) {
                $this.removeClass('vbs-active');
                $this.parent().find('.vbs-download-popup').fadeOut('fast');
            } else {
                $this.addClass('vbs-active');
                $this.parent().find('.vbs-download-popup').fadeIn('fast');
            }
        });

        // Delete media action
        VB.helper.find('.vbs-section-btns').on('click', '.vbs-red-btn', function(event) {
            event.preventDefault();
            VB.helper.find('.vbs-section-btns .vbs-del-btn').removeClass('vbs-active');
            $(this).parents('.vbs-popup').fadeOut('fast');
            if (typeof VB.settings.webHooks.remove != 'undefined') {
                VB.settings.webHooks.remove();
                return false;
            }
            alert('Default delete action');
        });

        // Delete media cancel
        VB.helper.find('.vbs-section-btns').on('click', '.vbs-blue-btn', function(event) {
            event.preventDefault();
            VB.helper.find('.vbs-section-btns .vbs-del-btn').removeClass('vbs-active');
            $(this).parents('.vbs-popup').fadeOut('fast');
        });

        // Favorite
        VB.helper.find('.vbs-section-btns').on('click', '.vbs-star-btn', function(event) {
            event.preventDefault();
            var $this = $(this);
            if ($this.hasClass('vbs-active')) {
                if (typeof VB.settings.webHooks.favoriteTrue != 'undefined') {
                    VB.settings.webHooks.favoriteTrue();
                    return false;
                }
                VB.api.favorite(false);
            } else {
                if (typeof VB.settings.webHooks.favoriteFalse != 'undefined') {
                    VB.settings.webHooks.favoriteFalse();
                    return false;
                }
                VB.api.favorite(true);
            }
        });

        // Help
        VB.helper.find('.vbs-section-btns').on('click', '.vbs-help-btn', function(event) {
            event.preventDefault();
            if (typeof VB.settings.webHooks.help != 'undefined') {
                VB.settings.webHooks.help();
                return false;
            }
            alert('Default help action');
        });

        // Fullscreen btn
        VB.helper.find('.vbs-section-btns').on('click', '.vbs-expand-btn', function(event) {
            event.preventDefault();
            if (typeof VB.settings.webHooks.fullscreen != 'undefined') {
                VB.settings.webHooks.fullscreen();
                return false;
            }
            $('body').addClass('vbs-fullscreen');
            $('#' + VB.settings.controlsBlock).append($('.vbs-search-form')).append('<a href="#" class="vbs-fullscreen-exit">Exit</a>').wrap('<div class="vbs-controls-wrapper"></div>').addClass('vbs-controls-box');
            if ($('#' + VB.settings.controlsBlock).hasClass('less-600px')) {
                $('#' + VB.settings.controlsBlock).removeClass('less-600px').addClass('less-600px-backup');
            }
            VB.view.resizeTimelineElements();
        });

        // Fullscreen exit
        $(document).on('click', '.vbs-fullscreen-exit', function(event) {
            event.preventDefault();
            if (typeof VB.settings.webHooks.fullscreenExit != 'undefined') {
                VB.settings.webHooks.fullscreenExit();
                return false;
            }
            $('body').removeClass('vbs-fullscreen');
            $(this).remove();
            $('#' + VB.settings.controlsBlock).unwrap().removeClass('vbs-controls-box');
            $('.vbs-keywords-block .vbs-section-title').after($('.vbs-search-form'));
            if ($('#' + VB.settings.controlsBlock).hasClass('less-600px-backup')) {
                $('#' + VB.settings.controlsBlock).removeClass('less-600px-backup').addClass('less-600px');
            }
            VB.view.resizeTimelineElements();
        });

        /*reader mode*/
        VB.helper.find('.vbs-section-btns').on('click', '.vbs-readermode-btn', function(event) {
            event.preventDefault();
            if (typeof VB.settings.webHooks.readermode != 'undefined') {
                VB.settings.webHooks.readermode();
                return false;
            }
            $('body').addClass('vbs-readermode');
            $('#' + VB.settings.controlsBlock).append($('.vbs-search-form')).append('<a href="#" class="vbs-reader-exit">Exit</a>').wrap('<div class="vbs-controls-wrapper"></div>').addClass('vbs-controls-box');
            if ($('#' + VB.settings.controlsBlock).hasClass('less-600px')) {
                $('#' + VB.settings.controlsBlock).removeClass('less-600px').addClass('less-600px-backup');
            }
            VB.view.resizeTimelineElements();
        });
        $(document).on('click', '.vbs-reader-exit', function(event) {
            event.preventDefault();
            if (typeof VB.settings.webHooks.readermodeExit != 'undefined') {
                VB.settings.webHooks.readermodeExit();
                return false;
            }
            $('body').removeClass('vbs-readermode');
            $(this).remove();
            $('#' + VB.settings.controlsBlock).unwrap().removeClass('vbs-controls-box');
            $('.vbs-keywords-block .vbs-section-title').after($('.vbs-search-form'));
            if ($('#' + VB.settings.controlsBlock).hasClass('less-600px-backup')) {
                $('#' + VB.settings.controlsBlock).removeClass('less-600px-backup').addClass('less-600px');
            }
            VB.view.resizeTimelineElements();
        });

        //* Comments events *//
        VB.helper.find(".vbs-comments-block .vbs-section-title").on('click', function() {
            var $this = $(this);
            $this.toggleClass('vbs-hidden');
            if ($this.hasClass('vbs-hidden')) {
                $this.attr('data-title', 'Show Comments');
                $this.parents('.vbs-comments-block').find('.vbs-section-body').slideUp();
            } else {
                $this.attr('data-title', 'Hide Comments');
                $this.parents('.vbs-comments-block').find('.vbs-section-body').slideDown();
            }
        });

        VB.helper.find('.vbs-comments-block .vbs-section-btns').on('click', '.vbs-comments-btn', function(event) {
            event.preventDefault();
            if (typeof VB.settings.webHooks.comment != 'undefined') {
                VB.settings.webHooks.comment();
                return false;
            }
            var newparam = {};
            var ltime = VB.data.position;
            newparam['vbt'] = Math.round(ltime);
            var vbspTime = VB.helper.parseTime(Math.round(ltime));

            var html = VB.templates.parse('commentPopup', {"vbt": newparam['vbt'], "vbspTime": vbspTime});

            if (VB.helper.find('.vbs-comments-popup').length === 0 || VB.helper.find('.vbs-comments-popup').hasClass('vbs-hidden')) {
                VB.helper.find('.vbs-comments-popup.vbs-hidden').remove();
                VB.helper.find('.vbs-comments-block .vbs-section-btns .vbs-clearfix li').append(html);
                VB.helper.find('.vbs-comments-block .vbs-section-btns .vbs-comments-btn').addClass('vbs-active');
                VB.helper.find('.vbs-comments-popup').show();
            } else {
                VB.helper.find('.vbs-comments-popup').fadeOut('fast', function() {
                    VB.helper.find('.vbs-comments-block .vbs-section-btns .vbs-comments-btn').removeClass('vbs-active');
                    VB.helper.find('.vbs-comments-popup').addClass('vbs-hidden');
                });
            }
        });

        VB.helper.find('.vbs-comments-block').on('click', '.vbs-section-header .vbs-confirm-btn', function(event) {
            event.preventDefault();

            var parent_div = $(this).parent(".vbs-comment-footer").parent(".vbs-comments-popup"),
                    comment_data = {},
                    comment_text = parent_div.find("#vbs-comment-text").val(),
                    comment_timestamp = parent_div.find("#vbs-comment-timeline").attr("vbct");

            if (comment_text == "") {
                alert("Text of comment is required.");
                return false;
            } else {
                VB.helper.find('.vbs-comments-popup').fadeOut('fast', function() {
                    VB.helper.find('.vbs-comments-block .vbs-section-btns .vbs-comments-btn').removeClass('vbs-active');
                    VB.helper.find('.vbs-comments-popup').addClass('vbs-hidden');
                });
            }

            comment_data['comment'] = comment_text;
            comment_data['comment_timestamp'] = comment_timestamp;
            comment_data['parent_comment_id'] = false;

            VB.api.addComment(comment_data);
        });

        var vbspPlayForComments;
        VB.helper.find('.vbs-comments-block').on('click', '.vbs-play-btn', function(event) {
            event.preventDefault();
            var _this = $(this);
            clearTimeout(vbspPlayForComments);
            vbspPlayForComments = setTimeout(function() {
                VB.helper.seek(_this.parent('.vbs-comment-popup-row').find('#vbs-comment-timeline').attr('vbct'));
            }, 250);
        });

        VB.helper.find('.vbs-comments-block').on('click', '.vbs-comment-reply', function(event) {
            event.preventDefault();
            if (typeof VB.settings.webHooks.comment != 'undefined') {
                VB.settings.webHooks.comment();
                return false;
            }

            var html = VB.templates.parse('commentReplyPopup', {"c_id": $(this).attr('c_id')});

            var parent_div = $(this).parent('.vbs-comment-reply-wrapper');

            if (parent_div.find('.vbs-comments-popup').length === 0) {
                VB.helper.find('.vbs-comments-popup').addClass('old_reply_popup');
                parent_div.append(html);
                parent_div.find('.vbs-comments-popup').show();
            } else {
                parent_div.find('.vbs-comments-popup').remove();
            }
            VB.helper.find('.vbs-comments-popup.old_reply_popup').remove();
        });

        // EDIT COMMENT BTN
        VB.helper.find('.vbs-comments-block').on('click', '.vbs-comment-edit', function(event) {
            event.preventDefault();
            if (typeof VB.settings.webHooks.commentEdit != 'undefined') {
                VB.settings.webHooks.commentEdit();
                return false;
            }
            var $this = $(this);
            var ctm = $this.attr('c_tm');
            var vbspTime = VB.helper.parseTime(Math.round(ctm));
            var commentBlock = $this.parents('.vbs-comment-row');
            var commentText = commentBlock.find('.vbs-comment-message p').text();
            var html = commentBlock.hasClass('vbs-answer1') ? VB.templates.parse('commentEditFirstPopup', {c_id: $this.attr('c_id'), vbt: ctm, vbspTime: vbspTime, commentText: commentText}) : vbView.parseTemplate('commentEditPopup', {c_id: $this.attr('c_id'), vbt: ctm, vbspTime: vbspTime, commentText: commentText});
            var parent_div = $(this).parent('.vbs-comment-edit-btn-wrapper');
            if (parent_div.find('.vbs-comments-popup').length === 0) {
                VB.helper.find('.vbs-comments-popup').addClass('old_reply_popup');
                parent_div.append(html);
                parent_div.find('.vbs-comments-popup').show();
                parent_div.find('textarea').focus();
            } else {
                parent_div.find('.vbs-comments-popup').remove();
            }
            VB.helper.find('.vbs-comments-popup.old_reply_popup').remove();
        });

        // CANCEL BTN
        VB.helper.find('.vbs-comments-block').on('click', '.vbs-section-header .vbs-cancel-btn, .vbs-comment-reply-wrapper .vbs-cancel-btn, .vbs-comment-edit-btn-wrapper .vbs-cancel-btn, .vbs-comment-delete-btn-wrapper .vbs-confirm-btn', function(event) {
            event.preventDefault();
            var $popup = $(this).parents('.vbs-comments-popup');
            $popup.fadeOut('fast', function() {
                VB.helper.find('.vbs-comments-block .vbs-section-btns .vbs-comments-btn').removeClass('vbs-active');
                $popup.addClass('vbs-hidden');
                $popup.remove();
            });
        });

        // REPLY BTN
        VB.helper.find('.vbs-comments-block').on('click', '.vbs-comment-reply-wrapper .vbs-confirm-btn', function(event) {
            event.preventDefault();
            var parent_div = $(this).parent(".vbs-comment-footer").parent(".vbs-comments-popup"),
                    comment_data = {},
                    comment_text = parent_div.find("#vbs-comment-reply-text").val(),
                    parent_comment_id = $(this).attr("c_id");
            if (comment_text == "") {
                alert("Text of comment is required.");
                return false;
            } else {
                $(this).parent('.vbs-comment-footer').parent('.vbs-comments-popup').parent('.vbs-comment-reply-wrapper').find('.vbs-comments-popup').remove();
            }
            comment_data['comment'] = comment_text;
            comment_data['comment_timestamp'] = false;
            comment_data['parent_comment_id'] = parent_comment_id;
            VB.api.addComment(comment_data);
        });

        // EDIT COMMENT
        VB.helper.find('.vbs-comments-block').on('click', '.vbs-comment-edit-btn-wrapper .vbs-confirm-btn', function(event) {
            event.preventDefault();
            var parent_div = $(this).parents(".vbs-comments-popup"),
                    comment_data = {},
                    comment_text = parent_div.find("textarea").val(),
                    comment_id = $(this).attr("c_id");
            if (comment_text == "") {
                alert("Text of comment is required.");
                return false;
            }
            comment_data['comment'] = comment_text;
            comment_data['comment_timestamp'] = false;
            comment_data['comment_id'] = comment_id;
            parent_div.find("textarea").attr('disabled', true);
            VB.api.data.tmp.commentParent = parent_div;
            VB.api.data.tmp.commentData = comment_data;
            VB.api.editComment(comment_data);
        });

        // DELETE COMMENT BTN
        VB.helper.find('.vbs-comments-block').on('click', '.vbs-comment-delete', function(event) {
            event.preventDefault();
            var $this = $(this);
            var html = VB.templates.parse('commentDeletePopup', {c_id: $this.attr('c_id')});
            var parent_div = $(this).parent('.vbs-comment-delete-btn-wrapper');

            if (parent_div.find('.vbs-comments-popup').length === 0) {
                VB.helper.find('.vbs-comments-popup').addClass('old_reply_popup');
                parent_div.append(html);
                parent_div.find('.vbs-comments-popup').show();
            } else {
                parent_div.find('.vbs-comments-popup').remove();
            }
            VB.helper.find('.vbs-comments-popup.old_reply_popup').remove();
        });

        // DELETE CONFIRM
        VB.helper.find('.vbs-comments-block').on('click', '.vbs-comment-delete-btn-wrapper .vbs-cancel-btn', function(event) {
            event.preventDefault();
            if (typeof VB.settings.webHooks.commentDelete != 'undefined') {
                VB.settings.webHooks.commentDelete();
                return false;
            }
            var comment_id = $(this).attr("c_id");
            VB.api.deleteComment(comment_id);
        });

        // Evernote
        VB.helper.find('.vbs-section-btns').on('click', '.vbs-evernote-btn', function(event) {
            event.preventDefault();
            if (typeof VB.settings.webHooks.evernote != 'undefined') {
                VB.settings.webHooks.evernote();
                return false;
            }
            if (typeof filepicker !== 'undefined') {
                var evtitle = VB.api.response.metadata != null && VB.api.response.metadata.response.title != '' ? VB.api.response.metadata.response.title : 'VoiceBase';
                filepicker.exportFile(VB.api.getAutoNotesHtmlURL(), {service: 'EVERNOTE', suggestedFilename: evtitle});
            }
        });

        // Edit transcript
        VB.helper.find('.vbs-section-btns').on('click', '.vbs-edit-btn', function(event) {
            event.preventDefault();
            if (typeof VB.settings.webHooks.editTranscript != 'undefined') {
                VB.settings.webHooks.editTranscript();
                return false;
            }

            VB.helper.find('.vbs-edit-mode-prewrapper').html(VB.templates.parse('vbs-edit-trans-mode', {ourtranscript: VB.helper.editTranscriptText()}));
            $('body').addClass('vbs-no-scroll');
        });

        // Edit transcript exit
        VB.helper.find('.vbs-transcript-block').on('click', '.vbs-edit-mode-exit', function(event) {
            event.preventDefault();
            if (typeof VB.settings.webHooks.editTranscriptExit != 'undefined') {
                VB.settings.webHooks.editTranscriptExit();
                return false;
            }

            VB.helper.find('.vbs-edit-mode-prewrapper').html("");
            $('body').removeClass('vbs-no-scroll');
        });
        
        // Edit transcript Save popup
        VB.helper.find('.vbs-transcript-block').on('click', '.vbs-save-edition-popup-trigger', function(event) {
            event.preventDefault();
            VB.helper.find('.vbs-save-popup-wrapper').fadeIn('fast');
        });

        // Edit transcript Cancel
        VB.helper.find('.vbs-transcript-block').on('click', '.vbs-cancel-edition-btn', function(event) {
            event.preventDefault();
            VB.helper.find('.vbs-save-popup-wrapper').fadeOut('fast');
        });

        // Edit transcript Discard Changes
        VB.helper.find('.vbs-transcript-block').on('click', '.vbs-discard-edition-btn', function(event) {
            event.preventDefault();
            VB.helper.find('.vbs-edit-mode-prewrapper').html(VB.templates.parse('vbs-edit-trans-mode', {ourtranscript: VB.helper.editTranscriptText()}));
        });

        // Edit transcript Save Changes
        VB.helper.find('.vbs-transcript-block').on('click', '.vbs-save-edition-btn', function(event) {
            event.preventDefault();
            VB.helper.find('.vbs-save-popup-wrapper .vbs-save-popup').fadeOut('fast');
            VB.helper.find('.vbs-save-popup-wrapper .vbs-save-loading-popup').fadeIn('fast');
            VB.helper.saveTranscript();
        });

        // Print
        $('.vbs-section-btns').on('click', '.vbs-print-btn', function(event) {
            event.preventDefault();
            if (typeof VB.settings.webHooks.print != 'undefined') {
                VB.settings.webHooks.print();
                return false;
            }
            VB.helper.downloadFile('pdf');
        });

        // Order
        $('.vbs-transcript-block').on('click', '.vbs-order-human-trans a', function(event) {
            if (typeof VB.settings.webHooks.orderTranscript != 'undefined') {
                VB.settings.webHooks.orderTranscript();
                return false;
            }
        });

        //* Other Events *//
        $(document).on('click', '.vbs-reload-overlay,.vbs-white-popup-overlay', function() {
            var $this = $(this);
            $this.fadeOut('fast', function() {
                $this.remove();
            });
        });

        // Context menu

        if (VB.settings.contextMenu || VB.settings.editKeywords) {
            VB.helper.find(".vbs-record-timeline-wrap").on("contextmenu taphold", function(event) {
                vbmenus(event, 'timeline', this);
            });
            VB.helper.find('.vbs-keywords-wrapper').on("contextmenu taphold", ".vbs-keywords-list-wrapper li a", function(event) {
                vbmenus(event, 'keyword', this);
            });
            VB.helper.find('.vbs-transcript-prewrapper').on("contextmenu taphold", ".vbs-transcript-wrapper span.w", function(event) {
                vbmenus(event, 'transcript', this);
            });
            $(document).on("click", function() {
                $("ul.vbs-vbcmenu").css({'top': '-5000px'});
            });
        }

        // Edit Events
        VB.helper.find(".vbs-transcript-block").on("contextmenu taphold", '.vbs-edition-block span.vbs-wd', function(event) {
            event.preventDefault();
            vbEditMenu(event, this);
        });

        $(document).on('click', '.vbsc-edit-play', function(event) {
            event.preventDefault();
            var stime = $(this).attr('data-time');
            VB.helper.seek(stime);
        });

        $(document).on('click', '.vbsc-edit-speaker', function(event) {
            event.preventDefault();
            var stime = $(this).attr('data-time');
            var selected = VB.helper.find('.vbs-edition-block .vbs-wd[t=' + stime + ']');
            var insertText = '<span class="w vbs-wd vbs-edit-speaker" t="' + stime + '"><br><br>NewSpeaker:</span> ';
            selected.before(insertText);
        });

        if (VB.settings.debug) {
            VB.helper.find(".vbs-play-btn").on("contextmenu taphold", function(event) {
                event.preventDefault();
                VB.helper.debug();
            });
        }
    }
    /*** End events ***/

    VB.templates = {
        parse: function(id, vars) {
            var template = this.get(id);
            for (var i in vars) {
                var rex = new RegExp("{{\\s*" + i + "\\s*}}", "gi");
                template = template.replace(rex, vars[i]);
            }
            return template;
        },
        get: function(id) {
            switch (id) {
                case('vbs-media'):
                    var tmpl = '<div class="vbs-media-block">\n\
                <div class="vbs-section-header">\n\
                    <div class="vbs-section-title">\n\
                        <span class="vbs-section-name vbs-sna">audio</span>\n\
                        <span class="vbs-section-name vbs-snv"></span>\n\
                        <span class="vbs-time"><span class="vbs-ctime">00:00:00</span> / <span class="vbs-ftime">00:00:00</span></span>\n\
                        <span class="vbs-voice-name"></span>\n\
                    </div>\n\
                    <div class="vbs-section-btns"><ul class="vbs-clearfix">';
                    tmpl += VB.settings.vbsButtons.downloadMedia ? '<li><a href="#" class="vbs-download-audio-btn" format="pdf" data-title="Download Recording"></a></li>' : '';
                    tmpl += VB.settings.vbsButtons.remove ? '<li><a href="#" class="vbs-del-btn" data-title="Delete Recording"></a><div class="vbs-download-popup vbs-delete-popup vbs-popup"><div class="vbs-arrow"></div><h3>Are you sure you want to delete this recording?</h3><a href="#" class="vbs-red-btn">Delete</a><a href="#" class="vbs-blue-btn">Cancel</a></div></li>' : '';
                    tmpl += VB.settings.vbsButtons.favorite ? '<li><a href="#" class="vbs-star-btn"></a></li>' : '';
                    tmpl += VB.settings.vbsButtons.help ? '<li><a href="#" class="vbs-help-btn" data-title="Help"></a></li>' : '';
                    tmpl += '</ul></div>\n\
                    <div class="clear-block"></div>\n\
                </div>\n\
                <div class="vbs-section-body"></div>\n\
            </div>';
                    return tmpl;
                    break;
                case('vbs-controls'):
                    var vrpbc = VB.settings.vbsButtons.prev && VB.settings.vbsButtons.next ? ' vbs-3-left-btns' : VB.settings.vbsButtons.prev || VB.settings.vbsButtons.next ? ' vbs-2-left-btns' : ' vbs-1-left-btns';
                    var tmpl = '<div class="vbs-record-player' + vrpbc + '">\n\
                <div class="vbs-player-control">\n\
                    <a href="#" class="vbs-play-btn" data-title="Play"></a>';
                    tmpl += VB.settings.vbsButtons.prev ? '<a href="#" class="vbs-prev-btn" data-title="Back 15 Seconds"></a>' : '';
                    tmpl += VB.settings.vbsButtons.next ? '<a href="#" class="vbs-next-action-btn vbs-next-notactive" data-title="Next Keyword Marker"></a>' : '';
                    tmpl += '</div>\n\
                <div class="vbs-time-name-wrapper-narrow">\n\
                    <span class="vbs-time"><span class="vbs-ctime">00:00:00</span> / <span class="vbs-ftime">00:00:00</span></span> <br>\n\
                    <span class="vbs-voice-name"></span>\n\
                </div>\n\
                <div class="vbs-timeline">\n\
                    <div class="vbs-record-preview">\n\
                        <div class="vbs-record-timeline-wrap">\n\
                            <div class="">\n\
                                <div class="vbs-dragger"></div>\n\
                                <div class="vbs-record-timeline"></div>\n\
                                <div class="vbs-record-progress"></div>\n\
                                <div class="vbs-speakers"></div>\n\
                                <div class="vbs-player-slider"></div>\n\
                                <div class="vbs-record_buffer"></div>\n\
                                <div class="vbs-utterance-markers"></div>\n\
                            </div>\n\
                            <!--markers-->\n\
                            <div class="vbs-markers"></div>\n\
                            <!-- / markers-->\n\
                            <div class="vbs-markers-hovers"></div>\n\
                            <div class="vbs-comments-wrapper-block"></div>\n\
                            <div class="vbs-record-disabler" style="width: 0%;"></div>\n\
                        </div>\n\
                    </div>\n\
                </div>';
                    tmpl += VB.settings.vbsButtons.share ? '<div class="vbs-share-btn-wrapper"><a href="#" class="vbs-share-btn vbs-popup-btn" data-title="Share"></a></div>' : '';
                    tmpl += '<div class="vbs-volume-toolbar">\n\
                    <a href="#" class="vbs-volume-btn" data-title="Volume"></a>\n\
                    <div class="vbs-volume-toolbar-block" style="display: none;">\n\
                        <div class="vbs-volume-slider">\n\
                            <div class="vbs-volume-slider-bg"></div>\n\
                            <div class="vbs-volume-slider-full"></div>\n\
                            <div class="vbs-volume-slider-handler"></div>\n\
                        </div>\n\
                    </div>\n\
                </div>\n\
            </div>';
                    return tmpl;
                    break;
                case('vbs-keywords'):
                    var tmpl = '<div class="vbs-keywords-block">\n\
                <div class="vbs-section-header">\n\
                    <div class="vbs-section-title" data-title="Hide Keywords">\n\
                        <span class="vbs-section-name">Keywords</span>\n\
                    </div>\n\
\n\
                    <div class="vbs-search-form vbs-no-speaker ';
                    tmpl += VB.settings.vbsButtons.evernote && typeof filepicker !== 'undefined' ? 'vbs-one-btn' : 'vbs-no-btns';
                    tmpl += '">\n\
                        <form action="#" id="vbs-search-form">\n\
                            <div class="vbs-widget-wrap">\n\
                                <div class="vbs-widget">\n\
                                    <input name="get_voice_search" value="" size="20" id="voice_search_txt" class="vbs-formfields" type="text" placeholder="Search..." autocomplete=off>\n\
                                    <div id="vbs-search-string">\n\
                                        <div class="vbs-marquee">\n\
                                            <div class="vbs-search-word-widget"></div>\n\
                                        </div>\n\
                                    </div>';
                    tmpl += VB.settings.vbsButtons.pwrdb ? '<span class="vbs-powered-by-label">Powered by VoiceBase</span>' : '';
                    tmpl += '</div>\n\
                             <a href="#" id="vbs-clear-string" title="Clear String"></a>\n\
                            </div>\n\
\n\
                            <div class="vbs-search-btn" data-title="Search">\n\
                                    <button type="submit"></button>\n\
                            </div>\n\
                            <div class="vbs-select-speaker-wrapper">\n\
                                <div class="vbs-select-speaker">Select speaker...</div>\n\
                                 <ul class="vbs-select-dropdown"></ul>\n\
                            </div>\n\
                        </form>\n\
                    </div>\n\
                    <div class="vbs-section-btns"><ul>';
                    tmpl += VB.settings.vbsButtons.evernote && typeof filepicker !== 'undefined' ? '<li><a href="#" class="vbs-evernote-btn" data-title="Send to Evernote"></a></li>' : '';
                    tmpl += '</ul></div>\n\
                    <div class="clear-block"></div>\n\
                </div>\n\
                <!-- / section header-->\n\
\n\
                <div class="vbs-section-body">\n\
                    <div class="vbs-keywords-wrapper vbs-scroll" style="{{ styles }}">\n\
                        <div class="vbs-topics"></div>\n\
                        <div class="vbs-keywords-list-wrapper">\n\
                            <div class="vbs-keywords-list-tab"></div>\n\
                        </div>\n\
                        <div class="clear-block"></div>\n\
                    </div>';
                    tmpl += VB.settings.showMore ? '<div class="vbs-more-btn"><a href="#">Show More...</a></div>' : '';
                    tmpl += '\n\
                </div>\n\
            </div>';
                    return tmpl;
                    break;
                case('vbs-edit-trans-mode'):
                    var html = '<div class="vbs-edit-mode-wrapper">\n\
                <div class="vbs-controls-wrapper">\n\
                    <div id="vbs-controls" class="vbs-controls-box">\n\
                        <div class="vbs-edition-btns vbs-clearfix">\n\
                            <!--a href="#" class="vbs-edition-btn" id="vbs-edit-revert-btn">Revert</a>\n\
                            <a href="#" class="vbs-edition-btn" id="vbs-edit-upload-btn">Upload</a>\n\
                            <div class="vbs-edit-two-btns">\n\
                                <a href="#" class="vbs-edition-btn" id="vbs-edit-skip-note-btn">Skip to Next Note</a>\n\
                                <a href="#" class="vbs-edition-btn" id="vbs-edit-next-note-btn">Add/Edit Note</a>\n\
                            </div>\n\
                            <div class="vbs-edit-two-btns">\n\
                                <a href="#" class="vbs-edition-btn" id="vbs-edit-undo-btn">Undo</a>\n\
                                <a href="#" class="vbs-edition-btn" id="vbs-edit-redo-btn">Redo</a>\n\
                            </div--!>\n\
                            <div class="vbs-save-exit-btns">\n\
                                <a href="#" class="vbs-save-btn vbs-save-edition-popup-trigger" id="vbs-save-edition-popup-trigger">Save & Re-sync</a>\n\
                                <a href="#" class="vbs-exit-btn vbs-edit-mode-exit">Exit</a>\n\
                            </div>\n\
                        </div>\n\
                        <div class="vbs-record-player vbs-3-left-btns">\n\
                            <div class="vbs-player-control">\n\
                                <a href="#" class="vbs-play-btn" data-title="Play"></a>\n\
                                <a href="#" class="vbs-prev-btn" data-title="Back 15 Seconds"></a>\n\
                                <a href="#" class="vbs-next-action-btn vbs-next-notactive" data-title="Next Keyword Marker"></a>\n\
                            </div>\n\
                            <div class="vbs-time-name-wrapper-narrow" style="opacity: 0;">\n\
                                <span class="vbs-time">\n\
                                    <span class="vbs-ctime">00:00:00</span> / <span class="vbs-ftime">00:04:03</span>\n\
                                </span> <br>\n\
                                <span class="vbs-voice-name"></span>\n\
                            </div>\n\
                                <div class="vbs-timeline">\n\
                                    <div class="vbs-record-preview">\n\
                                        <div class="vbs-record-timeline-wrap">\n\
                                            <div class="">\n\
                                                <div class="vbs-dragger"></div>\n\
                                                <div class="vbs-record-timeline"></div>\n\
                                                <div class="vbs-record-progress" style="width: 0%;"></div>\n\
                                                <div class="vbs-speakers"></div>\n\
                                                <div class="vbs-player-slider" style="left: 0%;"></div>\n\
                                                <div class="vbs-record_buffer"></div>\n\
                                            </div>\n\
                                            <!--markers-->  \n\
                                            <div class="vbs-markers"></div>\n\
                                            <!-- / markers-->\n\
                                            <div class="vbs-markers-hovers"></div>\n\
                                            <div class="vbs-comments-wrapper-block"></div>\n\
                                            <div class="vbs-record-disabler" style="width: 0%;"></div>\n\
                                        </div>\n\
                                    </div>\n\
                                </div>\n\
                                <div class="vbs-volume-toolbar">\n\
                                    <a href="#" class="vbs-volume-btn" data-title="Volume"></a>\n\
                                    <div class="vbs-volume-toolbar-block" style="display: none;">\n\
                                        <div class="vbs-volume-slider">\n\
                                            <div class="vbs-volume-slider-bg"></div>\n\
                                            <div class="vbs-volume-slider-full"></div>\n\
                                            <div class="vbs-volume-slider-handler"></div>\n\
                                        </div>\n\
                                    </div>\n\
                                </div>\n\
                            </div>\n\
                        </div>\n\
                    </div>\n\
                    <div class="vbs-edit-instr vbs-clearfix">\n\
                    <div class="vbs-mouse-btns-desc">\n\
                        <span><b>Left click</b> on text to <em>Edit</em></span>\n\
                        <span><b>Right click</b> on text to <em>Menu</em></span>\n\
                    </div>\n\
                    </div>\n\
                <div class="vbs-edition-block" contenteditable="true">\n\
                    {{ ourtranscript }}\n\
                </div>\n\
                <div class="vbs-popup-overlay vbs-save-popup-wrapper">\n\
                    <div class="vbs-save-popup">\n\
                        <h2>Unsaved Changes</h2>\n\
                        <p>You have unsaved changes that will be lost unless you save them.</p>\n\
                        <a href="#" class="vbs-save-btn vbs-save-edition-btn">Save Changes</a>\n\
                        <a href="#" class="vbs-exit-btn vbs-discard-edition-btn" >Discard Changes</a>\n\
                        <a href="#" class="vbs-exit-btn vbs-cancel-edition-btn">Cancel</a>\n\
                    </div>\n\
                    <div class="vbs-save-done-popup">\n\
                        <img src="images/save-done-icon.png" alt=""/>\n\
                        <h3>Done!</h3>\n\
                    </div>\n\
                    <div class="vbs-save-loading-popup">\n\
                        <div class="vbs-ajax-loader"></div>\n\
                        <h3>Saving & Re-syncing!</h3>\n\
                        <p>This may take a little time, especially if you’re editing a longer transcript.</p>\n\
                    </div>\n\
                </div>\n\
                </div>';
                    return html;
                    break;
                case('vbs-transcript'):
                    var resizing_style = !VB.settings.showMore ? 'vbs-no-showmore-btn' : '';
                    var tmpl = '<div class="vbs-transcript-block ' + resizing_style + '">\n\
                    <div class="vbs-edit-mode-prewrapper"></div>\n\
        <div class="vbs-section-header">\n\
            <div class="vbs-section-title">\n\
                <span class="vbs-section-name vbs-snh">human transcript</span>\n\
                <span class="vbs-section-name vbs-snm">machine transcript</span>\n\
            </div>';
                    tmpl += VB.settings.vbsButtons.orderTranscript ? '<div class="vbs-order-human-trans" data-title="See Transcript Price & Options"><a href="#" target="_blank">Order Human Transcript</a></div>' : '';
                    tmpl += '<div class="vbs-section-btns">\n\
                <ul class="vbs-clearfix">';
                    tmpl += VB.settings.vbsButtons.downloadTranscript ? '<li><a href="#" class="vbs-cloud-btn vbs-popup-btn" data-title="Download Transcript"></a>\n\
                <div class="vbs-download-popup vbs-popup">\n\
                    <div class="vbs-arrow"></div>\n\
                    <h3>Download transcript</h3>\n\
                    <a href="#pdf" class="vbs-donwload-pdf" format="pdf">PDF</a>\n\
                    <a href="#rtf" class="vbs-donwload-rtf" format="rtf">RTF</a>\n\
                    <a href="#srt" class="vbs-donwload-srt" format="srt">SRT</a>\n\
                </div>\n\
                </li>' : '';
                    tmpl += VB.settings.vbsButtons.edit ? '<li><a href="#" class="vbs-edit-btn" data-title="Edit Transcript"></a></li>' : '';
                    tmpl += VB.settings.vbsButtons.print ? '<li><a href="#" class="vbs-print-btn" data-title="Print Transcript"></a></li>' : '';
                    tmpl += VB.settings.vbsButtons.readermode ? '<li><a href="#" class="vbs-readermode-btn" data-title="Reader Mode"></a></li>' : '';
                    tmpl += '</ul>\n\
            </div>\n\
        </div>\n\
        <div class="vbs-section-body">\n\
           <!-- transcript-->\n\
            <div class="vbs-transcript-prewrapper vbs-resizable"><div class="vbs-transcript-wrapper"></div></div>\n\
            <!-- / transcript-->\n\
            ';

                    tmpl += VB.settings.showMore ? '<div class="vbs-more-btn"><a href="#">Show More...</a></div>' : '';

                    tmpl += '\n\
        </div>\n\
    </div>';

                    return tmpl;

                    break;
                case('vbs-comments'):
                    return '\n\
                <div class="vbs-comments-block">\n\
                    <div class="vbs-section-header">\n\
                        <div class="vbs-section-title" data-title="Show Comments">\n\
                            <span class="vbs-section-name"></span>\n\
                        </div>\n\
                        <div class="vbs-section-btns">\n\
                            <ul class="vbs-clearfix">\n\
                                <li>\n\
                                    <a href="#" class="vbs-comments-btn vbs-popup-btn" data-title="Add a Comment"></a>\n\
                                </li>\n\
                            </ul>\n\
                        </div>\n\
                    </div>\n\
                    <!--wrapper for comments content-->\n\
                    <div class="vbs-section-body"></div>\n\
                </div>';
                    break;
                case("disabler"):
                    return '<div class="vbs-disabler"></div>';
                    break;
                case("reloadOverlay"):
                    return '<div class="vbs-reload-overlay">\n\
                    <div class="vbs-reload-message-wrapper vbs-clearfix">\n\
                    <div class="vbs-reload-message"><a href="javascript:void(0)" class="overlay_dismiss">&times;</a><span>Some details were not load</span></div>\n\
                        <a href="javascript:location.reload();" class="vbs-reload-btn"></a>\n\
                    </div>\n\
                    </div>';
                    break;
                case("reloadOverlayCredentials"):
                    return '<div class="vbs-reload-overlay">\n\
                    <div class="vbs-reload-message-wrapper vbs-large-error-text vbs-clearfix">\n\
                    <div class="vbs-reload-message">\n\
                        <a href="javascript:void(0)" class="overlay_dismiss">&times;</a>\n\
                        <span>Could not load recording data, indexing file may not be complete. If reload does not solve problem contact support for assistance</span></div>\n\
                        <a href="javascript:location.reload();" class="vbs-reload-btn"></a>\n\
                    </div>\n\
                    </div>';
                    break;
                case("sharePopup"):
                    return '<div class="vbs-share-popup vbs-popup" style="display: block;">\n\
                        <div class="vbs-arrow"></div>\n\
\n\
                        <div class="vbs-share-radio-row vbs-clearfix vbs-checked">\n\
                            <input type="radio" name="share-opt" value="share-position" id="vbs-share-position" checked="checked">\n\
                            <label for="vbs-share-position">\n\
                                Share position <span class="vbsp-time" vbct="{{ vbt }}">{{ vbspTime }}</span> <br>\n\
                                <span class="vbs-explanation">Drag the timeline to change</span>\n\
                            </label>\n\
                            <a href="#" class="vbs-play-btn"></a>\n\
                        </div>\n\
\n\
                        <div class="vbs-share-radio-row vbs-clearfix">\n\
                            <input type="radio" name="share-opt" value="share-search" id="vbs-share-search">\n\
                            <label for="vbs-share-search">\n\
                                Share search  <br>\n\
                                <span class="vbs-explanation">The current search or keyword  selected</span>\n\
                            </label>\n\
                        </div>\n\
\n\
                        <div class="vbs-share-radio-row vbs-clearfix">\n\
                            <input type="radio" name="share-opt" value="share-file" id="vbs-share-file">\n\
                            <label for="vbs-share-file">Share file from start</label>\n\
                        </div>\n\
\n\
                        <div class="vbs-link-row vbs-clearfix {{ zclip }}">\n\
                            <input type="text" id="vbsp-url" class="vbsp-url" value="{{ url }}" >\n\
                            <a href="#" class="vbs-copy-btn">Copy</a>\n\
                        </div>\n\
\n\
                        {{ addthis }}\n\
\n\
                        <div class="vbs-share-footer">\n\
                            {{ vbShareButton }}<a href="#" class="vbs-cancel-btn">Cancel</a>\n\
                        </div>\n\
                    </div>';
                    break;
                case("commentPopup"):
                    return '\n\
                    <div class="vbs-comments-popup vbs-popup">\n\
                        <div class="vbs-arrow"></div>\n\
                        <div class="vbs-comment-popup-row vbs-clearfix">\n\
                            <label>\n\
                                Comment position: <span class="vbs-time" id="vbs-comment-timeline" vbct="{{ vbt }}">{{ vbspTime }}</span> <br>\n\
                                <span class="vbs-explanation">Drag the timeline to change</span>\n\
                            </label>\n\
                            <a href="#" class="vbs-play-btn"></a>\n\
                        </div>\n\
                        <div class="vbs-enter-comment-row">\n\
                            <textarea id="vbs-comment-text" placeholder="Enter your comment..."></textarea>\n\
                        </div>\n\
                        <div class="vbs-comment-footer">\n\
                            <a href="#" class="vbs-cancel-btn">Cancel</a>\n\
                            <a href="#" class="vbs-confirm-btn">Add comment</a>\n\
                        </div>\n\
                    </div>\n\
                ';
                    break;
                case("commentDeletePopup"):
                    return '<div class="vbs-comments-popup vbs-popup vbs-comment-delete-popup">\n\
                                <div class="vbs-arrow"></div>\n\
                                <span>Delete This Comment?</span>\n\
                                <div class="vbs-comment-footer">\n\
                                    <a href="#" class="vbs-cancel-btn" c_id="{{ c_id }}">Yes, Delete</a>\n\
                                    <a href="#" class="vbs-confirm-btn">No, Cancel</a>\n\
                                </div>\n\
                            </div>';
                    break;
                case("commentReplyPopup"):
                    return '\n\
                    <div class="vbs-comments-popup vbs-popup">\n\
                        <div class="vbs-arrow"></div>\n\
                        <div class="vbs-enter-comment-row">\n\
                            <textarea id="vbs-comment-reply-text" placeholder="Enter your comment..."></textarea>\n\
                        </div>\n\
                        <div class="vbs-comment-footer">\n\
                            <a href="#" class="vbs-cancel-btn">Cancel</a>\n\
                            <a href="#" c_id={{ c_id }} class="vbs-confirm-btn">Add comment</a>\n\
                        </div>\n\
                    </div>\n\
                ';
                    break;
                case("commentEditFirstPopup"):
                    return '\n\
                    <div class="vbs-comments-popup vbs-popup">\n\
                        <div class="vbs-arrow"></div>\n\
                        <div class="vbs-comment-popup-row vbs-clearfix">\n\
                            <label>\n\
                                Comment position: <span class="vbs-time" id="vbs-comment-timeline" vbct="{{ vbt }}">{{ vbspTime }}</span> <br>\n\
                                <span class="vbs-explanation">Drag the timeline to change</span>\n\
                            </label>\n\
                            <a href="#" class="vbs-play-btn"></a>\n\
                        </div>\n\
                        <div class="vbs-enter-comment-row">\n\
                            <textarea id="vbs-comment-text" placeholder="Enter your comment...">{{ commentText }}</textarea>\n\
                        </div>\n\
                        <div class="vbs-comment-footer">\n\
                            <a href="#" class="vbs-cancel-btn">Cancel</a>\n\
                            <a href="#" class="vbs-confirm-btn" c_id="{{ c_id }}">Save Changes</a>\n\
                        </div>\n\
                    </div>\n\
                ';
                    break;
                case("commentEditPopup"):
                    return '\n\
                    <div class="vbs-comments-popup vbs-popup vbs-edit-wr">\n\
                        <div class="vbs-arrow"></div>\n\
                        <div class="vbs-enter-comment-row">\n\
                            <textarea id="vbs-comment-text" placeholder="Enter your comment...">{{ commentText }}</textarea>\n\
                        </div>\n\
                        <div class="vbs-comment-footer">\n\
                            <a href="#" class="vbs-cancel-btn">Cancel</a>\n\
                            <a href="#" class="vbs-confirm-btn" c_id="{{ c_id }}">Save Changes</a>\n\
                        </div>\n\
                    </div>\n\
                ';
                    break;
                case("categoriesLiTemplate"):
                    return '<li class="{{liclass}}"><a href="#" speakers="{{ speakers }}">{{ title }}</a><div class="vbs-topic-del-btn-wrap"><i class="vbs-cross-btn vbs-popup-btn"></i></div></li>';
                    break;
                case("newCategoriesLiTemplate"):
                    return '<li {{ keyclass }}><a href="#" t="{{ times }}" in="{{ internalName }}" speakers="{{ speakers }}" {{ sptimes }}>{{ title }}</a></li>';
                    break;
                case("categoriesKeywords"):
                    return '<div class="category">' +
                            '<h3>{{ cattitle }} (<span class="ccount">{{ count }}</span>)</h3>' +
                            '<div class="new-topics">' +
                            '<ul>{{ lis }}</ul>' +
                            '<div class="clearblock"></div>' +
                            '</div>' +
                            '</div>';
                    break;
                case("keywordsTemplate"):
                    return '<li {{ keyclass }}>' +
                            '<a href="#" t="{{ times }}" in="{{ internalName }}" speakers="{{ speakers }}" {{ sptimes }}>{{ name }}</a>{{ keycounter }}' +
                            '</li>';
                    break;
                case("markerTemplate"):
                    return '<a href="#" class="vbs-marker" style="border-bottom-color:{{ stcolor }}; z-index:91; left:{{ position }}px;" stime="{{ time }}"><ins></ins></a>' +
                            '<span ctime="{{ time }}" class="vbs-comment">{{ phrase }}</span>';
                    break;
                case("markerKeyTemplate"):
                    return '<a href="#" class="vbs-marker key" style="z-index:91; left:{{ position }}px;" stime="{{ time }}"><ins></ins></a>';
                    break;
                case("searchWordTemplate"):
                    return '<span class="vbs-word" data-word-o="{{ word }}"><em><dfn style="border-bottom-color: {{ color }};" class="vbs-marker"></dfn>{{ clean_word }}<span class="vbs-search_word" style="display:none">{{ word }}</span></em></span>';
                    break;
                case("mainDiv"):
                    return '<!--media-->\n\
<div id="vbs-media"></div>\n\
<!--controls-->\n\
<div id="vbs-controls"></div>\n\
<!--keywords-->\n\
<div id="vbs-keywords"></div>\n\
<!-- transcript -->\n\
<div id="vbs-transcript"></div>\n\
<!-- comments -->\n\
<div id="vbs-comments"></div>';
                    break;
                case("speakersTemplate"):
                    return '<div class="vbs-speaker {{ colorclass }}" rel="tooltip" data-original-title="{{ speaker }}" data-plcement="top" style="width: {{ width }}px; left: {{ position }}px;" s="{{ s }}" e="{{ e }}" cnum="{{ colorclass }}"></div>';
                    break;
                case("speakersAllFilter"):
                    return '<div id="speakers-block" speakerlist="{{ speakerlist }}" style="{{ style }}"><div class="current-speaker"><h3 data-speaker="all">All speakers</h3></div><div class="speakers-list">Click to drill down into what {{ speakers_links }} talked about, or see keywords for <a href="#all" data-speaker="all">All Speakers</a></div><div style="clear: both;"></div></div>';
                    break;
                case("speakersFilter"):
                    return '<div id="speakers-block" speakerlist="{{ speakerlist }}" style="{{ style }}"><div class="current-speaker"><h3 data-speaker="{{ curspeaker }}">{{ curspeaker }}</h3></div><div class="speakers-list">Click to drill down into what {{ speakers_links }} talked about, or see keywords for <a href="#all" data-speaker="all">All Speakers</a></div><div style="clear: both;"></div></div>';
                    break;
                case("deleteTopicPopup"):
                    return '<div class="vbs-comments-popup vbs-popup vbs-topic-delete-popup" data-topic="{{ topicname }}">\n\
                            <div class="vbs-arrow"></div>\n\
                            <span>Delete Topic?</span>\n\
                            <div class="vbs-comment-footer">\n\
                                <a href="#" class="vbs-cancel-btn">Yes</a>\n\
                                <a href="#" class="vbs-confirm-btn">No</a>\n\
                            </div>\n\
                        </div>';
                    break;
                case("vbsCommentsTimeline"):
                    return '<div class="vbs-comments-wrapper {{ rightClass }}" style="left:{{ position }}px;" stime="{{ stime }}">\n\
                            <div class="vbs-comment-small"></div>\n\
                            <div class="vbs-comment-preview"><a href="#" stime="{{ stime }}">{{ commentText }}</a></div>\n\
                        </div>';
                    break;
                case("alertPopup"):
                    return '<div class="vbs-alert_popup" data-action="{{ action }}"><div class="modalDialog_transparentDivs" style="left: 0px; top: 0px; display: block; width: 1925px; height: 662px;"></div>\n\
                <div class="modalDialog_contentDiv" id="DHTMLSuite_modalBox_contentDiv" style="display: block; width: 433px; left: 744px; top: 267px;"><div class="popup"><!--[if lt IE 7]><iframe></iframe><![endif]--><div class="inpopup"><a href="#" class="modal_close" alt="Close" title="Close"></a><h4>Delete Confirmation</h4><p>Do you really want to remove this topic with keywords?</p><div class="voicebase_buttons"><span><a href="#" class="modal_confirm">Confirm Delete</a></span><ins><a href="#" class="modal_cancel">Cancel Delete</a></ins></div><div class="fixer">&nbsp;</div></div></div></div></div>';
                    break;

                case("errorPopup"):
                    return '' +
                        '<div class="vbs-white-popup-overlay">' +
                            '<div class="vbs-big-error-popup">' +
                                '<a href="javascript:void(0)" class="overlay_dismiss">&times;</a>'+
                                '<h2>Could not load recording data</h2>' +
                                '<p>Indexing file may not be complete. If reloading does not solve the problem, please contact support for assistance.</p>' +
                                '<a href="javascript:location.reload();" class="vbs-reload-btn"></a>' +
                                '<a href="http://www.voicebase.com/contact-us/" target="_blank" class="vbs-contact-support-btn"></a>' +
                            '</div>' +
                        '</div>';
                    break;

                case("utteranceBlock"):
                    return '<div class="vbs-utterance-block vbs-clearfix">'+
                        '<div class="vbs-utterance-title">'+
                            '<p>utterance detection</p>'+
                        '</div>'+
                        '<div class="vbs-utterance-list">'+
                            '<ul class="vbs-clearfix">'+
                            '</ul>'+
                        '</div>'+
                    '</div>';
                    break;

                case("utteranceCheckBox"):
                    return '<li>'+
                            '<label class="vbs-utter-{{ rownum }}">'+
                                '<input type="checkbox" checked data-row="{{ rownum }}"/>{{ title }}'+
                                '<span class="vbs-utter-num">({{ segmentsCount }})</span>'+
                            '</label>'+
                        '</li>';
                    break;

                case("utteranceMarker"):
                    return ''+
                    '<div class="vbs-utter-marker vbs-utter-{{ rownum }} vbs-utter-row{{ rownum }}" data-stime="{{ startTime }}" style="width:{{ width }}px; left:{{ position }}px;">' +
                        '<div class="vbs-utter-tooltip">' +
                           '<p class="vbs-utter-title">{{ title }}</p>' +
                            '<p class="vbs-utter-time">{{ time }}</p>' +
                        '</div>' +
                    '</div>';
                    break;
                case("loggerBlock"):
                    return ''+
                    '<div class="vbs-logger">' +
                        '<textarea>' +
                        '{{ response }}'+
                        '</textarea>' +
                    '</div>';
                    break;
                default:
                    return '';
            }
        }
    };

    VB.events = {
        time: null,
        onTime: function() {
            if(VB.instances[VB.current_instance].player && VB.instances[VB.current_instance].player.interface){
                if (Math.round(VB.data.position) != Math.round(VB.helper.getPosition())) {
                    if (!VB.data.clicker) {
                        VB.helper.hideLoader();
                    }
                    if (VB.settings.transcriptHighlight !== false && (Math.round(VB.helper.getPosition()) <= 1 || Math.round(VB.helper.getPosition()) % VB.settings.transcriptHighlight == 0)) {
                        VB.helper.highlight(VB.helper.getPosition());
                    }
                    VB.settings.movelistner = false;
                }
                var position = VB.data.position = VB.helper.getPosition();
                var duration = VB.data.duration;

                if (VB.settings.dragging == false && VB.settings.movelistner == false && typeof position != 'undefined' && duration) {
                    VB.helper.find(".vbs-player-slider").css("left", position * 100 / duration + "%");
                    VB.helper.find(".vbs-record-progress").css("width", position * 100 / duration + "%");
                    VB.helper.find(".vbs-ctime").html(VB.helper.parseTime(position));
                }
                if (!VB.data.clicker) {
                    if (VB.helper.getStatus() == "PAUSED") {
                        VB.helper.find(".vbs-player-control .vbs-play-btn").removeClass('vbs-playing').attr('data-title', "Play");

                    } else if (VB.helper.getStatus() == "PLAYING") {
                        VB.helper.find(".vbs-player-control .vbs-play-btn").addClass('vbs-playing').attr('data-title', "Pause");

                    }
                }
                if (VB.helper.getBuffer()) {
                    VB.helper.find(".vbs-record_buffer").css("width", VB.helper.getBuffer() + "%");
                }
                VB.helper.speakers();
            }
        }
    };

    VB.api = {
        inited: !1,
        init: function() {
            this.inited = !0;
            this.parameters = jQuery.extend(true, {}, this.default_parameters);
            if (VB.settings.mediaId) {
                this.parameters.mediaid = VB.settings.mediaId;
                delete this.parameters.externalid;
            } else {
                this.parameters.externalid = VB.settings.externalId;
                delete this.parameters.mediaid;
            }
            if (VB.settings.token || VB.settings.example) {
                this.parameters.token = VB.settings.token;
                delete this.parameters.apikey;
                delete this.parameters.password;
            } else {
                delete this.parameters.token;
                this.parameters.apikey = VB.settings.apiKey;
                this.parameters.password = VB.settings.password;
            }

            VB.api.response = {
                metadata: null,
                keywords: null,
                transcript: null,
                comments: null
            };
            VB.api.data = {
                speakers: {},
                keywords: {},
                comments: {},
                tmp: {}
            };
            VB.api.ready =  {
                metadata: !1,
                keywords: !1,
                transcript: !1,
                comments: !1
            };
            VB.api.errors =  {
                processing: 0,
                failure: 0
            };
        },
        default_parameters: {
            'version': VB.default_settings.apiVersion,
            'ModPagespeed': 'off'
        },
        parameters: {},
        getToken: function(timeout) {
            var _parameters = {};
            jQuery.extend(_parameters, this.parameters);
            _parameters.action = 'getToken';
            _parameters.timeout = timeout;
            VB.api.call(_parameters, VB.api.setToken);
        },
        setToken: function(data) {
            if (data.requestStatus == 'SUCCESS') {
                VB.settings.token = data.token;
                VB.view.initWithToken();
            } else {
                alert(data.statusMessage);
            }
        },
        getExampleToken: function() {
            var _parameters = {};
            _parameters.mediaid = VB.settings.mediaId;
            VB.api.callCustom(VB.settings.exampleTokenUrl, _parameters, VB.api.setExampleToken);
        },
        setExampleToken: function(data) {
            if (data.success == true) {
                VB.settings.token = data.token;
                VB.api.parameters.token = data.token;
                VB.view.initWithToken();
            } else {
                alert(data.message);
            }
        },
        getMetaData: function() {
            var _parameters = {};
            jQuery.extend(_parameters, this.parameters);
            _parameters.action = 'getFileMetaData';
            _parameters.confidence = '0.0';
            VB.api.call(_parameters, VB.api.setMetaData);
        },
        setMetaData: function(data) {
            if (data.requestStatus == 'SUCCESS' && data.response.fileStatus != 'PROCESSING') {
                VB.api.response.metadata = data;
                var timeSeconds = data.response.lengthMs / 1000;
                var timestring = VB.helper.parseTime(timeSeconds);

                VB.data.duration = timeSeconds;
                VB.helper.find('.voicebase_record_times').show();
                VB.helper.find('.vplayer').show();
                if (VB.settings.playerType == 'jwplayer' && $('#' + VB.settings.playerId).is('object')) {
                    VB.settings.playerDom = $('#' + VB.settings.playerId).parent();
                    VB.settings.playerDom.wrap('<div class="vbs-player-wrapper vbs-' + VB.helper.randId() + '"></div>');
                }
                else if(VB.settings.playerType == 'kaltura'){
                    VB.settings.playerDom = $('#' + VB.settings.playerId);
                    $('#' + VB.settings.playerId).addClass('vbs-player-wrapper vbs-' + VB.helper.randId());
                }
                else {
                    VB.settings.playerDom = $('#' + VB.settings.playerId);
                    $('#' + VB.settings.playerId).wrap('<div class="vbs-player-wrapper vbs-' + VB.helper.randId() + '"></div>');
                }
                if (!data.response.hasVideo) {
                    // HIDE PLAYER
                    if(VB.settings.playerType != 'kaltura'){
                        var waitinstance = setInterval(function() {
                            if (VB.instances.length) {
                                clearTimeout(waitinstance);
                                VB.helper.findc('.vbs-player-wrapper > :first-child').css({"height": 0});

                            }
                        }, 100);
                    }
                } else {
                    VB.helper.find('.vbs-media-block').addClass('vbs-video');
                    $('.vbs-video .vbs-section-title').attr('data-title', 'Hide Video');
                    VB.helper.find('.vbs-record-player').addClass('vbs-video');
                    var cont = VB.helper.findc('.vbs-player-wrapper');
                    var contWidth = cont.children().width();
                    if(VB.settings.playerType == 'kaltura'){
                        contWidth = cont.width();
                    }
                    $("#" + VB.settings.mediaBlock).insertBefore(cont).css('width', contWidth);
                    if (contWidth < VB.settings.mediumResponsive && contWidth >= VB.settings.minResponsive) {
                        VB.helper.find('.vbs-media-block').addClass('less-600px');
                    } else if (contWidth < VB.settings.minResponsive) {
                        VB.helper.find('.vbs-media-block').addClass('less-600px').addClass('less-460px');
                    }
                    if (VB.settings.vbsButtons.fullscreen) {
                        VB.helper.find(".vbs-media-block .vbs-section-btns ul").append('<li><a href="#" class="vbs-expand-btn" data-title="Expand Video"></a></li>');
                    }
                }
                VB.helper.adjustMediaTime(); 
                VB.helper.find('.vbs-ftime').text(timestring);
                if (data.response.isFavorite) {
                    VB.helper.find(".vbs-star-btn").addClass('vbs-active').attr('data-title', 'Remove to Favorites');
                } else {
                    VB.helper.find(".vbs-star-btn").attr('data-title', 'Add from Favorites');
                }
                VB.helper.checkAutoStart();
            } else {
                VB.helper.find('.vbs-media-block').append(VB.templates.get('disabler'));
                VB.helper.find('.vbs-record-player').append(VB.templates.get('disabler'));
                VB.api.setErrors(data);
            }
            VB.api.ready.metadata = true;
        },
        getKeywords: function() {
            var _parameters = {};
            jQuery.extend(_parameters, this.parameters);
            _parameters.action = 'getFileAnalyticsSnippets';
            _parameters.returnCategories = '1';
            _parameters.includeStartTimes = true;
            if (VB.settings.keywordsGroups) {
                _parameters.returnGroups = true;
            }
            VB.api.call(_parameters, VB.api.setKeywords);
        },
        setKeywords: function(data) {
            if (data.requestStatus == 'SUCCESS') {
                VB.api.response.keywords = data;

                var keywords = [];
                var catArray = [];
                var speakersArray = [];
                var speakersName = [];
                for (var i in data.categories) {
                    catArray.push(data.categories[i]);
                }
                if (VB.settings.keywordsGroups) {
                    for (var i in data.groups) {
                        catArray.push(data.groups[i]);
                    }
                }
                keywords = data.keywords;
                var categories = jQuery.map(catArray, function(item, index) {
                    for (var si in item.speakers) {
                        var speaker_name = item.speakers[si].replace(/<br \/>/g, "").replace(/<br\/>/g, "").replace(/\n/g, "").trim();
                        if (!inSpeakers(speaker_name)) {
                            var num = Object.keys(VB.data.speakers).length + 1;
                            VB.data.speakers['vbs-sp' + num + 'o'] = speaker_name;
                        }
                        if (!inArrayV(speakersName, speaker_name)) {
                            var num = Object.keys(speakersArray).length + 1;
                            speakersName.push(speaker_name);
                            speakersArray.push('vbs-sp' + num + 'o');
                        }
                    }

                    var isps = [];
                    if (typeof item.speakers != "undefined" && item.speakers.length) {
                        for (var isp in item.speakers) {
                            isps.push(VB.helper.getSpeakerKey(item.speakers[isp].replace(/<br \/>/g, "").replace(/<br\/>/g, "").replace(/\n/g, "").trim()));
                        }
                    }
                    isps.join();
                    return {
                        "name": item.name,
                        "score": item.score,
                        "subcategories": item.subcategories,
                        "similarCategories": item.similarCategories,
                        "speakers": isps,
                        "type": item.type
                    };
                });
                categories.sort((function(first, second) {
                    return first.score - second.score
                }));
                categories.reverse();
                
                var allTopicItem = {
                    'name': 'ALL TOPICS',
                    'keywords': keywords,
                    'subcategories': {},
                    'similarCategories': {},
                    'speakers': speakersArray.join()
                };
                categories.unshift(allTopicItem);

                var ka = [];
                for (var ki in data.keywords) {
                    ka.push(data.keywords[ki].name);
                }

                VB.data.keywords = ka;

                catArray.push(allTopicItem);

                var catUl = '<ul class="vbs-topics-list">';
                var li = "";
                var k = 0;
                for (var i in categories) {
                    if (typeof categories[i] == 'undefined') {
                        continue;
                    }
                    var subCats = '';
                    if (typeof categories[i].subcategories != 'undefined' && categories[i].subcategories.length) {
                        //sort by score            
                        for (var j in categories[i].subcategories) {
                            subCats += categories[i].subcategories[j].name + '<br/>';
                        }
                    }
                    var typeClass = categories[i].type == 'group' ? 'group': '';

                    li += " " + VB.templates.parse('categoriesLiTemplate', {
                        'title': categories[i].name,
                        'subcategories': subCats,
                        'speakers': categories[i].speakers,
                        'liclass': categories[i].name == 'ALL TOPICS' ? 'vbs-all-topics vbs-active' : typeClass
                    });
                    k++;
                }

                catUl += li + "</ul>";
                catArray.sort((function(first, second) {
                    return second.keywords.length - first.keywords.length;
                }));

                /// keywords
                var allSpeakersAr = [];
                var ull = "";
                for (var j in catArray) {
                    var typeClass = catArray[j]['type'] == 'group' ? 'class="group"': '';
                    
                    var fc = catArray[j]['name'] == 'ALL TOPICS' ? 'class="vbs-active"' : typeClass;
                    ull += '<ul tid="' + catArray[j]['name'] + '" ' + fc + '>';
                    var tk = catArray[j]['keywords'];

                    for (var i in tk) {
                        var sptimes = "";
                        var spkeys = [];
                        var times = [];
                        var item = tk[i];
                        for (var spt in tk[i].t) {
                            if (tk[i].t != '' && tk[i].t[spt]) {
                                var timses = tk[i].t[spt];
                                for (var timse in timses) {
                                    times.push(timses[timse]);
                                }
                            }
                            var speaker_name = spt.replace(/<br \/>/g, "").replace(/<br\/>/g, "").replace(/\n/g, "").trim();
                            var speaker_key = VB.helper.getSpeakerKey(speaker_name);
                            sptimes += 'data-spt-' + speaker_key + '="' + (tk[i].t != '' && tk[i].t[spt] ? tk[i].t[spt].join() : '') + '" ';
                            spkeys.push(speaker_key);
                            if (allSpeakersAr.indexOf(speaker_name) == '-1') {
                                allSpeakersAr.push(speaker_name);
                            }
                        }

                        var keyclass = tk[i].t ? 'class="key"' : '';
                        var internalName = typeof tk[i].internalName == 'undefined' ? tk[i].name : tk[i].internalName.join();
                        var keycounter = VB.settings.keywordsCounter ? ' <span>(' + times.length + ')</span>' : '';
                        ull += " " + VB.templates.parse('keywordsTemplate', {'name': tk[i].name, 'times': times.join(), 'speakers': spkeys, 'sptimes': sptimes, 'keyclass': keyclass, 'internalName': internalName, keycounter: keycounter});
                    }
                    ull += '</ul>';
                }

                if (VB.settings.keywordsColumns && VB.settings.keywordsColumns != 'auto') {
                    VB.helper.find('.vbs-keywords-list-wrapper').addClass(VB.helper.getColumnClassByNumber(VB.settings.keywordsColumns));
                }
                if (Object.keys(VB.data.speakers).length > 1) {
                    VB.view.speakerFilterWidget(VB.data.speakers, 'all');
                }

                VB.helper.find('.vbs-keywords-block .vbs-topics').html(catUl);
                VB.helper.find('.vbs-keywords-block .vbs-keywords-list-tab').html(ull);
                VB.helper.find('.vbs-keywords-block').slideDown('fast', function() {
                    if (VB.settings.keywordsColumns && VB.settings.keywordsColumns == 'auto') {
                        VB.helper.keywordsAutoColumns();
                    } else if (VB.settings.keywordsColumns && VB.settings.keywordsColumns == 'topics') {
                        VB.helper.keywordsAutoTopicsColumns();
                    }
                });
            } else {
                VB.helper.find('.vbs-keywords-block').append(VB.templates.get('disabler'));
                VB.api.setErrors(data);
            }
            VB.api.ready.keywords = true;
        },
        getTranscript: function() {
            var _parameters = {};
            jQuery.extend(_parameters, this.parameters);
            _parameters.action = 'getKeywords';
            _parameters.confidence = '0.0';
            VB.api.call(_parameters, VB.api.setTranscript);
        },
        setTranscript: function(data) {
            VB.api.response.transcript = data;
            if (data.requestStatus == 'FAILURE' || (data.fileStatus != "MACHINECOMPLETE" && data.fileStatus != "HUMANCOMPLETE")) {
                VB.helper.find('.vbs-transcript-block').addClass('vbs-ho').append(VB.templates.get('disabler')).show();
                VB.api.ready.transcript = true;
                VB.api.setErrors(data);
                return false;
            }
            if (data.transcriptType == 'human') {
                VB.helper.find('.vbs-transcript-block').addClass('vbs-human').find('.vbs-section-title').attr('data-title', 'Hide Transcript');
            } else {
                if (VB.settings.vbsButtons.orderTranscript) {
                    VB.helper.find('.vbs-transcript-block').addClass('vbs-with-order-btn');
                }
            }

            if (VB.settings.transcriptResizable && $.isFunction($.fn.resizable)) {
                var transMinWidth = VB.helper.find('.vbs-transcript-block').width();
                VB.helper.find('.vbs-resizable').resizable({
                    minWidth: transMinWidth,
                    resize: function() {
                        var transWidth = ($(this).width());
                        $(this).parent('.vbs-section-body').width(transWidth);
                        $(this).parent('.vbs-section-body').siblings('.vbs-section-header').width(transWidth);
                    }
                });
            }
            if (VB.settings.humanOnly && data.transcriptType == 'machine') {
                return false;
            }
            var transcript = [],
                    transpart = '',
                    lt = 0,
                    dt = data.transcript,
                    last = 0,
                    spturn = 0,
                    spf = false;

            for (var i = 0; i < dt.length; i++) {
                var val = dt[i];
                if (i == 0) {
                    transpart += '<span t="' + 0 + '">';
                }
                for (var k = 2; k <= 10; k++) {
                    if (Math.floor(val.s / 1000) >= (last + VB.settings.transcriptHighlight * k)) {
                        last += VB.settings.transcriptHighlight * k;
                        transpart += '<span t="' + last + '"></span>';
                    }
                }
                if (Math.floor(val.s / 1000) >= (last + VB.settings.transcriptHighlight)) {
                    last += VB.settings.transcriptHighlight;
                    transpart += '</span><span t="' + last + '">';
                }
                lt += val.s;
                var sptag = (typeof val.m !== "undefined" && val.m == "turn") ? 'm="' + val.w.replace(/<br \/>/g, "").replace(/<br\/>/g, "").replace(/\n/g, "").replace(":", "") + '"' : '';
                var speaker = sptag ? val.w.replace(/<br \/>/g, "").replace(/<br\/>/g, "").replace(/\n/g, "").replace(":", "").trim() : false;
                if (speaker && !inSpeakers(speaker)) {
                    var num = Object.keys(VB.data.speakers).length + 1;
                    VB.data.speakers['vbs-sp' + num + 'o'] = speaker;
                }
                spturn = (typeof val.m !== "undefined" && val.m == "turn") ? spturn + 1 : spturn;
                var br = (typeof val.m !== "undefined" && val.m == "turn" && i > 2) ? '<br/><br/>' : '';
                var br2 = (VB.settings.lineBreak && typeof dt[i - 1] !== "undefined" && dt[i].s - dt[i - 1].e > VB.settings.lineBreak * 1000) ? '<br/><br/>' : '';
                if (i == 0 && typeof val.m == "undefined") {
                    var fw = 'data-f=true';
                    spf = true;
                } else {
                    var fw = '';
                }
                transpart += val.w.match(/\w+/g) ? br + br2 + ' <span class="w" t="' + val.s + '" ' + sptag + ' ' + fw + '>' + val.w.replace(/\n/g, "") + '</span>' : '<span t="' + val.s + '" ' + sptag + '>' + val.w.replace(/\n/g, "") + '</span>';
            }

            transpart += '</span>';
            VB.helper.find('.vbs-transcript-block .vbs-transcript-wrapper').html(transpart);
            if (spturn && spf) {
                VB.helper.find('.vbs-transcript-block .vbs-transcript-wrapper span[data-f=true]').prepend('<span class="w" t="0" m=">> "><br><br>&gt;&gt; </span>');
            }
            if ($('.vbs-transcript-block').not('.vbs-human').length) {
                VB.helper.find('.vbs-transcript-block .vbs-section-body').hide();
                VB.helper.find('.vbs-transcript-block .vbs-section-title').addClass('vbs-hidden').attr('data-title', 'Show Transcript');
            }
            VB.helper.find(".vbs-transcript-block .vbs-transcript-prewrapper").css('height', VB.settings.transcriptHeight + "px");
            VB.helper.find('.vbs-transcript-block').slideDown('fast');
            var orderTranscriptURL = VB.settings.apiUrl.replace('services', 'orderTranscript');
            var mediaid = VB.settings.mediaId ? VB.settings.mediaId : VB.settings.externalId;
            var order_transcript_url = orderTranscriptURL + '/' + mediaid + '?token=' + VB.settings.token + '&cancel=close';
            VB.helper.find('.vbs-order-human-trans a').attr('href', order_transcript_url);

            $.map(data.transcript, function(val) {
                transcript.push(val.w);
            });
            VB.api.ready.transcript = true;
        },
        getSearch: function(terms, start) {
            VB.data.clicker = true;
            var terms_string = terms.join(',').toLowerCase();
            start = typeof start !== 'undefined' && start == false ? false : true;
            var _parameters = {};
            jQuery.extend(_parameters, this.parameters);
            _parameters.action = 'searchFile';
            _parameters.terms = terms_string;
            VB.api.call(_parameters, VB.api.setSearch, {start: start, terms: terms});
        },
        setSearch: function(data, args) {
            var start = args.start;
            var terms = args.terms;
            VB.data.clicker = false;
            var colors = new Array();
            VB.helper.find('.vbs-widget .vbs-word').each(function(key, marker) {
                var $marker = $(marker);
                var word = $marker.find('.vbs-search_word').text().replace(/"/g, '').toLowerCase();
                colors[word] = $marker.find('.vbs-marker').css('border-bottom-color');
            });
            if (data.requestStatus == "SUCCESS") {
                var allTimes = [];
                if (data.hits.length) {
                    var cit = 0;
                    data.hits.hits.map(function(item) {

                        var times = [];
                        var phrases = [];
                        item.hits.map(function(hit) {
                            if (VB.helper.filterResultForSpeaker(hit.time)) {
                                times = times.concat(hit.time);
                                phrases = phrases.concat(hit.phrase);
                            }
                        });
                        VB.view.markerWidget(times, phrases, colors[item.term.toLowerCase()]);
                        allTimes = allTimes.concat(times);
                        cit++;
                    });
                    if (VB.settings.editKeywords && data.hits.hits.length > 0) {
                        VB.data.searcht = allTimes;
                        VB.data.searchHits = data.hits.hits;
                        VB.helper.checkKeyword(terms, allTimes, data.hits.hits);
                    } else {
                        VB.data.searcht = null;
                        VB.data.searchHits = null;
                    }
                }
                allTimes.sort(function(a, b) {
                    return a - b;
                });
                if (start) {
                    VB.helper.seek(allTimes[0]);
                }
                VB.helper.startScroll();
            } else if (data.requestStatus == "FAILURE") {
                VB.helper.hideLoader();
            }
        },
        downloadAudio: function() {
            var _parameters = {};
            jQuery.extend(_parameters, this.parameters);
            _parameters.action = 'getFileMetadata';
            VB.api.call(_parameters, VB.api.setDownloadAudio);
        },
        setDownloadAudio: function(data) {
            if (data.requestStatus == 'SUCCESS') {
                window.location = data.response.downloadMediaUrl;
            } else {
                alert(data.statusMessage);
            }
        },
        getComments: function(hide, rebuild) {
            var _parameters = {};
            jQuery.extend(_parameters, this.parameters);
            VB.api.data.tmp.hide = typeof hide != 'undefined' ? hide : true;
            VB.api.data.tmp.rebuild = typeof rebuild != 'undefined' ? rebuild : false;
            _parameters.action = 'getComments';
            if (VB.settings.commentsUsername && VB.settings.commentsUsername != '') {
                _parameters.username = VB.settings.commentsUsername;
            }
            VB.api.call(_parameters, VB.api.setComments);
        },
        setComments: function(data) {
            if (data.requestStatus == 'SUCCESS') {
                var comments_html = '',
                        comments_count_string = '';

                if (data.response.threads !== undefined) {
                    var comments_count = 0;
                    var iiissd = 0;

                    VB.data.commentsThreads = data.response.threads;
                    for (var thread_key in data.response.threads) {
                        // Get thread
                        var thread = data.response.threads[thread_key];

                        for (var comment_key in thread.comments) {
                            // Get comment
                            var comment = thread.comments[comment_key];

                            // Get comment level
                            var comment_level = comment.level;
                            if (comment.level > '5') {
                                comment_level = '5';
                            }

                            // Get "commented at"
                            var commented_at = VB.helper.parseTime(thread.timeStamp);

                            comments_html += '<div class="vbs-comment-row vbs-answer' + comment_level + '">\n\
                                                              <div class="vbs-comment-title">\n\
                                                                  <a href="#" class="vbs-comment-author">' + comment.userName + '</a> ';
                            if (comment_level == 1) {
                                comments_html += '<span>commented at</span>\n\
                                                                  <span class="vbs-comment-time">' + commented_at + '</span>';
                            } else {
                                comments_html += '<span>replied</span>';
                            }
                            var vbsweb = comment.canEdit ? 'vbs-with-edition-btns' : '';
                            comments_html += '</div>\n\
                                                              <div class="vbs-comment-content ' + vbsweb + '">\n\
                                                                  <div class="vbs-arrow"></div>\n\
                                                                  <div class="vbs-comment-message">\n\
                                                                      <p>' + comment.content + '</p>\n\
                                                                  </div>';
                            if (comment.canEdit) {
                                comments_html +=
                                        '<div class="vbs-comment-edit-wrapper">\n\
                                                <div class="vbs-comment-edit-btn-wrapper">\n\
                                                    <a href="#" c_id="' + comment.id + '" c_tm="' + thread.timeStamp + '" class="vbs-comment-edit vbs-popup-btn">Edit</a>\n\
                                                </div>\n\
                                                <div class="vbs-comment-delete-btn-wrapper">\n\
                                                    <a href="#" c_id="' + comment.id + '" class="vbs-comment-delete vbs-popup-btn">Delete</a>\n\
                                                </div>\n\
                                            </div>';
                            } else {
                                comments_html +=
                                        '<div class="vbs-comment-reply-wrapper">\n\
                                                <a href="#"  c_id="' + comment.id + '" class="vbs-comment-reply vbs-popup-btn">Reply</a>\n\
                                            </div>';
                            }
                            comments_html += '</div>\n\
                                                          </div>\n\
                                                      </div>';
                            iiissd++;
                            comments_count++;
                        }
                    }

                    comments_count_string += comments_count + ' Comment(s)';
                } else {
                    comments_count_string += 'No Comments';
                    comments_html += '<div class="vbs-comment-row"><div class="vbs-comment-title">No Comments</div></div>';
                }

                $('.vbs-comments-block .vbs-section-name').attr('style', 'width: 200px;').text(comments_count_string);
                VB.view.commentsWidget(comments_html, VB.api.data.tmp.hide);
                if (VB.api.data.tmp.rebuild) {
                    VB.view.commentsTWidget();
                }
            } else {
                VB.helper.find('.vbs-comments-block').append(VB.templates.get('disabler'));
                VB.api.setErrors(data);
            }
            VB.api.ready.comments = true;
        },
        addComment: function(comment_data) {
            var _parameters = {};
            jQuery.extend(_parameters, this.parameters);
            _parameters.action = 'addComment';
            _parameters.comment = comment_data.comment;
            if (comment_data.comment_timestamp !== false) {
                _parameters.timeStamp = comment_data.comment_timestamp;
            }
            if (comment_data.parent_comment_id !== false) {
                _parameters.commentId = comment_data.parent_comment_id;
            }
            if (VB.settings.commentsUsername && VB.settings.commentsUsername != '') {
                _parameters.username = VB.settings.commentsUsername;
            }
            if (VB.settings.commentsUserhandle && VB.settings.commentsUserhandle != '') {
                _parameters.userhandle = VB.settings.commentsUserhandle;
            }
            VB.api.call(_parameters, VB.api.sendComment);
        },
        sendComment: function(data) {
            if (data.requestStatus == 'SUCCESS') {
                VB.api.getComments(VB.helper.find('.vbs-comments-block .vbs-section-title').hasClass('vbs-hidden'), true);
            } else {
                alert(data.statusMessage);
            }
        },
        editComment: function(comment_data) {
            var _parameters = {};
            jQuery.extend(_parameters, this.parameters);
            _parameters.action = 'editComment';
            _parameters.comment = comment_data.comment;
            _parameters.commentId = comment_data.comment_id;

            if (VB.settings.commentsUsername && VB.settings.commentsUsername != '') {
                _parameters.username = VB.settings.commentsUsername;
            }
            VB.api.call(_parameters, VB.api.sendEditComment);
        },
        sendEditComment: function(data) {
            var parent_div = VB.api.data.tmp.commentParent;
            var comment_data = VB.api.data.tmp.commentData;
            if (data.requestStatus == 'SUCCESS') {
                parent_div.parents('.vbs-comment-content').find('.vbs-comment-message p').text(comment_data.comment);
                parent_div.remove();
                VB.view.commentsTWidget();
            } else {
                parent_div.find("textarea").attr('disabled', false);
                alert(data.statusMessage);
            }
        },
        deleteComment: function(comment_id) {
            var _parameters = {};
            jQuery.extend(_parameters, this.parameters);
            _parameters.action = 'deleteComment';
            _parameters.commentId = comment_id;
            if (VB.settings.commentsUsername && VB.settings.commentsUsername != '') {
                _parameters.username = VB.settings.commentsUsername;
            }
            VB.api.call(_parameters, VB.api.sendComment);
        },
        favorite: function(param) {
            var _parameters = {};
            jQuery.extend(_parameters, this.parameters);
            param = typeof param !== "undefined" ? param : true;
            _parameters.action = 'updateMediaFile';
            _parameters.favorite = param ? 'add' : 'remove';
            VB.view.favorite(param);
            VB.api.call(_parameters, VB.api.sendFavorite);
        },
        sendFavorite: function(data) {
            if (data.requestStatus != 'SUCCESS') {
                VB.view.favoriteToggle();
                alert(data.statusMessage);
            }
        },
        getAutoNotesHtmlURL: function() {
            var _parameters = {};
            jQuery.extend(_parameters, this.parameters);
            _parameters.action = 'getAutoNotesHtml';
            _parameters.content = true;
            return VB.settings.apiUrl + '?' + getStringFromObject(_parameters);
        },
        editKeyword: function(mode, keyword_name, category_name, elem) {
            var _parameters = {};
            jQuery.extend(_parameters, this.parameters);
            _parameters.keywordname = keyword_name;
            _parameters.action = "moveKeyword";
            if (category_name != 'ALL TOPICS') {
                _parameters.categoryname = category_name;
            } else {
                _parameters.categoryname = '';
            }
            _parameters.mode = mode;
            var li = $(elem).parent();

            VB.api.call(_parameters, VB.api.responseEditKeywords, {mode: mode, li: li});
        },
        responseEditKeywords: function(data, args) {
            if (data.requestStatus == 'SUCCESS') {
                if (args.mode == 'up') {
                    args.li.insertBefore(args.li.prev());
                } else if (args.mode == 'down') {
                    args.li.insertAfter(args.li.next());
                } else if (args.mode == 'first') {
                    args.li.insertBefore(args.li.siblings(':eq(0)'));
                }
                if (args.mode == 'delete') {
                    args.li.remove();
                }
            } else {
                alert(data.statusMessage);
            }
        },
        removeKeyword: function(keyword_name, category_name, elem) {
            var _parameters = {};
            jQuery.extend(_parameters, this.parameters);
            _parameters.action = "deleteKeyword";
            _parameters.keywordname = keyword_name;
            if (category_name != 'ALL TOPICS') {
                _parameters.categoryname = category_name;
            } else {
                _parameters.categoryname = '';
            }
            var li = $(elem).parent();
            VB.api.call(_parameters, VB.api.responseRemoveKeyword, {category_name: category_name, keyword_name: keyword_name, li: li});
        },
        responseRemoveKeyword: function(data, args) {
            if (data.requestStatus == 'SUCCESS') {
                if (args.category_name == 'ALL TOPICS') {
                    VB.data.keywords.splice(VB.data.keywords.indexOf(args.keyword_name));
                }
                args.li.remove();
            } else {
                alert(data.statusMessage);
            }
        },
        removeTopic: function(cat) {
            var _parameters = {};
            jQuery.extend(_parameters, this.parameters);
            _parameters.categoryname = cat;
            _parameters.action = "deleteKeywordCategory";
            VB.api.call(_parameters, VB.api.responseRemoveTopic);
        },
        responseRemoveTopic: function(data) {
            if (data.requestStatus == 'SUCCESS') {
                VB.helper.find(".vbs-topics-list li.vbs-active").remove();
                var li = VB.helper.find('.vbs-topics-list li.vbs-all-topics');
                li.parent().find('.vbs-active').removeClass('vbs-active');
                li.addClass('vbs-active');
                var catName = li.find('a').text().trim();
                VB.helper.find(".vbs-keywords-list-tab ul").removeClass('vbs-active');
                VB.helper.find('.vbs-keywords-list-tab ul[tid="' + catName + '"]').addClass('vbs-active');
                $('.vbs-topic-delete-popup').remove();
                if (VB.settings.keywordsColumns == 'topics') {
                    VB.helper.keywordsAutoTopicsColumns();
                }
            } else {
                alert(data.statusMessage);
            }
        },
        addKeywords: function(keywords, times) {
            var _parameters = {};
            jQuery.extend(_parameters, this.parameters);
            if (keywords.match(/\s+/g)) {
                keywords = '"' + keywords + '"';
            }
            _parameters.keyword = keywords;
            _parameters.action = "addKeyword";
            VB.api.call(_parameters, VB.api.responseAddKeywords, {keywords:keywords, times:times});
        },
        responseAddKeywords: function(data, args) {
            if (data.requestStatus == 'SUCCESS') {
                var li = VB.helper.find('.vbs-topics-list li.vbs-all-topics');

                li.parent().find('.vbs-active').removeClass('vbs-active');
                li.addClass('vbs-active');
                var catName = li.find('a').text().trim();
                VB.helper.find(".vbs-keywords-list-tab ul").removeClass('vbs-active');
                VB.helper.find('.vbs-keywords-list-tab ul[tid="' + catName + '"]').addClass('vbs-active');

                var lik = $('.vbs-keywords-list-tab ul.vbs-active li');
                var kwarr = args.keywords.replace(/"/g, '');
                VB.data.keywords.push(kwarr);
                var link = '';
                var keycounter = VB.settings.keywordsCounter ? ' <span>(' + args.times.split(",").length + ')</span>' : '';
                link += '<li class="key"><a href="#" t="' + args.times + '" in="' + kwarr + '" speakers="">' + kwarr + '</a>' + keycounter + '</li>';
                $(link).insertBefore(lik.first());
                VB.helper.find('.vbs-add-search-word[data-kwa="' + kwarr + '"]').remove();
                if(VB.settings.keywordsColumns == 'topics'){
                    VB.helper.keywordsAutoTopicsColumns();
                }
            } else {
                alert(data.statusMessage);
            }
        },
        saveTrancript: function(content) {
            var _parameters = {};
            var content = content;
            jQuery.extend(_parameters, this.parameters);
            _parameters.content = content;
            _parameters.action = "updateTranscript";
            VB.api.callPost(_parameters, VB.api.responseSaveTrancript, content);
        },
        responseSaveTrancript: function(data, args) {
            if (data.requestStatus == 'SUCCESS') {
                setTimeout(function() {
                    VB.api.triggerTranscriptStatus();
                }, VB.settings.transcriptCheckTimer * 1000);
            } else {
                alert(data.statusMessage);
            }
        },
        triggerTranscriptStatus: function() {
            var _parameters = {};
            jQuery.extend(_parameters, this.parameters);
            _parameters.action = "getFileStatus";
            VB.api.call(_parameters, VB.api.responseTriggerTranscriptStatus);
        },
        responseTriggerTranscriptStatus: function(data) {
            if (data.requestStatus == 'SUCCESS' && data.fileStatus == 'PROCESSING') {
                setTimeout(function() {
                    VB.api.triggerTranscriptStatus();
                }, VB.settings.transcriptCheckTimer * 1000);
            } else if (data.requestStatus == 'SUCCESS') {
                VB.helper.saveTranscriptComplete();
            } else {
                alert(data.statusMessage);
            }
        },
        call: function(parameters, callback, args) {
            args = typeof args != 'undefined' ? args : false;
            if (this.inited === !1)
                this.init();

            $.getJSON(
                    VB.settings.apiUrl,
                    parameters
                    ).done(function(json) {
                callback(json, args);
            }).fail(function(jqxhr, textStatus, error) {
                console.log(jqxhr);
                //var err = textStatus + ", " + error;
            });
        },
        callPost: function(parameters, callback, args) {
            args = typeof args != 'undefined' ? args : false;
            jQuery.ajax({
                url: VB.settings.apiUrl,
                type: 'POST',
                data: parameters,
                dataType:"json"
            }).done(function( json ) {
                callback(json, args);
            }).fail(function(jqxhr, textStatus, error) {
                console.log(jqxhr);
            });
        },
        callCustom: function(url, parameters, callback, args) {
            args = typeof args != 'undefined' ? args : false;
            jQuery.ajax({
                url: url,
                type: 'POST',
                data: parameters,
                dataType: "json"
            }).done(function( json ) {
                callback(json, args);
            }).fail(function(jqxhr, textStatus, error) {
                console.log(jqxhr);
            });
        },
        setErrors: function(data){
            if(data.requestStatus == 'FAILURE'){
                VB.api.errors.failure++;
            }
            else if(data.response && data.response.fileStatus == 'PROCESSING'){
                VB.api.errors.processing++;
            }
            else if(data.fileStatus == 'PROCESSING'){
                VB.api.errors.processing++;
            }
        }
    };

    VB.reSettings = function(cs) {
        VB.settings = jQuery.extend(true, {}, VB.default_settings);
        VB.data = jQuery.extend(true, {}, VB.default_data);
        var s = keysToLowerCase(cs);

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

        // Keywords
        VB.settings.keywordsBlock = typeof s.keywordsblock !== 'undefined' ? s.keywordsblock : VB.settings.keywordsBlock;
        VB.settings.keywordsHeight = typeof s.keywordsheight !== 'undefined' ? s.keywordsheight : VB.settings.keywordsHeight;
        VB.settings.keywordsWidth = typeof s.keywordswidth !== 'undefined' ? (s.keywordswidth < 220 ? 220 : s.keywordswidth) : VB.settings.keywordsWidth;
        VB.settings.keywordsColumns = typeof s.keywordscolumns !== 'undefined' ? s.keywordscolumns : VB.settings.keywordsColumns;
        VB.settings.keywordsResizable = typeof s.keywordsresizable !== 'undefined' ? s.keywordsresizable : VB.settings.keywordsResizable;
        VB.settings.editKeywords = typeof s.editkeywords !== 'undefined' ? s.editkeywords : VB.settings.editKeywords;
        VB.settings.localKeywordSearch = typeof s.localkeywordsearch !== 'undefined' ? s.localkeywordsearch : VB.settings.localKeywordSearch;
        VB.settings.topicHover = typeof s.topichover !== 'undefined' ? s.topichover : VB.settings.topicHover;
        VB.settings.keywordsGroups = typeof s.keywordsgroups !== 'undefined' ? s.keywordsgroups : VB.settings.keywordsGroups;
        VB.settings.keywordsCounter = typeof s.keywordscounter !== 'undefined' ? s.keywordscounter : VB.settings.keywordsCounter;

        // Transcript
        VB.settings.transcriptBlock = typeof s.transcriptblock !== 'undefined' ? s.transcriptblock : VB.settings.transcriptBlock;
        VB.settings.transcriptHeight = typeof s.transcriptheight !== 'undefined' ? s.transcriptheight : VB.settings.transcriptHeight;
        VB.settings.transcriptWidth = typeof s.transcriptwidth !== 'undefined' ? (s.transcriptwidth < 220 ? 220 : s.transcriptwidth) : VB.settings.transcriptWidth;
        VB.settings.transcriptResizable = typeof s.transcriptresizable !== 'undefined' ? s.transcriptresizable : VB.settings.transcriptResizable;
        VB.settings.transcriptHighlight = typeof s.transcripthighlight !== 'undefined' ? s.transcripthighlight : VB.settings.transcriptHighlight;
        VB.settings.turnTimes = typeof s.turntimes !== 'undefined' ? s.turntimes : VB.settings.turnTimes;
        VB.settings.lineBreak = typeof s.linebreak !== 'undefined' ? s.linebreak : VB.settings.lineBreak;
        VB.settings.humanOnly = typeof s.humanonly !== 'undefined' ? s.humanonly : VB.settings.humanOnly;

        // Comments
        VB.settings.commentsBlock = typeof s.commentsblock !== 'undefined' ? s.commentsblock : VB.settings.commentsBlock;
        VB.settings.commentsWidth = typeof s.commentswidth !== 'undefined' ? s.commentswidth : VB.settings.commentsWidth;
        VB.settings.commentsUsername = typeof s.commentsusername !== 'undefined' ? s.commentsusername : VB.settings.commentsUsername;
        VB.settings.commentsUserhandle = typeof s.commentsuserhandle !== 'undefined' ? s.commentsuserhandle : VB.settings.commentsUserhandle;
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
        searchHits: null
    };
    VB.data = {};

    VB.helper = {
        isRand: !1,
        randConstant: null,
        css: '',
        randId: function() {
            if (!this.isRand && !this.randConstant) {
                this.isRand = !0;
                this.randConstant = this.rand();
            }
            return this.randConstant;
        },
        rand: function() {
            return Math.ceil(Math.random() * 1e9);
        },
        loadCss: function(filename) {
            if (this.css.indexOf("[" + filename + "]") == -1) {
                this.css += "[" + filename + "]";
                var fileref = document.createElement("link");
                fileref.setAttribute("rel", "stylesheet");
                fileref.setAttribute("type", "text/css");
                fileref.setAttribute("href", filename);
                if (typeof fileref != "undefined") {
                    document.getElementsByTagName("head")[0].appendChild(fileref);
                }
            }
        },
        find: function(param) {
            return $('.' + VB.data.vclass + ' ' + param);
        },
        findc: function(param) {
            return $('.' + VB.data.vclass + '' + param);
        },
        showLoader: function() {
            if (VB.settings.animation && VB.helper.find('.vbs-record-timeline-wrap').has('.vbs-loader')) {
                VB.helper.find('.vbs-record-timeline-wrap').prepend('<div class="vbs-loader"></div>');
            }
        },
        hideLoader: function() {
            VB.helper.find('.vbs-record-timeline-wrap .vbs-loader').fadeOut('fast', function() {
                $(this).remove()
            });
        },
        removeBold: function() {
            VB.helper.find('.vbs-keywords-list-wrapper .vbs-keywords-list-tab li a.bold').removeClass('bold');
        },
        termFor: function(string, type) {
            var ar = string.split(',');
            var nar = [];
            for (var i in ar) {
                if (ar[i].match(/\s+/g)) {
                    nar.push('"' + ar[i] + '"');
                } else {
                    nar.push(ar[i]);
                }
            }
            if (typeof type !== 'undefined' && type == 'url') {
                return nar.join(' ');
            }
            return nar;
        },
        filterResultForSpeaker: function(time) {
            if (typeof VB.settings.filterSpeaker == 'undefined' || VB.settings.filterSpeaker == 'all') {
                return true;
            }
            for (var sp in VB.data.allSpeakers) {
                if (time * 1000 > parseFloat(VB.data.allSpeakers[sp].t) &&
                        ((typeof VB.data.allSpeakers[parseInt(sp) + 1] != 'undefined' && time * 1000 <= parseFloat(VB.data.allSpeakers[parseInt(sp) + 1].t)) ||
                         (typeof VB.data.allSpeakers[parseInt(sp) + 1] == 'undefined' && time * 1000 <= VB.data.duration * 1000)) &&
                        VB.helper.getSpeakerKey(VB.data.allSpeakers[parseInt(sp)].s) == VB.settings.filterSpeaker
                        ) {
                    return true;
                }
            }
            return false;
        },
        filterSpeakersList: function(speakers) {
            VB.helper.find('.vbs-select-dropdown li').removeClass('vbs-disabled');
            VB.helper.find('.vbs-select-dropdown li').each(function(){
                var $this = $(this);
                var sp = $this.attr('data-speaker');
                if(speakers.indexOf(sp) < 0 && sp != 'all') {
                    $this.addClass('vbs-disabled');
                }
            });
        },
        parseTime: function(seconds) {
            var h = Math.floor(seconds / 3600) + "";
            var m = Math.floor(seconds % 3600 / 60) + "";
            var s = Math.floor(seconds % 3600 % 60) + "";
            return (h.padLeft(2) + ":" + m.padLeft(2) + ":" + s.padLeft(2));
        },
        getSearchWordsArray: function() {
            var words = VB.helper.find('#voice_search_txt').val().trim().match(/("[^"]+")+|[A-Za-z0-9_.,'-]+/ig);
            return words ? words : [];
        },
        keywordsAutoTopicsColumns: function(col) {
            col = typeof col !== 'undefined' ? col : 5;
            var $kw = VB.helper.find('.vbs-keywords-list-wrapper');
            var _this = this;
            if (col == 0)
                return false;
            $kw.removeClass(this.getColumnClassByNumber(col + 1)).
                    addClass(this.getColumnClassByNumber(col));
            $kw.find('ul.vbs-active li').each(function() {
                if ($(this).height() > 18) {
                    _this.keywordsAutoTopicsColumns(col - 1);
                    return false;
                }
            });
        },
        keywordsAutoColumns: function(col) {
            col = typeof col !== 'undefined' ? col : 5;
            var $kw = VB.helper.find('.vbs-keywords-list-wrapper');
            var _this = this;
            if (col == 0) {
                $kw.removeClass('vbs-auto-columns');
                return false;
            } else {
                $kw.addClass('vbs-auto-columns');
            }
            $kw.removeClass(this.getColumnClassByNumber(col + 1)).
                    addClass(this.getColumnClassByNumber(col));
            $kw.find('ul li').each(function() {
                if ($(this).height() > 18) {
                    _this.keywordsAutoColumns(col - 1);
                    return false;
                }
            });
            $kw.removeClass('vbs-auto-columns');
        },
        getColumnClassByNumber: function(number) {
            switch (number) {
                case 1:
                    return 'vbs-one-col';
                case 2:
                    return 'vbs-two-col';
                case 3:
                    return 'vbs-three-col';
                case 4:
                    return 'vbs-four-col';
                case 5:
                    return 'vbs-five-col';
                default:
                    return '';
            }
        },
        filterKeywords: function(speaker_key) {
            VB.settings.filterSpeaker = speaker_key;
            VB.helper.find('.vbs-topics .vbs-topics-list li').removeClass('vbs-disabled');
            VB.helper.find('.vbs-topics .vbs-topics-list li a').each(function() {
                var $thistopic = $(this);
                if (speaker_key == 'all') {
//                    $thistopic.parent().show();
                } else {
                    if ($thistopic.is('[speakers*="' + speaker_key + '"]')) {
//                        $thistopic.parent().show();
                    } else {
                        $thistopic.parent().addClass('vbs-disabled');
                    }
                    $thistopic.attr('t', $thistopic.attr('data-spt-' + speaker_key));
                }
            });

            VB.helper.find('.vbs-keywords-list-wrapper .vbs-keywords-list-tab li a').each(function() {
                var $this = $(this);
                $this.parent().removeClass('key');
                if (speaker_key == 'all') {
                    $this.parent().addClass('key').show();
                    var st = [];
                    for (var sp in VB.data.speakers) {
                        if (typeof $this.attr('data-spt-' + sp) != 'undefined') {
                            st.push($this.attr('data-spt-' + sp));
                        }
                    }
                    $this.attr('t', st.join());
                } else {
                    if ($this.is('[speakers*="' + speaker_key + '"]')) {
                        $this.parent().addClass('key').show();
                    } else {
                        $this.parent().hide();
                    }
                    $this.attr('t', $this.attr('data-spt-' + speaker_key));
                }
            });
            var active = VB.helper.find('.vbs-topics .vbs-topics-list li.vbs-active');
            if(active.is(':hidden')) {
                var li = VB.helper.find('.vbs-topics-list li.vbs-all-topics');
                li.parent().find('.vbs-active').removeClass('vbs-active');
                li.addClass('vbs-active');
                var catName = li.find('a').text().trim();
                VB.helper.find(".vbs-keywords-list-tab ul").removeClass('vbs-active');
                VB.helper.find('.vbs-keywords-list-tab ul[tid="' + catName + '"]').addClass('vbs-active');
            }

            if (VB.helper.find('#voice_search_txt').val().trim().length > 0) {
                VB.helper.find('.vbs-markers').html('');
                VB.helper.find(".vbs-next-action-btn:not([class='vbs-next-notactive'])").addClass('vbs-next-notactive');
                VB.api.getSearch([VB.helper.find('#voice_search_txt').val().trim()], false);
            }
            if(VB.settings.keywordsCounter) {
                VB.helper.find('.vbs-keywords-list-tab li a').each(function() {
                    var $this = $(this);
                    var t = $this.attr('t');
                    $this.parent().find('span').html('(' + t.split(",").length + ')');
                });
            }
        },
        setUtterance: function(utterances){
            var marker_sem = '';
            var checkbox_sem = '';
            for (var i = 0; i < utterances.length; i++) {
                var utt = utterances[i];
                var segments = utt.segments;

                for (var j = 0; j < segments.length; j++) {
                    var segment = segments[j];
                    var startPosition = VB.helper.getOffset(segment.s);
                    var endPosition = VB.helper.getOffset(segment.e);
                    var segment_width = endPosition - startPosition;
                    var timeLabel = VB.helper.parseTime(segment.s) + ' to ' + VB.helper.parseTime(segment.e);

                    marker_sem += VB.templates.parse('utteranceMarker', {
                        startTime: segment.s,
                        rownum: i + 1,
                        width: segment_width,
                        position: startPosition,
                        title: segment.u, //utt.name,
                        time: timeLabel
                    });
                }

                checkbox_sem += VB.templates.parse('utteranceCheckBox', {
                    rownum: i + 1,
                    title: utt.name,
                    segmentsCount: segments.length
                });
            }
            VB.helper.find('.vbs-utterance-markers').empty().append(marker_sem);
            if(checkbox_sem){
                var utteranceBlock = VB.templates.get('utteranceBlock');
                VB.helper.find('.vbs-keywords-block').before($(utteranceBlock));
                VB.helper.find('.vbs-utterance-block ul').append(checkbox_sem);
            }
        },
        getSpeakerKey: function(name) {
            for (var iss in VB.data.speakers) {
                if (VB.data.speakers[iss] == name)
                    return iss;
            }
            return '';
        },
        downloadFile: function(type) {
            var params = VB.api.parameters;
            params.action = 'getTranscript';
            params.content = true;
            params.format = type;
            window.location = VB.settings.apiUrl + '?' + getStringFromObject(params);
        },
        getNewUrl: function(urlparams) {
            var query = window.location.search.substring(1),
                    vars = query.split('&'),
                    opt = {},
                    np = [];
            if (query.length > 0) {
                for (var i = 0; i < vars.length; i++) {
                    var pair = vars[i].split('=');
                    if (pair[0] != 'vbt' && pair[0] != 'vbs') {
                        opt[pair[0]] = pair[1];
                        for (var params in urlparams) {
                            if (decodeURIComponent(pair[0]) == params) {
                                opt[pair[0]] = urlparams[params];
                            }
                        }
                    }
                }
            }
            for (var sh in VB.settings.shareParams) {
                if (typeof opt[sh] == 'undefined') {
                    opt[sh] = VB.settings.shareParams[sh];
                }
            }
            for (var params in urlparams) {
                if (typeof opt[params] == 'undefined') {
                    opt[params] = urlparams[params];
                }
            }
            for (var p in opt) {
                np.push(p + "=" + opt[p]);
            }
            return VB.settings.shareUrl ? VB.settings.shareUrl + '?' + np.join('&') : window.location.origin + window.location.pathname + '?' + np.join('&');
        },
        checkAutoStart: function() {
            var query = window.location.search.substring(1);
            var urlparams = ["vbt", "vbs"];
            var vars = query.split('&');
            var rt = {}
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split('=');
                for (var params in urlparams) {
                    if (decodeURIComponent(pair[0]) == urlparams[params]) {
                        rt[urlparams[params]] = pair[1];
                    }
                }
            }
            VB.data.startParams = rt;
            return false;
        },
        waitReady: function() {
            if (VB.api.ready.keywords && VB.api.ready.metadata && VB.api.ready.transcript && VB.api.ready.comments) {

                VB.helper.checkErrors();
                clearTimeout(VB.data.waiter);
                VB.view.speakersWidget();
                VB.view.commentsTWidget();
                if (VB.settings.editKeywords) {
                    $(".vbs-keywords-block .vbs-topics").addClass('vbs-edit-topics');
                }
                if (!$('.vbs-media-block').hasClass('.less-600px')) {
                    $('.vbs-record-player .vbs-time-name-wrapper-narrow').css({'opacity': 0});
                }
                if(VB.settings.playerType == 'jwplayer' && VB.api.response.metadata != null) {
                    if (VB.helper.getRenderingMode() != "html5" && VB.settings.stream == 'rtmp') {
                        var rtmp = VB.api.response.metadata.response.rtmpUrl + "" + VB.api.response.metadata.response.rtmpFile;
                        VB.helper.loadFile(rtmp);
                    } else
                    if (VB.settings.stream == 'http' || VB.settings.stream == true) {
                        VB.helper.loadFile(VB.api.response.metadata.response.streamUrl);
                    }
                }
                if (VB.data.startParams != false) {
                    this.autoStart(VB.data.startParams);
                }
                if(VB.api.response.keywords.utterances){
                    VB.helper.setUtterance(VB.api.response.keywords.utterances);
                }

                VB.view.tooltips();
            }
            return false;
        },
        waitReadyAfterSave: function() {
            if (VB.api.ready.keywords && VB.api.ready.metadata && VB.api.ready.transcript && VB.api.ready.comments) {
                VB.helper.find('.vbs-edit-mode-prewrapper').html("");
                $('body').removeClass('vbs-no-scroll');
                VB.helper.checkErrors();
                clearTimeout(VB.data.waiterSave);
                VB.view.speakersWidget();
                VB.view.commentsTWidget();
                VB.view.tooltips();
            }
            return false;
        },
        autoStart: function(params) {
            if (typeof params['vbs'] != 'undefined') {
                VB.helper.find('.vbs-markers').html('');
                VB.helper.find(".vbs-next-action-btn:not([class='vbs-next-notactive'])").addClass('vbs-next-notactive');
                var words = decodeURI(params['vbs']).trim().match(/("[^"]+")+|[A-Za-z0-9_.,'-]+/ig);
                words = words ? words : [];
                var stringWords = words.join(' ');
                VB.helper.find('#voice_search_txt').val(stringWords).attr('data-val', stringWords).change();
                if (words.length) {
                    VB.view.searchWordWidget(words);
                }
                var autoStart = true;
                if (typeof params['vbt'] != 'undefined') {
                    autoStart = false;
                    VB.data.played = params['vbt'];
                    VB.helper.seek(VB.data.played);
                }
                VB.api.getSearch(words, autoStart);
                return false;
            } else
            if (typeof params['vbt'] != 'undefined') {
                VB.data.played = params['vbt'];
                VB.helper.seek(VB.data.played);
            }

        },
        startScroll: function() {
            VB.helper.find("#vbs-search-string .vbs-marquee .vbs-search-word-widget").stop(true).css("left", 0);
            var words_width = 0;
            VB.helper.find(".vbs-word").each(function() {
                words_width += $(this).width() + 7;
            })
            if (words_width > VB.helper.find("#vbs-search-string .vbs-marquee").width()) {
                VB.helper.find('#vbs-search-string .vbs-marquee .vbs-search-word-widget').width(words_width);
                VB.helper.scrollStringLeft();
            }
        },
        scrollStringLeft: function() {
            var words_count = VB.helper.find(".vbs-word").length,
                    words_animate_duration = words_count * 1200;
            VB.helper.find("#vbs-search-string .vbs-marquee .vbs-search-word-widget").animate({"left": (VB.helper.find("#vbs-search-string .vbs-marquee").width()) - (VB.helper.find("#vbs-search-string .vbs-marquee .vbs-search-word-widget").width())}, {
                duration: words_animate_duration,
                complete: function() {
                    VB.helper.scrollStringRight();
                }
            }
            );
        },
        scrollStringRight: function() {
            var words_count = VB.helper.find(".vbs-word").length,
                    words_animate_duration = words_count * 1200;
            VB.helper.find("#vbs-search-string .vbs-marquee .vbs-search-word-widget").animate({"left": "1"}, {
                duration: words_animate_duration,
                complete: function() {
                    VB.helper.scrollStringLeft();
                }
            }
            );
        },
        getMaxKeywordHeight: function() {
            var vTopics = VB.helper.find('.vbs-topics-list').height();
            var vKeywords = VB.helper.find('.vbs-keywords-list-tab ul.vbs-active').height() + 10;
            return vTopics > vKeywords ? vTopics : vKeywords;
        },
        getKeywordHeight: function() {
            var vTopics = $('.vbs-topics').height();
            var vKeywords = $('.vbs-keywords-list-tab').height() + 10;
            return vTopics > vKeywords ? vTopics : vKeywords;
        },
        checkKeyword: function(terms, times, hits) {
            var nt = terms;
            var foradd = [];
            VB.helper.find('#vbs-search-string .vbs-search-word-widget .vbs-word a.vbs-add-search-word').remove();
            for (var ti in nt) {
                var term = nt[ti].replace(/"/g, '');
                if (jQuery.inArray(term, VB.data.keywords) == '-1') {
                    var ntTimes = [];
                    for (var hit in hits) {
                        if(hits[hit].term == term){
                            hits[hit].hits.map(function(hit) {
                                ntTimes = ntTimes.concat(hit.time);
                            });
                        }
                    }
                    var plus = '<a href="#add" class="vbs-add-search-word" title="Add to all topics" data-kwa="' + term + '" data-kwt="' + ntTimes + '"></a>';
                    VB.helper.find('#vbs-search-string .vbs-search-word-widget .vbs-word[data-word-o="' + term + '"]').append(plus);
                }
            }
        },
        localSearch: function(elem, terms) {
            var allTimes = [];
            var colors = new Array();
            VB.helper.find('.vbs-widget .vbs-word').each(function(key, marker) {
                var $marker = $(marker);
                var word = $marker.find('.vbs-search_word').text().replace(/"/g, '').toLowerCase();
                colors[word] = $marker.find('.vbs-marker').css('border-bottom-color');
            });

            var speakers = elem.attr('speakers').split(",");
            var times = [];
            var timesArray = elem.attr('t').split(",");
            var phrases = [];

            timesArray.map(function(time) {
                if (VB.helper.filterResultForSpeaker(time)) {
                    times = times.concat(time);
                    phrases = phrases.concat(VB.helper.localPhrase(time));
                }
            })
            VB.view.markerWidget(times, phrases, colors[terms]);

            allTimes = allTimes.concat(times);
            allTimes.sort(function(a, b) {
                return a - b;
            });
            VB.helper.seek(allTimes[0]);
        },
        localPhrase: function(time) {
            var before = 1000;
            var after = 1500;
            var text = "";
            var $elems = VB.helper.find('.vbs-transcript-wrapper > span > span:wordtime(' + (time * 1000 - before) + ',' + (time * 1000 + after) + ')');
            $elems.each(function() {
                var thistext = $(this).text();
                if (text == '' && !thistext.match(/\w+/g)) {
                } else if (text !== '' && !thistext.match(/\w+/g)) {
                    text += thistext;
                } else {
                    text += ' ' + thistext;
                }
            });
            return text;
        },
        highlight: function(position) {
            var curtime = Math.round(position);
            if (curtime == 1) {
                curtime = 0;
            }
            var nc = Math.floor(curtime / VB.settings.transcriptHighlight);
            curtime = nc * VB.settings.transcriptHighlight;
            VB.helper.find('.vbs-transcript-block .vbs-transcript-wrapper > span').removeClass('vbs-hl');
            VB.helper.find('.vbs-transcript-block .vbs-transcript-wrapper > span:wordtime(' + curtime + ',' + (curtime + VB.settings.transcriptHighlight - 1) + ')').addClass('vbs-hl');
            var spanhl = VB.helper.find('.vbs-transcript-block .vbs-transcript-wrapper > span.vbs-hl').length ? VB.helper.find('.vbs-transcript-block .vbs-transcript-wrapper > span.vbs-hl') : false;
            var transcripttext = VB.helper.find('.vbs-transcript-block .vbs-transcript-prewrapper').length ? VB.helper.find('.vbs-transcript-block .vbs-transcript-prewrapper') : false;
            if (spanhl && transcripttext) {
                VB.helper.find('.vbs-transcript-block .vbs-transcript-prewrapper:not(.vbs-t-hover)').stop(true, true).animate({
                    scrollTop: spanhl.offset().top - transcripttext.offset().top + transcripttext.scrollTop() - (transcripttext.height() - 20) / 2
                }, 500);
            }
            if ($('body').hasClass('vbs-readermode') && jQuery('.vbs-transcript-block .vbs-transcript-prewrapper:not(.vbs-t-hover)').length) {
                transcripttext = jQuery('.vbs-transcript-block').length ? jQuery('.vbs-transcript-block') : false;
                jQuery('.vbs-transcript-block').stop(true, true).animate({
                    scrollTop: spanhl.offset().top - transcripttext.offset().top + transcripttext.scrollTop() - (transcripttext.height() - 20) / 2
                }, 500);
            }
        },
        speakers: function() { // show "{{Speaker}} is speaking" in player heading
            var ct = VB.data.position * 1000;
            var curspeaker = jQuery('.vbs-speakers > div:speakertime(' + ct + ')');
            if (curspeaker.length) {
                var sname = curspeaker.attr('data-original-title');
                var scolor = curspeaker.attr('cnum');
                if (typeof sname != 'undefined' && (VB.data.lspeaker != sname || sname.trim() == '>>')) {
                    VB.data.lspeaker = sname;
                    var spblock = '<span class="' + scolor + '">' + sname + '</span> is speaking';
                    VB.helper.find('.vbs-voice-name').html(spblock);
                    VB.helper.adjustMediaTime();
                }
            } else {
                VB.helper.find('.vbs-voice-name').html('');
            }
        },
        track: function(event, args){
            args = typeof args != 'undefined' ? args : false;
            if (typeof ga !== 'undefined' && VB.settings.trackEvents) {
                switch (event) {
                    case ('play'):
                        ga('send', 'event', VB.settings.mediaId, 'Play', VB.helper.getPosition());
                        return true;
                    case ('pause'):
                        ga('send', 'event', VB.settings.mediaId, 'Pause', VB.helper.getPosition());
                        return true;
                    case ('seek'):
                        ga('send', 'event', VB.settings.mediaId, 'Seek', args);
                        return true;
                    case ('keyword'):
                        ga('send', 'event', VB.settings.mediaId, 'Keyword', args);
                        return true;
                    case ('transcript'):
                        ga('send', 'event', VB.settings.mediaId, 'Transcript', args);
                        return true;
                    break;
                    default:
                        return false;
                }
            }
            return false;
        },
        editTranscriptText: function(){
            var dt = VB.api.response.transcript.transcript,
                transpart = '',
                lt = 0,
                last = 0;
            for (var i = 0; i < dt.length; i++) {
                var val = dt[i];
                if (i == 0) {
                    transpart += '<span t="' + 0 + '">';
                }
                for (var k = 2; k <= 10; k++) {
                    if (Math.floor(val.s / 1000) >= (last + VB.settings.transcriptHighlight * k)) {
                        last += VB.settings.transcriptHighlight * k;
                        transpart += '<span t="' + last + '"></span>';
                    }
                }
                if (Math.floor(val.s / 1000) >= (last + VB.settings.transcriptHighlight)) {
                    last += VB.settings.transcriptHighlight;
                    transpart += '</span><span t="' + last + '">';
                }
                lt += val.s;
                var sptag = (typeof val.m !== "undefined" && val.m == "turn") ? 'm="' + val.w.replace(/<br\s*[\/]?>/gi, "").replace(/\n/gi, "").replace(":", "").trim() + '"' : '';
                var word = val.w.replace(/\n/g, "");
                transpart += val.w.match(/\w+/g) ? ' <span class="w vbs-wd ' + (sptag.length ? 'vbs-edit-speaker':'') + '" t="' + val.s + '" ' + sptag + '>' + word + '</span>' : '<span class="vbs-wd" t="' + val.s + '" ' + sptag + '>' + word + '</span>';
            }
            transpart += '</span>';
            return transpart;
        },
        saveTranscript: function() {
            var html = VB.helper.find('.vbs-edition-block').html();
            html = html.replace(/<br\s*[\/]?>/gi, "\n");
            var div = document.createElement("div");
            div.innerHTML = html;
            var content = div.textContent || div.innerText || "";
            VB.api.saveTrancript(content.trim());
        },
        saveTranscriptComplete: function() {
            VB.helper.find('.vbs-save-popup-wrapper .vbs-save-loading-popup').fadeOut('fast');
            VB.helper.find('.vbs-save-popup-wrapper .vbs-save-done-popup').fadeIn('fast');
            VB.view.initAfterSaveTranscript();
            VB.data.waiterSave = setInterval(function() {
                VB.helper.waitReadyAfterSave();
            }, 100);
        },
        adjustMediaTime: function(){
            var mediaTitle = VB.helper.find('.vbs-media-block .vbs-section-title');
            var mediaBtns = VB.helper.find('.vbs-media-block .vbs-section-btns');
            var mediaTitleRightCoord = mediaTitle.offset().left + mediaTitle.width();
            var mediaBtnsLeftCoord = mediaBtns.offset().left;

            if(mediaTitleRightCoord >= mediaBtnsLeftCoord){
                mediaTitle.find('.vbs-voice-name').hide();
                var mediaTitle = VB.helper.find('.vbs-media-block .vbs-section-title');
                var mediaBtns = VB.helper.find('.vbs-media-block .vbs-section-btns');
                var mediaTitleRightCoord = mediaTitle.offset().left + mediaTitle.width();
                var mediaBtnsLeftCoord = mediaBtns.offset().left;

                if(mediaTitleRightCoord >= mediaBtnsLeftCoord){
                    mediaTitle.find('.vbs-time').hide();
                    if (VB.helper.find('.vbs-media-block').hasClass('vbs-video')){
                        var time = VB.helper.parseTime(VB.data.duration);
                        VB.helper.findc('.vbs-player-wrapper').append('<span class="vbs-time"><span class="vbs-ctime">00:00:00</span> / <span class="vbs-ftime">' + time + '</span></span>');
                    }
                }
            }
        },
        startPlayer: function(start_time) {
            VB.helper.showLoader();
            window.setTimeout(function() {
                VB.helper.cseek(start_time);
            }, 200);

            window.setTimeout(function() {
                VB.settings.movelistner = false;
                VB.settings.dragging = false;
            }, 300);

            if (VB.settings.transcriptHighlight) {
                VB.helper.highlight(start_time);
            }
        },
        cseek: function(time) {
            VB.instances[VB.current_instance].player.interface.seek(time);
        },
        seek: function(time) {
            VB.helper.startPlayer(time);
        },
        play: function() {
            VB.instances[VB.current_instance].player.interface.play();
        },
        pause: function() {
            VB.instances[VB.current_instance].player.interface.pause();
        },
        getOffset: function(startTime){
            var wrapper = VB.helper.find('.vbs-record-timeline-wrap');
            return (startTime * wrapper.width()) / VB.data.duration;
        },
        getPosition: function() {
            return VB.instances[VB.current_instance].player.interface.position();
        },
        getStatus: function() {
            return VB.instances[VB.current_instance].player.interface.play_state();
        },
        getVolume: function() {
            return VB.instances[VB.current_instance].player.interface.get_volume();
        },
        setVolume: function(vol) {
            return VB.instances[VB.current_instance].player.interface.set_volume(vol);
        },
        getBuffer: function() {
            return VB.instances[VB.current_instance].player.interface.get_buffer();
        },
        getRenderingMode: function() {
            return VB.instances[VB.current_instance].player.interface.get_rendering_mode();
        },
        loadFile: function(f) {
            return VB.instances[VB.current_instance].player.interface.load_file(f);
        },
        checkErrors: function(){
            var $content_block = $('.vbsp-' + VB.helper.randId() + '.vbs-content');
            if (VB.api.errors.processing) {
                $content_block.append(VB.templates.get('reloadOverlayCredentials'));
            }
            else if(VB.api.errors.failure){
                $content_block.append(VB.templates.get('errorPopup'));
                var $bigErrorPopup = $content_block.find('.vbs-big-error-popup');
                var bigErrorPopupHeight = parseInt($bigErrorPopup.css('height'));
                $bigErrorPopup.css('marginTop', -bigErrorPopupHeight / 2);
            }
        },
        debug: function() {
            var pstreamUrl = 'inited';
            if (VB.settings.stream == "rtmp") {
                pstreamUrl = VB.api.response.metadata.response.rtmpUrl + VB.api.response.metadata.response.rtmpFile;
            } else if (VB.settings.stream == "http" || VB.settings.stream == true) {
                pstreamUrl = VB.api.response.metadata.response.streamUrl;
            }

            var response = {
                type: VB.settings.playerType,
                mode: VB.helper.getRenderingMode(),
                inited: VB.instances.length,
                isStream: VB.settings.stream,
                streamUrl: pstreamUrl,
                mediaID: VB.settings.mediaId ? VB.settings.mediaId : VB.settings.externalId,
                statusMetaData: VB.api.response.metadata && VB.api.response.metadata.requestStatus ? VB.api.response.metadata.requestStatus : false,
                statusKeyword: VB.api.response.keywords && VB.api.response.keywords.requestStatus ? VB.api.response.keywords.requestStatus : false,
                statusTranscript: VB.api.response.transcript && VB.api.response.transcript.requestStatus ? VB.api.response.transcript.requestStatus : false,
                statusTranscriptFileStatus: VB.api.response.transcript && VB.api.response.transcript.fileStatus ? VB.api.response.transcript.fileStatus : false,
                statusComments: VB.api.response.comments && VB.api.response.comments.requestStatus ? VB.api.response.comments.requestStatus : false,
                browserAppVersion: navigator.appVersion,
                browserUserAgent: navigator.userAgent,
                browserPlatform: navigator.platform,
                browserUserLanguage: navigator.userLanguage,
                url: window.location.href
            };

            // send logs to loggly.com
            if(typeof _LTracker != 'undefined'){
                _LTracker.push(response);
            }

            var $logger = VB.helper.find('.vbs-logger');
            if($logger.length > 0){
                $logger.remove();
            }
            else{
                VB.helper.find('.vbs-record-player').after(VB.templates.parse('loggerBlock', {response: JSON.stringify(response)}));
                var $textarea = VB.helper.find('.vbs-logger textarea');
                $textarea.bind('focus', function() {
                    this.select();
                });
            }
            console.log(response);
        }
    };

    VB.view = {
        main: null,
        pluginDiv: null,
        init: function(elem) {
            this.main = elem;
            var divnode = document.createElement('div');
            divnode.className = 'vbsp-' + VB.helper.randId() + ' vbs-content';
            divnode.innerHTML = VB.templates.get('mainDiv');
            this.pluginDiv = $(divnode);
            $(this.main).after(this.pluginDiv);
            VB.api.init();
            if (!VB.settings.token && !VB.settings.example) {
                VB.api.getToken(VB.settings.tokenTimeOut);
            } else if (VB.settings.example) {
                VB.api.getExampleToken();
            } else {
                VB.view.initWithToken();
            }
        },
        initWithToken: function() {
            VB.data.vclass = 'vbs-' + VB.helper.randId();
            $("#" + VB.settings.mediaBlock).html(VB.templates.parse('vbs-media')).addClass(VB.data.vclass).css({width: VB.settings.mediaWidth});
            $("#" + VB.settings.controlsBlock).html(VB.templates.get('vbs-controls')).addClass(VB.data.vclass).css({width: VB.settings.controlsWidth});
            $("#" + VB.settings.keywordsBlock).html(VB.templates.parse('vbs-keywords', {styles: 'height: ' + VB.settings.keywordsHeight + 'px;'})).addClass(VB.data.vclass).css({width: VB.settings.keywordsWidth});
            $("#" + VB.settings.transcriptBlock).addClass(VB.data.vclass).html(VB.templates.get('vbs-transcript')).css({width: VB.settings.transcriptWidth});
            $("#" + VB.settings.commentsBlock).addClass(VB.data.vclass).html(VB.templates.get('vbs-comments')).css({width: VB.settings.commentsWidth});
            if ($("#" + VB.settings.mediaBlock + "." + VB.data.vclass).width() < VB.settings.mediumResponsive && $("#" + VB.settings.mediaBlock + "." + VB.data.vclass).width() >= VB.settings.minResponsive) {
                $("#" + VB.settings.mediaBlock + "." + VB.data.vclass).addClass('less-600px');
            } else if ($("#" + VB.settings.mediaBlock + "." + VB.data.vclass).width() < VB.settings.minResponsive) {
                $("#" + VB.settings.mediaBlock + "." + VB.data.vclass).addClass('less-600px').addClass('less-460px');
            }
            if ($("#" + VB.settings.controlsBlock).width() < VB.settings.mediumResponsive && $("#" + VB.settings.controlsBlock).width() >= VB.settings.minResponsive) {
                $("#" + VB.settings.controlsBlock).addClass('less-600px');
            } else if ($("#" + VB.settings.controlsBlock).width() < VB.settings.minResponsive) {
                $("#" + VB.settings.controlsBlock).addClass('less-600px').addClass('less-460px');
            }
            if ($("#" + VB.settings.keywordsBlock).width() < VB.settings.mediumResponsive && $("#" + VB.settings.keywordsBlock).width() >= VB.settings.minResponsive) {
                $("#" + VB.settings.keywordsBlock).addClass('less-600px');
            } else if ($("#" + VB.settings.keywordsBlock).width() < VB.settings.minResponsive) {
                $("#" + VB.settings.keywordsBlock).addClass('less-600px').addClass('less-460px');
            }
            if ($("#" + VB.settings.transcriptBlock + "." + VB.data.vclass).width() < VB.settings.mediumResponsive && $("#" + VB.settings.transcriptBlock + "." + VB.data.vclass).width() >= VB.settings.minResponsive) {
                $("#" + VB.settings.transcriptBlock + "." + VB.data.vclass).addClass('less-600px');
            } else if ($("#" + VB.settings.transcriptBlock + "." + VB.data.vclass).width() < VB.settings.minResponsive) {
                $("#" + VB.settings.transcriptBlock + "." + VB.data.vclass).addClass('less-600px').addClass('less-460px');
            }
            if ($("#" + VB.settings.commentsBlock).width() < VB.settings.mediumResponsive && $("#" + VB.settings.commentsBlock).width() >= VB.settings.minResponsive) {
                $("#" + VB.settings.commentsBlock).addClass('less-600px');
            } else if ($("#" + VB.settings.commentsBlock).width() < VB.settings.minResponsive) {
                $("#" + VB.settings.commentsBlock).addClass('less-600px').addClass('less-460px');
            }

            VB.api.getMetaData();
            VB.api.getKeywords();
            VB.api.getTranscript();
            VB.api.getComments();
            VB.data.waiter = setInterval(function() {
                VB.helper.waitReady();
            }, 100);
            registerEvents();
        },
        initAfterSaveTranscript: function() {
            // Keyword clear
            VB.api.ready.keywords = false;
            VB.helper.find('.vbs-keywords-block .vbs-topics').html('');
            VB.helper.find('.vbs-keywords-block .vbs-keywords-list-tab').html('');
            VB.helper.find('.vbs-select-speaker-wrapper .vbs-select-dropdown').html('');
            VB.helper.find('.vbs-search-form').addClass('vbs-no-speaker');
            VB.data.speakers = {};
            // Transcript clear
            VB.api.ready.transcript = false;
            VB.helper.find('.vbs-transcript-block').removeClass('vbs-human').removeClass('vbs-with-order-btn');
            VB.helper.find('.vbs-transcript-block .vbs-transcript-wrapper').html('').removeClass('vbs-turntimes');
            VB.helper.find('.vbs-speakers').html('').removeClass('vbs-machine');
            VB.helper.find('.vbs-media-block .vbs-section-title, .vbs-time-name-wrapper-narrow').removeClass('vbs-machine');
            // ReInit
            VB.api.getKeywords();
            VB.api.getTranscript();
        },
        searchWordWidget: function(words) {
            var wrapper = VB.helper.find('.vbs-search-word-widget');
            VB.helper.find('#voice_search_txt').css("opacity", "0");
            VB.helper.find('#vbs-search-string').show();
            var markers_string = "";
            for (var i in words) {
                var tmpcolor = '';
                if (i > 7) {
                    tmpcolor = '#' + ('000000' + (Math.random() * 0xFFFFFF << 0).toString(16)).slice(-6);
                } else {
                    tmpcolor = VB.settings.colors[i];
                }
                markers_string += " " + VB.templates.parse('searchWordTemplate', {
                    'word': words[i],
                    'clean_word': words[i].replace(/"/g, ''),
                    'color': tmpcolor
                }, 'span');
            }
            wrapper.html(markers_string);
            if (VB.data.searcht && VB.settings.editKeywords && VB.helper.find('#voice_search_txt').attr('data-val') == VB.helper.find('#voice_search_txt').val()) {
                VB.helper.checkKeyword(words, VB.data.searcht, VB.data.searchHits);
            }
            if(VB.helper.find('#voice_search_txt').attr('data-val') != VB.helper.find('#voice_search_txt').val()) {
                VB.data.searcht = null;
                VB.data.searchHits = null;
            }
            VB.helper.startScroll();
        },
        markerWidget: function(times, phrases, color) {
            var wrapper = VB.helper.find('.vbs-record-timeline-wrap');
            var markers_div = VB.helper.find('.vbs-markers');
            var markers_string = "";
            if (typeof (color) == 'undefined' || color == null) {
                color = VB.settings.colors[0];
            }
            if (typeof (phrases) == 'undefined' || phrases == null) {
                phrases = null;
            }
            for (var i in times) {
                var position = (times[i] * wrapper.width()) / VB.data.duration;
                markers_string += " " + VB.templates.parse('markerTemplate', {
                    'position': position,
                    'time': times[i],
                    'stcolor': color,
                    'phrase': typeof (phrases[i]) == 'undefined' ? '' : phrases[i]
                });
            }
            markers_div.append(markers_string);
            if (markers_string.length) {
                VB.helper.find(".vbs-next-action-btn").removeClass('vbs-next-notactive');
            }
        },
        keywordHover: function(times) {
            if(times == '') {
                return false;
            }
            var wrapper = VB.helper.find('.vbs-record-timeline-wrap');
            var markers_string = '';
            times = times.split(",");
            for (var i in times) {
                var position = ((parseFloat(times[i])) * wrapper.width()) / VB.data.duration;
                markers_string += " " + VB.templates.parse('markerKeyTemplate', {
                    'position': position,
                    'time': parseFloat(times[i])
                });
            }
            VB.helper.find('.vbs-markers-hovers').html(markers_string);
        },
        removeKeywordHover: function() {
            VB.helper.find('.vbs-markers-hovers').html("");
        },
        commentsWidget: function(data, hide) {
            VB.helper.find('.vbs-comments-block .vbs-section-body').html(data);
            if (hide) {
                VB.helper.find('.vbs-comments-block .vbs-section-body').hide();
                VB.helper.find('.vbs-comments-block .vbs-section-title').addClass('vbs-hidden');
            }
            VB.helper.find('.vbs-comments-block').slideDown('fast');
        },
        commentsTWidget: function() {
            var wrapper = VB.helper.find('.vbs-record-timeline-wrap');
            var cmhtml = '';
            for (var thread_key in VB.data.commentsThreads) {
                var stime = VB.data.commentsThreads[thread_key].timeStamp;
                var position = (stime * wrapper.width()) / VB.data.duration;
                var rightClass = stime > VB.data.duration / 2 ? 'vbs-from-right' : '';
                var commentText = VB.data.commentsThreads[thread_key].comments[0].content;
                cmhtml += VB.templates.parse('vbsCommentsTimeline', {position: position, rightClass: rightClass, stime: stime, commentText: commentText});
            }
            VB.helper.find('.vbs-comments-wrapper-block').html(cmhtml);
        },
        favorite: function(opt) {
            if (opt)
                VB.helper.find(".vbs-star-btn").addClass('vbs-active').attr('data-tile', 'Remove from Favorites');
            else
                VB.helper.find(".vbs-star-btn").removeClass('vbs-active').attr('data-tile', 'Add from Favorites');
            return opt;
        },
        favoriteToggle: function() {
            VB.helper.find(".vbs-star-btn").toggleClass('vbs-active');
            return true;
        },
        speakersWidget: function() {
            var speakers = [];
            var snn = 1;
            VB.helper.find('.vbs-transcript-block .vbs-transcript-wrapper span.w[m]').each(function(index) {
                var $this = $(this);
                var spitem = [];
                spitem.s = $this.attr('m');
                spitem.t = $this.attr('t');
                speakers.push(spitem);
                var br = "", spclass;
                if (VB.settings.turnTimes) {
                    if (spitem.s.trim() == '>>') {
                        spclass = snn % 2 ? 'vbs-sp1' : 'vbs-sp2';
                        snn++;
                    } else {
                        spclass = VB.helper.getSpeakerKey(spitem.s);
                    }
                    br += '<span class="vbs-trans-info"><span class="vbs-human-trans-name ' + spclass + '">' + spitem.s + '</span><span class="vbs-human-trans-time">' + VB.helper.parseTime($this.attr('t') / 1000) + '</span></span>';
                }
                jQuery(br).insertBefore(this);
            });
            if (snn > 1) {
                VB.helper.find('.vbs-transcript-block .vbs-transcript-wrapper').addClass('vbs-machine');
            }
            var snn = 1;
            if (speakers.length) {
                if (VB.settings.turnTimes) {
                    VB.helper.find('.vbs-transcript-block .vbs-transcript-wrapper').addClass('vbs-turntimes');
                }
                var wrapperWidth = VB.helper.find('.vbs-record-timeline-wrap').width() - 1;
                var speakers_string = '';
                VB.data.allSpeakers = speakers;
                for (var i in speakers) {
                    speakers[i].s = speakers[i].s.replace(/<br \/>/g, "").replace(/<br\/>/g, "").replace(/\n/g, "").trim();
                    var position = ((speakers[i].t) / 1000 * wrapperWidth) / VB.data.duration;
                    var width;
                    if (typeof speakers[parseFloat(i) + 1] !== "undefined") {
                        width = ((speakers[parseFloat(i) + 1].t - speakers[parseFloat(i)].t) / 1000 * wrapperWidth) / VB.data.duration;
                    } else {
                        width = ((VB.data.duration - (speakers[parseFloat(i)].t) / 1000) * wrapperWidth) / VB.data.duration;
                    }
                    var end;
                    if (typeof speakers[parseFloat(i) + 1] !== "undefined") {
                        end = parseFloat(speakers[parseFloat(i) + 1].t);
                    } else {
                        end = VB.data.duration * 1000;
                    }
                    if (speakers[i].s.trim() == '>>') {
                        var colorclass = snn % 2 ? 'vbs-sp1' : 'vbs-sp2';
                        snn++;
                    } else {
                        var colorclass = VB.helper.getSpeakerKey(speakers[i].s);
                    }
                    speakers_string += " " + VB.templates.parse('speakersTemplate', {
                        'position': position,
                        'width': width,
                        's': parseFloat(speakers[parseFloat(i)].t),
                        'e': end,
                        'speaker': speakers[i].s,
                        'colorclass': colorclass
                    });
                }

                VB.helper.find('.vbs-speakers').html(speakers_string);
                if (snn > 1) {
                    VB.helper.find('.vbs-speakers').addClass('vbs-machine');
                    VB.helper.find('.vbs-media-block .vbs-section-title, .vbs-time-name-wrapper-narrow').addClass('vbs-machine');
                }
            }
        },
        speakerFilterWidget: function(speakers) {
            var speakers_string = '<li data-speaker="all">All Speakers</li>';
            for (var sp in speakers) {
                speakers_string += '<li data-speaker="' + sp + '">' + speakers[sp] + '</li>';
            }
            VB.helper.find('.vbs-search-form').removeClass('vbs-no-speaker');
            if (VB.helper.findc("#" + VB.settings.keywordsBlock).width() < VB.settings.mediumResponsiveWithSpeakers && VB.helper.findc("#" + VB.settings.keywordsBlock).width() >= VB.settings.minResponsive) {
                VB.helper.findc("#" + VB.settings.keywordsBlock).addClass('less-600px');
                VB.helper.find('.vbs-keywords-wrapper').height(VB.helper.find('.vbs-keywords-wrapper').height() - 55);
            }
            VB.helper.find('.vbs-select-speaker-wrapper .vbs-select-dropdown').html(speakers_string);
        },
        resizeTimelineElements: function() {
            // Markers
            var wrapperWidth = VB.helper.find('.vbs-record-timeline-wrap').width();
            var duration = VB.data.duration;
            VB.helper.find('.vbs-markers a').each(function() {
                var $this = $(this);
                var markerTime = $this.attr('stime');
                var position = (markerTime * wrapperWidth) / duration;
                $this.css('left', position);
            });
            // Speakers
            VB.helper.find('.vbs-speakers div').each(function() {
                var $this = $(this);
                var _speakerTimeStart = $this.attr('s');
                var _speakerTimeEnd = $this.attr('e');
                var position = (_speakerTimeStart / 1000 * (wrapperWidth - 1)) / duration;
                var width = ((_speakerTimeEnd - _speakerTimeStart) / 1000 * (wrapperWidth - 1)) / duration;
                $this.css({'left': position, 'width': width});
            });
            //Comments
            VB.helper.find('.vbs-comments-wrapper-block div.vbs-comments-wrapper ').each(function() {
                var $this = $(this);
                var commentTime = $this.attr('stime');
                var position = (commentTime * wrapperWidth) / duration;
                $this.css('left', position);
            });
            VB.helper.startScroll();
        },
        tooltips: function() {
            /* tooltips*/
            $('body').append('<span class="vbs-tooltip"></span>');
            $('[data-title]').each(function() {
                var $this = $(this);
                var titleBtnWidth = parseInt($this.css("width"));
                var tooltipTopMargin = $this.height();
                var $vbsTooltip = $('.vbs-tooltip');
                $this.hover(
                    function() {
                        $vbsTooltip.stop(true, true).hide();
                        var topPos = $this.offset().top;
                        var leftPos = $this.offset().left;
                        var title = $this.attr('data-title');
                        $vbsTooltip.text(title);
                        var vbsTooltipWidth = parseInt($vbsTooltip.css('width')) + 20;
                        var tooltipLeftMargin = (titleBtnWidth - vbsTooltipWidth) / 2;
                        VB.view.tooltipPosition($vbsTooltip, tooltipLeftMargin, tooltipTopMargin, topPos, leftPos);
                        $vbsTooltip.stop(true, true).fadeIn(100);
                    }, function() {
                        $vbsTooltip.stop(true, true).fadeOut(100);
                    }
                );
            });
        },
        tooltipPosition: function($vbsTooltip, tooltipLeftMargin, tooltipTopMargin, topPos, leftPos) {
            if (topPos <= 20) {
                $vbsTooltip.css({
                    "margin-left": tooltipLeftMargin + "px",
                    "margin-top": tooltipTopMargin + 5 + "px",
                    "top": topPos + "px",
                    "left": leftPos + "px"
                }).addClass('vbs-arrow-on-top');
            } else {
                $vbsTooltip.css({
                    "margin-left": tooltipLeftMargin + "px",
                    "margin-top": -tooltipTopMargin + "px",
                    "top": topPos + "px",
                    "left": leftPos + "px"
                }).removeClass('vbs-arrow-on-top');
            }
        }
    };

    VB.Player = function(a, b) {
        var d = this;
        this.instance = a;
        var h = VB.settings.playerType;
        h = h.toLowerCase().replace(/^\s+|\s+$/, ""), d.player_type = h;
        this.find_player_interval = setInterval(function() {
            try {
                d.interface = new VB.interface[h](b, d.instance);
                clearInterval(d.find_player_interval);
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
            var c = this;
            c.instance = b;
            if (document.getElementById(a) && document.getElementById(a).tagName.toLowerCase() == "iframe") {
                if (typeof YT == "undefined" || typeof YT.Player == "undefined")
                    throw "not_ready";
                if (!YT.loaded)
                    throw "not_ready";
                if (c.instance.ytplayerloaded)
                    return !1;
                c.youtube_player = new YT.Player(a), c.instance.ytplayerloaded = !0
            } else {
                this.youtube_player = window.document[a];
            }

            this.play = function() {
                this.youtube_player.playVideo();
            }, this.pause = function() {
                this.youtube_player.pauseVideo();
            }, this.play_state = function() {
                try {
                    var a = this.youtube_player.getPlayerState()
                } catch (b) {
                    return "PAUSED"
                }
                return parseInt(a) == 1 || parseInt(a) == 5 ? "PLAYING" : "PAUSED"
            }, this.position = function() {
                try {
                    return this.youtube_player.getCurrentTime() + 0.07;
                } catch (b) {
                    return 0;
                }
            }, this.duration = function() {
                return this.youtube_player ? parseInt(this.youtube_player.getDuration() + .5) : !1
            }, this.seek = function(a) {
                var a = parseInt(a, 10);
                this.youtube_player.seekTo(a);
            }, this.get_volume = function() {
                return this.youtube_player ? this.youtube_player.getVolume() : !1;
            }, this.set_volume = function(a) {
                this.youtube_player.setVolume(a);
            }, this.get_buffer = function() {
                return this.youtube_player ? c.youtube_player.getVideoBytesLoaded() : !1;
            };
        },
        jwplayer: function(a, b) {
            var c = this;
            c.instance = b;
            if (typeof jwplayer != "undefined" && jwplayer(a) && jwplayer(a).play)
                this.jw_player = jwplayer(a), this.play = function() {
                    c.jw_player.play()
                }, this.pause = function() {
                    c.jw_player.pause()
                }, this.play_state = function() {
                    return c.jw_player.getState() == "PLAYING" ? "PLAYING" : "PAUSED"
                }, this.position = function() {
                    return c.jw_player.getPosition()
                }, this.duration = function() {
                    return c.jw_player.getDuration()
                }, this.seek = function(t) {
                    c.jw_player.seek(t);
                }, this.get_volume = function() {
                    return c.jw_player.getVolume();
                }, this.set_volume = function(a) {
                    return c.jw_player.setVolume(a);
                }, this.get_buffer = function() {
                    return c.jw_player.getBuffer();
                }, this.get_rendering_mode = function() {
                    return c.jw_player.getRenderingMode();
                }, this.load_file = function(f) {
                    c.jw_player.load([{file: f}]);
                };
            else {
                if (!window.document[a] || typeof window.document[a].addModelListener == "undefined")
                    throw "not_ready";
                this.jw_player = window.document[a],
                this.play = function() {
                    c.jw_player.sendEvent("PLAY", "true")
                }, this.pause = function() {
                    c.jw_player.sendEvent("PLAY", "false")
                }, this.play_state = function() {
                    return this.player_state
                }, this.position = function() {
                    return this.playhead_time
                }, this.duration = function() {
                    return 1e3 * this.jw_player.getPlaylist()[c.jw_player.getConfig().item].duration
                }, this.seek = function(a) {
                    var b = parseInt(a, 10);
                    b = Math.max(0, b - 1), c.jw_player.sendEvent("SEEK", b)
                }, this.get_volume = function() {
                    return c.jw_player.getVolume();
                }, this.set_volume = function(a) {
                    return c.jw_player.setVolume(a);
                }, this.get_buffer = function() {
                    return c.jw_player.getBuffer();
                }, this.get_rendering_mode = function() {
                    return c.jw_player.getRenderingMode();
                }, this.load_file = function(f) {
                    c.jw_player.load(f);
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

        }
    };

    var methods = {
        init: function(options) {
            VB.reSettings(options);
            VB.init(VB.settings.playerId);
            VB.view.init(this);
        },
        favorite: function(opt) {
            if (opt)
                VB.helper.find(".vbs-star-btn").addClass('vbs-active').attr('data-tile', 'Remove from Favorites');
            else
                VB.helper.find(".vbs-star-btn").removeClass('vbs-active').attr('data-tile', 'Add from Favorites');
            return opt;
        },
        favoriteToggle: function() {
            VB.helper.find(".vbs-star-btn").toggleClass('vbs-active');
            return VB.helper.find(".vbs-star-btn").hasClass('vbs-active');
        },
        isFavorite: function() {
            return VB.helper.find(".vbs-star-btn").hasClass('vbs-active');
        },
        getPosition: function() {
            return Math.round(VB.helper.getPosition());
        },
        getSearchString: function() {
            return VB.helper.find('#voice_search_txt').val();
        },
        getSharePositionUrl: function() {
            var newparam = {};
            newparam['vbt'] = Math.round(VB.helper.getPosition());
            return VB.helper.getNewUrl(newparam);
        },
        getShareSearchStringUrl: function() {
            var newparam = {};
            newparam['vbs'] = encodeURI(VB.helper.find('#voice_search_txt').val());
            return VB.helper.getNewUrl(newparam);
        },
        getShareFlag: function() {
            return VB.helper.find('.vbs-share-radio-row input[name="share-opt"]:checked').val();
        },
        search: function(text) {
            VB.helper.find("#voice_search_txt").val(text);
            VB.helper.find('#vbs-search-form').submit();
            return text;
        },
        position: function(time) {
            VB.helper.seek(time);
            return time;
        }
    };

    $.fn.voicebase = function(method) {

        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.vbplugin');
        }

    };
})(jQuery);
