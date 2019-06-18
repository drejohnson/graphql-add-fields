// Extracted from https://github.com/monojack/graphql-normalizr/blob/master/src/GraphQLNormalizr.js#L193
import { visit, parse as gql, Kind } from 'graphql'

const hasField = fieldName => set =>
  set.some(({ alias, name }) => (alias || name).value === fieldName)

const createField = name => ({
  kind: 'Field',
  alias: undefined,
  name: {
    kind: 'Name',
    value: name
  },
  arguments: [],
  directives: [],
  selectionSet: undefined
})

const idKey = 'id'
const useConnections = false
const hasIdField = hasField(idKey)
const hasTypeNameField = hasField('__typename')
const hasEdgesField = hasField('edges')

const idField = createField(idKey)
const typeNameField = createField('__typename')

const isInlineFragment = node => node.kind === Kind.INLINE_FRAGMENT

const connectionFields = ['edges', 'pageInfo']

const excludeMetaFields = useConnections
  ? (node, key, parent, path) =>
      node.selections.some(isInlineFragment) ||
      hasEdgesField(node.selections) ||
      (!isInlineFragment(parent) &&
        connectionFields.includes(parent.name.value))
  : () => false

export function addRequiredFields(query) {
  return visit(query, {
    SelectionSet(node, key, parent, path) {
      if (
        parent.kind === Kind.OPERATION_DEFINITION ||
        excludeMetaFields(node, key, parent, path)
      ) {
        return
      }

      !hasIdField(node.selections) && node.selections.unshift(idField)
      !hasTypeNameField(node.selections) &&
        node.selections.unshift(typeNameField)

      return node
    }
  })
}

export function parse(qs) {
  return addRequiredFields(gql(qs, { noLocation: true }))
}
