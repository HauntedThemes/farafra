/**
 * Main JS file for Farafra
 */

jQuery(document).ready(function($) {

    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    var config = {
        'share-selected-text': true,
        'load-more': false,
        'infinite-scroll': false,
        'infinite-scroll-step': 3,
        'disqus-shortname': 'hauntedthemes-demo'
    };

	var swiper = new Swiper('.swiper-container', {
		slidesPerView: 1,
		spaceBetween: 30,
    });

    // Initialize Disqus comments
    if ($('#content').attr('data-id') && config['disqus-shortname'] != '') {

        $('.comments-trigger').on('click', function(event) {
            event.preventDefault();

            $(this).toggleClass('active');

            if (!$('#disqus_thread').length) {
	            $('.comments').append('<div id="disqus_thread"></div>');

	            var url = [location.protocol, '//', location.host, location.pathname].join('');
	            var disqus_config = function () {
	                this.page.url = url;
	                this.page.identifier = $('#content').attr('data-id');
	            };

	            (function() {
	            var d = document, s = d.createElement('script');
	            s.src = '//'+ config['disqus-shortname'] +'.disqus.com/embed.js';
	            s.setAttribute('data-timestamp', +new Date());
	            (d.head || d.body).appendChild(s);
	            })();
            };

            if (!$(this).hasClass('active')) {
                $('.comments').removeClass('active');
            }else{
                $('.comments').addClass('active');
            };

        });

    };

    $('.horz-accordion ul li').on('click', function(event) {
        event.preventDefault();
        $('.horz-accordion ul li').removeClass('active');
        $(this).addClass('active');
    });

    $('.horz-accordion ul li .prev, .horz-accordion ul li .next').on('click', function(event) {
        event.preventDefault();
        var index = $(this).closest('li').index();
        console.log(index);
        $('.horz-accordion ul li').removeClass('active');
    });

    var time;

    function changeSlideOnTime(time){
        time = setTimeout(function(){ 
            var index = $('.horz-accordion ul li.active').index();
            var next = index + 2;
            var length = $('.horz-accordion ul li').length;

            if (next > length) {
                next = 1;
            };

            $('.horz-accordion ul li').removeClass('active');
            $('.horz-accordion ul li:nth-child('+ next +')').addClass('active');

            changeSlideOnTime(time);
        }, 5000);
    }

    changeSlideOnTime(time);

});