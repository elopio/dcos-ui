import React from 'react';
import SidebarActions from '../../../events/SidebarActions';

class FormTabContent extends React.Component {

  render() {
    return null;
  }
}

FormTabContent.contextTypes = {
  router: React.PropTypes.func
};

FormTabContent.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = FormTabContent;