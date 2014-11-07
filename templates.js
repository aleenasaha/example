/*
* VB.templates
* */
voiceBase = (function(VB, $) {

    var addTabClasses = function(){
        var tab_classes = '';
        if(VB.settings.tabView){
            tab_classes += ' vbs-tab ';
        }
        return tab_classes;
    };

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
                case('vbs-searchbar-outer'):
                    var tmpl = '' +
                        '<div id="vbs-searchbar-block">' +
                        '<div class="vbs-search-form vbs-no-speaker">' +
                        '<form action="#" id="vbs-search-form">' +
                        '<div class="vbs-widget-wrap">' +
                        '<div class="vbs-widget">' +
                        '<input name="get_voice_search" value="" size="20" id="vbs-voice_search_txt" class="vbs-formfields" type="text" placeholder="Search..." autocomplete=off>' +
                        '<div id="vbs-search-string">' +
                        '<div class="vbs-marquee">' +
                        '<div class="vbs-search-word-widget"></div>' +
                        '</div>' +
                        '</div>';
                    tmpl += VB.settings.vbsButtons.pwrdb ? '<span class="vbs-powered-by-label">Powered by VoiceBase</span>' : '';
                    tmpl += '</div>' +
                        '<a href="#" id="vbs-clear-string" title="Clear String"></a>' +
                        '</div>';
                    if(VB.settings.vbsButtons.unquotes) {
                        tmpl +='<a href="javascript:void(0)" class="vbs-unquote-btn">Unquoted</a>';
                    }
                        tmpl +='<div class="vbs-search-btn" data-title="Search">' +
                        '   <button type="submit"></button>' +
                        '</div>' +
                        '</form>' +
                        '</div>' +
                        '</div>';
                    return tmpl;
                    break;
                case('vbs-keywords'):
                    var tmpl = '<div class="vbs-keywords-block ' + addTabClasses() + '">\n\
                <div class="vbs-section-header">\n\
                    <div class="vbs-section-title" data-title="Hide Keywords">\n\
                        <span class="vbs-section-name">Keywords</span>\n\
                    </div>\n\
\n\
                    <div class="vbs-search-form vbs-no-speaker ';
                    tmpl += VB.settings.vbsButtons.evernote && typeof filepicker !== 'undefined' ? 'vbs-one-btn' : 'vbs-no-btns';
                    tmpl += '">';
                    if(!VB.settings.searchBarOuter){
                        tmpl += '<form action="#" id="vbs-search-form">\n\
                            <div class="vbs-widget-wrap">\n\
                                <div class="vbs-widget">\n\
                                    <input name="get_voice_search" value="" size="20" id="vbs-voice_search_txt" class="vbs-formfields" type="text" placeholder="Search..." autocomplete=off>\n\
                                    <div id="vbs-search-string">\n\
                                        <div class="vbs-marquee">\n\
                                            <div class="vbs-search-word-widget"></div>\n\
                                        </div>\n\
                                    </div>';
                        tmpl += VB.settings.vbsButtons.pwrdb ? '<span class="vbs-powered-by-label">Powered by VoiceBase</span>' : '';
                        tmpl += '</div>\n\
                             <a href="#" id="vbs-clear-string" title="Clear String"></a>\n\
                            </div>';
                    if(VB.settings.vbsButtons.unquotes) {
                        tmpl +='<a href="javascript:void(0)" class="vbs-unquote-btn">Unquoted</a>';
                    }
                    tmpl +='<div class="vbs-search-btn" data-title="Search">\n\
                                    <button type="submit"></button>\n\
                            </div>';
                        tmpl += '</form>';
                    }
                    tmpl += '<div class="vbs-select-speaker-wrapper">\n\
                        <div class="vbs-select-speaker">Select speaker...</div>\n\
                        <ul class="vbs-select-dropdown"></ul>\n\
                    </div>';
                    tmpl += '</div>';
                    // keywords buttons
                    var buttons_li = '';
                    if(VB.settings.vbsButtons.evernote && typeof filepicker !== 'undefined'){
                        buttons_li += '<li><a href="#" class="vbs-evernote-btn" data-title="Send to Evernote"></a></li>';
                    }
                    if(buttons_li){
                        tmpl += '<div class="vbs-section-btns"><ul>';
                        tmpl += buttons_li;
                        tmpl += '</ul></div>';
                    }
                    tmpl += '<div class="clear-block"></div>\n\
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
                        <div class="vbs-save-done-img"></div>\
                        <h3>Done!</h3>\n\
                    </div>\n\
                    <div class="vbs-save-loading-popup">\n\
                        <div class="vbs-ajax-loader"></div>\n\
                        <h3>Saving & Re-syncing!</h3>\n\
                        <p>This may take a little time, especially if youâ€™re editing a longer transcript.</p>\n\
                    </div>\n\
                </div>\n\
                </div>';
                    return html;
                    break;
                case('vbs-transcript'):
                    var resizing_style = !VB.settings.showMore ? 'vbs-no-showmore-btn' : '';
                    var tmpl = '<div class="vbs-transcript-block ' + resizing_style + addTabClasses() + '">\n\
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
                    var tmpl = '\n\
                <div class="vbs-comments-block ' + addTabClasses() + '">\n\
                    <div class="vbs-section-header">\n\
                        <div class="vbs-section-title" data-title="Show Comments">\n\
                            <span class="vbs-section-name"></span>\n\
                        </div>\n\
                        <div class="vbs-section-btns">\n\
                            <ul class="vbs-clearfix">\n\
                                <li>';
                    if(VB.settings.tabView){
                        tmpl += '<a href="#" class="vbs-comments-btn vbs-popup-btn" data-title="Add a Comment">' +
                            '<div class="vbs-comments-btn-icon"></div>' +
                            '<span>Add New Comment</span>' +
                        '</a>';
                    }
                    else{
                        tmpl += '<a href="#" class="vbs-comments-btn vbs-popup-btn" data-title="Add a Comment"></a>';
                    }
                                tmpl += '</li>\n\
                            </ul>\n\
                        </div>\n\
                    </div>\n\
                    <!--wrapper for comments content-->\n\
                    <div class="vbs-section-body"></div>\n\
                </div>';
                    return tmpl;
                    break;
                case('vbs-news'):
                    var tmpl = '\n\
                <div class="vbs-news-block ' + addTabClasses() + '">\n\
                    <div class="vbs-section-header">\n\
                        <div class="vbs-section-title" data-title="Show News">\n\
                            <span class="vbs-section-name">\
                                <span>News stories</span>\
                                <span class="vbs-news-words-wrapper">\
                                    <span class="vbs-small-text"> related to </span>\
                                    <span class="vbs-news-words"></span>\
                                </span>\
                            </span>\n\
                        </div>\n\
                    </div>\n\
                    <!--wrapper for news content-->\n\
                    <div class="vbs-section-body">\n\
                        <div class="vbs-news-wrapper vbs-scroll">\n\
                        </div>\n\
                    </div>\n\
                </div>';
                    return tmpl;
                    break;
                case('vbs-news-elem'):
                    var tmpl = '';
                    tmpl += '<a href="{{ url }}" target="_blank" class="vbs-news-elem">' +
                        '<div class="vbs-news-elem-title">{{ title }}</div>' +
                        '<div class="vbs-news-elem-body">' +
                        '   <span class="vbs-news-elem-source">{{ source }}</span>' +
                        '   <span>&nbsp;-&nbsp;</span>' +
                        '   <span class="vbs-news-elem-time">{{ time }}</span>' +
                        '</div>'
                    '</a>'
                    return tmpl;
                    break;
                case('vbs-empty-news'):
                    var tmpl = '<div class="empty_news_message">News are not founded</div>';
                    return tmpl;
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
                    <div class="vbs-comments-popup vbs-comments-add-popup vbs-popup">\n\
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
                case("renameSpeakerPopup"):
                    return '\n\
                    <div class="vbs-rename-speaker-popup vbs-common-popup">\n\
                        <div class="vbs-arrow"></div>\n\
                        <div class="vbs-common-popup-header vbs-clearfix">\n\
                            <span>Rename speaker</span>\
                            <span class="vbs-old-speaker-name">{{ current_speaker_name }}</span>\
                            <span>to:</span>\
                        </div>\n\
                        <div class="vbs-common-popup-body">\n\
                            <input type="text" id="vbs-rename_speaker_input" data-old-speaker-name="{{ current_speaker_name }}" placeholder="Enter new speaker name"/>\
                        </div>\n\
                        <div class="vbs-common-popup-footer">\n\
                            <a href="#" class="vbs-cancel-btn">Cancel</a>\n\
                            <a href="#" class="vbs-confirm-btn">Rename</a>\n\
                        </div>\n\
                    </div>\n';
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
                    tmpl = '<!--media-->\n\
<div id="vbs-media"></div>\n\
<!--controls-->\n\
<div id="vbs-controls"></div>';
                    if(!VB.settings.tabView){
                        tmpl += '<!--keywords-->\n\
                        <div id="vbs-keywords"></div>';
                        if(VB.settings.showNewsBlock){
                            tmpl += '<!--news-->\n\
                            <div id="vbs-news"></div>';
                        }
                        tmpl += '<!-- transcript -->\n\
                        <div id="vbs-transcript"></div>\n\
                        <!-- comments -->\n\
                        <div id="vbs-comments"></div>';
                    }
                    else{
                        tmpl += '<!-- tabs-->\n<div class="vbs-not-media-sections vbs-tabs-view">\n' +
                            '    <div class="vbs-tabs-links vbs-clearfix">\n';
                        if(VB.settings.showKeywordsBlock){
                            tmpl += '        <a href="#" data-href=".vbs-keywords-block" class="vbs-active">Keywords</a>\n';
                        }
                        if(VB.settings.showTranscriptBlock){
                            tmpl += '        <a href="#" data-href=".vbs-transcript-block">Transcript</a>\n';
                        }
                        if(VB.settings.showCommentsBlock){
                            tmpl += '        <a href="#" data-href=".vbs-comments-block">Comments</a>\n';
                        }
                        tmpl += '</div>\n' +
                            '    <!--keywords-->\n' +
                            '    <div id="vbs-keywords"></div>\n' +
                            '    <!-- transcript -->\n' +
                            '    <div id="vbs-transcript"></div>\n' +
                            '    <!-- comments -->\n' +
                            '    <div id="vbs-comments"></div>\n' +
                            '</div>\n';
                    }
                    return tmpl;
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

                case("abstractErrorPopup"):
                    return '' +
                        '<div class="vbs-white-popup-overlay">' +
                            '<div class="vbs-big-error-popup">' +
                                '<a href="javascript:void(0)" class="overlay_dismiss">&times;</a>'+
                                '<h2>{{ errorTitle }}</h2>' +
                                '<p>{{ errorText }}</p>' +
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
                case("languageSelect"):
                    tmpl = '' +
                        '<div class="vbs-select-wrapper vbs-select-language-wrapper">\n\
                            <div class="vbs-select-title vbs-select-language">Select language...</div>\n\
                            <ul class="vbs-select-dropdown"></ul>\n\
                        </div>';
                    return tmpl;
                    break;
                case("languageItem"):
                    tmpl = '' +
                        '<li data-lang-code="{{ lang_code }}">{{ lang_name }}</li>';
                    return tmpl;
                    break;
                default:
                    return '';
            }
        }
    };

    return VB;
})(voiceBase, jQuery);
