# Shapeshifter.js

A mini Typescript/Javascript library that helps you transform objects faster & easier.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Transformation schema](#transformation-schema)
  * [Just copy an attribute](#just-copy-an-attribute)
  * [Rename an attribute](#rename-an-attribute)
  * [Use a mapping function](#use-a-mapping-function)
  * [Full definition](#full-definition)
- [Advanced settings](#advanced-settings)
  * [Nested transformation](#nested-transformation)
  * [Virtual attributes](#virtual-attributes)

## Installation
Using `npm`
```
npm install @necrobits/shapeshifter
```
or using `yarn`
```
yarn add @necrobits/shapeshifter
```

## Usage
```javascript
// Create a shapeshifter using a schema
const shapeshifter = Shapeshifter.create(schema);
// Transform the data
const newData = shapeshifter.transform(data);
```
## Transformation schema
`schema` is an object that describes the transformation. There are different ways to define it. Usually, the keys in the schema are the attribute names in the object. There is an exception for `virtual` attributes, we will come back to that later on. Now let's learn some simple syntax first.

### Just copy an attribute
Just use `true` to tell the Shapeshifter to copy the attribute.
```javascript
{
   my_attribute : true
}
```

### Rename an attribute
Simply write the new name as value
```javascript
{
    my_attribute: "my_new_attribute"
}
```
### Use a mapping function
Yes, you can also use a function to map the value
```javascript
{
    my_attribute: (value) => `This is a new ${value}`
}
```
Sometimes, you want to construct the value based on other fields. That's the time to utilize the 2. argument in the mapping function. This example transforms the first name field into full name.
```javascript
{
    first_name: (first_name, obj) => `${first_name} ${obj.last_name}`
}
```
### Full definition
The 3 variants above is a shorthand version for convenience and compactness. You can define the transformation using the full version like this:
```javascript
{
    my_attribute: {
        to: "my_new_attribute",
        mapping: (value) => `This is a new ${value}`
    }
}
```

## Advanced settings
### Nested transformation
You can define a nested transformation rule using the magic key `__nested__`.  
- If `parents` is only a object, the Shapeshifter will transform it as usual.  
- If `parents` is an array of multiple parent objects, the Shapeshifter will automatically apply a map function on the array to transform every element in the array.
```javascript
{
    first_name: true,
    last_name: true,
    parents: {
        __nested__: true,
        first_name: true,
        last_name: true
    }
}
```

### Virtual attributes
It's kinda irrational to transform `first_name` into `full_name` in the above example.  
What if you want to keep `first_name`, `last_name` but also want to create a new field called `full_name`? That's where virtual attributes come into play. With virtual attributes you can define new attributes.
Because those attributes are not created based on any old attributes, so we call them "virtual".

In order to define virtual attributes, you need to use the following format `__virtual<name>__`. 
For example:
```javascript
{
    first_name: true,
    last_name: true,
    __virtual_fullname__: {
        to: "full_name",
        mapping: (_, obj) => `${obj.first_name} ${obj.last_name}`
    },
    __virtual_fullname2__: {
        to: "full_name_uppercase",
        mapping: (_, obj) => `${obj.first_name} ${obj.last_name}`.toUpperCase()
    }
}
```

## License
MIT