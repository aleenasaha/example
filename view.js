/*
* VB.view
* */
voiceBase = (function(VB, $) {
    VB.view = {
        main: null,
        pluginDiv: null,
        init: function(elem) {
            this.initMainElem(elem);
            if(!VB.settings.hasPlaylist && !VB.settings.localApp){ // else initializing after player ready event
                this.initApi();
            }
        },
        initMainElem: function(elem){
            this.main = (elem[0].tagName === 'OBJECT' && VB.settings.playerType == 'jwplayer') ? $(elem).parent() : elem;
            var divnode = document.createElement('div');
            divnode.className = 'vbsp-' + VB.helper.randId() + ' vbs-content';
            divnode.innerHTML = VB.templates.get('mainDiv');
            this.pluginDiv = $(divnode);
            $(this.main).after(this.pluginDiv);
        },
        initApi: function(){
            VB.api.init();
            if (!VB.settings.token && !VB.settings.example && !VB.settings.localApp) {
                VB.api.getToken(VB.settings.tokenTimeOut);
            } else if (VB.settings.example && !VB.settings.localApp) {
                VB.api.getExampleToken();
            } else {
                VB.view.initWithToken();
            }
        },
        initWithToken: function() {
            VB.data.vclass = 'vbs-' + VB.helper.randId();

            VB.view.renderMediaBlock();
            if(!VB.settings.localApp){
                VB.api.getMetaData();
            }
            else {
                VB.api.setLocalMetaData();
            }

            if(VB.settings.showControlsBlock){
                VB.view.renderControlsBlock();
            }

            if(VB.settings.showKeywordsBlock){
                VB.view.renderKeywordsBlock();
                if(!VB.settings.localApp) {
                    VB.api.getKeywords();
                }
            }
            else{
                VB.api.ready.keywords = true;
            }

            if(VB.settings.showTranscriptBlock){
                VB.view.renderTranscriptBlock();
                if(!VB.settings.localApp) {
                    VB.api.getTranscript();
                }
            }
            else{
                VB.api.ready.transcript = true;
            }

            if(VB.settings.showCommentsBlock){
                VB.view.renderCommentsBlock();
                VB.api.getComments();
            }
            else{
                VB.api.ready.comments = true;
            }

            if(VB.settings.localApp) {
                VB.view.renderLanguageBlock();
            }

            if(VB.settings.showNewsBlock){
                VB.view.renderNewsBlock();
            }

            checkToggleBlocks();
            checkHeaderVisibility();

            VB.data.waiter = setInterval(function() {
                VB.helper.waitReady();
            }, 100);
            VB.events.registerEvents();
        },
        initLocalData: function(lang_code){
            VB.api.setKeywords(VB.data.localData.keywords[lang_code]);
            VB.api.setTranscript(VB.data.localData.transcripts[lang_code]);
        },
        renderControlsBlock: function(){
            var $controlsBlock = $("#" + VB.settings.controlsBlock);
            $controlsBlock.empty().html(VB.templates.get('vbs-controls')).addClass(VB.data.vclass).css({width: VB.settings.controlsWidth});
            VB.view.setResponsiveClass($controlsBlock);

        },
        renderMediaBlock: function(){
            var $mediaBlock = $("#" + VB.settings.mediaBlock);
            $mediaBlock.empty().html(VB.templates.parse('vbs-media')).addClass(VB.data.vclass).css({width: VB.settings.mediaWidth});
            VB.view.setResponsiveClass($mediaBlock);
        },
        renderKeywordsBlock: function(){
            var $keywordsBlock = $("#" + VB.settings.keywordsBlock);
            var $controlsBlock = $("#" + VB.settings.controlsBlock);

            if(!VB.settings.searchBarOuter){ // search bar in keywords block
                $keywordsBlock.empty().html(VB.templates.parse('vbs-keywords', {styles: 'height: ' + VB.settings.keywordsHeight + 'px;'})).addClass(VB.data.vclass).css({width: VB.settings.keywordsWidth});
                VB.view.setResponsiveClass($keywordsBlock);
            }
            else{
                $('#vbs-searchbar-block').remove();
                $controlsBlock.after(VB.templates.parse('vbs-searchbar-outer'));
                var searchBarBlock = $('#vbs-searchbar-block');
                searchBarBlock.addClass(VB.data.vclass);
                $keywordsBlock.empty().html(VB.templates.parse('vbs-keywords', {styles: 'height: ' + VB.settings.keywordsHeight + 'px;'})).addClass(VB.data.vclass).css({width: VB.settings.keywordsWidth});
                $keywordsBlock.find('.vbs-search-form').addClass('no_border');
            }

            if(VB.settings.tabView){
                var $tabs_links = $('.vbs-tabs-links');
                $tabs_links.find('a').removeClass('vbs-active');
                $tabs_links.find('[data-href=".vbs-keywords-block"]').addClass('vbs-active');
                $keywordsBlock.find('.vbs-keywords-block').addClass('vbs-tab-visible');
            }

        },
        renderTranscriptBlock: function(){
            var $transcriptBlock = $("#" + VB.settings.transcriptBlock);
            $transcriptBlock.addClass(VB.data.vclass).empty().html(VB.templates.get('vbs-transcript')).css({width: VB.settings.transcriptWidth});
            VB.view.setResponsiveClass($transcriptBlock);
        },
        renderCommentsBlock: function(){
            var $commentsBlock = $("#" + VB.settings.commentsBlock);
            $commentsBlock.addClass(VB.data.vclass).empty().html(VB.templates.get('vbs-comments')).css({width: VB.settings.commentsWidth});
            VB.view.setResponsiveClass($commentsBlock);
        },
        renderNewsBlock: function(){
            var $newsBlock = $("#" + VB.settings.newsBlock);
            $newsBlock.addClass(VB.data.vclass).empty().html(VB.templates.get('vbs-news')).css({width: VB.settings.newsWidth});
            VB.view.setResponsiveClass($newsBlock);
            VB.helper.collapseNewsBlock();
        },
        renderLanguageBlock: function(){
            if(VB.data.localData.languages && VB.data.localData.languages.length > 0){
                var $mediaBlock = $("#" + VB.settings.mediaBlock);
                var $controls = $mediaBlock.find('.vbs-section-header .vbs-section-btns');
                $controls.after(VB.templates.get('languageSelect'));
                var $languageSelect = $mediaBlock.find('.vbs-select-language-wrapper');

                var english = [];
                var sem = '';
                for (var i = 0; i < VB.data.localData.languages.length; i++) {
                    var lang = VB.data.localData.languages[i];
                    var lang_code = Object.keys(lang)[0];
                    var lang_name = lang[lang_code];
                    var lang_obj = {
                        lang_code: lang_code,
                        lang_name: lang_name
                    };
                    sem += VB.templates.parse('languageItem', lang_obj);
                    if(lang_code.indexOf('en') === 0){
                        english.push(lang_obj);
                    }
                }
                $languageSelect.find('.vbs-select-dropdown').html(sem);
                if(english.length > 0){
                    VB.view.selectLanguage(english[0]);
                }
                else {
                    VB.view.selectLanguage(VB.data.localData.languages[0]);
                }
            }
        },
        selectLanguage: function(lang_obj){
            var $langTitle = $('.vbs-select-language-wrapper').find('.vbs-select-language');
            var lang_code = lang_obj.lang_code
            $langTitle.removeClass('vbs-s-show').html(lang_obj.lang_name).attr(lang_code);
            VB.data.localData.selected_language = lang_code;
            VB.view.initLocalData(lang_code);
        },
        setResponsiveClass: function($block){
            if ($block.width() < VB.settings.mediumResponsive && $block.width() >= VB.settings.minResponsive) {
                $block.addClass('less-600px');
            } else if ($block.width() < VB.settings.minResponsive) {
                $block.addClass('less-600px').addClass('less-460px');
            }
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
            if(words.length > 0) {
                var wrapper = VB.helper.find('.vbs-search-word-widget');
                var $voice_search_txt = VB.helper.find('#vbs-voice_search_txt');
                $voice_search_txt.css("opacity", "0");
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
                if (VB.data.searcht && VB.settings.editKeywords && $voice_search_txt.attr('data-val') == $voice_search_txt.val()) {
                    VB.helper.checkKeyword(words, VB.data.searcht, VB.data.searchHits);
                }
                if($voice_search_txt.attr('data-val') != $voice_search_txt.val()) {
                    VB.data.searcht = null;
                    VB.data.searchHits = null;
                }
                VB.helper.updateQuotesVisibility();
                VB.helper.startScroll();
            }
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
            var $comments_block = VB.helper.find('.vbs-comments-block');
            $comments_block.find('.vbs-section-body').html(data);
            if (hide) {
                $comments_block.find('.vbs-section-body').hide();
                $comments_block.find('.vbs-section-title').addClass('vbs-hidden');
            }
            $comments_block.slideDown('fast');
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
            var $transcript_wrapper = VB.helper.find('.vbs-transcript-block .vbs-transcript-wrapper');
            $transcript_wrapper.find('span.w[m]').each(function(index) {
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
                    br += '<span class="vbs-clearfix"></span><span class="vbs-trans-info"><span class="vbs-human-trans-name ' + spclass + '" title="'+spitem.s+'">' + spitem.s + '</span><span class="vbs-human-trans-time">' + VB.helper.parseTime($this.attr('t') / 1000) + '</span></span>';
                }
                jQuery(br).insertBefore(this);
            });
            if (snn > 1) {
                $transcript_wrapper.addClass('vbs-machine');
            }
            var snn = 1;
            if (speakers.length) {
                if (VB.settings.turnTimes) {
                    $transcript_wrapper.addClass('vbs-turntimes');
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

                var $speakers = VB.helper.find('.vbs-speakers');
                $speakers.html(speakers_string);
                if (snn > 1) {
                    $speakers.addClass('vbs-machine');
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
            if(!VB.settings.searchBarOuter){
                var $keywordsBlock = VB.helper.findc("#" + VB.settings.keywordsBlock);
                var $keywords_wrapper = VB.helper.find('.vbs-keywords-wrapper');
                if ($keywordsBlock.width() < VB.settings.mediumResponsiveWithSpeakers && $keywordsBlock.width() >= VB.settings.minResponsive) {
                    $keywordsBlock.addClass('less-600px');
                    $keywords_wrapper.height($keywords_wrapper.height() - 55);
                }
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
                var $vbsTooltip = $('.vbs-tooltip');
                $this.hover(
                    function() {
                        var titleBtnWidth = parseInt($this.css("width"));
                        var tooltipTopMargin = 34; // height of tooltip
                        tooltipTopMargin += $('body').offset().top;
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

    function hideToggleArrows($block){
        $block.find('.vbs-section-title').addClass('vbs-no-toggle');
    }

    function checkToggleBlocks(){
        if(!VB.settings.toggleBlocks) {
            $('.vbs-section-title').addClass('vbs-no-toggle');
        }
        else {
            if(!VB.settings.toggleMediaBlock){
                hideToggleArrows($("#" + VB.settings.mediaBlock));
            }
            if(!VB.settings.toggleKeywordsBlock){
                hideToggleArrows($("#" + VB.settings.keywordsBlock));
            }
            if(!VB.settings.toggleTranscriptBlock){
                hideToggleArrows($("#" + VB.settings.transcriptBlock));
            }
            if(!VB.settings.toggleCommentBlock){
                hideToggleArrows($("#" + VB.settings.commentsBlock));
            }
            if(!VB.settings.toggleNewsBlock){
                hideToggleArrows($("#" + VB.settings.newsBlock));
            }
        }
    }

    function checkHeaderVisibility(){
        var $mediaBlock = $("#" + VB.settings.mediaBlock);
        var $keywordsBlock = $("#" + VB.settings.keywordsBlock);
        var $transcriptBlock = $("#" + VB.settings.transcriptBlock);
        var $commentsBlock = $("#" + VB.settings.commentsBlock);

        if(!VB.settings.hasMediaBlockHeader){
            $mediaBlock.hide();
        }
        if(!VB.settings.hasKeywordsBlockHeader){
            $keywordsBlock.find('.vbs-keywords-block').addClass('vbs-no-header');
        }
        if(!VB.settings.hasTranscriptBlockHeader){
            $transcriptBlock.find('.vbs-transcript-block').addClass('vbs-no-header');
        }
        if(!VB.settings.hasCommentsBlockHeader){
            $commentsBlock.find('.vbs-comments-block').addClass('vbs-no-header');
        }
    }

    return VB;
})(voiceBase, jQuery);
