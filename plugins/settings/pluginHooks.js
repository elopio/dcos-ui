import _ from 'underscore';

let settingsRoutes = require('./routes');

const PluginHooks = {
  configuration: {
    enabled: false
  },

  /**
   * @param  {Object} Hooks The Hooks API
   */
  initialize: function (Hooks) {
    Hooks.addFilter(
      'applicationRoutes', this.applicationRoutes.bind(this)
    );
    Hooks.addFilter(
      'sidebarNavigation', this.sidebarNavigation.bind(this)
    );
  },

  configure: function (configuration) {
    this.configuration = _.extend(this.configuration, configuration);
  },

  isEnabled() {
    return this.configuration.enabled;
  },

  applicationRoutes: function (routes) {
    if (this.isEnabled() !== true) {
      return routes;
    }

    // Append settings routes
    routes[0].children.forEach(function (child) {
      if (child.id === 'index') {
        child.children.push(settingsRoutes);
      }
    });

    return routes;
  },

  sidebarNavigation: function (value = []) {
    if (this.isEnabled() !== true) {
      return value;
    }

    return value.concat(['settings']);
  }
};

module.exports = PluginHooks;