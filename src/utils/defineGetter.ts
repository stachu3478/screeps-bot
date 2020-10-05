interface _HasPrototype {
  prototype: ObjectConstructor['prototype']
}

export default function defineGetter<I, T extends _HasPrototype, U>(
  object: T,
  property: string,
  handler: (instance: I) => U,
) {
  if (object.prototype.hasOwnProperty(property)) return
  Object.defineProperty(object.prototype, property, {
    get: function () {
      return handler(this as I)
    },
  })
}
