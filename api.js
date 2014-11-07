/*
* VB.api
* Interaction with the server
* */
voiceBase = (function(VB, $) {

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
            delete _parameters.mediaid; // so we can send requests for many mediaIds with one token
            delete _parameters.externalid;
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
            var $media_block = VB.helper.find('.vbs-media-block');
            if (data.requestStatus == 'SUCCESS' && data.response.fileStatus != 'PROCESSING') {
                VB.api.response.metadata = data;
                var timeSeconds = data.response.lengthMs / 1000;
                var timestring = VB.helper.parseTime(timeSeconds);

                VB.data.duration = timeSeconds;
                VB.helper.find('.voicebase_record_times').show();
                VB.helper.find('.vplayer').show();
                if (VB.settings.playerType == 'jwplayer' && $('#' + VB.settings.playerId).is('object')) {
                    VB.settings.playerDom = $('#' + VB.settings.playerId).parent();
                    VB.settings.playerDom.addClass('vbs-player-wrapper vbs-' + VB.helper.randId());
                }
                else if(VB.settings.playerType == 'kaltura'){
                    VB.settings.playerDom = $('#' + VB.settings.playerId);
                    VB.settings.playerDom.addClass('vbs-player-wrapper vbs-' + VB.helper.randId());
                }
                else if(VB.settings.playerType == 'sublime'){
                    var $player = $('#' + VB.settings.playerId);
                    VB.settings.playerDom = $player.parent(); // sbulime player should be in container
                    VB.settings.playerDom.addClass('vbs-player-wrapper vbs-' + VB.helper.randId());
                    var $controlsBlock =  $("#" + VB.settings.controlsBlock);
                    $controlsBlock.find('.vbs-record-player').addClass('vbs-1-right-btns').find('.vbs-volume-toolbar').remove();
                }
                else if(VB.settings.playerType == 'jplayer'){
                    var jplayer_interface = VB.instances[VB.current_instance].player.interface;
                    if(jplayer_interface){
                        VB.settings.playerDom = jplayer_interface.getGui();
                        VB.settings.playerDom.addClass('vbs-player-wrapper vbs-' + VB.helper.randId());
                    }
                }
                else {
                    VB.settings.playerDom = $('#' + VB.settings.playerId);
                    VB.settings.playerDom.wrap('<div class="vbs-player-wrapper vbs-' + VB.helper.randId() + '"></div>');
                }
                if (!data.response.hasVideo) {
                    // HIDE PLAYER
                    if(VB.settings.playerType != 'kaltura'){
                        var waitinstance = setInterval(function() {
                            if (VB.instances.length) {
                                clearTimeout(waitinstance);
                                VB.helper.findc('.vbs-player-wrapper').css({"height": 0});

                            }
                        }, 100);
                    }
                } else {
                    $media_block.addClass('vbs-video');
                    $('.vbs-video .vbs-section-title').attr('data-title', 'Hide Video');
                    VB.helper.find('.vbs-record-player').addClass('vbs-video');
                    var cont = VB.helper.findc('.vbs-player-wrapper');
                    var playerWidth = $('#' + VB.settings.playerId).width();
                    $("#" + VB.settings.mediaBlock).insertBefore(cont).css('width', playerWidth);
                    if (playerWidth < VB.settings.mediumResponsive && playerWidth >= VB.settings.minResponsive) {
                        $media_block.addClass('less-600px');
                    } else if (playerWidth < VB.settings.minResponsive) {
                        $media_block.addClass('less-600px').addClass('less-460px');
                    }
                    if (VB.settings.vbsButtons.fullscreen) {
                        $media_block.find(".vbs-section-btns ul").append('<li><a href="#" class="vbs-expand-btn" data-title="Expand Video"></a></li>');
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
                $media_block.append(VB.templates.get('disabler'));
                VB.helper.find('.vbs-record-player').append(VB.templates.get('disabler'));
                VB.api.setErrors(data);
            }
            VB.api.ready.metadata = true;
        },
        setLocalMetaData: function(){
            var lengthMs = VB.helper.getDuration() * 1000;
            var result = {
                lengthMs: lengthMs,
                hasVideo: true,
                isFavorite: false
            };
            VB.data.localData['metadata'] = {
                requestStatus: "SUCCESS",
                response: result
            };
            VB.api.setMetaData(VB.data.localData['metadata']);
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
            var $keywords_block = VB.helper.find('.vbs-keywords-block');
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
                        VB.helper.addSpeakerKey(speaker_name);
                        if (!VB.common.inArrayV(speakersName, speaker_name)) {
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

                $keywords_block.find('.vbs-topics').html(catUl);
                $keywords_block.find('.vbs-keywords-list-tab').html(ull);
                $keywords_block.slideDown('fast', function() {
                    if (VB.settings.keywordsColumns && VB.settings.keywordsColumns == 'auto') {
                        VB.helper.keywordsAutoColumns();
                    } else if (VB.settings.keywordsColumns && VB.settings.keywordsColumns == 'topics') {
                        VB.helper.keywordsAutoTopicsColumns();
                    }
                });
            } else {
                $keywords_block.append(VB.templates.get('disabler'));
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
            var $transcript_block = VB.helper.find('.vbs-transcript-block');
            if (data.requestStatus == 'FAILURE' || (data.fileStatus != "MACHINECOMPLETE" && data.fileStatus != "HUMANCOMPLETE")) {
                VB.api.ready.transcript = true;
                VB.api.setErrors(data);
                if(data.requestStatus == 'FAILURE' && (!data.transcript || (data.transcript && data.transcript.length == 0))){
                    $transcript_block.addClass('vbs-ho').append(VB.templates.get('disabler')).show();
                    return false;
                }
            }
            if (data.transcriptType == 'human') {
                $transcript_block.addClass('vbs-human').find('.vbs-section-title').attr('data-title', 'Hide Transcript');
            } else {
                if (VB.settings.vbsButtons.orderTranscript) {
                    $transcript_block.addClass('vbs-with-order-btn');
                }
            }

            if (VB.settings.transcriptResizable && $.isFunction($.fn.resizable)) {
                var $transcriptWrap = $('#' + VB.settings.transcriptBlock);
                var transMinWidth = $transcriptWrap.width();
                var transcript_offset = $transcriptWrap.offset();
                var transMaxWidth = (transcript_offset && transcript_offset.left) ?  $(document).width() - Math.round(transcript_offset.left) - 10 : $transcriptWrap.width();
                VB.helper.find('.vbs-resizable').resizable({
                    minWidth: transMinWidth,
                    maxWidth: transMaxWidth,
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
            var dt_length = dt.length;
            for (var i = 0; i < dt_length; i++) {
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
                VB.helper.addSpeakerKey(speaker);
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
            $transcript_block.find('.vbs-transcript-wrapper').html(transpart);
            if (spturn && spf) {
                $transcript_block.find('.vbs-transcript-wrapper span[data-f=true]').before('<span class="w" t="0" m=">> "><br><br>&gt;&gt; </span>');
            }
            if ($transcript_block.not('.vbs-human').length && (VB.settings.toggleBlocks && VB.settings.toggleTranscriptBlock)) {
                $transcript_block.find('.vbs-section-body').hide();
                $transcript_block.find('.vbs-section-title').addClass('vbs-hidden').attr('data-title', 'Show Transcript');
            }
            $transcript_block.find(".vbs-transcript-prewrapper").css('height', VB.settings.transcriptHeight + "px");
            $transcript_block.slideDown('fast');
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
            VB.helper.collapseNewsBlock();
//            VB.api.getNews();
            if(VB.settings.localSearch){
                var results = VB.helper.localTranscriptSearch(terms);
                VB.api.setSearch(results, {start: true, terms: terms});
            }
            else {
                var terms_string = terms.join(',').toLowerCase();
                start = typeof start !== 'undefined' && start == false ? false : true;
                var _parameters = {};
                jQuery.extend(_parameters, this.parameters);
                _parameters.action = 'searchFile';
                _parameters.terms = terms_string;
                VB.api.call(_parameters, VB.api.setSearch, {start: start, terms: terms});
            }
        },
        setSearch: function(data, args) {
            var start = args.start;
            var terms = args.terms;
            VB.data.clicker = false;
            var colors = [];
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
            VB.api.data.tmp.hide = (typeof hide != 'undefined') ? hide : (VB.settings.toggleBlocks && VB.settings.toggleCommentBlock) ? true : false;
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
                                                                  <span class="vbs-comment-author">' + comment.userName + '</span> ';
                            if (comment_level == 1) {
                                comments_html += '<span>commented at</span>\n\
                                                                  <a href="javascript:void(0)" class="vbs-comment-time" data-vbct="' + thread.timeStamp + '">' + commented_at + '</a>';
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
            return VB.settings.apiUrl + '?' + VB.common.getStringFromObject(_parameters);
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
                var $topics_list = VB.helper.find(".vbs-topics-list");
                $topics_list.find("li.vbs-active").remove();
                var li = $topics_list.find('li.vbs-all-topics');
                li.parent().find('.vbs-active').removeClass('vbs-active');
                li.addClass('vbs-active');
                var catName = li.find('a').text().trim();
                var $keywords_list_tab = VB.helper.find(".vbs-keywords-list-tab");
                $keywords_list_tab.find("ul").removeClass('vbs-active');
                $keywords_list_tab.find('ul[tid="' + catName + '"]').addClass('vbs-active');
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

                var $keywords_list_tab = VB.helper.find(".vbs-keywords-list-tab");
                $keywords_list_tab.find("ul").removeClass('vbs-active');
                $keywords_list_tab.find('ul[tid="' + catName + '"]').addClass('vbs-active');

                var lik = $keywords_list_tab.find('ul.vbs-active li');
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
                VB.helper.saveTranscriptError(data.statusMessage);
            }
        },
        triggerTranscriptStatus: function() {
            var _parameters = {};
            jQuery.extend(_parameters, this.parameters);
            _parameters.action = "getFileStatus";
            VB.api.call(_parameters, VB.api.responseTriggerTranscriptStatus);
        },
        responseTriggerTranscriptStatus: function(data) {
            if (data.requestStatus == 'SUCCESS' && (data.fileStatus == 'PROCESSING' || data.fileStatus == 'REPROCESSING')) {
                setTimeout(function() {
                    VB.api.triggerTranscriptStatus();
                }, VB.settings.transcriptCheckTimer * 1000);
            } else if (data.requestStatus == 'SUCCESS') {
                VB.helper.saveTranscriptComplete();
            }
            else if(data.requestStatus == 'FAILURE'){
                VB.helper.saveTranscriptError(data.statusMessage);
            }
            else {
                alert(data.statusMessage);
            }
        },
        getNews: function(){
            var terms = VB.helper.getSearchWordsArray();
            if(terms.length == 0){
                VB.api.addEmptyMessageForNews();
                return false;
            }
            if($("#" + VB.settings.newsBlock).find('.vbs-section-title').hasClass('vbs-hidden')) { // block is collapse
                return false;
            }
            if(VB.settings.showNewsBlock){
                var $newsBlock = VB.helper.find('.vbs-news-block');
                var words = terms;
                if($.isArray(words)){
                    words = words.join(' ');
                }
                if(VB.data.prevNewsRequest === words){
                    return false;
                }
                VB.data.prevNewsRequest = words;

                $newsBlock.find('.vbs-news-wrapper').html('<div class="vbs-loader"></div>');
                var bing_url = encodeURI('https://beta.voicebase.com/bing/search/query/' + words);
                $.ajax({
                    type: 'GET',
                    url: bing_url,
                    success: function(data){
                        data = JSON.parse(data);
                        VB.api.setNews(data, terms);
                    },
                    error: function(jqXHR, textStatus, errorThrown){
                        console.log(errorThrown + ': Error ' + jqXHR.status);
                    }
                });
                return true;
            }
        },
        setNews: function(data, terms){
            var all_news = (data && data.d) ? data.d.results : [];
            if(all_news.length > 0){
                if($.isArray(terms)){
                    terms = terms.join(', ');
                }
                var $newsBlock = VB.helper.find('.vbs-news-block');
                $newsBlock.find('.vbs-news-words').html(terms);
                var sem = '';
                for (var i = 0; i < all_news.length; i++) {
                    var news = all_news[i];
                    var title = news.Title || '';
                    var source = news.Source || '';
                    var time = news['Date'];
                    var news_url = news.Url;

                    sem += VB.templates.parse('vbs-news-elem', {
                        title: title,
                        source: source,
                        time: time,
                        url: news_url
                    });
                }
                $newsBlock.find('.vbs-news-wrapper').html(sem);
                $newsBlock.find('.vbs-news-elem:odd').addClass('vbs-news-elem-odd').after('<div class="clear-block"></div>');
                if(!VB.settings.hasNewsBlockHeader) {
                    $newsBlock.addClass('vbs-no-header');
                }
            }
            else {
                VB.api.addEmptyMessageForNews();
            }
            console.log('news:\n', data);
        },
        addEmptyMessageForNews: function(){
            var empty_message = VB.templates.get('vbs-empty-news');
            VB.helper.find('.vbs-news-block').find('.vbs-news-wrapper').html(empty_message);
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

    return VB;
})(voiceBase, jQuery);
