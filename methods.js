/*
* VB.methods. Public plugin methods
* */
voiceBase = (function(VB, $) {

    VB.methods = {
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
            var $star = VB.helper.find(".vbs-star-btn");
            $star.toggleClass('vbs-active');
            return $star.hasClass('vbs-active');
        },
        isFavorite: function() {
            return VB.helper.find(".vbs-star-btn").hasClass('vbs-active');
        },
        getPosition: function() {
            return Math.round(VB.helper.getPosition());
        },
        getSearchString: function() {
            return VB.helper.find('#vbs-voice_search_txt').val();
        },
        getSharePositionUrl: function() {
            var newparam = {};
            newparam['vbt'] = Math.round(VB.helper.getPosition());
            return VB.helper.getNewUrl(newparam);
        },
        getShareSearchStringUrl: function() {
            var newparam = {};
            newparam['vbs'] = encodeURI(VB.helper.find('#vbs-voice_search_txt').val());
            return VB.helper.getNewUrl(newparam);
        },
        getShareFlag: function() {
            return VB.helper.find('.vbs-share-radio-row input[name="share-opt"]:checked').val();
        },
        search: function(text) {
            VB.helper.find("#vbs-voice_search_txt").val(text);
            VB.helper.find('#vbs-search-form').submit();
            return text;
        },
        position: function(time) {
            VB.helper.seek(time);
            return time;
        }
    };

    return VB;
})(voiceBase, jQuery);
