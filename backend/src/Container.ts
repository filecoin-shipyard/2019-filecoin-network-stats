export type Factory = (...deps: any[]) => any

export interface ServiceDefinition {
  name: string,
  factory: Factory,
  dependencies: string[],
  isSingleton: boolean
}

export class Registry {
  private registry: { [name: string]: ServiceDefinition };

  constructor (otherRegistry?: Registry) {
    this.clear();

    if (otherRegistry) {
      const otherServices = otherRegistry.services();
      otherServices.forEach((name) => (this.registry[name] = otherRegistry.get(name)));
    }
  }

  clear (): void {
    this.registry = {};
  }

  bind (name: string, factory: Factory, dependencies: string[] = [], isSingleton: boolean = true) {
    if (this.registry[name]) {
      throw new Error(`A service named ${name} is already defined.`);
    }

    this.registry[name] = {
      name,
      factory,
      dependencies,
      isSingleton,
    };
  }

  get (name: string): ServiceDefinition {
    const service = this.registry[name];

    if (!service) {
      throw new Error(`Service with name ${name} not found`);
    }

    return service;
  }

  services (): string[] {
    return Object.keys(this.registry);
  }
}

export class Container {
  private registry: Registry;

  private cache: { [name: string]: any };

  constructor (registry: Registry) {
    this.registry = registry;
    this.clear();
  }

  async resolve<T> (name: string): Promise<T> {
    return this.internalResolve<T>(name, []);
  }

  clear (): void {
    this.cache = {};
  }

  private async internalResolve<T> (name: string, visited: string[]): Promise<T> {
    if (visited[0] === name || visited[visited.length - 1] === name) {
      throw new Error(`Found cyclic dependencies: [${visited.join(',')},${name}]`);
    }

    const definition = this.registry.get(name);

    if (!definition.isSingleton) {
      return this.instantiate(definition, visited);
    }

    if (this.cache[name]) {
      return this.cache[name];
    }

    const instance = await this.instantiate(definition, visited);
    this.cache[name] = instance;
    return instance as T;
  }

  private async instantiate<T> (definition: ServiceDefinition, visited: string[]): Promise<T> {
    visited.push(definition.name);
    const dependencies: any[] = [];

    for (let i = 0; i < definition.dependencies.length; i++) {
      const name = definition.dependencies[i];
      const dep = await this.internalResolve(name, visited.slice());
      dependencies.push(dep);
    }

    const instance = await definition.factory.apply(null, dependencies);
    return instance as T;
  }
}
