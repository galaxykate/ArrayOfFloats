/**
 * @author Kate
 */

// UI utilities

function TabBar(holder, tabSettings, openIndex) {
    this.div = $("<div/>", {
        class : "tab-holder",
    }).appendTo(holder);
    var bar = this;
    this.tabs = [];

    $.each(tabSettings, function(index, settings) {
        bar.tabs[index] = {
            div : $("<div/>", {
                class : "tab",
                html : settings.label
            }).appendTo(bar.div).click(function() {
                bar.open(index);
            }),
            settings : settings
        };

    });

    if (openIndex !== undefined) {
        this.open(openIndex);
    }
};

TabBar.prototype.open = function(index) {
    if (this.openedIndex !== undefined) {
        var open = this.tabs[this.openedIndex];
        open.div.removeClass("open");

        if (open.settings.onClose)
            open.settings.onClose();
    }
    this.openedIndex = index;
    if (this.openedIndex !== undefined) {
        var open = this.tabs[this.openedIndex];
        open.div.addClass("open");

        if (open.settings.onOpen)
            open.settings.onOpen();
    }
};

function prettyJSON(grammar) {
    var lines = [];
    $.each(grammar, function(key, val) {
        lines.push("&nbsp;&nbsp;&nbsp;<b>" + key + ":</b> " + escapeHTML(JSON.stringify(val)));
    });
    var output = lines.join(",<p>");
    return output;
}

function updateGrammar(src, grammar) {
    // string all whitespace

    // Remove all tags not in the grammar
    var level = 0;
    var states = [];
    var mode;

    var cleaned = "";

    function pushState(endChar, skip) {
        states.push({
            endChar : endChar,
            skip : skip
        });
        mode = states[states.length - 1];
    };

    function popState() {
        states.pop();
        mode = states[states.length - 1];
    };

    for (var i = 0; i < src.length; i++) {
        var c = src.charAt(i);

        switch(c) {
        case "&":
            pushState(";", true);
            break;

        case "\\":
            console.log("escape");
            break;
        case "<":
            pushState(">", true);

            break;
        case "[":
            pushState("]", false);
            //   cleaned += "[";
            break;

        default:

        }

        // waiting for something
        if (!mode || !mode.skip)
            cleaned += c;

        if (mode && mode.endChar === c) {
            popState();
        }

    }

    console.log("Update grammar", cleaned);
    return cleaned;
}

function escapeHTML(s) {
    return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function stripHTML(s) {
    s = s.replace(/<br>/g, '').replace(/&nbsp;/g, '');
    return s;
}

var QueryString = function() {
    // This function is anonymous, is executed immediately and
    // the return value is assigned to QueryString!
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        // If first entry with this name
        if ( typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = decodeURIComponent(pair[1]);
            // If second entry with this name
        } else if ( typeof query_string[pair[0]] === "string") {
            var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
            query_string[pair[0]] = arr;
            // If third or later entry with this name
        } else {
            query_string[pair[0]].push(decodeURIComponent(pair[1]));
        }
    }
    return query_string;
}();

function getRandom(a) {
    return a[Math.floor(Math.random() * a.length)];
}

Array.prototype.contains = function(query) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === query)
            return true;
    }
    return false;
};

var pages = [{
    id : "diss",
    title : "Dissertation"
}, {
    id : "blog",
    title : "Blog"
}, {
    id : "ccp",
    title : "Tutorials"
}, {
    id : "tracery",
    title : "Tracery"
}];

// http://jquery-howto.blogspot.com/2009/09/get-url-parameters-values-with-jquery.html
function getUrlVars() {
    var vars = [],
        hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}


$(document).ready(function() {

    var path = window.location.pathname;
    var pageName = path.split("/").pop().split(".");
    createTopNav(pageName);
    start(pageName, getUrlVars());
});

function createTopNav(pageName) {
    console.log("create top nav");
    var topNav = $("#top-nav");

    // Create the nav bar
    $.each(pages, function(index, page) {
        if (pageName[0] === page.id) {
            console.log(pageName[0]);
        } else {
            var link = $("<div/>", {
                html : page.title,
                class : "top-link",
            }).appendTo(topNav).click(function() {
                window.history.pushState("obj", page.title, window.location.pathname + "?m=" + page.id);
                start(pageName, getUrlVars());
            });
        }
    });

  
}
