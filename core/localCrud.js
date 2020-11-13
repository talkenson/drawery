const CrudStore = {
  Pixels: 'store-pixels',
  Lines: 'store-lines',
  Rectangles: 'store-rects',
  Temporaries: 'store-temporaries',
  State: 'store-state-saver',
};

class StorageAssistant {
  op = window.localStorage;

  // get(key: string, expectedValue: string | null) -> realValue || expectedValue[string | null]
  get = (key, expectedValue) => {
    let rawValue = this.op.getItem(key), value;
    try {
      value = JSON.parse(rawValue);
    } catch (e) {
      value = rawValue;
    }
    return value || expectedValue
  };

  // set(key: string, value: string)
  set = (key, value) => {
    if (typeof value !== "string") value = JSON.stringify(value);
    this.op.setItem(key, value);
  };

  // delete(key: string)
  delete = (key) => {
    this.op.removeItem(key)
  };

  // _clear()
  _clear = this.op.clear;
}

class Crud {
  storeName = null;
  prefix = 'CrudStorage__';
  sa = new StorageAssistant();

  constructor(store) {
    if (!store) {
      throw new Error('There\'s no Store provided to Crud initializer! (E: emp_constructor_called)');
    }
    if (typeof store !== 'string') {
      throw new Error('Incorrect Store name provided to Crud initializer! (E: incorrect_store_name)');
    }
    console.log('Crud::Init :', store);
    this.storeName = this.prefix + store;
    this.__purgeData();
    document.addEventListener(this.storeName + '_update', this.eventHandler);
  }

  state = {
    value: [],
  };

  create = (iObjectAny) => {
    let temp = this.sa.get(this.storeName, null) || this.state;
    console.log(temp);
    temp.value.push(iObjectAny);
    this.sa.set(this.storeName, temp);
    document.dispatchEvent(new CustomEvent(this.storeName + '_update', {"detail": {"type": 'add'}}));
  };

  getAll = () => {
    return this.sa.get(this.storeName, null) || this.state;
  };

  eventHandler = (event) => {
    // redraw()????????
    console.log(`UPDATE: ${event.type} with`, event.detail);
  };

  __purgeData = () => {
    console.log('purging', this.storeName, '...');
    this.sa.delete(this.storeName)
  }

}
