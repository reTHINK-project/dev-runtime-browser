import PoliciesManager from './PoliciesManager';

class PoliciesGUI {

  constructor(policyEngine) {
    if (!policyEngine) throw Error('Policy Engine is not set!');
    this.policiesManager = new PoliciesManager(policyEngine);
    this.elements = this._setElements();
    this._setListeners();
  }

  _addMember() {
    let group = event.target.id;
    $('.member-new-intro').html('<h5>Add a member to a group</h5><p>Insert a user email below to add to the "' + group + '" group.</p>');
    $('.member-new-modal').openModal();
    $('.member-new-ok').off();
    $('.member-new-ok').on('click', (event) => {
      let member = $('#member-new').val();
      $('#member-new').val('');
      this.policiesManager.addToGroup(group, member);
      $('.member-new-modal').closeModal();
      this._manageGroups();
    });
  }

  _createGroup() {
    $('#group-new-name').val('');
    $('.group-new-modal').openModal();
    $('.group-new-ok').on('click', (event) => {
      let groupName = $('#group-new-name').val();
      this.policiesManager.createGroup(groupName);
      this._manageGroups();
    });
  }

  _addPolicy() {
    $('#policy-new-title').val('');
    $('.combining').html('');
    let algorithms = ['Block overrides', 'Allow overrides', 'First applicable'];
    $('.combining').append(this._getOptions('comb-algorithm', 'Choose a combining algorithm', algorithms));
    $('.policy-new').openModal();

    $('.policy-new-ok').off();
    $('.policy-new-ok').on('click', (event) => {
      let policyTitle = $('#policy-new-title').val();
      if (!policyTitle) {
        Materialize.toast('Invalid policy title', 4000);
      } else {
        let combiningAlgorithm = $('#comb-algorithm').val();
        this.policiesManager.addPolicy(policyTitle, combiningAlgorithm);
        $('.help-menu').addClass('hide');
        $('.policy-new').closeModal();
        this._goHome();
      }
    });
    $('.help-btn').off();
    $('.help-btn').on('click', (event) => {
      $('.help-menu').removeClass('hide');
    });
  }

  _decreaseRulePriority() {
    let id = event.target.closest('tr').id;
    let splitId = id.split(':');
    let thisPriority = parseInt(splitId[splitId.length - 1]);
    splitId.pop();
    let policyTitle = splitId.join(':');
    let lastPriority = this.policiesManager.getPolicy(policyTitle).getLastPriority();
    if (lastPriority != thisPriority) {
      let newPriority = parseInt(thisPriority + 1);
      this.policiesManager.decreaseRulePriority(policyTitle, thisPriority, newPriority);
      this._goHome();
    }
  }

  _deleteMember() {
    let id = event.target.closest('tr').id;
    let splitId = id.split('::');
    let member = splitId[splitId.length - 1];
    splitId.pop();
    let group = splitId.join('::');
    this.policiesManager.removeFromGroup(group, member);
    this._manageGroups();
  }

  _deleteGroup() {
    let groupName = event.target.closest('tr').children[0].id;
    this.policiesManager.deleteGroup(groupName);
    this._manageGroups();
  }

  _deletePolicy() {
    let policyTitle = event.target.closest('tr').id;
    this.policiesManager.deletePolicy(policyTitle);
    this._goHome();
  }

  _deleteRule() {
    let id = event.target.closest('tr').id;
    let splitId = id.split(':');
    let priority = splitId[splitId.length - 1];
    splitId.pop();
    let policyTitle = splitId.join(':');
    let rule = this.policiesManager.getRuleOfPolicy(policyTitle, priority);

    this.policiesManager.deleteRule(policyTitle, rule);
    this._goHome();
  }

  _getActivePolicy() {
    $('.policy-active').html('');
    let activeUserPolicy = this.policiesManager.getActivePolicy();
    let policies = this.policiesManager.getPoliciesTitles();
    policies.push('Deactivate all policies');

    $('.policy-active').append(this._getOptions('policies-list', 'Click to activate a policy', policies, activeUserPolicy));

    $('#policies-list').on('click', (event) => {
      let policyTitle = $('#policies-list').find(":selected")[0].textContent;
      if (policyTitle === 'Deactivate all policies') {
        policyTitle = undefined;
      }
      this.policiesManager.updateActivePolicy(policyTitle);
    });
  }

  _getGroupOptions(title, keys, scopes, lists) {
    let list = '<option disabled selected>' + title + '</option>';

    for (let i in keys) {
      list += '<optgroup label=' + keys[i] + '>';
      for (let j in lists[i]) {
        list += '<option id="' + scopes[i] + '">' + lists[i][j] + '</option>';
      }
    }

    return list;
  }

  _getInfo(variable) {
    let info;

    switch(variable) {
      case 'Date':
        info = $('.config').find('input').val();
        if (info.indexOf(',') !== -1) { //20 July, 2016
          let splitInfo = info.split(' '); //['20', 'July,',' '2016']
          splitInfo[1] = splitInfo[1].substring(0, splitInfo[1].length - 1); //'July'
          let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
          info = splitInfo[0] + '/' + (months.indexOf(splitInfo[1]) + 1) + '/' + splitInfo[2];
        } else { // 2016-07-20
          let splitInfo = info.split('-');
          info = splitInfo[2] + '/' + splitInfo[1] + '/' + splitInfo[0];
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

  _getList(items) {
      let list = '';
      let numItems = items.length;

      for (let i = 0; i < numItems; i++) {
        list += '<li class="divider"></li>';
        list += '<li><a class="center-align">' + items[i] + '</a></li>';
      }

      return list;
    }

  _getOptions(id, title, list, selected) {
    let options = '<select id="' + id + '" class="browser-default"><option disabled selected>' + title + '</option>';
    for (let i in list) {
      if (selected !== undefined & selected === list[i]) {
        options += '<option selected id="' + id + '">' + list[i] + '</option>';
      } else {
        options += '<option id="' + id + '">' + list[i] + '</option>';
      }
    }
    options += '</select>';

    return options;
  }

  _getPoliciesTable() {
    $('.policies-no').addClass('hide');
    $('.policies-current').html('');

    let policies = this.policiesManager.getFormattedPolicies();
    let policiesTitles = [];
    let rulesTitles = [];
    let ids = [];

    for (let i in policies) {
      policiesTitles.push(policies[i].title);
      rulesTitles.push(policies[i].rulesTitles);
      ids.push(policies[i].ids);
    }

    let table = '<table>';
    let isEmpty = policiesTitles.length === 0;

    for (let i in policiesTitles) {
      table += '<thead><tr id="' + policiesTitles[i] + '"><td></td><td></td><th class="center-align">' + policiesTitles[i] + '</th><td><i class="material-icons clickable-cell policy-delete" style="cursor: pointer; vertical-align: middle">delete_forever</i></td></tr></thead><tbody>';

      for (let j in rulesTitles[i]) {
        table += '<tr id="' + ids[i][j] + '" ><td><i class="material-icons clickable-cell rule-priority-increase" style="cursor: pointer; vertical-align: middle">arrow_upward</i></td><td><i class="material-icons clickable-cell rule-priority-decrease" style="cursor: pointer; vertical-align: middle">arrow_downward</i></td><td class="rule-show clickable-cell" style="cursor: pointer">' + rulesTitles[i][j] + '</td><td><i class="material-icons clickable-cell rule-delete" style="cursor: pointer; vertical-align: middle">clear</i></td></tr>';
      }
      table += '<tr id="' + policiesTitles[i] + '"></td><td></td><td></td><td style="text-align:center"><i class="material-icons clickable-cell center-align rule-add" style="cursor: pointer">add_circle</i></td></tr>';
    }
    if (!isEmpty) {
      table += '</tbody></table>';
      $('.policies-current').append(table);
    } else {
      $('.policies-no').removeClass('hide');
    }
    $('.rule-add').on('click', (event) => { this._showVariablesTypes(); });
    $('.rule-delete').on('click', (event) => { this._deleteRule(); });
    $('.rule-show').on('click', (event) => { this._showRule(); });
    $('.rule-priority-increase').on('click', (event) => { this._increaseRulePriority(); });
    $('.rule-priority-decrease').on('click', (event) => { this._decreaseRulePriority(); });
    $('.policy-add').off();
    $('.policy-add').on('click', (event) => { this._addPolicy(); });
    $('.policy-delete').on('click', (event) => { this._deletePolicy(); });
  }

  _goHome() {
    this._getActivePolicy();
    this._getPoliciesTable();
  }

  _increaseRulePriority() {
    let id = event.target.closest('tr').id;
    let splitId = id.split(':');
    let thisPriority = parseInt(splitId[splitId.length - 1]);
    if (thisPriority !== 0) {
      splitId.pop();
      let policyTitle = splitId.join(':');
      let newPriority = thisPriority - 1;

      this.policiesManager.increaseRulePriority(policyTitle, thisPriority, newPriority);
      this._goHome();
    }
  }

  _manageGroups() {
    $('.groups-current').html('');
    let groupsPE = this.policiesManager.getGroups();
    let groups = groupsPE.groupsNames;
    let members = groupsPE.members;
    let ids = groupsPE.ids;

    let table = '<table>';
    let isEmpty = groups.length === 0;

    for (let i in groups) {
      table += '<thead><tr><th id="' + groups[i] + '">' + groups[i] + '</th><td style="text-align:right"><i class="material-icons clickable-cell group-delete" style="cursor: pointer; vertical-align: middle">delete_forever</i></td></tr></thead><tbody>';
      for (let j in members[i]) {
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
    $('.member-add').on('click', (event) => { this._addMember(); });
    $('.member-delete').on('click', (event) => { this._deleteMember(); });
    $('.group-add').off();
    $('.group-add').on('click', (event) => { this._createGroup(); });
    $('.group-delete').on('click', (event) => { this._deleteGroup(); });
  }

  _parseFileContent(content) {
    let parsedContent = JSON.parse(content);
    for (let i in parsedContent) {
      this.policiesManager.addPolicy(i, undefined, parsedContent[i]);
    }
    $('.policy-new').closeModal();
  }

  _setElements() {
    return {
      date: (params) => { return '<input type="date" class="datepicker">'; },
      select: (params) => { return this._getOptions(params[0], params[1], params[2]); },
      form: (params) => { return '<form><input type="text" placeholder="' + params + '"></input></form>'; }
    };
  }

  _showNewConfigurationPanel(policyTitle) {
    let variable = event.target.text;
    $('.variable').html(this._getNewConfiguration(policyTitle, variable));
    $('.scopes').empty().html('');

    let keys = ['Email', 'Hyperty', 'All'];
    let scopes = ['identity', 'hyperty', 'global'];
    let lists = [];

    lists.push(this.policiesManager.getMyEmails());
    lists.push(this.policiesManager.getMyHyperties());
    lists.push(['All identities and hyperties']);
    $('.scopes').append(this._getGroupOptions('Apply this configuration to:', keys, scopes, lists));
    $('.variable').removeClass('hide');
  }

  _showVariablesTypes() {
    let policyTitle = event.target.closest('tr').id;

    $('#variables-types').empty().html('');
    let variables = this.policiesManager.getVariables();
    $('#variables-types').append(this._getList(variables));
    $('.variable').addClass('hide');
    $('.rule-new').openModal();
    $('#variables-types').off();
    $('#variables-types').on('click', (event) => { this._showNewConfigurationPanel(policyTitle); });
  }

  _getNewConfiguration(policyTitle, variable) {
    let info = this.policiesManager.getVariableInfo(variable);
    $('.rule-new-title').html(info.title);
    $('.description').html(info.description);
    $('.config').html('');

    if (variable === 'Subscription preferences') {
      $('.subscription-type').removeClass('hide');
    } else {
      $('.subscription-type').addClass('hide');
      let tags = info.input;
      for (let i in tags) {
        if (variable === 'Group of users') {
          tags[i][1].push(this.policiesManager.getGroupsNames());
        }
        $('.config').append(this.elements[tags[i][0]](tags[i][1]));
        if (variable === 'Group of users') {
          tags[i][1].pop();
        }
      }
      if (variable ==='date') {
        $('.datepicker').pickadate({
          selectMonths: true,
          selectYears: 15
        });
      }
    }
    document.getElementById('allow').checked = false;
    document.getElementById('block').checked = false;
    $('.ok-btn').off();
    $('.ok-btn').on('click', (event) => {
      if ($("input[name='rule-new-decision']:checked")[0] !== undefined) {
        let info = this._getInfo(variable);
        let decision = $("input[name='rule-new-decision']:checked")[0].id;
        decision = decision === 'allow';
        let scope = $('.scopes').find(":selected")[0].id;
        let target = $('.scopes').find(":selected")[0].textContent;
        target = (target === 'All identities and hyperties') ? 'global' : target;
        this.policiesManager.setInfo(variable, policyTitle, info, decision, scope, target);
        $('.rule-new').closeModal();
        this._goHome();
      } else {
        throw Error('INFORMATION MISSING: please specify an authorisation decision.');
      }
    });
  }

  _deleteInfo(resourceType) {
    let id = event.target.closest('tr').id;
    let splitId = id.split(':');
    let scope = splitId[0];
    splitId.shift();
    let target = splitId.join('');
    let condition = event.target.closest('tr').children[0].id;
    this.policiesManager.deleteInfo(resourceType, scope, target, condition);
    this._goHome();
  }

  _setListeners() {
    $('.settings-btn').on('click', (event) => {
      parent.postMessage({ body: { method: 'showAdminPage' }, to: 'runtime:gui-manager' }, '*');
      $('.admin-page').removeClass('hide');
      document.getElementsByTagName('body')[0].style = 'background-color:white;';
    });

    $('.policies-page-show').on('click', (event) => {
      $('.policies-section').removeClass('hide');
      $('.identities-section').addClass('hide');
      this._goHome();
      this._manageGroups();
    });

    $('.admin-page-exit').on('click', (event) => {
      parent.postMessage({ body: { method: 'hideAdminPage' }, to: 'runtime:gui-manager' }, '*');
      $('.admin-page').addClass('hide');
      document.getElementsByTagName('body')[0].style = 'background-color:transparent;';
    });

    $('.exit-btn').on('click', (event) => {
      $('.subscription-type').addClass('hide');
      $('.help-menu').addClass('hide');
    });

    $('#policy-file').on('change', (event) => {
      let file = event.target.files[0];
      let reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onload = (event) => {
        this._parseFileContent(event.target.result);
        this._goHome();
      }
      reader.onerror = (event) => {
        throw Error("Error reading the file");
      }
    });
  }

  _showRule() {
    let ruleTitle = event.target.textContent;
    let id = event.target.closest('tr').id;
    let splitId = id.split(':');
    let priority = splitId[splitId.length - 1];
    splitId.pop();
    let policyTitle = splitId.join(':');
    let rule = this.policiesManager.getRuleOfPolicy(policyTitle, priority);
    if (rule.condition.attribute === 'subscription' && rule.condition.params === 'preauthorised') {
      $('.authorise-btns').addClass('hide');
    } else {
      let element;
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
    $('.subscription-decision').on('click', (event) => { this._updateRule('subscription', policyTitle, rule); });
    $('.decision').off();
    $('.decision').on('click', (event) => { this._updateRule('authorisation', policyTitle, rule);});
  }

  _updateRule(type, policyTitle, rule) {
    let title = $('.rule-title').text();
    let splitTitle = title.split(' ');
    let index = splitTitle.indexOf('is');
    if (index === -1) {
      index = splitTitle.indexOf('are');
    }
    switch (type) {
      case 'authorisation':
        let newDecision = $("input[name='rule-update-decision']:checked")[0].id;

        if (newDecision === 'btn-allow') {
          splitTitle[index + 1] = 'allowed';
          newDecision = true;
        } else {
          splitTitle[index + 1] = 'blocked';
          newDecision = false;
        }
        title = splitTitle.join(' ');
        $('.rule-title').html('<h5><b>' + title + '</b></h5>');
        this.policiesManager.updatePolicy(policyTitle, rule, newDecision);
        break;
      case 'subscription':
        let newSubscriptionType = event.target.labels[0].textContent;

        let decision = splitTitle[index + 1];
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
        this.policiesManager.updatePolicy(policyTitle, rule, newDecision, newSubscriptionType);
        break;
    }
    this._goHome();
  }
}

export default PoliciesGUI;
