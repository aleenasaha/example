/*
* VB.helper
* */
voiceBase = (function(VB, $) {
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
            var $timeline_wrap = VB.helper.find('.vbs-record-timeline-wrap');
            if (VB.settings.animation && $timeline_wrap.has('.vbs-loader')) {
                $timeline_wrap.prepend('<div class="vbs-loader"></div>');
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
            VB.helper.find('.vbs-select-dropdown li').removeClass('vbs-disabled').each(function(){
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
            var words = VB.helper.find('#vbs-voice_search_txt').val().trim().match(/("[^"]+")+|[\S]+/ig); // 0-9_.,'-
            return words ? words : [];
        },
        keywordsAutoTopicsColumns: function(col) {
            col = typeof col !== 'undefined' ? col : 5;
            var $kw = VB.helper.find('.vbs-keywords-list-wrapper');
            var _this = this;
            if (col == 0)
                return false;
            $kw.removeClass(_this.getColumnClassByNumber(col + 1)).addClass(_this.getColumnClassByNumber(col));
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
            var $list_li = VB.helper.find('.vbs-topics .vbs-topics-list li');
            $list_li.removeClass('vbs-disabled');
            $list_li.find('a').each(function() {
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

            if (VB.helper.find('#vbs-voice_search_txt').val().trim().length > 0) {
                VB.helper.find('.vbs-markers').html('');
                VB.helper.find(".vbs-next-action-btn:not([class='vbs-next-notactive'])").addClass('vbs-next-notactive');
                VB.api.getSearch([VB.helper.find('#vbs-voice_search_txt').val().trim()], false);
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
            var utterances_length = utterances.length;
            for (var i = 0; i < utterances_length; i++) {
                var utt = utterances[i];
                var segments = utt.segments;
                var seg_length = segments.length;
                for (var j = 0; j < seg_length; j++) {
                    var segment = segments[j];
                    var startPosition = VB.helper.getOffset(segment.s);
                    var endPosition = VB.helper.getOffset(segment.e);
                    var segment_width = endPosition - startPosition;
                    var timeLabel = VB.helper.parseTime(segment.s) + ' to ' + VB.helper.parseTime(segment.e);

                    var tooltip_chars_max_length = 65;
                    var title = segment.u.substr(0, tooltip_chars_max_length-3) + "..."; // multiline ellipsis

                    marker_sem += VB.templates.parse('utteranceMarker', {
                        startTime: segment.s,
                        rownum: i + 1,
                        width: segment_width,
                        position: startPosition,
                        title: title,
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
                $("#" + VB.settings.controlsBlock).after($(utteranceBlock));
                $('.vbs-utterance-block').addClass(VB.data.vclass).find('ul').append(checkbox_sem);
            }
        },
        getSpeakerKey: function(name) {
            for (var iss in VB.data.speakers) {
                if (VB.data.speakers[iss].toLowerCase() == name.toLowerCase())
                    return iss;
            }
            return '';
        },
        addSpeakerKey: function(speaker_name){
            if (speaker_name && !VB.common.inSpeakers(speaker_name) && speaker_name != '>>') {
                var num = Object.keys(VB.data.speakers).length + 1;
                VB.data.speakers['vbs-sp' + num + 'o'] = speaker_name;
            }
        },
        downloadFile: function(type) {
            var params = VB.api.parameters;
            params.action = 'getTranscript';
            params.content = true;
            params.format = type;
            window.location = VB.settings.apiUrl + '?' + VB.common.getStringFromObject(params);
        },
        getNewUrl: function(urlparams) {
            var query = window.location.search.substring(1),
                vars = query.split('&'),
                opt = {},
                np = [];
            if (query.length > 0) {
                var vars_length = vars.length;
                for (var i = 0; i < vars_length; i++) {
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
            var rt = {};
            var vars_length = vars.length;
            for (var i = 0; i < vars_length; i++) {
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
                if(VB.api.response.keywords && VB.api.response.keywords.utterances){
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
                var words = decodeURI(params['vbs']).trim().match(/("[^"]+")+|[\S]+/ig); //A-Za-z0-9_.,'-
                words = words ? words : [];
                var stringWords = words.join(' ');
                VB.helper.find('#vbs-voice_search_txt').val(stringWords).attr('data-val', stringWords).change();
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
            var $marquee = VB.helper.find("#vbs-search-string .vbs-marquee");
            var $search_word_widget = $marquee.find(".vbs-search-word-widget");
            $search_word_widget.stop(true).css("left", 0);
            var words_width = 0;
            VB.helper.find(".vbs-word").each(function() {
                words_width += $(this).width() + 7;
            });
            if (words_width > $marquee.width()) {
                $search_word_widget.width(words_width);
                VB.helper.scrollStringLeft();
            }
            else{
                $search_word_widget.width($('#vbs-search-string').width());
            }
        },
        scrollStringLeft: function() {
            var words_count = VB.helper.find(".vbs-word").length,
                words_animate_duration = words_count * 1200;
            var $marquee = VB.helper.find("#vbs-search-string .vbs-marquee");
            var $search_word_widget = $marquee.find(".vbs-search-word-widget");
            $search_word_widget.animate({"left": ($marquee.width()) - ($search_word_widget.width())}, {
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
            var foradd = [];
            VB.helper.find('#vbs-search-string .vbs-search-word-widget .vbs-word a.vbs-add-search-word').remove();
            terms = VB.common.uniqueArray(terms);
            for (var ti in terms) {
                var term = terms[ti].replace(/"/g, '');
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
                    VB.helper.find('#vbs-search-string .vbs-search-word-widget .vbs-word[data-word-o="' + term + '"]').each(function(){
                        $(this).append(plus);
                    });
                }
            }
        },
        localSearch: function(elem, terms) {
            var allTimes = [];
            var colors = [];
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
                    phrases = phrases.concat(VB.helper.localPhraseByDom(time));
                }
            });
            VB.view.markerWidget(times, phrases, colors[terms]);

            allTimes = allTimes.concat(times);
            allTimes.sort(function(a, b) {
                return a - b;
            });
            VB.helper.seek(allTimes[0]);
        },
        localPhraseByDom: function(time) {
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
        localPhraseByObj: function(word){
            var transcript_words = VB.api.response.transcript.transcript;
            var pos = word.p;
            var before = 1000;
            var after = 1500;

            var i = 1;
            var before_phrase = transcript_words[pos - 1].w;
            while(before > 0){
                var tek_word = transcript_words[pos - i];
                var prev_word = transcript_words[pos - 1 - i];
                if(prev_word && prev_word.m != 'turn' && tek_word.m != 'turn'){
                    var space = (tek_word.m == 'punc') ? '' : ' ';
                    before_phrase =  prev_word.w + space + before_phrase;
                    before -= (tek_word.s - prev_word.s);
                    i++;
                }
                else break;
            }

            i = 1;
            var after_phrase = '';
            while(after > 0){
                var tek_word = transcript_words[pos - i];
                var next_word = transcript_words[pos - 1 + i];
                if(next_word && tek_word && next_word.m != 'turn' && tek_word.m != 'turn'){
                    var space = (next_word.m == 'punc') ? '' : ' ';
                    after_phrase =  after_phrase + space + next_word.w;
                    after -= (next_word.s - tek_word.s);
                    i++;
                }
                else break;
            }

            return before_phrase + after_phrase;
        },
        localTranscriptSearch: function(terms){
            console.time('localSearch');
            var data = {
                requestStatus: 'SUCCESS',
                hits: {
                    hits: [],
                    length: 1
                }
            };
            var transcript_words = VB.api.response.transcript.transcript;
            var results = [];
            var temp_results = {};

            // create fuse model
            var fuseEngine = new Fuse(transcript_words, {
                keys: ['w'],
                threshold: 0.2
            });

            var term_phrases = [];
            var term_one_word = [];
            for (var i = 0; i < terms.length; i++) {
                var _term = terms[i];
                if(_term.indexOf('"') === 0 && _term.lastIndexOf('"') === (_term.length - 1)){ // if "many words"
                    term_phrases.push(_term);
                }
                else{
                    term_one_word.push(_term);
                }
            }

            console.time('fuse');
            for (i = 0; i < term_one_word.length; i++) {
                var one_word = term_one_word[i];
                var fuse_result = fuseEngine.search(one_word);
                for (var j = 0; j < fuse_result.length; j++) {
                    var fuse_res_item = fuse_result[j];
                    VB.helper.addResultNodeForLocalSearch(one_word, fuse_res_item, temp_results);
                }
            }
            console.timeEnd('fuse');

            if(term_phrases.length > 0){
                console.time('indexOf');
                for (var i = 0; i < transcript_words.length; i++) {
                    var word_obj = transcript_words[i];
                    if(word_obj.m != 'turn'){
                        var word_in = [];
                        for (var j = 0; j < term_phrases.length; j++) {
                            var word = '';
                            var phrase = term_phrases[j];
                            phrase = phrase.toLocaleLowerCase().replace(/"/g, "");
                            phrase = VB.helper.replaceAndTrim(phrase);
                            var inner_words = phrase.split(/(?=\W)(?=\s)/).map(function(inner_term){
                                return VB.helper.replaceAndTrim(inner_term);
                            });
                            phrase = inner_words.join(' ');

                            var term_length = inner_words.length;
                            var num = 0;
                            for (var k = 0; k < term_length; k++) {
                                var next_word = transcript_words[i + num];
                                if(next_word){
                                    var space = ' ';
                                    if(next_word.m == 'punc'){
                                        space = '';
                                        k--;
                                    }
                                    word += space + VB.helper.replaceAndTrim(next_word.w).toLocaleLowerCase();
                                }
                                num++;
                            }

                            if(word.indexOf(phrase) != -1){
                                word_in.push(phrase);
                            }
                        }

                        if(word_in.length > 0){
                            VB.helper.addResultNodeForLocalSearch(word_in[0], transcript_words[i], temp_results);
                        }
                    }
                }
                console.timeEnd('indexOf');
            }

            for (var key in temp_results) {
                data.hits.hits.push({
                    term: key,
                    hits: temp_results[key]
                });
            }
            console.log("Local search: \n", data);
            console.timeEnd('localSearch');

            return data;
        },
        addResultNodeForLocalSearch: function(name, word, results_obj){
            var result_info = {};
            result_info.time = word.s / 1000;
            result_info.phrase = VB.helper.localPhraseByObj(word);
            if(!results_obj[name]){
                results_obj[name] = [];
            }
            results_obj[name].push(result_info);
        },
        highlight: function(position) {
            var curtime = Math.round(position);
            if (curtime == 1) {
                curtime = 0;
            }
            var nc = Math.floor(curtime / VB.settings.transcriptHighlight);
            curtime = nc * VB.settings.transcriptHighlight;
            var $transcript_block = VB.helper.find('.vbs-transcript-block');
            var $transcript_wrapper = $transcript_block.find('.vbs-transcript-wrapper');
            var $transcript_prewrapper = $transcript_block.find('.vbs-transcript-prewrapper');

            $transcript_wrapper.children('span').removeClass('vbs-hl');
            $transcript_wrapper.children('span:wordtime(' + curtime + ',' + (curtime + VB.settings.transcriptHighlight - 1) + ')').addClass('vbs-hl');
            var spanhl = $transcript_wrapper.children('span.vbs-hl').length ? $transcript_wrapper.children('span.vbs-hl') : false;
            var transcripttext = $transcript_prewrapper.length ? $transcript_prewrapper : false;
            if (spanhl && transcripttext) {
                $transcript_prewrapper.not('.vbs-t-hover').stop(true, true).animate({
                    scrollTop: spanhl.offset().top - transcripttext.offset().top + transcripttext.scrollTop() - (transcripttext.height() - 20) / 2
                }, 500);
            }
            if ($('body').hasClass('vbs-readermode') && $transcript_prewrapper.not('.vbs-t-hover').length) {
                transcripttext = $transcript_block.length ? $transcript_block : false;
                $transcript_block.stop(true, true).animate({
                    scrollTop: spanhl.offset().top - transcripttext.offset().top + transcripttext.scrollTop() - (transcripttext.height() - 20) / 2
                }, 500);
            }
        },
        speakers: function() { // show "{{Speaker}} is speaking" in player heading
            var ct = VB.data.position * 1000;
            var curspeaker = $('.vbs-speakers > div:speakertime(' + ct + ')');
            if (curspeaker.length) {
                var sname = curspeaker.attr('data-original-title');
                var scolor = curspeaker.attr('cnum');
                if (typeof sname != 'undefined' && (VB.data.lspeaker != sname && sname.trim() != '>>')) {
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
            var $popup_wrap = VB.helper.find('.vbs-save-popup-wrapper');
            $popup_wrap.find('.vbs-save-loading-popup').fadeOut('fast');
            $popup_wrap.find('.vbs-save-done-popup').fadeIn('fast');
            VB.view.initAfterSaveTranscript();
            VB.data.waiterSave = setInterval(function() {
                VB.helper.waitReadyAfterSave();
            }, 100);
        },
        saveTranscriptError: function(message) {
            var $popup_wrap = VB.helper.find('.vbs-save-popup-wrapper');
            $popup_wrap.find('.vbs-save-popup').show();
            $popup_wrap.find('.vbs-save-loading-popup').fadeOut('fast');
            $popup_wrap.fadeOut('fast');
            var errorTemplate = VB.templates.parse('abstractErrorPopup', {
                errorTitle: 'Could not save transcript',
                errorText: message
            });
            $('.vbsp-' + VB.helper.randId() + '.vbs-content').append(errorTemplate);
        },
        adjustMediaTime: function(){
            var $media_block = VB.helper.find('.vbs-media-block');
            var mediaTitle = $media_block.find('.vbs-section-title');
            var mediaBtns = $media_block.find('.vbs-section-btns');
            var mediaTitleRightCoord = mediaTitle.offset().left + mediaTitle.width();
            var mediaBtnsLeftCoord = mediaBtns.offset().left;

            if(mediaTitleRightCoord >= mediaBtnsLeftCoord){
                mediaTitle.find('.vbs-voice-name').hide();
                var mediaTitle = $media_block.find('.vbs-section-title');
                var mediaBtns = $media_block.find('.vbs-section-btns');
                var mediaTitleRightCoord = mediaTitle.offset().left + mediaTitle.width();
                var mediaBtnsLeftCoord = mediaBtns.offset().left;

                if(mediaTitleRightCoord >= mediaBtnsLeftCoord){
                    mediaTitle.find('.vbs-time').hide();
                    if ($media_block.hasClass('vbs-video')){
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
        getDuration: function() {
            return VB.instances[VB.current_instance].player.interface.duration();
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
        setVolume: function(vol) { // set player volume
            return VB.instances[VB.current_instance].player.interface.set_volume(vol);
        },
        setPluginVolume: function(vol){
            VB.helper.find(".vbs-volume-slider-full").css("height", vol + "%");
            VB.helper.find(".vbs-volume-slider-handler").css("bottom", vol + "%");
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
        setSizePlayer: function(width, height) {
            return VB.instances[VB.current_instance].player.interface.setSize(width, height);
        },
        setDefaultSizePlayer: function() {
            return VB.instances[VB.current_instance].player.interface.setDefaultSize();
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
        },
        replaceAndTrim: function(word){
            return word.replace(/<br \/>/g, "").replace(/<br\/>/g, "").replace(/\n/g, "").trim();
        },
        collapseNewsBlock: function(){
            var $newsBlock = $("#" + VB.settings.newsBlock);
            if ($newsBlock.length > 0 && VB.settings.toggleBlocks && VB.settings.toggleNewsBlock) {
                var $sectionBody = $newsBlock.find('.vbs-section-body');
                $newsBlock.find('.vbs-section-title').addClass('vbs-hidden').attr('data-title', 'Show News');
                $newsBlock.find('.vbs-news-words-wrapper').hide();
                $sectionBody.slideUp();
            }
        },
        expandNewsBlock: function(){
            var $newsBlock = $("#" + VB.settings.newsBlock);
            if ($newsBlock.length > 0 && VB.settings.toggleBlocks && VB.settings.toggleNewsBlock) {
                var $sectionBody = $newsBlock.find('.vbs-section-body');
                $newsBlock.find('.vbs-section-title').removeClass('vbs-hidden').attr('data-title', 'Hide News');
                $newsBlock.find('.vbs-news-words-wrapper').show();
                $sectionBody.slideDown();
            }
        },
        updateQuotesVisibility: function(){
            if(VB.settings.vbsButtons.unquotes) {
                var $search_form = VB.helper.find(".vbs-search-form");
                var terms = VB.helper.getSearchWordsArray();
                var quotedTerms = terms.filter(function(_term){
                    return (_term.indexOf('"') === 0 && _term.lastIndexOf('"') === (_term.length - 1)) // if "many words"
                });
                if(quotedTerms.length > 0) {
                    $search_form.addClass('vbs-quoted');
                }
                else {
                    $search_form.removeClass('vbs-quoted');
                }
            }
        },
        removeQuotes: function(){
            var terms = VB.helper.getSearchWordsArray();
            var words = [];
            terms.forEach(function(_term){
                if(_term.indexOf('"') === 0 && _term.lastIndexOf('"') === (_term.length - 1)) { // if "many words"
                    _term = _term.replace(/"/g, "");
                    var inner_words = _term.split(' ');
                    inner_words.forEach(function(w){
                        words.push(w);
                    });
                }
                else {
                    words.push(_term);
                }
            });

            var stringWords = words.join(' ');
            VB.helper.find('#vbs-voice_search_txt').val(stringWords).attr('data-val', stringWords);
            $('#vbs-search-form').submit();
        },
        isRetina: function(){
            var mediaQuery = "(-webkit-min-device-pixel-ratio: 1.5),\
            (min--moz-device-pixel-ratio: 1.5),\
            (-o-min-device-pixel-ratio: 3/2),\
            (min-resolution: 1.5dppx)";
            if (window.devicePixelRatio > 1){
                return true;
            }
            if (window.matchMedia && window.matchMedia(mediaQuery).matches) {
                return true;
            }
            return false;
        },
        isMobile: function(){
            var check = false;
            (function(a,b){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
            return check;

        }
    };

    return VB;
})(voiceBase, jQuery);
