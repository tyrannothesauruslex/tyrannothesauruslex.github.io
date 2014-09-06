var baseUrl = "http://api.wordnik.com/v4/word.json/";
var apiKey = "a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5"; //demo key from developer.wordnik.com
var path;

var bht_url = "https://words.bighugelabs.com/api/2/";
var bht_apikey = "eb4e57bb2c34032da68dfeb3a0578b68";
/*
BHT 
https://words.bighugelabs.com/api/2/eb4e57bb2c34032da68dfeb3a0578b68/eager/json
returns:
{"adjective":{"syn":["avid","great","zealous"],"ant":["uneager"],"sim":["anxious","dying","enthusiastic","hot","impatient","overeager","raring"]},"noun":{"syn":["tidal bore","bore","eagre","aegir","tidal current","tidal flow"]}}
*/


var SCHEMAS = {};
/*SCHEMAS.definitions = array of objects
definition would be for i++ result[i].text*/

window.onload = function() {
    document.getElementById("your_word").focus();
    initAutoThesaurus();
    $('#your_word').focus();
};

//$(function() { $('#your_word').focus(); });

function getBHTsynPath() {
    //console.log( $('#your_word').val() );
    var word = extractor( $('#your_word').val() );
    //if (word.length < 2) { return null; }
    //console.log( word );
    var res = $('.tt-dataset-foo2').find('p')[0];
    //console.log( '.tt-dataset-foo', $(res).html() );
    //path = bht_url + bht_apikey + '/' + word + '/json?callback=?';
    path = bht_url + bht_apikey + '/' + word + '/json?callback=?';
    //path = baseUrl + word + "/definitions?useCanonical=true&relationshipTypes=synonym&limitPerRelationshipType=100&api_key=" + apiKey;
    return path;
}

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
            new_arr = ['{wordnik} '];
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

  var remoteBHT_Hound = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      prefetch: {
          //url: getDefPath(),
          url: getBHTsynPath(),
          replace: function (response) {
            //console.log('response', response); 
            //return getDefPath();
            return getBHTsynPath();
          },
          /*filter: function(response) {     
            //console.log('response', response); 
            return response;
          }*/
      },      
      remote: {
        //url: getDefPath(),
        url: getBHTsynPath(),
        replace: function () {
            //return getDefPath();
            return getBHTsynPath();
        },
        filter: function(response) {
            //console.log(response[0]);
            // BHT returns obj with keys for each part of speech
            // each an object with keys ant, sim, syn 
            // each of which is an array
            // for now push all syns into one array?
            new_arr = [];
            for (var key in response) {
                new_arr = new_arr.concat(response[key].syn);
            }

            var newer_arr = ['{bht} '];
            for (var i = 0; i < new_arr.length; i++) {
              newer_arr.push(' <span class="syn">' + new_arr[i] + '</span>');
            }

            new_list = [{"words": newer_arr}];
            //return response;
            return new_list;
        }
      }
    });
     
    remoteSynHound.initialize();
    remoteBHT_Hound.initialize();
     
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
        },
        {
          name: 'foo2',
          //displayKey: 'text',
          displayKey: 'words',
          menu: '#idDefList',
          source: remoteBHT_Hound.ttAdapter(), // todo: remoteBHTsynHound
        }
        
    );
}

$(document).on("click.tt", ".tt-suggestion", function(e) {
    /*console.log('click.tt, .tt-suggestion', $(this).html() );
    console.log('click.tt, .tt-suggestion', $(this) );
    console.log('.paper html', $('.paper').html() );
    *///$(this).show();
    e.stopPropagation();
    e.preventDefault();
});

