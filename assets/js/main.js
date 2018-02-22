/**
 * Main JS file for Farafra
 */

jQuery(document).ready(function($) {

    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
        readLaterPosts = [],
        swiperFeatured;

    var config = {
        'share-selected-text': true,
        'disqus-shortname': 'hauntedthemes-demo'
    };

    if ($('.horz-accordion .swiper-slide').length == 1) {
        $('.horz-accordion').addClass('single');
    };

    if (w < 1200) {
        swiperFeatured = new Swiper('.horz-accordion', {
            slidesPerView: 1,
            spaceBetween: 1,
            effect: 'slide',
            speed: 500,
        });
    }else{
        swiperFeatured = new Swiper('.horz-accordion', {
            slidesPerView: 1,
            spaceBetween: 1,
            effect: 'fade',
            speed: 500,
            simulateTouch: false,
        });
    };

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
                });
            }else{
                swiperFeatured.destroy();
                swiperFeatured = new Swiper('.horz-accordion', {
                    slidesPerView: 1,
                    spaceBetween: 1,
                    effect: 'fade',
                    speed: 500,
                    simulateTouch: false,
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

    // Initialize ghostHunter - A Ghost blog search engine
    var searchField = $("#search-field").ghostHunter({
        results             : "#results",
        onKeyUp             : true,
        zeroResultsInfo     : true,
        displaySearchInfo   : false,
        onComplete      : function( results ){

            $('#results').empty();

            var tags = [];
            $.each(results, function(index, val) {
                if (val.tags.length) {
                    if ($.inArray(val.tags[0], tags) === -1) {
                        tags.push(val.tags[0]);
                    };
                }else{
                    if ($.inArray('Other', tags) === -1) {
                        tags.push('Other');
                    };
                };
            });
            tags.sort();

            $.each(tags, function(index, val) {
                $('#results').append('<h5>'+ val +'</h5><ul data-tag="'+ val +'" class="list-box"</ul>');
            });

            $.each(results, function(index, val) {
                if (val.tags.length) {
                    $('#results ul[data-tag="'+ val.tags[0] +'"]').append('<li><time>'+ val.pubDate +'</time><a href="#" class="read-later" data-id="'+ val.ref +'"></a><a href="'+ val.link +'">'+ val.title +'</a></li>');
                }else{
                    $('#results ul[data-tag="Other"]').append('<li><a href="#" class="read-later" data-id="'+ val.ref +'"></a><time>'+ val.pubDate +'</time><a href="'+ val.link +'">'+ val.title +'</a></li>');
                };
            });

            readLaterPosts = readLater($('#results'), readLaterPosts);

        }
    });

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
            $('header .counter').removeClass('hidden').text(readLaterPosts.length);
            var filter = readLaterPosts.toString();
            filter = "id:["+filter+"]";

            $.get(ghost.url.api('posts', {filter:filter, include:"tags"})).done(function (data){
                $('.bookmark-container').empty();
                var tags = [];
                $.each(data.posts, function(index, val) {
                    if (val.tags.length) {
                        if ($.inArray(val.tags[0].name, tags) === -1) {
                            tags.push(val.tags[0].name);
                        };
                    }else{
                        if ($.inArray('Other', tags) === -1) {
                            tags.push('Other');
                        };
                    };
                });
                tags.sort();

                $.each(tags, function(index, val) {
                    $('.bookmark-container').append('<h5>'+ val +'</h5><ul data-tag="'+ val +'" class="list-box"</ul>');
                });

                $.each(data.posts, function(index, val) {
                    if (val.tags.length) {
                        $('.bookmark-container ul[data-tag="'+ val.tags[0].name +'"]').append('<li><time>'+ prettyDate(val.created_at) +'</time><a href="#" class="read-later active" data-id="'+ val.id +'"></a><a href="/'+ val.slug +'">'+ val.title +'</a></li>');
                    }else{
                        $('.bookmark-container ul[data-tag="Other"]').append('<li><a href="#" class="read-later active" data-id="'+ val.id +'"></a><time>'+ prettyDate(val.created_at) +'</time><a href="/'+ val.slug +'">'+ val.title +'</a></li>');
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

            });
        }else{
            $('header .counter').addClass('hidden');
            $('.bookmark-container').append('<p class="no-bookmarks">You haven\'t yet saved any bookmarks. To bookmark a post, just click <i class="circle"></i>.</p>')
        };

    }

    function prettyDate(date) {
        var d = new Date(date);
        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            return d.getDate() + ' ' + monthNames[d.getMonth()] + ' ' + d.getFullYear();
    };

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

    $('.bookmark').on('click', function(event) {
        event.preventDefault();
        $('#bookmark, .backdrop, body').toggleClass('active');
    });

    $('.search').on('click', function(event) {
        event.preventDefault();
        $('#search, .backdrop, body').toggleClass('active');
        setTimeout(function() {
            $('#search input').focus();
        }, 300);
    });

    $('.backdrop').on('click', function(event) {
        event.preventDefault();
        $(this).removeClass('active');
        $('#bookmark, #search, #menu, body').removeClass('active');
    });

    $('.menu').on('click', function(event) {
        event.preventDefault();
        $('#menu, .backdrop, body').toggleClass('active');
    });

    $('.close').on('click', function(event) {
        event.preventDefault();
        $('.backdrop').click();
    });

    // Execute on scroll
    $(window).on('scroll', function(event) {
        // Hide menu and search after scroll
        var top = $(window).scrollTop();
        if (top > (h/2)) {
            $('.backdrop').click();
        };
    });

});