var baseUrl = "http://api.wordnik.com/v4/word.json/";
var apiKey = "a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5"; //demo key from developer.wordnik.com
var path;

var SCHEMAS = {};
/*SCHEMAS.definitions = array of objects
definition would be for i++ result[i].text*/

window.onload = function() {
    document.getElementById("your_word").focus();
    initAutoThesaurus();
    $('#your_word').focus();
};

//$(function() { $('#your_word').focus(); });

function getSynPath() {
    //console.log( $('#your_word').val() );
    var word = extractor( $('#your_word').val() );
    //if (word.length < 2) { return null; }
    //console.log( word );
    var res = $('.tt-dataset-foo').find('p')[0];
    //console.log( '.tt-dataset-foo', $(res).html() );
    path = baseUrl + word + "/relatedWords?useCanonical=true&relationshipTypes=synonym&limitPerRelationshipType=100&api_key=" + apiKey;
    //path = baseUrl + word + "/definitions?useCanonical=true&relationshipTypes=synonym&limitPerRelationshipType=100&api_key=" + apiKey;
    return path;
}

function getDefPath() {
    //console.log( $('#your_word').val() );
    var word = extractor( $('#your_word').val() );
    //if (word.length < 2) { return null; }
    console.log( 'getDefPath', word );
    var res = $('.tt-dataset-foo').find('p')[0];
    console.log( '.tt-dataset-foo', $(res).html() );
    path = baseUrl + word + "/definitions?useCanonical=true&relationshipTypes=synonym&limitPerRelationshipType=100&api_key=" + apiKey;
    return path;
}

function extractor(query) {
    var result = /([^ ]+)$/.exec(query);
    if(result && result[1])
        return result[1].trim();
    return '';
}

function initAutoThesaurus() {
    /*http://stackoverflow.com/questions/21710289/how-to-use-typeahead-js-0-10-step-by-step-remote-prefetch-local*/
    var remoteSynHound = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      prefetch: {
          url: getSynPath(),

      },      
      remote: {
        url: getSynPath(),
        replace: function () {
            return getSynPath();
        },
        // the json file contains an array of strings, but the Bloodhound
        // suggestion engine expects JavaScript objects so this converts all of
        // those strings
        filter: function(list) {
            arr = list[0].words;
            new_arr = [];
            for (var i = 0; i < arr.length; i++) {
              new_arr.push(' <span class="syn">' + arr[i] + '</span>');
            }

            // put them back together
            new_list = [{"words": new_arr}];
            //console.log(new_list);
            return new_list;
        }
      }
    });

  var remoteDefHound = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      prefetch: {
          url: getDefPath(),
          replace: function (response) {
            //console.log('response', response); 
            return getDefPath();
          },
          /*filter: function(response) {     
            //console.log('response', response); 
            return response;
          }*/
      },      
      remote: {
        url: getDefPath(),
        replace: function () {
            return getDefPath();
        },
        filter: function(response) {
            //return $.map(list, function(country) { return { words: country }; });
            // list is an array with one element, an object
            // list[0].words is an array of the words
            console.log(response);
            console.log(response[0]);
            //console.log(response[0]);
            return response;
        }
      }
    });
     
    remoteSynHound.initialize();
    remoteDefHound.initialize();
     
    /*$('.typeahead').typeahead(null, {
      name: 'foo',
      displayKey: 'words',
      //displayKey: 'text',
      source: remoteSynHound.ttAdapter(),
    }); */ 

    $('.typeahead').typeahead(null, 
        {
          name: 'foo',
          displayKey: 'words',
          //displayKey: 'text',
          menu: '#idSynonymList',
          source: remoteSynHound.ttAdapter(),
          //templates: {
              /*empty: [
                '<div class="empty-message">',
                '',
                '</div>'
              ].join('\n'),*/
              //suggestion: Handlebars.compile('<p><span class="synonym">{{words}}</span> |</p>')
              //suggestion: Handlebars.compile(['<span class="synonym">{{words}}</span>'].join('|'))
              /*suggestion: [
                '<span class="synonym">','displayKey','</span>'
              ].join(' ')*/
          //}          
        }//,
        /*
        {
          name: 'foo2',
          displayKey: 'text',
          menu: '#idDefList',
          source: remoteDefHound.ttAdapter(),
        }
        */
    );
}

$(document).on("click.tt", ".tt-suggestion", function(e) {
    console.log('click.tt, .tt-suggestion', $(this).html() );
    console.log('click.tt, .tt-suggestion', $(this) );
    console.log('.paper html', $('.paper').html() );
    //$(this).show();
    e.stopPropagation();
    e.preventDefault();
});

