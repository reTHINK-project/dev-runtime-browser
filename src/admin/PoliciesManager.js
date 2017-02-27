class PoliciesManager {

  constructor(pepGuiURL, pepURL, messageBus) {
    let _this = this;
    _this._guiURL = pepGuiURL;
    _this._pepURL = pepURL;
    _this._messageBus = messageBus;

    // assume prepare attributes is called after this
  }

  callPolicyEngineFunc(methodName, parameters) {
    let _this = this;
    let message;

    return new Promise((resolve, reject) => {
      message = { type: 'execute', to: _this._pepURL, from: _this._guiURL,
        body: { resource: 'policy', method: methodName, params: parameters }, };
      _this._messageBus.postMessage(message, (res) => {
        let result = res.body.value;
        resolve(result);
      });
    });
  }

  prepareAttributes() {
    return new Promise((resolve, reject) => {
      let _this = this;
      _this.callPolicyEngineFunc('userPolicies', {}).then((userPolicies) => {
        _this.policies = userPolicies;
        _this.variables = _this.setVariables();
        _this.addition = _this.setAdditionMethods();
        _this.validation = _this.setValidationMethods();
        resolve();
      });
    });
  }

  addToGroup(groupName, user) {
    return this.callPolicyEngineFunc('addToGroup', {groupName: groupName, userEmail: user});
  }

  createGroup(groupName) {
    return this.callPolicyEngineFunc('createGroup', {groupName: groupName});
  }

  addPolicy(title, combiningAlgorithm, policy) {
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

    return this.callPolicyEngineFunc('addPolicy',
      {source: 'USER', key: title, policy: policy, combiningAlgorithm: combiningAlgorithm});
  }

  decreaseRulePriority(policyTitle, thisPriority, newPriority) {
    this.getRuleOfPolicy(policyTitle, newPriority).priority = thisPriority;
    this.getRuleOfPolicy(policyTitle, thisPriority).priority = newPriority;
    return this.callPolicyEngineFunc('savePolicies', {source: 'USER'});
  }

  deleteGroup(groupName) {
    return this.callPolicyEngineFunc('deleteGroup', {groupName: groupName});
  }

  deletePolicy(title) {
    return this.callPolicyEngineFunc('removePolicy', {source: 'USER', key: title});
  }

  deleteRule(policyTitle, rule) {
    let _this = this;

    return new Promise((resolve, reject) => {
      _this.callPolicyEngineFunc('userPolicies', {}).then((userPolicies) => {
        userPolicies[policyTitle].deleteRule(rule);
        _this.callPolicyEngineFunc('savePolicies', {source: 'USER'}).then(() => {
          resolve();
        });
      });
    });
  }

  getActivePolicy() {
    return this.callPolicyEngineFunc('activeUserPolicy', {});
  }

  getPolicy(key) {
    return this.callPolicyEngineFunc('userPolicy', {key: key});
  }

  getPoliciesTitles() {
    let _this = this;
    return new Promise((resolve, reject) => {
      _this.callPolicyEngineFunc('userPolicies', {}).then((policies) => {
        let titles = [];

        for (let i in policies) {
          titles.push(i);
        }

        resolve(titles);
      });
    });
  }

  getTargets(scope) {
    let targets = [];

    for (let i in this.policies[scope]) {
      if (targets.indexOf(i) === -1) {
        targets.push(i);
      }
    }

    return targets;
  }

  increaseRulePriority(policyTitle, thisPriority, newPriority) {
    let _this = this;
    _this.getRuleOfPolicy(policyTitle, thisPriority).priority = newPriority;
    _this.getRuleOfPolicy(policyTitle, newPriority).priority = thisPriority;
    return _this.callPolicyEngineFunc('savePolicies', {source: 'USER'});
  }

  setVariables() {
    return {
      'Date': {
        title: '<br><h5>Updating date related configurations</h5><p>Incoming communications in the introduced date will be allowed or blocked according to your configurations, which can be changed in the preferences page.</p><br>',
        description: '<p>Date:</p>',
        input: [
          ['date', []]
        ]
      },
      'Domain': {
        title: '<br><h5>Updating domain configurations</h5><p>Incoming communications from a user whose identity is from the introduced domain allowed or blocked according to your configurations, which can be changed in the preferences page.</p><br>',
        description: '<p>Domain:</p>',
        input: [
          ['form', []]
        ]
      },
      'Group of users': {
        title: '<br><h5>Updating groups configurations</h5><p>Incoming communications from a user whose identity is in the introduced group will be allowed or blocked according to your configurations, which can be changed in the preferences page.</p><br>',
        description: '<p>Group name:</p>',
        input: [
          ['select', ['group', 'Select a group:']]
        ]
      },
      'Subscription preferences': {
        title: '<br><h5>Updating subscriptions configurations</h5><p>The acceptance of subscriptions to your hyperties will be allowed or blocked according to your configurations, which can be changed in the preferences page.</p><br>',
        input: []
      },
      'Time of the day': {
        title: '<br><h5>Updating time configurations</h5><p>Incoming communications in the introduced timeslot will be blocked, but this can be changed in the preferences page.</p><p>Please introduce a new timeslot in the following format:</p><p class="center-align">&lt;START-HOUR&gt;:&lt;START-MINUTES&gt; to &lt;END-HOUR&gt;:&lt;END-MINUTES&gt;</p><br>',
        description: '<p>Timeslot:</p>',
        input: [
          ['form', []]
        ]
      },
      Weekday: {
        title: '<br><h5>Updating weekday configurations</h5><p>Incoming communications in the introduced weekday will be allowed or blocked according to your configurations, which can be changed in the preferences page.</p><br>',
        description: '<p>Weekday:</p>',
        input: [
          ['select', ['weekday', 'Select a weekday:', ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']]]
        ]
      }
    };
  }

  setAdditionMethods() {
    let _this = this;
    return {
      Date: (params) => {
        return new Promise((resolve, reject) => {
          let policyTitle = params[0];
          _this.callPolicyEngineFunc('userPolicies', {}).then((userPolicies) => {
            userPolicies[policyTitle].createRule(params[4], { attribute: 'date', operator: 'equals', params: params[3] }, params[1], params[2]);
            _this.callPolicyEngineFunc('savePolicies', {source: 'USER'}).then(() => {
              resolve();
            });
          });
        });
      },
      Domain: (params) => {
        return new Promise((resolve, reject) => {
          let policyTitle = params[0];
          _this.callPolicyEngineFunc('userPolicies', {}).then((userPolicies) => {
            userPolicies[policyTitle].createRule(params[4], { attribute: 'domain', operator: 'equals', params: params[3] }, params[1], params[2]);
            _this.callPolicyEngineFunc('savePolicies', {source: 'USER'}).then(() => {
              resolve();
            });
          });
        });
      },
      'Group of users': (params) => {
        return new Promise((resolve, reject) => {
          let policyTitle = params[0];
          _this.callPolicyEngineFunc('userPolicies', {}).then((userPolicies) => {
            userPolicies[policyTitle].createRule(params[4], { attribute: 'source', operator: 'in', params: params[3] }, params[1], params[2]);
            _this.callPolicyEngineFunc('savePolicies', {source: 'USER'}).then(() => {
              resolve();
            });
          });
        });
      },
      'Subscription preferences': (params) => {
        return new Promise((resolve, reject) => {
          let policyTitle = params[0];
          _this.callPolicyEngineFunc('userPolicies', {}).then((userPolicies) => {
            let operator = 'equals';
            if (params[3] === 'preauthorised') {
              operator = 'in';
            }

            // TIAGO: this is giving me an error...
            userPolicies[policyTitle].createRule(params[4], { attribute: 'subscription', operator: operator, params: params[3] }, params[1], params[2]);
            _this.callPolicyEngineFunc('savePolicies', {source: 'USER'}).then(() => {
              resolve();
            });
          });
        });
      },
      'Time of the day': (params) => {
        return new Promise((resolve, reject) => {
          let policyTitle = params[0];
          _this.callPolicyEngineFunc('userPolicies', {}).then((userPolicies) => {
            params[3] = params[3].split(' to ');
            let start = params[3][0].split(':');
            start = start.join('');
            let end = params[3][1].split(':');
            end = end.join('');
            userPolicies[policyTitle].createRule(params[4], { attribute: 'time', operator: 'between', params: [start, end] }, params[1], params[2]);
            _this.callPolicyEngineFunc('savePolicies', {source: 'USER'}).then(() => {
              resolve();
            });
          });
        });
      },

      Weekday: (params) => {
        return new Promise((resolve, reject) => {
          let weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          params[3] = weekdays.indexOf(params[3]);
          let policyTitle = params[0];
          _this.callPolicyEngineFunc('userPolicies', {}).then((userPolicies) => {
            userPolicies[policyTitle].createRule(params[4], { attribute: 'weekday', operator: 'equals', params: params[3] }, params[1], params[2]);
            _this.callPolicyEngineFunc('savePolicies', {source: 'USER'}).then(() => {
              resolve();
            });
          });
        });
      }
    };
  }

  setValidationMethods() {
    return {
      Date: (scope, info) => { return this.isValidDate(info) & this.isValidScope(scope); },
      'Group of users': (scope, info) => { return this.isValidString(info) & this.isValidScope(scope); },
      Domain: (scope, info) => { return this.isValidDomain(info) & this.isValidScope(scope); },
      Weekday: (scope, info) => { return true & this.isValidScope(scope); },
      'Subscription preferences': (scope, info) => { return this.isValidSubscriptionType(info) & this.isValidScope(scope); },
      'Time of the day': (scope, info) => { return this.isValidTimeslot(info) & this.isValidScope(scope); }
    };
  }

  updateActivePolicy(title) {
    let _this = this;
    return new Promise((resolve, reject) => {
      _this.callPolicyEngineFunc('activeUserPolicy', {userPolicy: title}).then(() => {
        _this.callPolicyEngineFunc('saveActivePolicy', {}).then(() => {
          resolve();
        });
      });
    });
  }

  isValidEmail(info) {
    let pattern = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/;
    return pattern.test(info);
  }

  isValidDomain(info) {
    let pattern = /[a-z0-9.-]+\.[a-z]{2,3}$/;
    return pattern.test(info);
  }

  isValidString(info) {
    let pattern = /[a-z0-9.-]$/;
    return pattern.test(info);
  }

  isValidSubscriptionType(info) {
    return true;
  }

  isValidDate(info) {
    let infoSplit = info.split('/');
    let day = parseInt(infoSplit[0]);
    let month = parseInt(infoSplit[1]);
    let year = parseInt(infoSplit[2]);

    let date = new Date(year, month-1, day);
    let isValidFormat = date.getFullYear() === year && date.getMonth() + 1 === month && date.getDate() === day;
    let formattedDate = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear()
    let now = new Date();
    let today = now.getDate() + '/' + (now.getMonth() + 1) + '/' + now.getFullYear();

    let isFuture = false;
    if (date.getFullYear() > now.getFullYear()) {
      isFuture = true;
    } else {
      if (date.getFullYear() == now.getFullYear()) {
        if ((date.getMonth() + 1) > (now.getMonth() + 1)) {
          isFuture = true;
        } else {
          if ((date.getMonth() + 1) == (now.getMonth() + 1)) {
            if (date.getDate() >= (now.getDate())) {
              isFuture = true;
            }
          }
        }
      }
    }

    return (isValidFormat && isFuture);
  }

  isValidScope(scope) {
    return scope !== '';
  }

  isValidTimeslot(info) {
    if (!info) {
      return false;
    }
    let splitInfo = info.split(' to '); // [12:00, 13:00]
    let twoTimes = splitInfo.length === 2;
    if (!twoTimes) {
      return false;
    }
    let splitStart = splitInfo[0].split(':'); // [12, 00]
    let splitEnd = splitInfo[1].split(':'); // [13, 00]
    if (splitStart.length !== 2 || splitEnd.length !== 2) {
      return false;
    }
    let okSize = (splitStart[0].length === 2) && (splitStart[1].length === 2) && (splitEnd[0].length === 2) && (splitEnd[1].length === 2);
    let areIntegers = (splitStart[0] == parseInt(splitStart[0], 10)) && (splitStart[1] == parseInt(splitStart[1], 10)) && (splitEnd[0] == parseInt(splitEnd[0], 10)) && (splitEnd[1] == parseInt(splitEnd[1], 10));
    return twoTimes && okSize && areIntegers;
  }

  getFormattedPolicies() {
    let _this = this;
    return new Promise((resolve, reject) => {
      _this.callPolicyEngineFunc('userPolicies', {}).then((policiesPE) => {
        let policiesGUI = [];

        for (let i in policiesPE) {
          let policy = {
            title: policiesPE[i].key,
            rulesTitles: [],
            ids: []
          }

          if (policiesPE[i].rules.length !== 0) {
            policiesPE[i].rules = policiesPE[i].sortRules();
            for (let j in policiesPE[i].rules) {
              let title = _this._getTitle(policiesPE[i].rules[j]);
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

  getRuleOfPolicy(title, priority) {
    let _this = this;
    return new Promise((resolve, reject) => {
      _this.callPolicyEngineFunc('userPolicies', {}).then((policies) => {
        let policy = policies[title];
        resolve(policy.getRuleByPriority(priority));
      });
    });
  }

  _getTitle(rule) {
    let condition = rule.condition;
    let authorise = (rule.decision) ? 'allowed' : 'blocked';
    let target = rule.target === 'global' ? 'All identities and hyperties' : rule.target;
    let attribute = condition.attribute;
    switch(attribute) {
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
        let start = condition.params[0][0] + condition.params[0][1] + ':' + condition.params[0][2] + condition.params[0][3];
        let end = condition.params[1][0] + condition.params[1][1] + ':' + condition.params[1][2] + condition.params[1][3];
        return 'Timeslot from ' + start + ' to ' + end + ' is ' + authorise + ' (' + target + ')';
      case 'weekday':
        let weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let weekdayID = condition.params;
        return 'Weekday \"' + weekdays[weekdayID] + '\" is ' + authorise + ' (' + target + ')';
      default:
        return 'Rule ' + rule.priority + ' is ' + authorise + ' (' + target + ')';
    }
  }

  getVariables() {
    let variablesTitles = [];
    for (let i in this.variables) {
      variablesTitles.push(i);
    }
    return variablesTitles;
  }

  getVariableInfo(variable) {
    return this.variables[variable];
  }

  getMyEmails() {
    return this.callPolicyEngineFunc('getMyEmails', {});
  }

  getMyHyperties() {
    return this.callPolicyEngineFunc('getMyHyperties', {});
  }

  //TODO If there is a problem with the input, show it to the user
  setInfo(variable, policyTitle, info, authorise, scope, target) {
    let _this = this;
    return new Promise((resolve, reject) => {
      if (_this.validation[variable](scope, info)) {
        _this.addition[variable]([policyTitle, scope, target, info, authorise]).then(() => {
          resolve();
        });
      } else {
        reject('Invalid configuration');
      }
    });
  }

  deleteInfo(variable, scope, target, info) {
    let params = [scope, target, info];
    if (variable === 'member') {
      let conditionSplit = info.split(' ');
      let groupName = conditionSplit[2];
      params = [scope, groupName, info];
    }
    this.deletion[variable](params);
  }

  getGroups() {
    let _this = this;
    return new Promise((resolve, reject) => {
      _this.callPolicyEngineFunc('groups', {}).then((groups) => {
        let groupsGUI = {
          groupsNames: [],
          members: [],
          ids: []
        };

        for (let i in groups) {
          groupsGUI.groupsNames.push(i);
          groupsGUI.members.push(groups[i]);
          let ids = [];
          for (let j in groups[i]) {
            ids.push(i + '::' + groups[i][j]);
          }
          groupsGUI.ids.push(ids);
        }

        //console.log('TIAGO groups', groupsGUI)
        resolve(groupsGUI);
      });
    });
  }

  getGroupsNames() {
    return this.callPolicyEngineFunc('getGroupsNames', {});
  }

  removeFromGroup(groupName, user) {
    return this.callPolicyEngineFunc('removeFromGroup', {groupName: groupName, userEmail: user});
  }

  updatePolicy(policyTitle, rule, newDecision, newSubscriptionType) {
    let _this = this;
    return new Promise((resolve, reject) => {
      _this.callPolicyEngineFunc('userPolicies', {}).then((userPolicies) => {
        userPolicies[policyTitle].deleteRule(rule);
        if (!newSubscriptionType) {
          userPolicies[policyTitle].createRule(newDecision, rule.condition, rule.scope, rule.target, rule.priority);
        } else {
          let operator = (newSubscriptionType === '*') ? 'equals' : 'in';
          userPolicies[policyTitle].createRule(newDecision, [{ attribute: 'subscription', opeator: operator, params: newSubscriptionType }], rule.scope, rule.target, rule.priority);
        }

        _this.callPolicyEngineFunc('saveActivePolicy', {}).then(() => {
          resolve();
        });
      });
    });
  }

}

export default PoliciesManager;
