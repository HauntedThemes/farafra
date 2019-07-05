/**
 * Main JS file for Farafra
 */

jQuery(document).ready(function($) {

    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
        readLaterPosts = [],
        swiperFeatured,
        noBookmarksMessage = $('.no-bookmarks').html(),
        monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    var config = {
        'share-selected-text': true,
        'disqus-shortname': 'hauntedthemes-demo',
        'content-api-host': '',
        'content-api-key': '',
    };

    var ghostAPI = new GhostContentAPI({
        host: config['content-api-host'],
        key: config['content-api-key'],
        version: 'v2'
    });

    setGalleryRation();

    // Featured posts slider

    if ($('.horz-accordion .swiper-slide').length == 1) {
        $('.horz-accordion').addClass('single');
    };

    if (w < 1200) {
        swiperFeatured = new Swiper('.horz-accordion', {
            slidesPerView: 1,
            spaceBetween: 1,
            effect: 'slide',
            speed: 500,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false
            },
        });
    }else{
        swiperFeatured = new Swiper('.horz-accordion', {
            slidesPerView: 1,
            spaceBetween: 1,
            effect: 'fade',
            speed: 500,
            simulateTouch: false,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false
            },
        });
    };

    $('.horz-accordion ul li .feature-link').on('click', function(event) {
        if (!$(this).closest('.swiper-slide').hasClass('swiper-slide-active')) {
            event.preventDefault();
        };
    });

    $('.horz-accordion ul li').on('click', function(event) {
        if (!swiperFeatured.animating) {
            swiperFeatured.slideTo($(this).index());
        };
    });

    $('.horz-accordion ul li .prev').on('click', function(event) {
        event.preventDefault();
        if (swiperFeatured.activeIndex == 0) {
            swiperFeatured.slideTo($('.horz-accordion ul li').length - 1);
        }else{
            swiperFeatured.slidePrev();
        };
    });

    $('.horz-accordion ul li .next').on('click', function(event) {
        event.preventDefault();
        if (swiperFeatured.activeIndex == $('.horz-accordion ul li').length - 1) {
            swiperFeatured.slideTo(0);
        }else{
            swiperFeatured.slideNext();
        };
    });

    $(window).on('resize', function(event) {
        w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

        if ($('.horz-accordion').length) {
            if (w < 1200) {
                swiperFeatured.destroy();
                swiperFeatured = new Swiper('.horz-accordion', {
                    slidesPerView: 1,
                    spaceBetween: 1,
                    effect: 'slide',
                    speed: 500,
                    autoplay: {
                        delay: 5000,
                        disableOnInteraction: false
                    },
                });
            }else{
                swiperFeatured.destroy();
                swiperFeatured = new Swiper('.horz-accordion', {
                    slidesPerView: 1,
                    spaceBetween: 1,
                    effect: 'fade',
                    speed: 500,
                    simulateTouch: false,
                    autoplay: {
                        delay: 5000,
                        disableOnInteraction: false
                    },
                });
            };
        };

    });

    if (typeof Cookies.get('farfara-read-later') !== "undefined") {
        readLaterPosts = JSON.parse(Cookies.get('farfara-read-later'));
    }

    readLaterPosts = readLater($('#content .loop'), readLaterPosts);


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

    // Initialize Highlight.js
    $('pre code').each(function(i, block) {
        hljs.highlightBlock(block);
    });

    var ghostSearch = new GhostSearch({
        host: config['content-api-host'],
        key: config['content-api-key'],
        input: '#search-field',
        results: '#results',
        api: {
            parameters: { 
                fields: ['title', 'slug', 'published_at', 'primary_tag', 'id'],
                include: 'tags',
            },
        },
        on: {
            afterDisplay: function(results){

                $('#results').empty();
                
                var tags = [];
                $.each(results, function(index, val) {
                    if (val.obj.primary_tag) {
                        if ($.inArray(val.obj.primary_tag.name, tags) === -1) {
                            tags.push(val.obj.primary_tag.name);
                        };
                    }else{
                        if ($.inArray('Other', tags) === -1) {
                            tags.push('Other');
                        };
                    };
                });

                tags.sort();

                $.each(tags, function(index, val) {
                    var tag = val;
                    if (val == 'Other') {
                        tag = $('#results').attr('data-other');
                    };
                    $('#results').append('<h5>'+ tag +'</h5><ul data-tag="'+ val +'" class="list-box"></ul>');
                });

                $.each(results, function(index, val) {
                    var dateSplit = val.obj.published_at.split('T');
                    dateSplit = dateSplit[0].split('-');
                    var month = monthNames[dateSplit[1]-1];
                    var date = moment(dateSplit[2]+'-'+month+'-'+dateSplit[1], "DD-MM-YYYY").format('DD MMM YYYY');
                    if (val.obj.primary_tag) {
                        $('#results ul[data-tag="'+ val.obj.primary_tag.name +'"]').append('<li><time>'+ date +'</time><a href="#" class="read-later" data-id="'+ val.obj.id +'"></a><a href="/'+ val.obj.slug +'/">'+ val.obj.title +'</a></li>');
                    }else{
                        $('#results ul[data-tag="Other"]').append('<li><a href="#" class="read-later" data-id="'+ val.obj.id +'"></a><time>'+ date +'</time><a href="/'+ val.obj.slug +'/">'+ val.obj.title +'</a></li>');
                    };
                });

                readLaterPosts = readLater($('#results'), readLaterPosts);

            },
        }
    })

    function readLater(content, readLaterPosts){

        if (typeof Cookies.get('farfara-read-later') !== "undefined") {
            $.each(readLaterPosts, function(index, val) {
                $('.read-later[data-id="'+ val +'"]').addClass('active');
            });
            bookmarks(readLaterPosts);
        }
        
        $(content).find('.read-later').each(function(index, el) {
            $(this).on('click', function(event) {
                event.preventDefault();
                var id = $(this).attr('data-id');
                if ($(this).hasClass('active')) {
                    removeValue(readLaterPosts, id);
                }else{
                    readLaterPosts.push(id);
                };
                $('.read-later[data-id="'+ id +'"]').each(function(index, el) {
                    $(this).toggleClass('active');
                });
                $('header .btns a .counter').addClass('shake');
                setTimeout(function() {
                    $('header .btns a .counter').removeClass('shake');
                }, 300);
                Cookies.set('farfara-read-later', readLaterPosts, { expires: 365 });
                bookmarks(readLaterPosts);
            });
        });

        return readLaterPosts;

    }

    function bookmarks(readLaterPosts){

        $('.bookmark-container').empty();
        if (readLaterPosts.length) {

            var filter = readLaterPosts.toString();
            filter = "id:["+filter+"]";

            ghostAPI.posts
                .browse({limit: 'all', filter: filter, include: 'tags'})
                .then((results) => {

                    $('.bookmark-container').empty();

                    var tags = [];
                    $.each(results, function(index, val) {
                        if (val.primary_tag) {
                            if ($.inArray(val.primary_tag.name, tags) === -1) {
                                tags.push(val.primary_tag.name);
                            };
                        }else{
                            if ($.inArray('Other', tags) === -1) {
                                tags.push('Other');
                            };
                        };
                    });
    
                    tags.sort();

                    $.each(tags, function(index, val) {
                        var tag = val;
                        if (val == 'Other') {
                            tag = $('.bookmark-container').attr('data-other');
                        };
                        $('.bookmark-container').append('<h5>'+ tag +'</h5><ul data-tag="'+ val +'" class="list-box"></ul>');
                    });
    
                    $.each(results, function(index, val) {
                        var dateSplit = val.published_at.split('T');
                        dateSplit = dateSplit[0].split('-');
                        var month = monthNames[dateSplit[1]-1];
                        var date = moment(dateSplit[2]+'-'+month+'-'+dateSplit[1], "DD-MM-YYYY").format('DD MMM YYYY');
                        if (val.primary_tag) {
                            $('.bookmark-container ul[data-tag="'+ val.primary_tag.name +'"]').append('<li><time>'+ date +'</time><a href="#" class="read-later active" data-id="'+ val.id +'"></a><a href="/'+ val.slug +'/">'+ val.title +'</a></li>');
                        }else{
                            $('.bookmark-container ul[data-tag="Other"]').append('<li><a href="#" class="read-later active" data-id="'+ val.id +'"></a><time>'+ date +'</time><a href="/'+ val.slug +'/">'+ val.title +'</a></li>');
                        };
                    });

                    $('.bookmark-container').find('.read-later').each(function(index, el) {
                        $(this).on('click', function(event) {
                            event.preventDefault();
                            var id = $(this).attr('data-id');
                            if ($(this).hasClass('active')) {
                                removeValue(readLaterPosts, id);
                            }else{
                                readLaterPosts.push(id);
                            };
                            $('.read-later[data-id="'+ id +'"]').each(function(index, el) {
                                $(this).toggleClass('active');
                            });
                            Cookies.set('farfara-read-later', readLaterPosts, { expires: 365 });
                            bookmarks(readLaterPosts);
                        });
                    });

                    if (results) {
                        $('header .counter').removeClass('hidden').text(results.length);
                    }else{
                        $('header .counter').addClass('hidden');
                        $('.bookmark-container').append('<p class="no-bookmarks"></p>');
                        $('.no-bookmarks').html(noBookmarksMessage)
                    };

                })
                .catch((err) => {
                    console.error(err);
                });
           
        }else{
            $('header .counter').addClass('hidden');
            $('.bookmark-container').append('<p class="no-bookmarks"></p>');
            $('.no-bookmarks').html(noBookmarksMessage)
        };

    }

    function removeValue(arr) {
        var what, a = arguments, L = a.length, ax;
        while (L > 1 && arr.length) {
            what = a[--L];
            while ((ax= arr.indexOf(what)) !== -1) {
                arr.splice(ax, 1);
            }
        }
        return arr;
    }

    $("[data-toggle=popover]").popover({
        html : true,
        content: function() {
            var content = $(this).attr("data-popover-content");
            return $(content).children(".popover-body").html();
        }
    });

    // Show bookmark modal on click
    $('.bookmark').on('click', function(event) {
        event.preventDefault();
        $('#bookmark, .backdrop, body').toggleClass('active');
    });

    // Show search modal on click
    $('.search').on('click', function(event) {
        event.preventDefault();
        $('#search, .backdrop, body').toggleClass('active');
        setTimeout(function() {
            $('#search input').focus();
        }, 300);
    });

    // Show menu modal on click
    $('.menu').on('click', function(event) {
        event.preventDefault();
        $('#menu, .backdrop, body').toggleClass('active');
    });

    // Hide search, bookmark and menu on backdrop click
    $('.backdrop').on('click', function(event) {
        event.preventDefault();
        $(this).removeClass('active');
        $('#bookmark, #search, #menu, body').removeClass('active');
    });

    // Hide search, bookmark and menu on x click
    $('.close').on('click', function(event) {
        event.preventDefault();
        $('.backdrop').click();
    });

    // Initialize shareSelectedText
    if (config['share-selected-text']) {
        shareSelectedText('.post-template .post-content', {
            sanitize: true,
            buttons: [
                'twitter',
            ],
            tooltipTimeout: 250
        });
    }; 

    // Execute on load
    $(window).on('load', function(event) {

        setGalleryRation();

        $('.post-content img').each(function(index, el) {
            if (!$(this).parent().is("a")) {
                $( "<a href='" + $(this).attr('src') + "' class='zoom'></a>" ).insertAfter( $(this) );
                $(this).appendTo($(this).next("a"));
            };
        });

        $('.zoom').fluidbox();

        $(window).on('scroll', function(event) {
            $('.zoom').fluidbox('close');
            if ($('.post-template').length) {
                progressBar();
            };
        });
    });

    // Progress bar for inner post
    function progressBar(){
        var postContentOffsetTop = $('.post-content').offset().top;
        var postContentHeight = $('.post-content').height();
        if ($(window).scrollTop() > postContentOffsetTop && $(window).scrollTop() < (postContentOffsetTop + postContentHeight)) {
            var heightPassed = $(window).scrollTop() - postContentOffsetTop;
            var percentage = heightPassed * 100/postContentHeight;
            $('.progress').css({
                width: percentage + '%'
            });
        }else if($(window).scrollTop() < postContentOffsetTop){
            $('.progress').css({
                width: '0%'
            });
        }else{
            $('.progress').css({
                width: '100%'
            });
        };
    }

    function detectIE() {
        var ua = window.navigator.userAgent;

        var msie = ua.indexOf('MSIE ');
        if (msie > 0) {
            // IE 10 or older => return version number
            return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }

        var trident = ua.indexOf('Trident/');
        if (trident > 0) {
            // IE 11 => return version number
            var rv = ua.indexOf('rv:');
            return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }

        var edge = ua.indexOf('Edge/');
        if (edge > 0) {
           // Edge (IE 12+) => return version number
           return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
        }

        // other browser
        return false;
    }

    if (detectIE()) {
        $('body').addClass('ie');
    };

    // Set the right proportion for images inside the gallery
    function setGalleryRation(){
        $('.kg-gallery-image img').each(function(index, el) {
            var container = $(this).closest('.kg-gallery-image');
            var width = $(this)[0].naturalWidth;
            var height = $(this)[0].naturalHeight;
            var ratio = width / height;
            container.attr('style', 'flex: ' + ratio + ' 1 0%');
        });
    }

});