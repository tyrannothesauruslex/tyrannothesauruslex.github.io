//var mwUrl = "http://www.dictionaryapi.com/api/v1/references/thesaurus/xml/test?key=ee5e16f0-13f9-4750-b9e8-b4fa8a4f860d";

var mw_dict_url = 'http://www.dictionaryapi.com/api/v1/references/collegiate/xml/';
var mw_dict_apikey = '2ec52038-fec7-4619-9a80-59e9310af898'



var baseUrl = "http://api.wordnik.com/v4/word.json/";
var apiKey = "a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5"; //demo key from developer.wordnik.com
var path;

var bht_url = "https://words.bighugelabs.com/api/2/";
var bht_apikey = "eb4e57bb2c34032da68dfeb3a0578b68";

//mwJSON('taste','thesaurus',mwUrl);

/*<?php

// This function grabs the definition of a word in XML format.
function grab_xml_definition ($word, $ref, $key)
  { $uri = "http://www.dictionaryapi.com/api/v1/references/" . urlencode($ref) . "/xml/" . 
          urlencode($word) . "?key=" . urlencode($key);
    return file_get_contents($uri);
  };

$xdef = grab_xml_definition("test", "thesaurus", "ee5e16f0-13f9-4750-b9e8-b4fa8a4f860d");

?>*/

function mwJSON (word, ref, key)
  { uri = "http://www.dictionaryapi.com/api/v1/references/" + encodeURIComponent(ref) + "/json/" + 
          encodeURIComponent(word) + "?key=" + encodeURIComponent(key);
    //return file_get_contents(uri);
    $.getJSON(uri,function(data) {
      console.log(data);
    });
  };

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

    word_path_arr = [word, path];
    //return path;
    return word_path_arr;
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
      /*prefetch: {
          url: getSynPath(),
      },      
      */remote: {
          url: getSynPath(),
          replace: function () {
              return getSynPath();
          },
          // the json file contains an array of strings, but the Bloodhound
          // suggestion engine expects JavaScript objects so this converts all of
          // those strings
          filter: function(list) {
              if ( typeof list[0] !== "undefined" && list[0].hasOwnProperty('words') ) {      
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
      }
    });

  var remoteBHT_Hound = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
/*      prefetch: {
          url: getBHTsynPath(),
          replace: function (response) {
            return getBHTsynPath();
          },
      },      
*/      remote: {
        //url: getDefPath(),
        url: getBHTsynPath()[1],
        replace: function () {
            //return getDefPath();
            return getBHTsynPath()[1];
        },
        filter: function(response) {
            //console.log(response[0]);
            // BHT returns obj with keys for each part of speech
            // each an object with keys ant, sim, syn 
            // each of which is an array
            // for now push all syns into one array?




            new_arr = [];
            /*for (var key in response) { //keys: adjective, noun,...
                new_arr = new_arr.concat(response[key].syn);
            }*/
            
            var newest_str = '<b>{' + getBHTsynPath()[0] + '} </b>';

            var pos_arr = [];
            var pos_div = '';

            for (var key in response) { //keys: adjective, noun,...
                pos_div = '<div class="pos-div"> <span class="PoS"><em>' + key + '</em></span>:';
                var newer_arr = [];
                //new_arr = new_arr.concat(response[key].syn);
                if ( response[key].syn ) {
                    for (var i = 0; i < response[key].syn.length; i++) {
                        newer_arr.push(' <a href=# onclick="showDef((this.textContent || this.innerText));"><span class="syn">' + response[key].syn[i] + '</a></span>');
                    }
                }
                pos_div += newer_arr.join();
                pos_div += '</div>'
                newest_str += pos_div;
            }


            /*for (var i = 0; i < new_arr.length; i++) {
              newer_arr.push(' <span class="syn">' + new_arr[i] + '</span>');
            }*/

            //newest_str += newer_arr.join();


            /*var newest_str = '<b>{' + getBHTsynPath()[0] + '} </b>';
            for (var i = 0; i < new_arr.length; i++) {
              newest_str += ' <span class="syn">' + new_arr[i] + '</span>';
            }*/

            //new_list = [{"words": newer_arr}];
            new_list = [{"words": [newest_str] }];
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

    //$('.typeahead').typeahead(null, 
    $('.typeahead').typeahead(
        {
          minLength: 3
        }/*, 
        {
          name: 'foo',
          displayKey: 'words',
          //displayKey: 'text',
          menu: '#idSynonymList',
          //minLength: 4,
          source: remoteSynHound.ttAdapter(),

        }*/,
        {
          name: 'foo2',
          displayKey: 'words',
          menu: '#idDefList',
          source: remoteBHT_Hound.ttAdapter(),
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

var TEMP;

function showDef(word) {
    
    var res = $('.tt-dataset-foo2').find('p')[0];

    var path = mw_dict_url + word + '?key=' + mw_dict_apikey;
    //http://www.dictionaryapi.com/api/v1/references/collegiate/xml/test?key=

    word_path_arr = [word, path];
    //return path;
    TEMP = path;
    console.log(TEMP);
    return word_path_arr;
}

