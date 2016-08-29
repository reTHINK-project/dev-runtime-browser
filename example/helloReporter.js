

"use strict";

var hyperty;

function deployReporter(runtimeLoader) {

  let hypertyHolder = $('.hyperties');
  hypertyHolder.removeClass('hide');


  let hypertyUrl = 'hyperty-catalogue://' + runtime.domain + '/.well-known/hyperty/HelloWorldReporter';

  // Load First Hyperty
  runtimeLoader.requireHyperty(hypertyUrl).then(hypertyDeployed).catch(function(reason) {
    console.error(reason);
  });

}


function hypertyDeployed(result) {


  hyperty = result.instance;

  console.log(hyperty);

  $('.selection-panel').hide();

  let hypertyPanel = $('.hyperty-panel');

  let hi = '<p>Hyperty Reporter URL: ' + result.runtimeHypertyURL + '</p>';

  hypertyPanel.append(hi);


  let hello = $('.hello-panel');

  let sayHelloTo = '<form class="say-hello"> Hyperty URL: <input class="to-hyperty-input" type="text" name="toHyperty"><br><input type="submit" value="Say Hello"></form>'

  hello.append(sayHelloTo);

  $('.say-hello').on('submit', sayHello);
}


function sayHello(event) {

event.preventDefault();

let toHypertyForm = $(event.currentTarget);

let toHyperty = toHypertyForm.find('.to-hyperty-input').val();

console.log(toHyperty);

  hyperty.hello(toHyperty).then(function(helloObject) {

    console.log('helloUrl: ', helloObject);

    $('.hello-panel').hide();

    var helloUrl = '<p>Hello URL: '+ helloObject.url + '</p>';

    let bye = $('.bye-panel');

    let sayByeTo = '<button class="say-bye">Say Bye</button>';

    bye.append(helloUrl);

    bye.append(sayByeTo);

    $('.bye-panel').on('click', sayBye);
  }).catch(function(reason) {
    console.error(reason);
    reject(reason);
  });

}

function sayBye() {

  hyperty.bye();

}


Handlebars.getTemplate = function(name) {

  return new Promise(function(resolve, reject) {

    if (Handlebars.templates === undefined || Handlebars.templates[name] === undefined) {
      Handlebars.templates = {};
    } else {
      resolve(Handlebars.templates[name]);
    }

    $.ajax({
      url: 'templates/' + name + '.hbs',
      success: function(data) {
        Handlebars.templates[name] = Handlebars.compile(data);
        resolve(Handlebars.templates[name]);
      },

      fail: function(reason) {
        reject(reason);
      }
    });

  });

}
