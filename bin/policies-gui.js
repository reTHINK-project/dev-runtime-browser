(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.policiesGui = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _PoliciesManager = require('./PoliciesManager');

var _PoliciesManager2 = _interopRequireDefault(_PoliciesManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PoliciesGUI = function () {
  function PoliciesGUI(pepGuiURL, pepURL, messageBus) {
    _classCallCheck(this, PoliciesGUI);

    var _this = this;
    _this.policiesManager = new _PoliciesManager2.default(pepGuiURL, pepURL, messageBus);
    // assume prepareAttributes is called after this
  }

  _createClass(PoliciesGUI, [{
    key: 'prepareAttributes',
    value: function prepareAttributes() {
      var _this = this;
      return new Promise(function (resolve, reject) {
        _this.policiesManager.prepareAttributes().then(function () {
          _this.elements = _this._setElements();
          _this._setListeners();
          resolve();
        });
      });
    }
  }, {
    key: '_addMember',
    value: function _addMember() {
      var _this = this;
      var group = event.target.id;
      $('.member-new-intro').html('<h5>Add a member to a group</h5><p>Insert a user email below to add to the "' + group + '" group.</p>');
      $('.member-new-modal').openModal();
      $('.member-new-ok').off();
      $('.member-new-ok').on('click', function (event) {
        var member = $('#member-new').val();
        $('#member-new').val('');
        _this.policiesManager.addToGroup(group, member).then(function () {
          $('.member-new-modal').closeModal();
          _this._manageGroups();
        });
      });
    }
  }, {
    key: '_createGroup',
    value: function _createGroup() {
      var _this = this;
      $('#group-new-name').val('');
      $('.group-new-modal').openModal();
      $('.group-new-ok').on('click', function (event) {
        var groupName = $('#group-new-name').val();
        _this.policiesManager.createGroup(groupName).then(function () {
          _this._manageGroups();
        });
      });
    }
  }, {
    key: '_addPolicy',
    value: function _addPolicy() {
      var _this = this;
      $('#policy-new-title').val('');
      $('.combining').html('');
      var algorithms = ['Block overrides', 'Allow overrides', 'First applicable'];
      $('.combining').append(this._getOptions('comb-algorithm', 'Choose a combining algorithm', algorithms));
      $('.policy-new').openModal();

      $('.policy-new-ok').off();
      $('.policy-new-ok').on('click', function (event) {
        var policyTitle = $('#policy-new-title').val();
        if (!policyTitle) {
          Materialize.toast('Invalid policy title', 4000);
        } else {
          var combiningAlgorithm = $('#comb-algorithm').val();
          _this.policiesManager.addPolicy(policyTitle, combiningAlgorithm).then(function () {
            $('.help-menu').addClass('hide');
            $('.policy-new').closeModal();
            _this._goHome();
          });
        }
      });
      $('.help-btn').off();
      $('.help-btn').on('click', function (event) {
        $('.help-menu').removeClass('hide');
      });
    }
  }, {
    key: '_decreaseRulePriority',
    value: function _decreaseRulePriority() {
      var _this = this;
      var id = event.target.closest('tr').id;
      var splitId = id.split(':');
      var thisPriority = parseInt(splitId[splitId.length - 1]);
      splitId.pop();
      var policyTitle = splitId.join(':');
      _this.policiesManager.getPolicy(policyTitle).then(function (policy) {
        var lastPriority = policy.getLastPriority();
        if (lastPriority != thisPriority) {
          var newPriority = parseInt(thisPriority + 1);
          _this.policiesManager.decreaseRulePriority(policyTitle, thisPriority, newPriority).then(function () {
            _this._goHome();
          });
        }
      });
    }
  }, {
    key: '_deleteMember',
    value: function _deleteMember() {
      var _this = this;
      var id = event.target.closest('tr').id;
      var splitId = id.split('::');
      var member = splitId[splitId.length - 1];
      splitId.pop();
      var group = splitId.join('::');
      _this.policiesManager.removeFromGroup(group, member).then(function () {
        _this._manageGroups();
      });
    }
  }, {
    key: '_deleteGroup',
    value: function _deleteGroup() {
      var _this = this;
      var groupName = event.target.closest('tr').children[0].id;
      _this.policiesManager.deleteGroup(groupName).then(function () {
        _this._manageGroups();
      });
    }
  }, {
    key: '_deletePolicy',
    value: function _deletePolicy() {
      var _this = this;
      var policyTitle = event.target.closest('tr').id;
      _this.policiesManager.deletePolicy(policyTitle).then(function () {
        _this._goHome();
      });
    }
  }, {
    key: '_deleteRule',
    value: function _deleteRule() {
      var _this = this;
      var id = event.target.closest('tr').id;
      var splitId = id.split(':');
      var priority = splitId[splitId.length - 1];
      splitId.pop();
      var policyTitle = splitId.join(':');
      var rule = _this.policiesManager.getRuleOfPolicy(policyTitle, priority);

      _this.policiesManager.deleteRule(policyTitle, rule).then(function () {
        _this._goHome();
      });
    }
  }, {
    key: '_getActivePolicy',
    value: function _getActivePolicy() {
      var _this = this;
      _this.policiesManager.getActivePolicy().then(function (activeUserPolicy) {
        $('.policy-active').html('');
        _this.policiesManager.getPoliciesTitles().then(function (policies) {
          policies.push('Deactivate all policies');

          $('.policy-active').append(_this._getOptions('policies-list', 'Click to activate a policy', policies, activeUserPolicy));

          $('#policies-list').on('click', function (event) {
            var policyTitle = $('#policies-list').find(":selected")[0].textContent;
            if (policyTitle === 'Deactivate all policies') {
              policyTitle = undefined;
            }
            _this.policiesManager.updateActivePolicy(policyTitle);
          });
        });
      });
    }
  }, {
    key: '_getGroupOptions',
    value: function _getGroupOptions(title, keys, scopes, lists) {
      var list = '<option disabled selected>' + title + '</option>';

      for (var i in keys) {
        list += '<optgroup label=' + keys[i] + '>';
        for (var j in lists[i]) {
          list += '<option id="' + scopes[i] + '">' + lists[i][j] + '</option>';
        }
      }

      return list;
    }
  }, {
    key: '_getInfo',
    value: function _getInfo(variable) {
      var info = void 0;

      switch (variable) {
        case 'Date':
          info = $('.config').find('input').val();
          if (info.indexOf(',') !== -1) {
            //20 July, 2016
            var splitInfo = info.split(' '); //['20', 'July,',' '2016']
            splitInfo[1] = splitInfo[1].substring(0, splitInfo[1].length - 1); //'July'
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            info = splitInfo[0] + '/' + (months.indexOf(splitInfo[1]) + 1) + '/' + splitInfo[2];
          } else {
            // 2016-07-20
            var _splitInfo = info.split('-');
            info = _splitInfo[2] + '/' + _splitInfo[1] + '/' + _splitInfo[0];
          }
          break;
        case 'Group of users':
          info = $('#group').find(":selected").text();
          break;
        case 'Subscription preferences':
          if (info = $("input[name='rule-new-subscription']:checked")[0] !== undefined) {
            info = $("input[name='rule-new-subscription']:checked")[0].id;
          }
          break;
        case 'Weekday':
          info = $('#weekday').find(":selected").text();
          break;
        default:
          info = $('.config').find('input').val();
          break;
      }

      return info;
    }
  }, {
    key: '_getList',
    value: function _getList(items) {
      var list = '';
      var numItems = items.length;

      for (var i = 0; i < numItems; i++) {
        list += '<li class="divider"></li>';
        list += '<li><a class="center-align">' + items[i] + '</a></li>';
      }

      return list;
    }
  }, {
    key: '_getOptions',
    value: function _getOptions(id, title, list, selected) {
      var options = '<select id="' + id + '" class="browser-default"><option disabled selected>' + title + '</option>';
      for (var i in list) {
        if (selected !== undefined & selected === list[i]) {
          options += '<option selected id="' + id + '">' + list[i] + '</option>';
        } else {
          options += '<option id="' + id + '">' + list[i] + '</option>';
        }
      }
      options += '</select>';

      return options;
    }
  }, {
    key: '_getPoliciesTable',
    value: function _getPoliciesTable() {
      var _this = this;

      _this.policiesManager.getFormattedPolicies().then(function (policies) {
        $('.policies-no').addClass('hide');
        $('.policies-current').html('');

        var policiesTitles = [];
        var rulesTitles = [];
        var ids = [];

        for (var i in policies) {
          policiesTitles.push(policies[i].title);
          rulesTitles.push(policies[i].rulesTitles);
          ids.push(policies[i].ids);
        }

        var table = '<table>';
        var isEmpty = policiesTitles.length === 0;

        for (var _i in policiesTitles) {
          table += '<thead><tr id="' + policiesTitles[_i] + '"><td></td><td></td><th class="center-align">' + policiesTitles[_i] + '</th><td><i class="material-icons clickable-cell policy-delete" style="cursor: pointer; vertical-align: middle">delete_forever</i></td></tr></thead><tbody>';

          for (var j in rulesTitles[_i]) {
            table += '<tr id="' + ids[_i][j] + '" ><td><i class="material-icons clickable-cell rule-priority-increase" style="cursor: pointer; vertical-align: middle">arrow_upward</i></td><td><i class="material-icons clickable-cell rule-priority-decrease" style="cursor: pointer; vertical-align: middle">arrow_downward</i></td><td class="rule-show clickable-cell" style="cursor: pointer">' + rulesTitles[_i][j] + '</td><td><i class="material-icons clickable-cell rule-delete" style="cursor: pointer; vertical-align: middle">clear</i></td></tr>';
          }
          table += '<tr id="' + policiesTitles[_i] + '"></td><td></td><td></td><td style="text-align:center"><i class="material-icons clickable-cell center-align rule-add" style="cursor: pointer">add_circle</i></td></tr>';
        }
        if (!isEmpty) {
          table += '</tbody></table>';
          $('.policies-current').append(table);
        } else {
          $('.policies-no').removeClass('hide');
        }
        $('.rule-add').on('click', function (event) {
          _this._showVariablesTypes();
        });
        $('.rule-delete').on('click', function (event) {
          _this._deleteRule();
        });
        $('.rule-show').on('click', function (event) {
          _this._showRule();
        });
        $('.rule-priority-increase').on('click', function (event) {
          _this._increaseRulePriority();
        });
        $('.rule-priority-decrease').on('click', function (event) {
          _this._decreaseRulePriority();
        });
        $('.policy-add').off();
        $('.policy-add').on('click', function (event) {
          _this._addPolicy();
        });
        $('.policy-delete').on('click', function (event) {
          _this._deletePolicy();
        });
      });
    }
  }, {
    key: '_goHome',
    value: function _goHome() {
      this._getActivePolicy();
      this._getPoliciesTable();
    }
  }, {
    key: '_increaseRulePriority',
    value: function _increaseRulePriority() {
      var _this = this;
      var id = event.target.closest('tr').id;
      var splitId = id.split(':');
      var thisPriority = parseInt(splitId[splitId.length - 1]);
      if (thisPriority !== 0) {
        splitId.pop();
        var policyTitle = splitId.join(':');
        var newPriority = thisPriority - 1;

        _this.policiesManager.increaseRulePriority(policyTitle, thisPriority, newPriority).then(function () {
          _this._goHome();
        });
      }
    }
  }, {
    key: '_manageGroups',
    value: function _manageGroups() {
      var _this = this;
      _this.policiesManager.getGroups().then(function (groupsPE) {
        $('.groups-current').html('');
        var groups = groupsPE.groupsNames;
        var members = groupsPE.members;
        var ids = groupsPE.ids;

        var table = '<table>';
        var isEmpty = groups.length === 0;

        for (var i in groups) {
          table += '<thead><tr><th id="' + groups[i] + '">' + groups[i] + '</th><td style="text-align:right"><i class="material-icons clickable-cell group-delete" style="cursor: pointer; vertical-align: middle">delete_forever</i></td></tr></thead><tbody>';
          for (var j in members[i]) {
            table += '<tr id="' + ids[i][j] + '" ><td style="cursor: pointer">' + members[i][j] + '</td><td style="text-align:right"><i class="material-icons clickable-cell member-delete" style="cursor: pointer; vertical-align: middle">clear</i></td></tr>';
          }

          table += '<tr id="' + groups[i] + '"><td><i class="material-icons clickable-cell member-add" id="' + groups[i] + '" style="cursor: pointer">add_circle</i></td></tr>';
        }

        if (!isEmpty) {
          table += '</tbody></table>';
          $('.groups-current').append(table);
        } else {
          $('.groups-current').append('<p>There are no groups set.</p>');
        }

        $('.member-add').off();
        $('.member-add').on('click', function (event) {
          _this._addMember();
        });
        $('.member-delete').on('click', function (event) {
          _this._deleteMember();
        });
        $('.group-add').off();
        $('.group-add').on('click', function (event) {
          _this._createGroup();
        });
        $('.group-delete').on('click', function (event) {
          _this._deleteGroup();
        });
      });
    }
  }, {
    key: '_parseFileContent',
    value: function _parseFileContent(content) {
      var parsedContent = JSON.parse(content);
      for (var i in parsedContent) {
        this.policiesManager.addPolicy(i, undefined, parsedContent[i]);
      }
      $('.policy-new').closeModal();
    }
  }, {
    key: '_setElements',
    value: function _setElements() {
      var _this2 = this;

      return {
        date: function date(params) {
          return '<input type="date" class="datepicker">';
        },
        select: function select(params) {
          return _this2._getOptions(params[0], params[1], params[2]);
        },
        form: function form(params) {
          return '<form><input type="text" placeholder="' + params + '"></input></form>';
        }
      };
    }
  }, {
    key: '_showNewConfigurationPanel',
    value: function _showNewConfigurationPanel(policyTitle) {
      var _this3 = this;

      var variable = event.target.text;
      $('.variable').html(this._getNewConfiguration(policyTitle, variable));
      $('.scopes').empty().html('');

      var keys = ['Email', 'Hyperty', 'All'];
      var scopes = ['identity', 'hyperty', 'global'];
      var lists = [];

      this.policiesManager.getMyEmails().then(function (emails) {
        lists.push(emails);
        _this3.policiesManager.getMyHyperties().then(function (hyperties) {
          lists.push(hyperties);
          lists.push(['All identities and hyperties']);
          $('.scopes').append(_this3._getGroupOptions('Apply this configuration to:', keys, scopes, lists));
          $('.variable').removeClass('hide');
        });
      });
    }
  }, {
    key: '_showVariablesTypes',
    value: function _showVariablesTypes(event) {
      var _this4 = this;

      var policyTitle = event.target.closest('tr').id;

      $('#variables-types').empty().html('');
      var variables = this.policiesManager.getVariables();
      $('#variables-types').append(this._getList(variables));
      $('.variable').addClass('hide');
      $('.rule-new').openModal();
      $('#variables-types').off();
      $('#variables-types').on('click', function (event) {
        _this4._showNewConfigurationPanel(policyTitle);
      });
    }
  }, {
    key: '_getNewConfiguration',
    value: function _getNewConfiguration(policyTitle, variable) {
      var _this = this;
      var info = _this.policiesManager.getVariableInfo(variable);
      $('.rule-new-title').html(info.title);
      $('.description').html(info.description);
      $('.config').html('');

      if (variable === 'Subscription preferences') {
        $('.subscription-type').removeClass('hide');
      } else {
        (function () {
          $('.subscription-type').addClass('hide');
          var tags = info.input;

          var _loop = function _loop(i) {
            _this.policiesManager.getGroupsNames().then(function (groupsNames) {
              if (variable === 'Group of users') {
                tags[i][1].push(groupsNames);
              }
              $('.config').append(_this.elements[tags[i][0]](tags[i][1]));
              if (variable === 'Group of users') {
                tags[i][1].pop();
              }
            });
          };

          for (var i in tags) {
            _loop(i);
          }
          if (variable === 'date') {
            $('.datepicker').pickadate({
              selectMonths: true,
              selectYears: 15
            });
          }
        })();
      }
      document.getElementById('allow').checked = false;
      document.getElementById('block').checked = false;
      $('.ok-btn').off();
      $('.ok-btn').on('click', function (event) {
        if ($("input[name='rule-new-decision']:checked")[0] !== undefined) {
          var _info = _this._getInfo(variable);
          var decision = $("input[name='rule-new-decision']:checked")[0].id;
          decision = decision === 'allow';
          var scope = $('.scopes').find(":selected")[0].id;
          var target = $('.scopes').find(":selected")[0].textContent;
          target = target === 'All identities and hyperties' ? 'global' : target;
          _this.policiesManager.setInfo(variable, policyTitle, _info, decision, scope, target).then(function () {
            $('.rule-new').closeModal();
            _this._goHome();
          });
        } else {
          throw Error('INFORMATION MISSING: please specify an authorisation decision.');
        }
      });
    }
  }, {
    key: '_deleteInfo',
    value: function _deleteInfo(resourceType) {
      var id = event.target.closest('tr').id;
      var splitId = id.split(':');
      var scope = splitId[0];
      splitId.shift();
      var target = splitId.join('');
      var condition = event.target.closest('tr').children[0].id;
      this.policiesManager.deleteInfo(resourceType, scope, target, condition);
      this._goHome();
    }
  }, {
    key: '_setListeners',
    value: function _setListeners() {
      var _this5 = this;

      $('.settings-btn').on('click', function (event) {
        parent.postMessage({ body: { method: 'showAdminPage' }, to: 'runtime:gui-manager' }, '*');
        $('.admin-page').removeClass('hide');
        document.getElementsByTagName('body')[0].style = 'background-color:white;';
      });

      $('.policies-page-show').on('click', function (event) {
        $('.policies-section').removeClass('hide');
        $('.identities-section').addClass('hide');
        _this5._goHome();
        _this5._manageGroups();
      });

      $('.admin-page-exit').on('click', function (event) {
        parent.postMessage({ body: { method: 'hideAdminPage' }, to: 'runtime:gui-manager' }, '*');
        $('.admin-page').addClass('hide');
        document.getElementsByTagName('body')[0].style = 'background-color:transparent;';
      });

      $('.exit-btn').on('click', function (event) {
        $('.subscription-type').addClass('hide');
        $('.help-menu').addClass('hide');
      });

      $('#policy-file').on('change', function (event) {
        var file = event.target.files[0];
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (event) {
          _this5._parseFileContent(event.target.result);
          _this5._goHome();
        };
        reader.onerror = function (event) {
          throw Error("Error reading the file");
        };
      });
    }
  }, {
    key: '_showRule',
    value: function _showRule(event) {
      var _this6 = this;

      var ruleTitle = event.target.textContent;
      var id = event.target.closest('tr').id;
      var splitId = id.split(':');
      var priority = splitId[splitId.length - 1];
      splitId.pop();
      var policyTitle = splitId.join(':');
      this.policiesManager.getRuleOfPolicy(policyTitle, priority).then(function (rule) {
        if (rule.condition.attribute === 'subscription' && rule.condition.params === 'preauthorised') {
          $('.authorise-btns').addClass('hide');
        } else {
          var element = void 0;
          if (rule.decision) {
            element = document.getElementById('btn-allow');
          } else {
            element = document.getElementById('btn-block');
          }
          element.checked = true;
          $('.authorise-btns').removeClass('hide');
        }
        $('.member-add').addClass('hide');
        $('.member-new-btn').addClass('hide');

        $('.rule-details').openModal();
        $('.rule-title').html('<h5><b>' + ruleTitle + '</b></h5>');
        if (rule.condition.attribute === 'subscription') {
          $('.subscription-type').removeClass('hide');
        }
        $('.subscription-decision').on('click', function (event) {
          _this6._updateRule('subscription', policyTitle, rule);
        });
        $('.decision').off();
        $('.decision').on('click', function (event) {
          _this6._updateRule('authorisation', policyTitle, rule);
        });
      });
    }
  }, {
    key: '_updateRule',
    value: function _updateRule(type, policyTitle, rule) {
      var _this = this;
      var title = $('.rule-title').text();
      var splitTitle = title.split(' ');
      var index = splitTitle.indexOf('is');
      if (index === -1) {
        index = splitTitle.indexOf('are');
      }
      switch (type) {
        case 'authorisation':
          var newDecision = $("input[name='rule-update-decision']:checked")[0].id;

          if (newDecision === 'btn-allow') {
            splitTitle[index + 1] = 'allowed';
            newDecision = true;
          } else {
            splitTitle[index + 1] = 'blocked';
            newDecision = false;
          }
          title = splitTitle.join(' ');
          $('.rule-title').html('<h5><b>' + title + '</b></h5>');
          _this.policiesManager.updatePolicy(policyTitle, rule, newDecision).then(function () {
            _this._goHome();
          });
          break;
        case 'subscription':
          var newSubscriptionType = event.target.labels[0].textContent;

          var decision = splitTitle[index + 1];
          splitTitle = title.split('hyperties are');
          if (newSubscriptionType === 'All subscribers') {
            $('.authorise-btns').removeClass('hide');
            newDecision = rule.decision;
            newSubscriptionType = '*';
            title = 'Subscriptions from all hyperties are' + splitTitle[1];
          } else {
            $('.authorise-btns').addClass('hide');
            newDecision = true;
            newSubscriptionType = 'preauthorised';
            title = 'Subscriptions from previously authorised hyperties are' + splitTitle[1];
          }

          $('.rule-title').html('<h5><b>' + title + '</b></h5>');
          _this.policiesManager.updatePolicy(policyTitle, rule, newDecision, newSubscriptionType).then(function () {
            _this._goHome();
          });
          break;
      }
    }
  }]);

  return PoliciesGUI;
}();

exports.default = PoliciesGUI;

},{"./PoliciesManager":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PoliciesManager = function () {
  function PoliciesManager(pepGuiURL, pepURL, messageBus) {
    _classCallCheck(this, PoliciesManager);

    var _this = this;
    _this._guiURL = pepGuiURL;
    _this._pepURL = pepURL;
    _this._messageBus = messageBus;

    // assume prepare attributes is called after this
  }

  _createClass(PoliciesManager, [{
    key: 'callPolicyEngineFunc',
    value: function callPolicyEngineFunc(methodName, parameters) {
      var _this = this;
      var message = void 0;

      return new Promise(function (resolve, reject) {
        message = { type: 'execute', to: _this._pepURL, from: _this._guiURL,
          body: { resource: 'policy', method: methodName, params: parameters } };
        _this._messageBus.postMessage(message, function (res) {
          var result = res.body.value;
          resolve(result);
        });
      });
    }
  }, {
    key: 'prepareAttributes',
    value: function prepareAttributes() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        var _this = _this2;
        _this.callPolicyEngineFunc('userPolicies', {}).then(function (userPolicies) {
          _this.policies = userPolicies;
          _this.variables = _this.setVariables();
          _this.addition = _this.setAdditionMethods();
          _this.validation = _this.setValidationMethods();
          resolve();
        });
      });
    }
  }, {
    key: 'addToGroup',
    value: function addToGroup(groupName, user) {
      return this.callPolicyEngineFunc('addToGroup', { groupName: groupName, userEmail: user });
    }
  }, {
    key: 'createGroup',
    value: function createGroup(groupName) {
      return this.callPolicyEngineFunc('createGroup', { groupName: groupName });
    }
  }, {
    key: 'addPolicy',
    value: function addPolicy(title, combiningAlgorithm, policy) {
      if (policy === undefined) {
        switch (combiningAlgorithm) {
          case 'Block overrides':
            combiningAlgorithm = 'blockOverrides';
            break;
          case 'Allow overrides':
            combiningAlgorithm = 'allowOverrides';
            break;
          case 'First applicable':
            combiningAlgorithm = 'firstApplicable';
            break;
          default:
            combiningAlgorithm = undefined;
        }
      }

      return this.callPolicyEngineFunc('addPolicy', { source: 'USER', key: title, policy: policy, combiningAlgorithm: combiningAlgorithm });
    }
  }, {
    key: 'decreaseRulePriority',
    value: function decreaseRulePriority(policyTitle, thisPriority, newPriority) {
      this.getRuleOfPolicy(policyTitle, newPriority).priority = thisPriority;
      this.getRuleOfPolicy(policyTitle, thisPriority).priority = newPriority;
      return this.callPolicyEngineFunc('savePolicies', { source: 'USER' });
    }
  }, {
    key: 'deleteGroup',
    value: function deleteGroup(groupName) {
      return this.callPolicyEngineFunc('deleteGroup', { groupName: groupName });
    }
  }, {
    key: 'deletePolicy',
    value: function deletePolicy(title) {
      return this.callPolicyEngineFunc('removePolicy', { source: 'USER', key: title });
    }
  }, {
    key: 'deleteRule',
    value: function deleteRule(policyTitle, rule) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _this.callPolicyEngineFunc('userPolicies', {}).then(function (userPolicies) {
          userPolicies[policyTitle].deleteRule(rule);
          _this.callPolicyEngineFunc('savePolicies', { source: 'USER' }).then(function () {
            resolve();
          });
        });
      });
    }
  }, {
    key: 'getActivePolicy',
    value: function getActivePolicy() {
      return this.callPolicyEngineFunc('activeUserPolicy', {});
    }
  }, {
    key: 'getPolicy',
    value: function getPolicy(key) {
      return this.callPolicyEngineFunc('userPolicy', { key: key });
    }
  }, {
    key: 'getPoliciesTitles',
    value: function getPoliciesTitles() {
      var _this = this;
      return new Promise(function (resolve, reject) {
        _this.callPolicyEngineFunc('userPolicies', {}).then(function (policies) {
          var titles = [];

          for (var i in policies) {
            titles.push(i);
          }

          resolve(titles);
        });
      });
    }
  }, {
    key: 'getTargets',
    value: function getTargets(scope) {
      var targets = [];

      for (var i in this.policies[scope]) {
        if (targets.indexOf(i) === -1) {
          targets.push(i);
        }
      }

      return targets;
    }
  }, {
    key: 'increaseRulePriority',
    value: function increaseRulePriority(policyTitle, thisPriority, newPriority) {
      var _this = this;
      _this.getRuleOfPolicy(policyTitle, thisPriority).priority = newPriority;
      _this.getRuleOfPolicy(policyTitle, newPriority).priority = thisPriority;
      return _this.callPolicyEngineFunc('savePolicies', { source: 'USER' });
    }
  }, {
    key: 'setVariables',
    value: function setVariables() {
      return {
        'Date': {
          title: '<br><h5>Updating date related configurations</h5><p>Incoming communications in the introduced date will be allowed or blocked according to your configurations, which can be changed in the preferences page.</p><br>',
          description: '<p>Date:</p>',
          input: [['date', []]]
        },
        'Domain': {
          title: '<br><h5>Updating domain configurations</h5><p>Incoming communications from a user whose identity is from the introduced domain allowed or blocked according to your configurations, which can be changed in the preferences page.</p><br>',
          description: '<p>Domain:</p>',
          input: [['form', []]]
        },
        'Group of users': {
          title: '<br><h5>Updating groups configurations</h5><p>Incoming communications from a user whose identity is in the introduced group will be allowed or blocked according to your configurations, which can be changed in the preferences page.</p><br>',
          description: '<p>Group name:</p>',
          input: [['select', ['group', 'Select a group:']]]
        },
        'Subscription preferences': {
          title: '<br><h5>Updating subscriptions configurations</h5><p>The acceptance of subscriptions to your hyperties will be allowed or blocked according to your configurations, which can be changed in the preferences page.</p><br>',
          input: []
        },
        'Time of the day': {
          title: '<br><h5>Updating time configurations</h5><p>Incoming communications in the introduced timeslot will be blocked, but this can be changed in the preferences page.</p><p>Please introduce a new timeslot in the following format:</p><p class="center-align">&lt;START-HOUR&gt;:&lt;START-MINUTES&gt; to &lt;END-HOUR&gt;:&lt;END-MINUTES&gt;</p><br>',
          description: '<p>Timeslot:</p>',
          input: [['form', []]]
        },
        Weekday: {
          title: '<br><h5>Updating weekday configurations</h5><p>Incoming communications in the introduced weekday will be allowed or blocked according to your configurations, which can be changed in the preferences page.</p><br>',
          description: '<p>Weekday:</p>',
          input: [['select', ['weekday', 'Select a weekday:', ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']]]]
        }
      };
    }
  }, {
    key: 'setAdditionMethods',
    value: function setAdditionMethods() {
      var _this = this;
      return {
        Date: function Date(params) {
          return new Promise(function (resolve, reject) {
            var policyTitle = params[0];
            _this.callPolicyEngineFunc('userPolicies', {}).then(function (userPolicies) {
              userPolicies[policyTitle].createRule(params[4], { attribute: 'date', operator: 'equals', params: params[3] }, params[1], params[2]);
              _this.callPolicyEngineFunc('savePolicies', { source: 'USER' }).then(function () {
                resolve();
              });
            });
          });
        },
        Domain: function Domain(params) {
          return new Promise(function (resolve, reject) {
            var policyTitle = params[0];
            _this.callPolicyEngineFunc('userPolicies', {}).then(function (userPolicies) {
              userPolicies[policyTitle].createRule(params[4], { attribute: 'domain', operator: 'equals', params: params[3] }, params[1], params[2]);
              _this.callPolicyEngineFunc('savePolicies', { source: 'USER' }).then(function () {
                resolve();
              });
            });
          });
        },
        'Group of users': function GroupOfUsers(params) {
          return new Promise(function (resolve, reject) {
            var policyTitle = params[0];
            _this.callPolicyEngineFunc('userPolicies', {}).then(function (userPolicies) {
              userPolicies[policyTitle].createRule(params[4], { attribute: 'source', operator: 'in', params: params[3] }, params[1], params[2]);
              _this.callPolicyEngineFunc('savePolicies', { source: 'USER' }).then(function () {
                resolve();
              });
            });
          });
        },
        'Subscription preferences': function SubscriptionPreferences(params) {
          return new Promise(function (resolve, reject) {
            var policyTitle = params[0];
            _this.callPolicyEngineFunc('userPolicies', {}).then(function (userPolicies) {
              var operator = 'equals';
              if (params[3] === 'preauthorised') {
                operator = 'in';
              }

              // TIAGO: this is giving me an error...
              userPolicies[policyTitle].createRule(params[4], { attribute: 'subscription', operator: operator, params: params[3] }, params[1], params[2]);
              _this.callPolicyEngineFunc('savePolicies', { source: 'USER' }).then(function () {
                resolve();
              });
            });
          });
        },
        'Time of the day': function TimeOfTheDay(params) {
          return new Promise(function (resolve, reject) {
            var policyTitle = params[0];
            _this.callPolicyEngineFunc('userPolicies', {}).then(function (userPolicies) {
              params[3] = params[3].split(' to ');
              var start = params[3][0].split(':');
              start = start.join('');
              var end = params[3][1].split(':');
              end = end.join('');
              userPolicies[policyTitle].createRule(params[4], { attribute: 'time', operator: 'between', params: [start, end] }, params[1], params[2]);
              _this.callPolicyEngineFunc('savePolicies', { source: 'USER' }).then(function () {
                resolve();
              });
            });
          });
        },

        Weekday: function Weekday(params) {
          return new Promise(function (resolve, reject) {
            var weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            params[3] = weekdays.indexOf(params[3]);
            var policyTitle = params[0];
            _this.callPolicyEngineFunc('userPolicies', {}).then(function (userPolicies) {
              userPolicies[policyTitle].createRule(params[4], { attribute: 'weekday', operator: 'equals', params: params[3] }, params[1], params[2]);
              _this.callPolicyEngineFunc('savePolicies', { source: 'USER' }).then(function () {
                resolve();
              });
            });
          });
        }
      };
    }
  }, {
    key: 'setValidationMethods',
    value: function setValidationMethods() {
      var _this3 = this;

      return {
        Date: function Date(scope, info) {
          return _this3.isValidDate(info) & _this3.isValidScope(scope);
        },
        'Group of users': function GroupOfUsers(scope, info) {
          return _this3.isValidString(info) & _this3.isValidScope(scope);
        },
        Domain: function Domain(scope, info) {
          return _this3.isValidDomain(info) & _this3.isValidScope(scope);
        },
        Weekday: function Weekday(scope, info) {
          return true & _this3.isValidScope(scope);
        },
        'Subscription preferences': function SubscriptionPreferences(scope, info) {
          return _this3.isValidSubscriptionType(info) & _this3.isValidScope(scope);
        },
        'Time of the day': function TimeOfTheDay(scope, info) {
          return _this3.isValidTimeslot(info) & _this3.isValidScope(scope);
        }
      };
    }
  }, {
    key: 'updateActivePolicy',
    value: function updateActivePolicy(title) {
      var _this = this;
      return new Promise(function (resolve, reject) {
        _this.callPolicyEngineFunc('activeUserPolicy', { userPolicy: title }).then(function () {
          _this.callPolicyEngineFunc('saveActivePolicy', {}).then(function () {
            resolve();
          });
        });
      });
    }
  }, {
    key: 'isValidEmail',
    value: function isValidEmail(info) {
      var pattern = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/;
      return pattern.test(info);
    }
  }, {
    key: 'isValidDomain',
    value: function isValidDomain(info) {
      var pattern = /[a-z0-9.-]+\.[a-z]{2,3}$/;
      return pattern.test(info);
    }
  }, {
    key: 'isValidString',
    value: function isValidString(info) {
      var pattern = /[a-z0-9.-]$/;
      return pattern.test(info);
    }
  }, {
    key: 'isValidSubscriptionType',
    value: function isValidSubscriptionType(info) {
      return true;
    }
  }, {
    key: 'isValidDate',
    value: function isValidDate(info) {
      var infoSplit = info.split('/');
      var day = parseInt(infoSplit[0]);
      var month = parseInt(infoSplit[1]);
      var year = parseInt(infoSplit[2]);

      var date = new Date(year, month - 1, day);
      var isValidFormat = date.getFullYear() === year && date.getMonth() + 1 === month && date.getDate() === day;
      var formattedDate = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
      var now = new Date();
      var today = now.getDate() + '/' + (now.getMonth() + 1) + '/' + now.getFullYear();

      var isFuture = false;
      if (date.getFullYear() > now.getFullYear()) {
        isFuture = true;
      } else {
        if (date.getFullYear() == now.getFullYear()) {
          if (date.getMonth() + 1 > now.getMonth() + 1) {
            isFuture = true;
          } else {
            if (date.getMonth() + 1 == now.getMonth() + 1) {
              if (date.getDate() >= now.getDate()) {
                isFuture = true;
              }
            }
          }
        }
      }

      return isValidFormat && isFuture;
    }
  }, {
    key: 'isValidScope',
    value: function isValidScope(scope) {
      return scope !== '';
    }
  }, {
    key: 'isValidTimeslot',
    value: function isValidTimeslot(info) {
      if (!info) {
        return false;
      }
      var splitInfo = info.split(' to '); // [12:00, 13:00]
      var twoTimes = splitInfo.length === 2;
      if (!twoTimes) {
        return false;
      }
      var splitStart = splitInfo[0].split(':'); // [12, 00]
      var splitEnd = splitInfo[1].split(':'); // [13, 00]
      if (splitStart.length !== 2 || splitEnd.length !== 2) {
        return false;
      }
      var okSize = splitStart[0].length === 2 && splitStart[1].length === 2 && splitEnd[0].length === 2 && splitEnd[1].length === 2;
      var areIntegers = splitStart[0] == parseInt(splitStart[0], 10) && splitStart[1] == parseInt(splitStart[1], 10) && splitEnd[0] == parseInt(splitEnd[0], 10) && splitEnd[1] == parseInt(splitEnd[1], 10);
      return twoTimes && okSize && areIntegers;
    }
  }, {
    key: 'getFormattedPolicies',
    value: function getFormattedPolicies() {
      var _this = this;
      return new Promise(function (resolve, reject) {
        _this.callPolicyEngineFunc('userPolicies', {}).then(function (policiesPE) {
          var policiesGUI = [];

          for (var i in policiesPE) {
            var policy = {
              title: policiesPE[i].key,
              rulesTitles: [],
              ids: []
            };

            if (policiesPE[i].rules.length !== 0) {
              policiesPE[i].rules = policiesPE[i].sortRules();
              for (var j in policiesPE[i].rules) {
                var title = _this._getTitle(policiesPE[i].rules[j]);
                policy.rulesTitles.push(title);
                policy.ids.push(policy.title + ':' + policiesPE[i].rules[j].priority);
              }
            }

            policiesGUI.push(policy);
          }

          resolve(policiesGUI);
        });
      });
    }
  }, {
    key: 'getRuleOfPolicy',
    value: function getRuleOfPolicy(title, priority) {
      var _this = this;
      return new Promise(function (resolve, reject) {
        _this.callPolicyEngineFunc('userPolicies', {}).then(function (policies) {
          var policy = policies[title];
          resolve(policy.getRuleByPriority(priority));
        });
      });
    }
  }, {
    key: '_getTitle',
    value: function _getTitle(rule) {
      var condition = rule.condition;
      var authorise = rule.decision ? 'allowed' : 'blocked';
      var target = rule.target === 'global' ? 'All identities and hyperties' : rule.target;
      var attribute = condition.attribute;
      switch (attribute) {
        case 'date':
          return 'Date ' + condition.params + ' is ' + authorise + ' (' + target + ')';
        case 'domain':
          return 'Domain \"' + condition.params + '\" is ' + authorise + ' (' + target + ')';
        case 'source':
          if (condition.operator === 'in') {
            return 'Group \"' + condition.params + '\" is ' + authorise + ' (' + target + ')';
          } else {
            if (condition.operator === 'equals') {
              return 'User ' + condition.params + ' is ' + authorise + ' (' + target + ')';
            }
          }
        case 'subscription':
          if (condition.params === '*') {
            return 'Subscriptions from all hyperties are ' + authorise + ' (' + target + ')';
          } else {
            if (condition.params === 'preauthorised') {
              return 'Subscriptions from previously authorised hyperties are allowed (' + target + ')';
            }
          }
        case 'time':
          var start = condition.params[0][0] + condition.params[0][1] + ':' + condition.params[0][2] + condition.params[0][3];
          var end = condition.params[1][0] + condition.params[1][1] + ':' + condition.params[1][2] + condition.params[1][3];
          return 'Timeslot from ' + start + ' to ' + end + ' is ' + authorise + ' (' + target + ')';
        case 'weekday':
          var weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          var weekdayID = condition.params;
          return 'Weekday \"' + weekdays[weekdayID] + '\" is ' + authorise + ' (' + target + ')';
        default:
          return 'Rule ' + rule.priority + ' is ' + authorise + ' (' + target + ')';
      }
    }
  }, {
    key: 'getVariables',
    value: function getVariables() {
      var variablesTitles = [];
      for (var i in this.variables) {
        variablesTitles.push(i);
      }
      return variablesTitles;
    }
  }, {
    key: 'getVariableInfo',
    value: function getVariableInfo(variable) {
      return this.variables[variable];
    }
  }, {
    key: 'getMyEmails',
    value: function getMyEmails() {
      return this.callPolicyEngineFunc('getMyEmails', {});
    }
  }, {
    key: 'getMyHyperties',
    value: function getMyHyperties() {
      return this.callPolicyEngineFunc('getMyHyperties', {});
    }

    //TODO If there is a problem with the input, show it to the user

  }, {
    key: 'setInfo',
    value: function setInfo(variable, policyTitle, info, authorise, scope, target) {
      var _this = this;
      return new Promise(function (resolve, reject) {
        if (_this.validation[variable](scope, info)) {
          _this.addition[variable]([policyTitle, scope, target, info, authorise]).then(function () {
            resolve();
          });
        } else {
          reject('Invalid configuration');
        }
      });
    }
  }, {
    key: 'deleteInfo',
    value: function deleteInfo(variable, scope, target, info) {
      var params = [scope, target, info];
      if (variable === 'member') {
        var conditionSplit = info.split(' ');
        var groupName = conditionSplit[2];
        params = [scope, groupName, info];
      }
      this.deletion[variable](params);
    }
  }, {
    key: 'getGroups',
    value: function getGroups() {
      var _this = this;
      return new Promise(function (resolve, reject) {
        _this.callPolicyEngineFunc('groups', {}).then(function (groups) {
          var groupsGUI = {
            groupsNames: [],
            members: [],
            ids: []
          };

          for (var i in groups) {
            groupsGUI.groupsNames.push(i);
            groupsGUI.members.push(groups[i]);
            var ids = [];
            for (var j in groups[i]) {
              ids.push(i + '::' + groups[i][j]);
            }
            groupsGUI.ids.push(ids);
          }

          //console.log('TIAGO groups', groupsGUI)
          resolve(groupsGUI);
        });
      });
    }
  }, {
    key: 'getGroupsNames',
    value: function getGroupsNames() {
      return this.callPolicyEngineFunc('getGroupsNames', {});
    }
  }, {
    key: 'removeFromGroup',
    value: function removeFromGroup(groupName, user) {
      return this.callPolicyEngineFunc('removeFromGroup', { groupName: groupName, userEmail: user });
    }
  }, {
    key: 'updatePolicy',
    value: function updatePolicy(policyTitle, rule, newDecision, newSubscriptionType) {
      var _this = this;
      return new Promise(function (resolve, reject) {
        _this.callPolicyEngineFunc('userPolicies', {}).then(function (userPolicies) {
          userPolicies[policyTitle].deleteRule(rule);
          if (!newSubscriptionType) {
            userPolicies[policyTitle].createRule(newDecision, rule.condition, rule.scope, rule.target, rule.priority);
          } else {
            var operator = newSubscriptionType === '*' ? 'equals' : 'in';
            userPolicies[policyTitle].createRule(newDecision, [{ attribute: 'subscription', opeator: operator, params: newSubscriptionType }], rule.scope, rule.target, rule.priority);
          }

          _this.callPolicyEngineFunc('saveActivePolicy', {}).then(function () {
            resolve();
          });
        });
      });
    }
  }]);

  return PoliciesManager;
}();

exports.default = PoliciesManager;

},{}]},{},[1])(1)
});

//# sourceMappingURL=policies-gui.js.map
