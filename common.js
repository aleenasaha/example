/*
* Module with common functions from all modules
* */
voiceBase = (function(VB, $) {

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

    String.prototype.padLeft = function(total) {
        return Array(total - this.length + 1).join('0') + this;
    };

    // Extends
    jQuery.extend(jQuery.expr[':'], {
        "wordtime": function(element, i, match, elements) {
            var value = parseFloat($(element).attr('t'));
            var minMaxValues = match[3].split(/\s?,\s?/);
            var minValue = parseFloat(minMaxValues[0]);
            var maxValue = parseFloat(minMaxValues[1]);
            return !isNaN(value) && !isNaN(minValue) && !isNaN(maxValue) && value <= maxValue && value >= minValue;
        }
    });

    jQuery.extend(jQuery.expr[':'], {
        "speakertime": function(element, i, match, elements) {
            var s = parseFloat($(element).attr('s'));
            var e = parseFloat($(element).attr('e'));
            var minMaxValues = match[3].split(/\s?,\s?/);
            var value = parseFloat(minMaxValues[0]);
            return !isNaN(s) && !isNaN(e) && !isNaN(value) && value <= e && value >= s;
        }
    });

    VB.common = {
        inSpeakers: function (needle) {
            for (var iss in VB.data.speakers) {
                if (VB.data.speakers[iss].toLowerCase() == needle.toLowerCase())
                    return true;
            }
            return false;
        },

        getStringFromObject: function (obj) {
            return Object.keys(obj).map(function (key) {
                return encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]);
            }).join('&');
        },

        inArrayV: function(sarray, needle) {
            for (var iss in sarray) {
                if (sarray[iss] == needle)
                    return true;
            }
            return false;
        },

        keysToLowerCase: function(obj) {
            var keys = Object.keys(obj);
            var n = keys.length;
            while (n--) {
                var key = keys[n]; // "cache" it, for less lookups to the array
                if (key !== key.toLowerCase()) { // might already be in its lower case version
                    obj[key.toLowerCase()] = obj[key]; // swap the value to a new lower case key
                    delete obj[key]; // delete the old key
                }
            }
            return (obj);
        },

        vbmenus: function(event, type, elem) {
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
                var $voice_search_txt = $('#vbs-voice_search_txt');
                if ($voice_search_txt.val().length) {
                    newparam['vbs'] = encodeURI($voice_search_txt.val());
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

            $("<ul class='vbs-vbcmenu'>" + menu + "</ul>").appendTo("body");

            var $menu = $('.vbs-vbcmenu');
            if($menu.height() + event.pageY < document.body.clientHeight){
                $menu.css({
                    top: event.pageY + "px",
                    left: event.pageX + "px"
                });
            }
            else{
                $menu.css({
                    top: (event.pageY - $menu.height()) + "px",
                    left: event.pageX + "px"
                });
            }

            if (copy) {
                $("#vbc_url").find('a').zclip({
                    path: VB.settings.zeroClipboardSwfPath,
                    copy: url
                });
            }
            if (share) {
                addthis.toolbox("#vbc_share");
            }
        },

        vbEditMenu: function(event, elem) {
            $("ul.vbs-vbcmenu").remove();
            var $this = $(elem);
            var stime = $this.attr('t') / 1000;
            var stimep = stime > 1 ? stime - 1 : stime;
            var menu = '';
            menu += '<li><a href="#" class="vbsc-edit-play" data-time="'+ stimep  +'">Play</a></li>';
            if(!$this.hasClass('vbs-edit-speaker') && !$this.prev().hasClass('vbs-edit-speaker')){
                menu += '<li><a href="#" class="vbsc-edit-speaker" data-time="'+ stime * 1000 +'">Insert Speaker</a></li>';
            }
            if($this.hasClass('vbs-edit-speaker')){
                var speaker_name = $this.attr('m') || '';
                menu += '<li><a href="#" class="vbsc-rename-speaker" data-speaker-name="'+ speaker_name +'">Rename Speaker</a></li>';
            }

            var $editWrapper = $('.vbs-edit-mode-wrapper');
            $editWrapper.append("<ul class='vbs-vbcmenu'>" + menu + "</ul>");
            var $menu = $('.vbs-vbcmenu');
            var coordY = event.clientY + $editWrapper.scrollTop();

            if($menu.height() + event.clientY < document.body.clientHeight){
                $menu.css({
                    top: coordY + "px",
                    left: event.pageX + "px"
                });
            }
            else{
                $menu.css({
                    top: (coordY - $menu.height() - $this.height()) + "px",
                    left: event.pageX + "px"
                });
            }
        },

        getSpeakerName: function(key) {
            return typeof VB.data.speakers[key] != 'undefined' ? VB.data.speakers[key] : '';
        },

        uniqueArray: function(array){
            array = array ? array : [];
            var unique_array = {};
            for (var i = 0; i < array.length; i++) {
                unique_array[array[i]] = true;
            }
            array = Object.keys(unique_array);
            return array;
        },

        hidePopup: function($popup){
            $popup.fadeOut('fast', function(){
                $(this).remove();
            });
        }
    };

    return VB;
})(voiceBase, jQuery);
