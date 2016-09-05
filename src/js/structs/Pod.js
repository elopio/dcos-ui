import HealthStatus from '../constants/HealthStatus';
import PodInstanceList from './PodInstanceList';
import PodSpec from './PodSpec';
import Service from './Service';
import ServiceStatus from '../constants/ServiceStatus';
import ServiceImages from '../constants/ServiceImages';

module.exports = class Pod extends Service {
  constructor() {
    super(...arguments);

    // For performance reasons we are creating only a single
    // instance of the pod spec (instead of creating a new
    // instance every time the user calls `getSpec()`)
    //
    // The variable is prefixed because `Item` will expose
    // all the properties it gets as a properties of this object
    // and we want to avoid any naming collisions.
    //
    this._spec = new PodSpec(this.get('spec'));
  }

  /**
   * @override
   */
  getSpec() {
    return this._spec;
  }

  /**
   * @override
   */
  getHealth() {
    switch (this.get('status')) {
      // DEGRADED - The number of STABLE pod instances is less than the number
      // of desired instances.
      case 'DEGRADED':
        return HealthStatus.UNHEALTHY;

      // STABLE   - All launched pod instances have started and, if health
      // checks were specified, are all healthy.
      case 'STABLE':
        return HealthStatus.HEALTHY;

      // TERMINAL - Marathon is tearing down all of the instances for this pod.
      case 'TERMINAL':
        return HealthStatus.NA;

      default:
        return HealthStatus.NA;
    }
  }

  /**
   * @override
   */
  getLabels() {
    return this.getSpec().getLabels();
  }

  /**
   * @override
   */
  getServiceStatus() {
    let scalingInstances = this.getSpec().getScalingInstances();
    let runningInstances = this.countRunningInstances();
    let nonterminalInstances = this.countNonTerminalInstances();

    if ((nonterminalInstances === 0) && (scalingInstances === 0)) {
      return ServiceStatus.SUSPENDED;
    }

    if (scalingInstances !== nonterminalInstances) {
      return ServiceStatus.DEPLOYING;
    }

    if (runningInstances > 0) {
      return ServiceStatus.RUNNING;
    }

    return ServiceStatus.NA;
  }

  /**
   * @override
   */
  getImages() {
    return ServiceImages.NA_IMAGES;
  }

  /**
   * @override
   */
  getInstancesCount() {
    // Apparently this means 'get total number of instances staged'
    return this.getSpec().getScalingInstances();
  }

  /**
   * @override
   */
  getTasksSummary() {
    let taskSummary = {
      tasksHealthy: 0,
      tasksUnhealthy: 0,
      tasksStaged: 0,
      tasksRunning: 0,
      tasksUnknown: 0,
      tasksOverCapacity: 0
    };

    this.getInstanceList().mapItems(function (instance) {
      if (instance.isRunning()) {
        taskSummary.tasksRunning++;
        if (instance.hasHealthChecks()) {
          if (instance.isHealthy()) {
            taskSummary.tasksHealthy++;
          } else {
            taskSummary.tasksUnhealthy++;
          }
        } else {
          taskSummary.tasksUnknown++;
        }

      } else if (instance.isStaging()) {
        taskSummary.tasksStaged++;
      }
    });

    let totalInstances = taskSummary.tasksStaged + taskSummary.tasksRunning;
    let definedInstances = this.getSpec().getContainerCount();

    if (totalInstances > definedInstances) {
      taskSummary.tasksOverCapacity = totalInstances - definedInstances;
    }

    return taskSummary;
  }

  /**
   * @override
   */
  getResources() {
    return this.getSpec().getResourcesSummary();
  }

  getInstanceList() {
    return new PodInstanceList({items: this.get('instances') || []});
  }

  countRunningInstances() {
    return this.getInstanceList().reduceItems(function (counter, instance) {
      if (instance.isRunning()) {
        return counter + 1;
      }
      return counter;
    }, 0);
  }

  countNonTerminalInstances() {
    return this.getInstanceList().reduceItems(function (counter, instance) {
      if (!instance.isInStatus(['TERMINAL'])) {
        return counter + 1;
      }
      return counter;
    }, 0);
  }

  countTotalInstances() {
    return (this.get('instances') || []).length;
  }

};