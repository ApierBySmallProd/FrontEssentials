import Entity, { Association } from './entity';

import type { Method } from '../ajaxrequest';

export function Local() {
  return (target: any, key: any) => {
    if (!target.constructor.localAttributes) {
      target.constructor.localAttributes = [];
    }
    target.constructor.localAttributes.push(key);
  };
}

export function Id() {
  return (target: any, key: any) => {
    target.constructor.idAttribute = key;
  };
}

export function NoUpdate() {
  return (target: any, key: any) => {
    if (!target.constructor.noUpdateAttributes) {
      target.constructor.noUpdateAttributes = [];
    }
    target.constructor.noUpdateAttributes.push(key);
  };
}

export function HasOne(entity: string) {
  return (target: any, key: any) => {
    if (!target.constructor.associations) {
      target.constructor.associations = [];
    }
    const association: Association = {
      attributeName: key,
      entityName: entity,
      type: 'one',
    };
    target.constructor.associations.push(association);
  };
}

export function HasMany(entity: string) {
  return (target: any, key: any) => {
    if (!target.constructor.associations) {
      target.constructor.associations = [];
    }
    const association: Association = {
      attributeName: key,
      entityName: entity,
      type: 'many',
    };
    target.constructor.associations.push(association);
  };
}

export interface EntityClassOptions {
  baseUrl: string;
  create?: {
    method?: Method;
    path?: string;
  };
  update?: {
    method?: Method;
    path?: string;
  };
  delete?: {
    method?: Method;
    path?: string;
  };
  findOne?: {
    method?: Method;
    path?: string;
  };
  findAll?: {
    method?: Method;
    path?: string;
  };
}

const defaultOptions: EntityClassOptions = {
  baseUrl: '',
  create: {
    method: 'POST',
    path: '/',
  },
  update: {
    method: 'PATCH',
    path: '/',
  },
  delete: {
    method: 'DELETE',
    path: '/',
  },
  findAll: {
    method: 'GET',
    path: '/',
  },
  findOne: {
    method: 'GET',
    path: '/',
  },
};

export function EntityClass(options: EntityClassOptions) {
  return <
    T extends { className: string; options: EntityClassOptions; newEntity: () => any; new (...args: any[]): Entity }
  >(
    constructor: T,
  ) => {
    Entity.entityClasses.push({ name: constructor.name, class: constructor, entities: null, events: {} });
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args);
        constructor.className = constructor.name;
        constructor.newEntity = () => new constructor();
        constructor.options = { ...defaultOptions, ...options };
      }
    };
  };
}
