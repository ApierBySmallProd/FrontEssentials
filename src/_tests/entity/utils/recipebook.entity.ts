import { Entity, EntityClass, HasMany, Id, NoUpdate } from '../../..';

import RecipeEntity from './recipe.entity';

@EntityClass({
  baseUrl: 'http://localhost:2000/book/',
})
export default class RecipeBookEntity extends Entity {
  @Id()
  @NoUpdate()
  public id: number;

  public name: string;

  @HasMany('RecipeEntity')
  public recipes: RecipeEntity[];
}
