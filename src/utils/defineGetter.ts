interface _HasPrototype {
  prototype: ObjectConstructor['prototype']
}

export default function defineGetter<
  I,
  T extends _HasPrototype,
  U extends keyof I
>(object: T, property: U, handler: (instance: I) => I[U]) {
  if (object.prototype.hasOwnProperty(property)) return
  Object.defineProperty(object.prototype, property, {
    get: function () {
      return handler(this as I)
    },
  })
}
