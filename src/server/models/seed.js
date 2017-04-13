import faker from 'faker';
import { ObjectID } from 'mongodb';
import { Map, Range, List } from 'immutable';
import slugify from 'slugify';

function getRandom(min, max, round = 1) {
  return +((Math.random() * (max - min)) + min).toFixed(round);
}

function getLocale(seed) {
  return ['ru', 'en', 'fr'][seed % 3];
}

function getRatingSource(seed) {
  return ['http://ahmed.info',
    'http://jamarcus.name',
    'https://kianna.info',
    'http://reta.name',
    'https://lysanne.info',
  ][seed % 5];
}

function getVideoSource(seed) {
  return ['http://www.youtube.com/embed/bXTC3YNxIEM',
    'http://www.youtube.com/embed/G928p6pnhtI',
    'http://www.youtube.com/embed/MxWurb299-c',
    'http://player.vimeo.com/video/148177148',
    'http://player.vimeo.com/video/141843181',
  ][seed % 5];
}

function getAttributeGroups(seed) {
  return ['Cameras',
    'Design',
    'Network',
  ][seed % 3];

}

function fakeTranslations(generator, amount = 3) {
  return Range(0, amount).map((value, key) => Map()
    .set('language', getLocale(key))
    .set('content', `${faker.company.catchPhraseAdjective()} ${faker.hacker.abbreviation()} ${generator()}`),
  ).toList();
}

function fakeAttributeTranslations(group, amount = 3) {
  return Range(0, amount).map((value, key) => Map()
    .set('language', getLocale(key))
    .set('content', getAttributeGroups(group)),
  ).toList();
}

function fakeAttributes(amount = 15) {
  return Range(0, amount).map(() => Map()
    .set('id', new ObjectID())
    .set('name', fakeTranslations(faker.hacker.abbreviation)),
  ).toList();
}

function fakeAttributeGroups(amount = 3) {
  return Range(0, amount).map((value, key) => Map()
    .set('id', new ObjectID())
    .set('name', fakeAttributeTranslations(key)),
  ).toList();
}

function fakeCategories(amount = 10) {
  return Range(0, amount).map(() => Map()
    .set('_id', new ObjectID())
    .set('name', fakeTranslations(faker.commerce.department))
    .set('attributeGroups', fakeAttributeGroups())
    .set('attributes', fakeAttributes()),
  ).toList();
}

function fakeValues(amount = 15) {
  return Range(0, amount).map(() => Map()
    .set('attribute', null)
    .set('content', fakeTranslations(faker.random.number)),
  ).toList();
}

function fakeRating(amount = 5) {
  return Range(0, amount).map((value, key) => Map()
    .set('id', new ObjectID())
    .set('source', {title: getRatingSource(key), image: faker.image.imageUrl()})
    .set('score', getRandom(0, 10, 2)),
  ).toList();
}

function fakeItems(amount = 10) {
  return Range(0, amount).map(() => Map()
    .set('_id', new ObjectID())
    .set('slug', slugify(`${faker.company.catchPhraseAdjective()} ${faker.hacker.abbreviation()} ${faker.commerce.productName()}`, '_'))
    .set('name', fakeTranslations(faker.commerce.productName))
    .set('values', fakeValues())
    .set('rating', fakeRating())
    .set('images', Range(0, 8).map(() => faker.image.imageUrl()))
    .set('videos', Range(0, 5).map((element, index) => getVideoSource(index))),
  ).toList();
}

function fakeComparisons(amount = 10) {
  return Range(0, amount).map(() => Map()
    .set('_id', new ObjectID())
    .set('slug', slugify(`${faker.company.catchPhraseAdjective()} ${faker.hacker.abbreviation()} ${faker.commerce.productName()}`, '_'))
    .set('title', fakeTranslations(faker.hacker.phrase))
    .set('image', faker.image.imageUrl())
    .set('category', null)
    .set('items', List())
    .set('attributes', List()),
  ).toList();
}

// assign attributes to attribute groups
const categories = fakeCategories().map((category) => {
  const attributeGroups = category.get('attributeGroups');
  const attributes = category.get('attributes').map((attribute) => {
    const attributeGroupId = attributeGroups.get(getRandom(0, attributeGroups.size - 1, 0)).get('id');
    return attribute.set('attributeGroup', attributeGroupId);
  });
  return category.set('attributes', attributes);
});

// assign items to category and values to attributes
const items = fakeItems(100).map((item) => {
  const randomIndex = getRandom(0, categories.size - 1, 0);
  const category = categories.get(randomIndex);
  const values = item
    .get('values')
    .map((value, index) => value.set('attribute', category.get('attributes').getIn([index, 'id'])));
  return item.set('category', category.get('_id')).set('values', values);
});

// assign comparison to category and items with attributes to comparison
const comparisons = fakeComparisons(15).map((comparison) => {
  const category = categories.get(getRandom(0, categories.size - 1, 0));
  const categoryItems = items.filter(item => category.get('_id') === item.get('category'));
  const comparisonItems = categoryItems.slice(getRandom(0, categoryItems.size - 1, 0))
    .map(item => item.get('_id'));
  const comparisonAttributes = category.get('attributes').slice(getRandom(0, category.get('attributes') - 1, 0))
    .map(attribute => attribute.get('id'));
  return comparison.set('category', category.get('_id'))
    .set('items', comparisonItems)
    .set('attributes', comparisonAttributes);
});

export { categories, items, comparisons };
